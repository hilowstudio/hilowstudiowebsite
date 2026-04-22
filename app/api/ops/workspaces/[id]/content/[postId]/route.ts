import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

async function ensurePostInWorkspace(workspaceId: string, postId: string) {
  const { data } = await supabase
    .from("content_posts")
    .select("id, workspace_id, client_id")
    .eq("id", postId)
    .maybeSingle();
  if (!data) return { found: false as const };
  if (data.workspace_id !== workspaceId || data.client_id !== null) {
    return { found: true as const, scoped: false as const };
  }
  return { found: true as const, scoped: true as const };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> },
) {
  const { id, postId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const check = await ensurePostInWorkspace(id, postId);
  if (!check.found) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (!check.scoped) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> },
) {
  const { id, postId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const check = await ensurePostInWorkspace(id, postId);
  if (!check.found) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (!check.scoped) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const allowed = [
    "title",
    "body",
    "post_type",
    "scheduled_at",
    "status",
    "metadata",
    "hook_type",
    "funnel_stage",
    "content_pillar",
    "visual_url",
    "first_comment",
    "first_comment_delay_minutes",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (updates.scheduled_at) {
    const d = new Date(updates.scheduled_at as string);
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    updates.week_number = Math.ceil(
      ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("content_posts")
    .update(updates)
    .eq("id", postId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> },
) {
  const { id, postId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const check = await ensurePostInWorkspace(id, postId);
  if (!check.found) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (!check.scoped) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("content_posts")
    .delete()
    .eq("id", postId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
