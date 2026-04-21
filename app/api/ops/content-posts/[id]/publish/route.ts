import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import { resolveContentPostScope } from "@/lib/ops/content";
import { inngest } from "@/lib/inngest/client";
import {
  publishTextPost,
  publishDocumentPost,
  uploadDocument,
  LinkedInNotConnectedError,
  LinkedInTokenExpiredError,
} from "@/lib/linkedin";
import { incrementUsage } from "@/lib/ops/meters";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const scope = await resolveContentPostScope(id);
  if (!scope) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasClientAccess(
      user.memberships,
      scope.clientId,
      scope.workspaceId,
      "client_contributor",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    .eq("id", id)
    .in("status", ["draft", "scheduled", "failed", "approved"])
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
        scope.clientId,
      );
      result = await publishDocumentPost(
        post.body,
        documentUrn,
        post.title || "Carousel",
        scope.clientId,
      );
    } else {
      result = await publishTextPost(post.body, scope.clientId);
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
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await incrementUsage(scope.clientId, "posts_published", 1);

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
    await supabase
      .from("content_posts")
      .update({ status: "failed", error_message: message })
      .eq("id", id);

    const status =
      err instanceof LinkedInNotConnectedError ||
      err instanceof LinkedInTokenExpiredError
        ? 412
        : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
