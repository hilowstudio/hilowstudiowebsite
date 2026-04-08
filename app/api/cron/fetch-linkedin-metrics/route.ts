import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

const LINKEDIN_API = "https://api.linkedin.com/rest";

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrn = process.env.LINKEDIN_PERSON_URN;

  if (!accessToken || !personUrn) {
    return NextResponse.json(
      { error: "Missing LinkedIn credentials" },
      { status: 500 }
    );
  }

  // Fetch published posts that have a linkedin_post_id
  const { data: posts, error: queryErr } = await supabase
    .from("content_posts")
    .select("id, linkedin_post_id, published_at")
    .eq("status", "published")
    .not("linkedin_post_id", "is", null)
    .order("published_at", { ascending: false })
    .limit(20);

  if (queryErr) {
    return NextResponse.json({ error: queryErr.message }, { status: 500 });
  }

  if (!posts || posts.length === 0) {
    return NextResponse.json({ success: true, fetched: 0 });
  }

  let fetched = 0;
  let failed = 0;

  for (const post of posts) {
    try {
      // LinkedIn Social Actions API
      const statsRes = await fetch(
        `${LINKEDIN_API}/socialActions/${encodeURIComponent(post.linkedin_post_id)}/statistics`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      if (!statsRes.ok) {
        // Fallback: try the organizationalEntityShareStatistics endpoint
        // For now, store zeros so we have a record
        console.error(`LinkedIn stats fetch failed for ${post.linkedin_post_id}: ${statsRes.status}`);
        failed++;
        continue;
      }

      const stats = await statsRes.json();

      await supabase.from("linkedin_metrics").insert({
        post_id: post.id,
        impressions: stats.impressionCount || stats.totalShareStatistics?.impressionCount || 0,
        likes: stats.likeCount || stats.totalShareStatistics?.likeCount || 0,
        comments: stats.commentCount || stats.totalShareStatistics?.commentCount || 0,
        shares: stats.shareCount || stats.totalShareStatistics?.shareCount || 0,
        clicks: stats.clickCount || stats.totalShareStatistics?.clickCount || 0,
      });

      fetched++;
    } catch (err) {
      console.error(`Metrics fetch failed for post ${post.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ success: true, fetched, failed });
}
