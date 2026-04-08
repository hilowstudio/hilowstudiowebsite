import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const exportFormat = searchParams.get("export");

  // Fetch all published posts with their latest metrics
  const { data: posts, error: postsErr } = await supabase
    .from("content_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (postsErr) {
    return NextResponse.json({ error: postsErr.message }, { status: 500 });
  }

  if (!posts || posts.length === 0) {
    if (exportFormat === "claude") {
      return NextResponse.json({
        brief: "# Content Performance Brief\n\nNo published posts with metrics yet.",
      });
    }
    return NextResponse.json({ posts: [], aggregations: null });
  }

  // Fetch latest metrics for each post
  const postIds = posts.map((p) => p.id);
  const { data: allMetrics } = await supabase
    .from("linkedin_metrics")
    .select("*")
    .in("post_id", postIds)
    .order("fetched_at", { ascending: false });

  // Deduplicate: keep only latest metric per post
  const latestMetrics: Record<string, typeof allMetrics extends (infer T)[] | null ? T : never> = {};
  for (const m of allMetrics || []) {
    if (!latestMetrics[m.post_id]) {
      latestMetrics[m.post_id] = m;
    }
  }

  // Enrich posts with metrics
  const enriched = posts.map((p) => ({
    ...p,
    metrics: latestMetrics[p.id] || null,
  }));

  // Aggregate by hook type, funnel, and pillar
  const byHook: Record<string, { count: number; impressions: number; likes: number; comments: number; shares: number; clicks: number }> = {};
  const byFunnel: Record<string, { count: number; impressions: number; likes: number; comments: number; shares: number; clicks: number }> = {};
  const byPillar: Record<string, { count: number; impressions: number; likes: number; comments: number; shares: number; clicks: number }> = {};

  for (const p of enriched) {
    const m = p.metrics;
    const hook = p.hook_type || "untagged";
    const funnel = p.funnel_stage || "untagged";
    const pillar = p.content_pillar || "untagged";

    if (!byHook[hook]) byHook[hook] = { count: 0, impressions: 0, likes: 0, comments: 0, shares: 0, clicks: 0 };
    if (!byFunnel[funnel]) byFunnel[funnel] = { count: 0, impressions: 0, likes: 0, comments: 0, shares: 0, clicks: 0 };
    if (!byPillar[pillar]) byPillar[pillar] = { count: 0, impressions: 0, likes: 0, comments: 0, shares: 0, clicks: 0 };

    byHook[hook].count++;
    byFunnel[funnel].count++;
    byPillar[pillar].count++;

    if (m) {
      byHook[hook].impressions += m.impressions;
      byHook[hook].likes += m.likes;
      byHook[hook].comments += m.comments;
      byHook[hook].shares += m.shares;
      byHook[hook].clicks += m.clicks;

      byFunnel[funnel].impressions += m.impressions;
      byFunnel[funnel].likes += m.likes;
      byFunnel[funnel].comments += m.comments;
      byFunnel[funnel].shares += m.shares;
      byFunnel[funnel].clicks += m.clicks;

      byPillar[pillar].impressions += m.impressions;
      byPillar[pillar].likes += m.likes;
      byPillar[pillar].comments += m.comments;
      byPillar[pillar].shares += m.shares;
      byPillar[pillar].clicks += m.clicks;
    }
  }

  if (exportFormat === "claude") {
    // Build structured markdown brief for Claude
    const topPosts = enriched
      .filter((p) => p.metrics)
      .sort((a, b) => (b.metrics?.impressions || 0) - (a.metrics?.impressions || 0))
      .slice(0, 5);

    const bottomPosts = enriched
      .filter((p) => p.metrics)
      .sort((a, b) => (a.metrics?.impressions || 0) - (b.metrics?.impressions || 0))
      .slice(0, 5);

    let brief = `${PERSONA_SYSTEM_PROMPT}\n\n---\n\n# Content Performance Brief\n`;
    brief += `Generated: ${new Date().toISOString().slice(0, 10)}\n`;
    brief += `Total published posts: ${posts.length}\n\n`;

    brief += `## Top 5 Performing Posts (by impressions)\n\n`;
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

    brief += `## Performance by Hook Type\n\n`;
    brief += `| Hook | Posts | Impressions | Likes | Comments | Shares | Clicks |\n`;
    brief += `|------|-------|-------------|-------|----------|--------|--------|\n`;
    for (const [hook, data] of Object.entries(byHook)) {
      brief += `| ${hook} | ${data.count} | ${data.impressions} | ${data.likes} | ${data.comments} | ${data.shares} | ${data.clicks} |\n`;
    }

    brief += `\n## Performance by Funnel Stage\n\n`;
    brief += `| Stage | Posts | Impressions | Likes | Comments | Shares | Clicks |\n`;
    brief += `|-------|-------|-------------|-------|----------|--------|--------|\n`;
    for (const [stage, data] of Object.entries(byFunnel)) {
      brief += `| ${stage} | ${data.count} | ${data.impressions} | ${data.likes} | ${data.comments} | ${data.shares} | ${data.clicks} |\n`;
    }

    brief += `\n## Performance by Pillar\n\n`;
    brief += `| Pillar | Posts | Impressions | Likes | Comments | Shares | Clicks |\n`;
    brief += `|--------|-------|-------------|-------|----------|--------|--------|\n`;
    for (const [pillar, data] of Object.entries(byPillar)) {
      brief += `| ${pillar} | ${data.count} | ${data.impressions} | ${data.likes} | ${data.comments} | ${data.shares} | ${data.clicks} |\n`;
    }

    brief += `\n## Context for Strategy Review\n`;
    brief += `- Weekly target: 4x TOFU, 2x MOFU, 1x BOFU\n`;
    brief += `- Content pillars: Calm Tech, ADHD Operator, AI for Operators, Own Your Stack, The Cost of the Mask\n`;
    brief += `- Platform: LinkedIn\n`;
    brief += `- Please identify patterns in what's working by pillar and hook type. Suggest adjustments to the pillar/funnel mix and recommend content themes for the coming weeks.\n`;

    return NextResponse.json({ brief });
  }

  return NextResponse.json({
    posts: enriched,
    aggregations: { byHook, byFunnel, byPillar },
  });
}
