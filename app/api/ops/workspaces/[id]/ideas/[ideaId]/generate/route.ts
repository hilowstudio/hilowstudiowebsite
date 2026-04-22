import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { requireWorkspace } from "@/lib/ops/workspace-guard";
import {
  generatePostDraft,
  assembleSourceContext,
  VoiceGuideMissingError,
} from "@/lib/generate-post";
import { HOOK_TYPES, FUNNEL_STAGES } from "@/lib/content-strategy";
import { getContentPillars } from "@/lib/pillars";
import type {
  ContentPillar,
  HookType,
  FunnelStage,
} from "@/lib/types/database";

const HOOK_VALUES = new Set(HOOK_TYPES.map((h) => h.value));
const FUNNEL_VALUES = new Set(FUNNEL_STAGES.map((f) => f.value));

interface GenerateFromIdeaBody {
  pillar?: string;
  hookType?: string;
  funnelStage?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ideaId: string }> },
) {
  const { id, ideaId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

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
    .eq("id", ideaId)
    .eq("workspace_id", id)
    .is("client_id", null)
    .single();

  if (ideaErr || !idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }
  if (idea.status === "hidden") {
    return NextResponse.json({ error: "Source is hidden" }, { status: 400 });
  }

  const pillar = body.pillar ?? idea.suggested_pillar;
  const hookType = body.hookType ?? idea.suggested_hook;
  const funnelStage = body.funnelStage ?? idea.suggested_funnel;

  const dbPillars = await getContentPillars({ workspaceId: id, clientId: null });
  const PILLAR_SLUGS = new Set(dbPillars.map((p) => p.slug));
  if (!pillar || !PILLAR_SLUGS.has(pillar as string)) {
    return NextResponse.json(
      { error: "Missing or invalid pillar" },
      { status: 400 },
    );
  }
  if (!hookType || !HOOK_VALUES.has(hookType as HookType)) {
    return NextResponse.json(
      { error: "Missing or invalid hookType" },
      { status: 400 },
    );
  }
  const humanOnlyHooks = new Set(
    HOOK_TYPES.filter((h) => h.humanOnly).map((h) => h.value),
  );
  if (humanOnlyHooks.has(hookType as HookType)) {
    return NextResponse.json(
      { error: "Story and Vulnerable hooks are reserved for human-authored posts" },
      { status: 400 },
    );
  }
  if (!funnelStage || !FUNNEL_VALUES.has(funnelStage as FunnelStage)) {
    return NextResponse.json(
      { error: "Missing or invalid funnelStage" },
      { status: 400 },
    );
  }

  const sourceMaterial = assembleSourceContext(idea);

  let generatedBody: string;
  try {
    generatedBody = await generatePostDraft({
      pillar: pillar as ContentPillar,
      hookType: hookType as HookType,
      funnelStage: funnelStage as FunnelStage,
      sourceMaterial,
      sourceUrl: idea.source_url || undefined,
      scope: { workspaceId: id, clientId: null },
    });
  } catch (err) {
    if (err instanceof VoiceGuideMissingError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Claude API error (${err.status}): ${err.message}` },
        { status: 502 },
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: post, error: insertErr } = await supabase
    .from("content_posts")
    .insert({
      workspace_id: id,
      client_id: null,
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
        generated_from_idea: ideaId,
        source_type: idea.source_url ? "url" : "text",
      },
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  await supabase
    .from("content_ideas")
    .update({
      use_count: (idea.use_count || 0) + 1,
      promoted_post_id: post.id,
    })
    .eq("id", ideaId);

  return NextResponse.json(post, { status: 201 });
}
