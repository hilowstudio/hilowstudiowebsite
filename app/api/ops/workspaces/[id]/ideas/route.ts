import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const source = searchParams.get("source");
  const limit = Number(searchParams.get("limit") || "10");
  const offset = Number(searchParams.get("offset") || "0");
  const countOnly = searchParams.get("count") === "true";

  let query = supabase
    .from("content_ideas")
    .select("*", { count: "exact" })
    .eq("workspace_id", id)
    .is("client_id", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (source) query = query.eq("source", source);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (countOnly) return NextResponse.json({ count });
  return NextResponse.json({ data: data || [], total: count || 0 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const {
    raw_insight,
    source,
    suggested_hook,
    suggested_funnel,
    suggested_pillar,
    source_url,
    source_material,
    source_metadata,
  } = body;

  if (!raw_insight) {
    return NextResponse.json(
      { error: "Insight text is required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("content_ideas")
    .insert({
      workspace_id: id,
      client_id: null,
      raw_insight,
      source: source || "personal",
      suggested_hook: suggested_hook || null,
      suggested_funnel: suggested_funnel || null,
      suggested_pillar: suggested_pillar || null,
      source_url: source_url?.trim() || null,
      source_material: source_material?.trim() || null,
      source_metadata: source_metadata || {},
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
