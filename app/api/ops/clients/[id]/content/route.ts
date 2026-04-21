import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

async function loadClient(clientId: string) {
  const { data } = await supabase
    .from("ops_clients")
    .select("id, workspace_id")
    .eq("id", clientId)
    .maybeSingle();
  return data as { id: string; workspace_id: string } | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const client = await loadClient(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasClientAccess(
      user.memberships,
      client.id,
      client.workspace_id,
      "client_contributor",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    body?: string;
    post_type?: string;
    scheduled_at?: string;
    status?: string;
    hook_type?: string;
    funnel_stage?: string;
    content_pillar?: string;
  };

  if (!body.body?.trim()) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("content_posts")
    .insert({
      workspace_id: client.workspace_id,
      client_id: client.id,
      title: body.title?.trim() || null,
      body: body.body,
      post_type: body.post_type || "text",
      scheduled_at: body.scheduled_at || null,
      status: body.status || "draft",
      hook_type: body.hook_type || null,
      funnel_stage: body.funnel_stage || null,
      content_pillar: body.content_pillar || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
