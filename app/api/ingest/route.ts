import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { IDEA_SOURCES, CONTENT_PILLARS, HOOK_TYPES, FUNNEL_STAGES } from "@/lib/content-strategy";
import type { IdeaSource, ContentPillar, HookType, FunnelStage } from "@/lib/types/database";

const VALID_SOURCES = new Set(IDEA_SOURCES.map((s) => s.value));
const VALID_PILLARS = new Set(CONTENT_PILLARS.map((p) => p.value));
const VALID_HOOKS = new Set(HOOK_TYPES.map((h) => h.value));
const VALID_FUNNELS = new Set(FUNNEL_STAGES.map((f) => f.value));

function verifyIngestToken(request: NextRequest): boolean {
  const token = request.headers
    .get("authorization")
    ?.replace("Bearer ", "");
  return !!token && token === process.env.INGEST_API_KEY;
}

interface IngestRequestBody {
  source?: string;
  raw_insight?: string;
  source_url?: string;
  source_material?: string;
  source_metadata?: Record<string, unknown>;
  suggested_hook?: string;
  suggested_funnel?: string;
  suggested_pillar?: string;
}

export async function POST(request: NextRequest) {
  if (!verifyIngestToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: IngestRequestBody;
  try {
    body = (await request.json()) as IngestRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { source, raw_insight, source_url, source_material, source_metadata } = body;

  if (!source || !VALID_SOURCES.has(source as IdeaSource)) {
    return NextResponse.json(
      { error: `Invalid or missing source. Valid: ${[...VALID_SOURCES].join(", ")}` },
      { status: 400 }
    );
  }

  if (!raw_insight || !raw_insight.trim()) {
    return NextResponse.json(
      { error: "raw_insight is required" },
      { status: 400 }
    );
  }

  // Validate optional strategy suggestions
  if (body.suggested_hook && !VALID_HOOKS.has(body.suggested_hook as HookType)) {
    return NextResponse.json({ error: "Invalid suggested_hook" }, { status: 400 });
  }
  if (body.suggested_funnel && !VALID_FUNNELS.has(body.suggested_funnel as FunnelStage)) {
    return NextResponse.json({ error: "Invalid suggested_funnel" }, { status: 400 });
  }
  if (body.suggested_pillar && !VALID_PILLARS.has(body.suggested_pillar as ContentPillar)) {
    return NextResponse.json({ error: "Invalid suggested_pillar" }, { status: 400 });
  }

  // Idempotency: if source_metadata.external_id is provided, check for duplicates
  const externalId = source_metadata?.external_id;
  if (externalId && typeof externalId === "string") {
    const { data: existing } = await supabase
      .from("content_ideas")
      .select("*")
      .eq("source_metadata->>external_id", externalId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }
  }

  const { data, error } = await supabase
    .from("content_ideas")
    .insert({
      raw_insight: raw_insight.trim(),
      source: source as IdeaSource,
      source_url: source_url?.trim() || null,
      source_material: source_material?.trim() || null,
      source_metadata: source_metadata || {},
      suggested_hook: (body.suggested_hook as HookType) || null,
      suggested_funnel: (body.suggested_funnel as FunnelStage) || null,
      suggested_pillar: (body.suggested_pillar as ContentPillar) || null,
      status: "captured",
    })
    .select()
    .single();

  if (error) {
    console.error("Ingest insert failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
