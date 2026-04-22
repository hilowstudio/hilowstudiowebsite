import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import { REPURPOSE_THRESHOLDS } from "@/lib/content-strategy";

export const checkRepurpose = inngest.createFunction(
  {
    id: "check-repurpose",
    retries: 1,
    triggers: [{ event: "content/repurpose.check" }],
  },
  async ({ step }) => {
    const created = await step.run("find-repurposable", async () => {
      const cutoff = new Date();
      cutoff.setDate(
        cutoff.getDate() - REPURPOSE_THRESHOLDS.min_age_days
      );

      // Get published posts older than threshold
      const { data: posts } = await supabase
        .from("content_posts")
        .select("id, body, title, hook_type, funnel_stage, content_pillar, published_at, workspace_id, client_id")
        .eq("status", "published")
        .lte("published_at", cutoff.toISOString());

      if (!posts || posts.length === 0) return [];

      const newSources: string[] = [];

      for (const post of posts) {
        // Check if already repurposed
        const { data: existing } = await supabase
          .from("content_ideas")
          .select("id")
          .eq("source_metadata->>external_id", `repurpose:${post.id}`)
          .maybeSingle();

        if (existing) continue;

        // Get latest metrics
        const { data: metrics } = await supabase
          .from("linkedin_metrics")
          .select("impressions, likes, comments, shares")
          .eq("post_id", post.id)
          .order("fetched_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!metrics) continue;

        const { impressions, likes, comments, shares } = metrics;
        if (impressions < REPURPOSE_THRESHOLDS.min_impressions) continue;

        const engagementRate =
          (likes + comments + shares) / Math.max(impressions, 1);
        if (engagementRate < REPURPOSE_THRESHOLDS.min_engagement_rate)
          continue;

        // Create repurpose source
        const { data: idea, error } = await supabase
          .from("content_ideas")
          .insert({
            workspace_id: post.workspace_id ?? null,
            client_id: post.client_id ?? null,
            raw_insight: `High-performing post (${impressions.toLocaleString()} impressions, ${(engagementRate * 100).toFixed(1)}% engagement): ${post.body.slice(0, 300)}`,
            source: "repurpose",
            source_metadata: {
              source_system: "repurpose",
              external_id: `repurpose:${post.id}`,
              original_post_id: post.id,
              original_body: post.body,
              original_title: post.title,
              original_hook_type: post.hook_type,
              original_funnel_stage: post.funnel_stage,
              original_pillar: post.content_pillar,
              published_at: post.published_at,
              metrics: { impressions, likes, comments, shares, engagementRate },
              suggestion:
                "Rewrite from a new angle, convert to carousel, or target a different funnel stage.",
            },
            status: "active",
          })
          .select("id")
          .single();

        if (!error && idea) newSources.push(idea.id);
      }

      return newSources;
    });

    return { created: created.length, ids: created };
  }
);
