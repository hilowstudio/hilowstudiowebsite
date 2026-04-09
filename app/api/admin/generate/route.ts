import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { generatePostDraft, VoiceGuideMissingError } from "@/lib/generate-post";
import {
  CONTENT_PILLARS,
  HOOK_TYPES,
  FUNNEL_STAGES,
} from "@/lib/content-strategy";
import type {
  ContentPillar,
  HookType,
  FunnelStage,
} from "@/lib/types/database";

const PILLAR_VALUES = new Set(CONTENT_PILLARS.map((p) => p.value));
const HOOK_VALUES = new Set(HOOK_TYPES.map((h) => h.value));
const FUNNEL_VALUES = new Set(FUNNEL_STAGES.map((f) => f.value));

interface GenerateRequestBody {
  pillar?: string;
  hookType?: string;
  funnelStage?: string;
  sourceMaterial?: string;
  sourceUrl?: string;
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: GenerateRequestBody;
  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pillar, hookType, funnelStage, sourceMaterial, sourceUrl } = body;

  if (!pillar || !PILLAR_VALUES.has(pillar as ContentPillar)) {
    return NextResponse.json(
      { error: "Invalid or missing pillar" },
      { status: 400 }
    );
  }
  if (!hookType || !HOOK_VALUES.has(hookType as HookType)) {
    return NextResponse.json(
      { error: "Invalid or missing hookType" },
      { status: 400 }
    );
  }
  if (!funnelStage || !FUNNEL_VALUES.has(funnelStage as FunnelStage)) {
    return NextResponse.json(
      { error: "Invalid or missing funnelStage" },
      { status: 400 }
    );
  }

  let generatedBody: string;
  try {
    generatedBody = await generatePostDraft({
      pillar: pillar as ContentPillar,
      hookType: hookType as HookType,
      funnelStage: funnelStage as FunnelStage,
      sourceMaterial: sourceMaterial?.trim() || undefined,
      sourceUrl: sourceUrl?.trim() || undefined,
    });
  } catch (err) {
    if (err instanceof VoiceGuideMissingError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error:", err.status, err.message);
      return NextResponse.json(
        { error: `Claude API error (${err.status}): ${err.message}` },
        { status: 502 }
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("generatePostDraft failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const sourceType = sourceUrl
    ? "url"
    : sourceMaterial
      ? "text"
      : "none";

  const { data: post, error: insertErr } = await supabase
    .from("content_posts")
    .insert({
      title: null,
      body: generatedBody,
      post_type: "text",
      hook_type: hookType as HookType,
      funnel_stage: funnelStage as FunnelStage,
      content_pillar: pillar as ContentPillar,
      status: "draft",
      metadata: {
        generator: "claude-sonnet-4-6",
        generated_at: new Date().toISOString(),
        source_type: sourceType,
      },
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json(post, { status: 201 });
}
