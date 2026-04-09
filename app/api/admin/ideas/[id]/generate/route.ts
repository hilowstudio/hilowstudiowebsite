import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { generatePostDraft, assembleSourceContext, VoiceGuideMissingError } from "@/lib/generate-post";
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

interface GenerateFromIdeaBody {
  pillar?: string;
  hookType?: string;
  funnelStage?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Body is optional; accept missing or empty JSON
  let body: GenerateFromIdeaBody = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as GenerateFromIdeaBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data: idea, error: ideaErr } = await supabase
    .from("content_ideas")
    .select("*")
    .eq("id", id)
    .single();

  if (ideaErr || !idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  if (idea.status === "promoted") {
    return NextResponse.json({ error: "Already promoted" }, { status: 400 });
  }

  const pillar = body.pillar ?? idea.suggested_pillar;
  const hookType = body.hookType ?? idea.suggested_hook;
  const funnelStage = body.funnelStage ?? idea.suggested_funnel;

  if (!pillar || !PILLAR_VALUES.has(pillar as ContentPillar)) {
    return NextResponse.json(
      { error: "Missing or invalid pillar (set suggested_pillar on the idea or pass pillar in the request body)" },
      { status: 400 }
    );
  }
  if (!hookType || !HOOK_VALUES.has(hookType as HookType)) {
    return NextResponse.json(
      { error: "Missing or invalid hookType (set suggested_hook on the idea or pass hookType in the request body)" },
      { status: 400 }
    );
  }
  if (!funnelStage || !FUNNEL_VALUES.has(funnelStage as FunnelStage)) {
    return NextResponse.json(
      { error: "Missing or invalid funnelStage (set suggested_funnel on the idea or pass funnelStage in the request body)" },
      { status: 400 }
    );
  }

  // Assemble rich source context from raw_insight + source_material + source_metadata
  const sourceMaterial = assembleSourceContext(idea);

  let generatedBody: string;
  try {
    generatedBody = await generatePostDraft({
      pillar: pillar as ContentPillar,
      hookType: hookType as HookType,
      funnelStage: funnelStage as FunnelStage,
      sourceMaterial,
      sourceUrl: idea.source_url || undefined,
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
        generated_from_idea: id,
        source_type: idea.source_url ? "url" : "text",
      },
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Mark idea as promoted
  await supabase
    .from("content_ideas")
    .update({ status: "promoted", promoted_post_id: post.id })
    .eq("id", id);

  return NextResponse.json(post, { status: 201 });
}
