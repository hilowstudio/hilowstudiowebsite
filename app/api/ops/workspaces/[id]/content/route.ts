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
  const hookType = searchParams.get("hook_type");
  const funnelStage = searchParams.get("funnel_stage");
  const pillar = searchParams.get("content_pillar");

  let query = supabase
    .from("content_posts")
    .select("*")
    .eq("workspace_id", id)
    .is("client_id", null)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (hookType) query = query.eq("hook_type", hookType);
  if (funnelStage) query = query.eq("funnel_stage", funnelStage);
  if (pillar) query = query.eq("content_pillar", pillar);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const body = (await request.json().catch(() => ({}))) as {
    title?: string | null;
    body?: string;
    post_type?: string;
    scheduled_at?: string | null;
    status?: string;
    hook_type?: string | null;
    funnel_stage?: string | null;
    content_pillar?: string | null;
    metadata?: Record<string, unknown>;
  };

  if (!body.body?.trim() && body.status !== "draft") {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  let week_number: number | null = null;
  if (body.scheduled_at) {
    const d = new Date(body.scheduled_at);
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    week_number = Math.ceil(
      ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
  }

  const { data, error } = await supabase
    .from("content_posts")
    .insert({
      workspace_id: id,
      client_id: null,
      title: body.title?.trim() || null,
      body: body.body || "",
      post_type: body.post_type || "text",
      scheduled_at: body.scheduled_at || null,
      status: body.status || "draft",
      hook_type: body.hook_type || null,
      funnel_stage: body.funnel_stage || null,
      content_pillar: body.content_pillar || null,
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
