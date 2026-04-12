import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { inngest } from "@/lib/inngest/client";
import {
  publishTextPost,
  publishDocumentPost,
  uploadDocument,
  LinkedInNotConnectedError,
  LinkedInTokenExpiredError,
} from "@/lib/linkedin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Fetch the post
  const { data: post, error: fetchErr } = await supabase
    .from("content_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.status === "published") {
    return NextResponse.json(
      { error: "Post is already published" },
      { status: 400 }
    );
  }
  if (post.status === "publishing") {
    return NextResponse.json(
      { error: "Post is already being published" },
      { status: 409 }
    );
  }

  // Optimistic lock: flip to publishing only if still in a publishable state.
  // Mirrors the cron route at app/api/cron/publish-linkedin/route.ts.
  const { data: locked, error: lockErr } = await supabase
    .from("content_posts")
    .update({ status: "publishing" })
    .eq("id", id)
    .in("status", ["draft", "scheduled", "failed"])
    .select()
    .single();

  if (lockErr || !locked) {
    return NextResponse.json(
      { error: "Could not lock post for publishing (race condition?)" },
      { status: 409 }
    );
  }

  try {
    let result;

    // If carousel with a generated PDF, attempt document upload + document post
    if (
      post.post_type === "carousel" &&
      post.metadata?.carousel_pdf
    ) {
      const pdfBuffer = Buffer.from(
        post.metadata.carousel_pdf as string,
        "base64"
      );
      const documentUrn = await uploadDocument(pdfBuffer, post.title || "Carousel");
      result = await publishDocumentPost(
        post.body,
        documentUrn,
        post.title || "Carousel"
      );
    } else {
      result = await publishTextPost(post.body);
    }

    const { data: updated, error: updateErr } = await supabase
      .from("content_posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        linkedin_post_id: result.id,
        error_message: null,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      console.error("Failed to mark post as published:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Schedule first comment if configured
    if (post.first_comment && result.id) {
      await inngest.send({
        name: "linkedin/first-comment.schedule",
        data: {
          postId: id,
          postUrn: result.id,
          comment: post.first_comment,
          delayMinutes: post.first_comment_delay_minutes || 2,
        },
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Publish failed for post ${id}:`, message);

    await supabase
      .from("content_posts")
      .update({
        status: "failed",
        error_message: message,
      })
      .eq("id", id);

    const status =
      err instanceof LinkedInNotConnectedError ||
      err instanceof LinkedInTokenExpiredError
        ? 412 // Precondition Failed: LinkedIn needs (re)connection
        : 502; // Bad Gateway: upstream LinkedIn API failure

    return NextResponse.json({ error: message }, { status });
  }
}
