import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ideaId: string }> },
) {
  const { id, ideaId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

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
  if (idea.status === "promoted") {
    return NextResponse.json({ error: "Already promoted" }, { status: 400 });
  }

  const { data: post, error: postErr } = await supabase
    .from("content_posts")
    .insert({
      workspace_id: id,
      client_id: null,
      title: null,
      body: idea.raw_insight,
      post_type: "text",
      hook_type: idea.suggested_hook || null,
      funnel_stage: idea.suggested_funnel || null,
      content_pillar: idea.suggested_pillar || null,
      status: "draft",
      metadata: { promoted_from_idea: ideaId },
    })
    .select()
    .single();

  if (postErr) {
    return NextResponse.json({ error: postErr.message }, { status: 500 });
  }

  await supabase
    .from("content_ideas")
    .update({ status: "promoted", promoted_post_id: post.id })
    .eq("id", ideaId);

  return NextResponse.json(post, { status: 201 });
}
