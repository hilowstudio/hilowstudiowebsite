import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import { structureIntoSlides } from "@/lib/carousel/slides-from-post";
import { generateCarouselPdf } from "@/lib/carousel/generate-carousel";

export const generateCarousel = inngest.createFunction(
  {
    id: "generate-carousel",
    retries: 2,
    triggers: [{ event: "content/carousel.generate" }],
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

    // Step 2: AI structures content into slides
    const slides = await step.run("structure-slides", async () => {
      return await structureIntoSlides(post.body, post.title, {
        workspaceId: post.workspace_id ?? null,
        clientId: post.client_id ?? null,
      });
    });

    // Step 3: Generate PDF
    const pdfBase64 = await step.run("generate-pdf", async () => {
      const buffer = await generateCarouselPdf(slides);
      return buffer.toString("base64");
    });

    // Step 4: Store PDF in post metadata
    await step.run("save-pdf", async () => {
      const metadata = (post.metadata || {}) as Record<string, unknown>;
      metadata.carousel_pdf = pdfBase64;
      metadata.carousel_slides = slides;

      await supabase
        .from("content_posts")
        .update({ metadata, post_type: "carousel" })
        .eq("id", postId);
    });

    return { postId, slideCount: slides.length };
  }
);
