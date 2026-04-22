import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { inngest } from "@/lib/inngest/client";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> },
) {
  const { id, postId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const { data: post } = await supabase
    .from("content_posts")
    .select("id")
    .eq("id", postId)
    .eq("workspace_id", id)
    .is("client_id", null)
    .maybeSingle();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await inngest.send({
    name: "content/image.generate",
    data: { postId, workspaceId: id },
  });

  return NextResponse.json({ queued: true }, { status: 202 });
}
