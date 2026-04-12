import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import { generateQuoteCard } from "@/lib/images/generate-quote-card";
import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";

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

    // Step 2: Extract the best quote from the post via AI
    const quoteData = await step.run("extract-quote", async () => {
      const response = await getAnthropic().messages.create({
        model: SONNET_MODEL,
        max_tokens: 500,
        system:
          "Extract the single most powerful, shareable sentence or short passage from this LinkedIn post. Return ONLY the quote text, nothing else. No quotation marks. Keep it under 200 characters for visual impact.",
        messages: [{ role: "user", content: post.body }],
      });
      const text = response.content.find((b) => b.type === "text");
      return text && text.type === "text"
        ? text.text.trim()
        : post.body.slice(0, 200);
    });

    // Step 3: Generate the quote card PDF
    const pdfBase64 = await step.run("generate-quote-card", async () => {
      const variant = Math.random() > 0.5 ? "ink" : "paper";
      const buffer = await generateQuoteCard(
        quoteData,
        "Hi-Low Studio",
        variant
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
  }
);
