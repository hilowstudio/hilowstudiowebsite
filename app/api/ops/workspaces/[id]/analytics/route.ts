import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

type Bucket = {
  count: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
};

function emptyBucket(): Bucket {
  return { count: 0, impressions: 0, likes: 0, comments: 0, shares: 0, clicks: 0 };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const exportFormat = request.nextUrl.searchParams.get("export");

  const { data: posts, error: postsErr } = await supabase
    .from("content_posts")
    .select("*")
    .eq("workspace_id", id)
    .is("client_id", null)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (postsErr) {
    return NextResponse.json({ error: postsErr.message }, { status: 500 });
  }

  if (!posts || posts.length === 0) {
    if (exportFormat === "claude") {
      return NextResponse.json({
        brief:
          "# Content Performance Brief\n\nNo published posts with metrics yet.",
      });
    }
    return NextResponse.json({ posts: [], aggregations: null });
  }

  const postIds = posts.map((p) => p.id);
  const { data: allMetrics } = await supabase
    .from("linkedin_metrics")
    .select("*")
    .in("post_id", postIds)
    .order("fetched_at", { ascending: false });

  type MetricRow = {
    post_id: string;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
  };
  const latestMetrics: Record<string, MetricRow> = {};
  for (const m of (allMetrics as MetricRow[] | null) || []) {
    if (!latestMetrics[m.post_id]) latestMetrics[m.post_id] = m;
  }

  const enriched = posts.map((p) => ({ ...p, metrics: latestMetrics[p.id] || null }));

  const byHook: Record<string, Bucket> = {};
  const byFunnel: Record<string, Bucket> = {};
  const byPillar: Record<string, Bucket> = {};

  for (const p of enriched) {
    const m = p.metrics;
    const hook = p.hook_type || "untagged";
    const funnel = p.funnel_stage || "untagged";
    const pillar = p.content_pillar || "untagged";

    if (!byHook[hook]) byHook[hook] = emptyBucket();
    if (!byFunnel[funnel]) byFunnel[funnel] = emptyBucket();
    if (!byPillar[pillar]) byPillar[pillar] = emptyBucket();

    byHook[hook].count++;
    byFunnel[funnel].count++;
    byPillar[pillar].count++;

    if (m) {
      for (const k of ["impressions", "likes", "comments", "shares", "clicks"] as const) {
        byHook[hook][k] += m[k];
        byFunnel[funnel][k] += m[k];
        byPillar[pillar][k] += m[k];
      }
    }
  }

  if (exportFormat === "claude") {
    const topPosts = enriched
      .filter((p) => p.metrics)
      .sort(
        (a, b) => (b.metrics?.impressions || 0) - (a.metrics?.impressions || 0),
      )
      .slice(0, 5);

    const bottomPosts = enriched
      .filter((p) => p.metrics)
      .sort(
        (a, b) => (a.metrics?.impressions || 0) - (b.metrics?.impressions || 0),
      )
      .slice(0, 5);

    let brief = `${PERSONA_SYSTEM_PROMPT}\n\n---\n\n# Content Performance Brief\n`;
    brief += `Generated: ${new Date().toISOString().slice(0, 10)}\n`;
    brief += `Total published posts: ${posts.length}\n\n`;

    brief += `## Top 5 Performing Posts\n\n`;
    for (const p of topPosts) {
      brief += `### ${p.title || p.body.slice(0, 60)}\n`;
      brief += `- Hook: ${p.hook_type || "untagged"} | Funnel: ${p.funnel_stage || "untagged"}\n`;
      brief += `- Impressions: ${p.metrics?.impressions} | Likes: ${p.metrics?.likes} | Comments: ${p.metrics?.comments} | Shares: ${p.metrics?.shares}\n`;
      brief += `- Published: ${p.published_at?.slice(0, 10)}\n\n`;
    }

    brief += `## Bottom 5 Performing Posts\n\n`;
    for (const p of bottomPosts) {
      brief += `### ${p.title || p.body.slice(0, 60)}\n`;
      brief += `- Hook: ${p.hook_type || "untagged"} | Funnel: ${p.funnel_stage || "untagged"}\n`;
      brief += `- Impressions: ${p.metrics?.impressions} | Likes: ${p.metrics?.likes} | Comments: ${p.metrics?.comments}\n`;
      brief += `- Published: ${p.published_at?.slice(0, 10)}\n\n`;
    }

    const renderTable = (label: string, group: Record<string, Bucket>) => {
      let s = `\n## Performance by ${label}\n\n`;
      s += `| ${label} | Posts | Impressions | Likes | Comments | Shares | Clicks |\n`;
      s += `|---|---|---|---|---|---|---|\n`;
      for (const [k, d] of Object.entries(group)) {
        s += `| ${k} | ${d.count} | ${d.impressions} | ${d.likes} | ${d.comments} | ${d.shares} | ${d.clicks} |\n`;
      }
      return s;
    };
    brief += renderTable("Hook", byHook);
    brief += renderTable("Funnel", byFunnel);
    brief += renderTable("Pillar", byPillar);

    brief += `\n## Context for Strategy Review\n`;
    brief += `- Weekly target: 4x TOFU, 2x MOFU, 1x BOFU\n`;
    brief += `- Platform: LinkedIn\n`;

    return NextResponse.json({ brief });
  }

  return NextResponse.json({
    posts: enriched,
    aggregations: { byHook, byFunnel, byPillar },
  });
}
