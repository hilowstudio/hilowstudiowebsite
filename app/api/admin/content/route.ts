import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const hookType = request.nextUrl.searchParams.get("hook_type");
  const funnelStage = request.nextUrl.searchParams.get("funnel_stage");
  const pillar = request.nextUrl.searchParams.get("content_pillar");

  let query = supabase
    .from("content_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }
  if (hookType) {
    query = query.eq("hook_type", hookType);
  }
  if (funnelStage) {
    query = query.eq("funnel_stage", funnelStage);
  }
  if (pillar) {
    query = query.eq("content_pillar", pillar);
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
  const { title, body: postBody, post_type, scheduled_at, status, hook_type, funnel_stage, content_pillar } = body;

  if (!postBody) {
    return NextResponse.json({ error: "Post body is required" }, { status: 400 });
  }

  // Compute ISO week number from scheduled_at if provided
  let week_number: number | null = null;
  if (scheduled_at) {
    const d = new Date(scheduled_at);
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    week_number = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  const { data, error } = await supabase
    .from("content_posts")
    .insert({
      title: title || null,
      body: postBody,
      post_type: post_type || "text",
      scheduled_at: scheduled_at || null,
      status: status || "draft",
      hook_type: hook_type || null,
      funnel_stage: funnel_stage || null,
      content_pillar: content_pillar || null,
      week_number,
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
