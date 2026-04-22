import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

async function ensureIdeaInWorkspace(workspaceId: string, ideaId: string) {
  const { data } = await supabase
    .from("content_ideas")
    .select("id, workspace_id, client_id")
    .eq("id", ideaId)
    .maybeSingle();
  if (!data) return { found: false as const };
  if (data.workspace_id !== workspaceId || data.client_id !== null) {
    return { found: true as const, scoped: false as const };
  }
  return { found: true as const, scoped: true as const };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ideaId: string }> },
) {
  const { id, ideaId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const check = await ensureIdeaInWorkspace(id, ideaId);
  if (!check.found)
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  if (!check.scoped)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const allowed = [
    "raw_insight",
    "source",
    "suggested_hook",
    "suggested_funnel",
    "suggested_pillar",
    "status",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("content_ideas")
    .update(updates)
    .eq("id", ideaId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ideaId: string }> },
) {
  const { id, ideaId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const check = await ensureIdeaInWorkspace(id, ideaId);
  if (!check.found)
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  if (!check.scoped)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase
    .from("content_ideas")
    .delete()
    .eq("id", ideaId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
