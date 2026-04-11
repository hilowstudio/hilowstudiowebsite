import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const source = request.nextUrl.searchParams.get("source");
  const limit = Number(request.nextUrl.searchParams.get("limit") || "10");
  const offset = Number(request.nextUrl.searchParams.get("offset") || "0");
  const countOnly = request.nextUrl.searchParams.get("count") === "true";

  let query = supabase
    .from("content_ideas")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }
  if (source) {
    query = query.eq("source", source);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (countOnly) {
    return NextResponse.json({ count });
  }

  return NextResponse.json({ data: data || [], total: count || 0 });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("content_ideas")
    .insert({
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
