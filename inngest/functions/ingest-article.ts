import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { articleSummarySchema } from "@/lib/ai/schemas";

export const ingestArticle = inngest.createFunction(
  {
    id: "ingest-article",
    retries: 2,
    triggers: [{ event: "source/article.ingest" }],
  },
  async ({ event, step }) => {
    const { url } = event.data as { url: string };

    // Step 1: Check for duplicate
    const existing = await step.run("check-duplicate", async () => {
      const { data } = await supabase
        .from("content_ideas")
        .select("id")
        .eq("source_metadata->>external_id", `article:${url}`)
        .maybeSingle();
      return data;
    });

    if (existing) {
      return { status: "duplicate", ideaId: existing.id };
    }

    // Step 2: Fetch and summarize the article using Gemini
    const analysis = await step.run("analyze-article", async () => {
      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: articleSummarySchema,
        messages: [
          {
            role: "user",
            content: `Read this URL and analyze the article content. Extract a summary, key takeaways, and entities.\n\nURL: ${url}`,
          },
        ],
      });
      return object;
    });

    // Step 3: Create content idea
    const idea = await step.run("create-idea", async () => {
      const { data, error } = await supabase
        .from("content_ideas")
        .insert({
          raw_insight: analysis.summary,
          source: "article",
          source_url: url,
          source_metadata: {
            source_system: "hi-low",
            external_id: `article:${url}`,
            title: url,
            summary: analysis.summary,
            key_takeaways: analysis.keyTakeaways,
            entities: analysis.entities,
          },
          status: "captured",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    return { status: "created", ideaId: idea.id };
  }
);
