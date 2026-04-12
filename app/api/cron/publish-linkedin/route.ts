import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { inngest } from "@/lib/inngest/client";
import { publishTextPost, publishDocumentPost, uploadDocument } from "@/lib/linkedin";

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();

  // Find posts that are scheduled and due
  const { data: duePosts, error: queryErr } = await supabase
    .from("content_posts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(5);

  if (queryErr) {
    return NextResponse.json({ error: queryErr.message }, { status: 500 });
  }

  if (!duePosts || duePosts.length === 0) {
    return NextResponse.json({ success: true, published: 0 });
  }

  let published = 0;
  let failed = 0;

  for (const post of duePosts) {
    // Optimistic lock: set to publishing
    await supabase
      .from("content_posts")
      .update({ status: "publishing" })
      .eq("id", post.id)
      .eq("status", "scheduled");

    try {
      let result;

      if (post.post_type === "carousel" && post.metadata?.carousel_pdf) {
        const pdfBuffer = Buffer.from(post.metadata.carousel_pdf as string, "base64");
        const documentUrn = await uploadDocument(pdfBuffer, post.title || "Carousel");
        result = await publishDocumentPost(post.body, documentUrn, post.title || "Carousel");
      } else {
        result = await publishTextPost(post.body);
      }

      await supabase
        .from("content_posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          linkedin_post_id: result.id,
        })
        .eq("id", post.id);

      // Schedule first comment if configured
      if (post.first_comment && result.id) {
        await inngest.send({
          name: "linkedin/first-comment.schedule",
          data: {
            postId: post.id,
            postUrn: result.id,
            comment: post.first_comment,
            delayMinutes: post.first_comment_delay_minutes || 2,
          },
        });
      }

      published++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Failed to publish post ${post.id}:`, message);

      await supabase
        .from("content_posts")
        .update({
          status: "failed",
          error_message: message,
        })
        .eq("id", post.id);

      failed++;
    }
  }

  return NextResponse.json({ success: true, published, failed });
}
