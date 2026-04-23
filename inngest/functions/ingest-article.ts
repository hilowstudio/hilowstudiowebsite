import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import { opsGenerateObject } from "@/lib/ops/llm";
import { fetchUrlAsMarkdown } from "@/lib/ops/url-fetch";
import { articleSummarySchema } from "@/lib/ai/schemas";

export const ingestArticle = inngest.createFunction(
  {
    id: "ingest-article",
    retries: 2,
    triggers: [{ event: "source/article.ingest" }],
  },
  async ({ event, step }) => {
    const { url, workspaceId, clientId } = event.data as {
      url: string;
      workspaceId?: string | null;
      clientId?: string | null;
    };

    // Step 1: Check for duplicate
    const existing = await step.run("check-duplicate", async () => {
      let query = supabase
        .from("content_ideas")
        .select("id")
        .eq("source_metadata->>external_id", `article:${url}`);
      if (workspaceId) query = query.eq("workspace_id", workspaceId);
      const { data } = await query.maybeSingle();
      return data;
    });

    if (existing) {
      return { status: "duplicate", ideaId: existing.id };
    }

    // Step 2: Fetch the article as clean markdown
    const pageMarkdown = await step.run("fetch-article", async () => {
      const fetched = await fetchUrlAsMarkdown(url);
      return fetched.content;
    });

    // Step 3: Analyze the article content via LLM (structured output)
    const analysis = await step.run("analyze-article", async () => {
      const result = await opsGenerateObject({
        scope: { workspaceId: workspaceId ?? null, clientId: clientId ?? null },
        tier: "standard",
        messages: [
          {
            role: "user",
            content: `Analyze the article below. Extract a summary, key takeaways, and entities.

URL: ${url}

<article>
${pageMarkdown}
</article>`,
          },
        ],
        schema: articleSummarySchema,
      });
      return result.object;
    });

    // Step 4: Create content idea
    const idea = await step.run("create-idea", async () => {
      const { data, error } = await supabase
        .from("content_ideas")
        .insert({
          workspace_id: workspaceId ?? null,
          client_id: clientId ?? null,
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
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    });

    return { status: "created", ideaId: idea.id };
  },
);
