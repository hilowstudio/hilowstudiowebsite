import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { inngest } from "@/lib/inngest/client";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = (await request.json()) as {
    postId: string;
  };

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  // Verify post exists
  const { data: post } = await supabase
    .from("content_posts")
    .select("id")
    .eq("id", postId)
    .single();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await inngest.send({
    name: "content/image.generate",
    data: { postId },
  });

  return NextResponse.json({ queued: true }, { status: 202 });
}
