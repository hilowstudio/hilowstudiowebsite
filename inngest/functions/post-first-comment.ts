import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import { postComment } from "@/lib/linkedin";

export const postFirstComment = inngest.createFunction(
  {
    id: "post-first-comment",
    retries: 3,
    triggers: [{ event: "linkedin/first-comment.schedule" }],
  },
  async ({ event, step }) => {
    const { postId, postUrn, comment, delayMinutes } = event.data as {
      postId: string;
      postUrn: string;
      comment: string;
      delayMinutes: number;
    };

    // Wait the configured delay
    await step.sleep("wait-before-comment", `${delayMinutes}m`);

    // Post the comment
    const commentId = await step.run("post-comment", async () => {
      return await postComment(postUrn, comment);
    });

    // Mark as posted in the database
    await step.run("mark-posted", async () => {
      await supabase
        .from("content_posts")
        .update({ first_comment_posted: true })
        .eq("id", postId);
    });

    return { commentId, postId };
  }
);
