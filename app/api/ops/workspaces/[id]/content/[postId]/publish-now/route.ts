import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { inngest } from "@/lib/inngest/client";
import {
  publishTextPost,
  publishDocumentPost,
  uploadDocument,
  LinkedInNotConnectedError,
  LinkedInTokenExpiredError,
} from "@/lib/linkedin";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> },
) {
  const { id, postId } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const { data: post, error: fetchErr } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", postId)
    .eq("workspace_id", id)
    .is("client_id", null)
    .single();

  if (fetchErr || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  if (post.status === "published") {
    return NextResponse.json(
      { error: "Post is already published" },
      { status: 400 },
    );
  }
  if (post.status === "publishing") {
    return NextResponse.json(
      { error: "Post is already being published" },
      { status: 409 },
    );
  }

  const { data: locked, error: lockErr } = await supabase
    .from("content_posts")
    .update({ status: "publishing" })
    .eq("id", postId)
    .in("status", ["draft", "scheduled", "failed"])
    .select()
    .single();

  if (lockErr || !locked) {
    return NextResponse.json(
      { error: "Could not lock post for publishing (race condition?)" },
      { status: 409 },
    );
  }

  try {
    let result;
    if (post.post_type === "carousel" && post.metadata?.carousel_pdf) {
      const pdfBuffer = Buffer.from(
        post.metadata.carousel_pdf as string,
        "base64",
      );
      const documentUrn = await uploadDocument(
        pdfBuffer,
        post.title || "Carousel",
        null,
        id,
      );
      result = await publishDocumentPost(
        post.body,
        documentUrn,
        post.title || "Carousel",
        null,
        id,
      );
    } else {
      result = await publishTextPost(post.body, null, id);
    }

    const { data: updated, error: updateErr } = await supabase
      .from("content_posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        linkedin_post_id: result.id,
        error_message: null,
      })
      .eq("id", postId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    if (post.first_comment && result.id) {
      await inngest.send({
        name: "linkedin/first-comment.schedule",
        data: {
          postId,
          postUrn: result.id,
          comment: post.first_comment,
          delayMinutes: post.first_comment_delay_minutes || 2,
          workspaceId: id,
        },
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("content_posts")
      .update({ status: "failed", error_message: message })
      .eq("id", postId);

    const status =
      err instanceof LinkedInNotConnectedError ||
      err instanceof LinkedInTokenExpiredError
        ? 412
        : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
