import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import { generateQuoteCard } from "@/lib/images/generate-quote-card";
import { opsGenerateObject } from "@/lib/ops/llm";
import { quoteSchema } from "@/lib/ai/schemas";

export const generateImage = inngest.createFunction(
  {
    id: "generate-image",
    retries: 2,
    triggers: [{ event: "content/image.generate" }],
  },
  async ({ event, step }) => {
    const { postId } = event.data as { postId: string };

    // Step 1: Fetch the post
    const post = await step.run("fetch-post", async () => {
      const { data, error } = await supabase
        .from("content_posts")
        .select("*")
        .eq("id", postId)
        .single();
      if (error || !data) throw new Error(`Post ${postId} not found`);
      return data;
    });

    // Step 2: Extract the best quote from the post via LLM (structured output)
    const quoteData = await step.run("extract-quote", async () => {
      const result = await opsGenerateObject({
        scope: {
          workspaceId: post.workspace_id ?? null,
          clientId: post.client_id ?? null,
        },
        tier: "fast",
        system:
          "Extract the single most powerful, shareable sentence or short passage from this LinkedIn post. Return it in the structured output. No quotation marks. Keep it under 200 characters for visual impact.",
        messages: [{ role: "user", content: post.body }],
        schema: quoteSchema,
        maxTokens: 500,
      });
      return result.object.quote.trim() || post.body.slice(0, 200);
    });

    // Step 3: Generate the quote card PDF
    const pdfBase64 = await step.run("generate-quote-card", async () => {
      const variant = Math.random() > 0.5 ? "ink" : "paper";
      const buffer = await generateQuoteCard(
        quoteData,
        "Hi-Low Studio",
        variant,
      );
      return buffer.toString("base64");
    });

    // Step 4: Save to post metadata
    await step.run("save-quote-card", async () => {
      const metadata = (post.metadata || {}) as Record<string, unknown>;
      metadata.post_image = pdfBase64;
      metadata.post_image_type = "quote_card";

      await supabase
        .from("content_posts")
        .update({ metadata })
        .eq("id", postId);
    });

    return { postId, type: "quote_card" };
  },
);
