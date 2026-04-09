import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");

  let query = supabase
    .from("content_ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
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
  } = body;

  if (!raw_insight) {
    return NextResponse.json({ error: "Insight text is required" }, { status: 400 });
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
      status: "captured",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
