"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  ContentPost,
  LinkedinMetrics,
  ContentPillarRow,
} from "@/lib/types/database";
import { HOOK_TYPES, FUNNEL_STAGES } from "@/lib/content-strategy";

interface EnrichedPost extends ContentPost {
  metrics: LinkedinMetrics | null;
}

interface Aggregation {
  count: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

interface AnalyticsData {
  posts: EnrichedPost[];
  aggregations: {
    byHook: Record<string, Aggregation>;
    byFunnel: Record<string, Aggregation>;
    byPillar: Record<string, Aggregation>;
  } | null;
}

export function WorkspaceAnalytics({ workspaceId }: { workspaceId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dbPillars, setDbPillars] = useState<ContentPillarRow[]>([]);

  useEffect(() => {
    fetch(`/api/ops/workspaces/${workspaceId}/pillars`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setDbPillars)
      .catch(() => {});
  }, [workspaceId]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/analytics`,
      { cache: "no-store" },
    );
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function copyClaudeBrief() {
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/analytics?export=claude`,
    );
    if (res.ok) {
      const { brief } = await res.json();
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function engagementRate(m: LinkedinMetrics | null): string {
    if (!m || m.impressions === 0) return "\u2013";
    const engagements = m.likes + m.comments + m.shares + m.clicks;
    return ((engagements / m.impressions) * 100).toFixed(1) + "%";
  }

  if (loading)
    return <p className="text-ink-light text-sm py-8">Loading...</p>;

  const posts = data?.posts || [];
  const aggregations = data?.aggregations;
  const hasMetrics = posts.some((p) => p.metrics);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Analytics</h1>
          <p className="text-sm text-ink-muted mt-1">
            {posts.length} published post{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={copyClaudeBrief}
          className="px-4 py-2 rounded-md border border-paper-muted text-sm text-ink hover:bg-paper-warm transition-colors"
        >
          {copied ? "Copied" : "Copy Performance Brief for Claude"}
        </button>
      </div>

      {!hasMetrics && posts.length > 0 && (
        <div className="rounded-lg border border-paper-muted p-4">
          <p className="text-sm text-ink-muted">
            No metrics fetched yet. Metrics populate once the fetch cron runs
            against your published LinkedIn posts.
          </p>
        </div>
      )}

      {aggregations && (
        <section>
          <h2 className="text-xs text-ink-muted uppercase tracking-wide mb-3">
            By Funnel Stage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["tofu", "mofu", "bofu", "untagged"].map((stage) => {
              const agg = aggregations.byFunnel[stage];
              if (!agg) return null;
              const funnelDef = FUNNEL_STAGES.find((f) => f.value === stage);
              return (
                <div key={stage} className="rounded-lg border border-paper-muted p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        funnelDef?.colorClass || "bg-paper-muted text-ink-muted"
                      }`}
                    >
                      {stage.toUpperCase()}
                    </span>
                    <span className="text-xs text-ink-light">
                      {agg.count} post{agg.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-ink-light text-xs">Impressions</p>
                      <p className="text-ink font-medium">
                        {agg.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-light text-xs">Likes</p>
                      <p className="text-ink font-medium">
                        {agg.likes.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-light text-xs">Comments</p>
                      <p className="text-ink font-medium">
                        {agg.comments.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-light text-xs">Clicks</p>
                      <p className="text-ink font-medium">
                        {agg.clicks.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {aggregations && (
        <section>
          <h2 className="text-xs text-ink-muted uppercase tracking-wide mb-3">
            By Content Pillar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(aggregations.byPillar).map(([pillar, agg]) => {
              if (!agg || agg.count === 0) return null;
              const pillarDef = dbPillars.find((p) => p.slug === pillar);
              return (
                <div key={pillar} className="rounded-lg border border-paper-muted p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        pillarDef?.color_class || "bg-paper-muted text-ink-muted"
                      }`}
                    >
                      {pillarDef?.short_label || pillar}
                    </span>
                    <span className="text-xs text-ink-light">
                      {agg.count} post{agg.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-ink-light text-xs">Impressions</p>
                      <p className="text-ink font-medium">
                        {agg.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink-light text-xs">Likes</p>
                      <p className="text-ink font-medium">
                        {agg.likes.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {aggregations && (
        <section>
          <h2 className="text-xs text-ink-muted uppercase tracking-wide mb-3">
            By Hook Type
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-muted border-b border-paper-muted">
                  <th className="pb-2 font-medium">Hook</th>
                  <th className="pb-2 font-medium text-right">Posts</th>
                  <th className="pb-2 font-medium text-right">Impressions</th>
                  <th className="pb-2 font-medium text-right">Likes</th>
                  <th className="pb-2 font-medium text-right">Comments</th>
                  <th className="pb-2 font-medium text-right">Shares</th>
                  <th className="pb-2 font-medium text-right">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(aggregations.byHook).map(([hook, agg]) => {
                  const hookDef = HOOK_TYPES.find((h) => h.value === hook);
                  return (
                    <tr key={hook} className="border-b border-paper-muted/50">
                      <td className="py-2.5 text-ink">
                        {hookDef?.label || hook}
                      </td>
                      <td className="py-2.5 text-ink-muted text-right">
                        {agg.count}
                      </td>
                      <td className="py-2.5 text-ink text-right">
                        {agg.impressions.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-ink text-right">
                        {agg.likes.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-ink text-right">
                        {agg.comments.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-ink text-right">
                        {agg.shares.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-ink text-right">
                        {agg.clicks.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className="text-xs text-ink-muted uppercase tracking-wide mb-3">
            Post Performance
          </h2>
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.id} className="rounded-lg border border-paper-muted p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink truncate">
                      {post.title || post.body.slice(0, 80)}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {post.hook_type && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-paper-muted text-ink-muted">
                          {HOOK_TYPES.find((h) => h.value === post.hook_type)?.label ||
                            post.hook_type}
                        </span>
                      )}
                      {post.funnel_stage && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            FUNNEL_STAGES.find((f) => f.value === post.funnel_stage)
                              ?.colorClass || ""
                          }`}
                        >
                          {post.funnel_stage.toUpperCase()}
                        </span>
                      )}
                      {post.content_pillar && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            dbPillars.find((p) => p.slug === post.content_pillar)
                              ?.color_class || ""
                          }`}
                        >
                          {
                            dbPillars.find((p) => p.slug === post.content_pillar)
                              ?.short_label
                          }
                        </span>
                      )}
                      <span className="text-xs text-ink-light">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-ink-light shrink-0">
                    ER: {engagementRate(post.metrics)}
                  </span>
                </div>

                {post.metrics ? (
                  <div className="grid grid-cols-5 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-ink-light">Impressions</p>
                      <p className="text-sm text-ink font-medium">
                        {post.metrics.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-light">Likes</p>
                      <p className="text-sm text-ink font-medium">
                        {post.metrics.likes.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-light">Comments</p>
                      <p className="text-sm text-ink font-medium">
                        {post.metrics.comments.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-light">Shares</p>
                      <p className="text-sm text-ink font-medium">
                        {post.metrics.shares.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-light">Clicks</p>
                      <p className="text-sm text-ink font-medium">
                        {post.metrics.clicks.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-ink-light mt-2">No metrics yet</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-ink-muted text-sm">
            No published posts yet. Create and schedule content to see analytics here.
          </p>
        </div>
      )}
    </div>
  );
}
