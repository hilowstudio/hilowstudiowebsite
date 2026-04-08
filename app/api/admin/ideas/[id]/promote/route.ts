import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Fetch the idea
  const { data: idea, error: ideaErr } = await supabase
    .from("content_ideas")
    .select("*")
    .eq("id", id)
    .single();

  if (ideaErr || !idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  if (idea.status === "promoted") {
    return NextResponse.json({ error: "Already promoted" }, { status: 400 });
  }

  // Create a draft post from the idea
  const { data: post, error: postErr } = await supabase
    .from("content_posts")
    .insert({
      title: null,
      body: idea.raw_insight,
      post_type: "text",
      hook_type: idea.suggested_hook || null,
      funnel_stage: idea.suggested_funnel || null,
      content_pillar: idea.suggested_pillar || null,
      status: "draft",
      metadata: { promoted_from_idea: id },
    })
    .select()
    .single();

  if (postErr) {
    return NextResponse.json({ error: postErr.message }, { status: 500 });
  }

  // Update the idea as promoted
  await supabase
    .from("content_ideas")
    .update({
      status: "promoted",
      promoted_post_id: post.id,
    })
    .eq("id", id);

  return NextResponse.json(post, { status: 201 });
}
