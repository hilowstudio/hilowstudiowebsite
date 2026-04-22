import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { inngest } from "@/lib/inngest/client";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

interface EpisodeIngestBody {
  title: string;
  audioUrl?: string;
  youtubeUrl?: string;
  description?: string;
  publishedAt?: string;
  feedTitle?: string;
  transcriptUrl?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const body: EpisodeIngestBody = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!body.audioUrl && !body.youtubeUrl) {
    return NextResponse.json(
      { error: "Either audioUrl or youtubeUrl is required" },
      { status: 400 },
    );
  }

  const youtubeId = body.youtubeUrl ? extractYouTubeId(body.youtubeUrl) : null;
  const isYouTube = !!youtubeId;
  const externalId = youtubeId
    ? `youtube:${youtubeId}`
    : `episode:${body.audioUrl}`;

  const { data: existing } = await supabase
    .from("content_ideas")
    .select("id")
    .eq("workspace_id", id)
    .is("client_id", null)
    .eq("source_metadata->>external_id", externalId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { queued: false, ideaId: existing.id, message: "Already ingested" },
      { status: 200 },
    );
  }

  const { data: idea, error: insertErr } = await supabase
    .from("content_ideas")
    .insert({
      workspace_id: id,
      client_id: null,
      raw_insight: `Processing: ${body.title}`,
      source: isYouTube ? "youtube" : "podcast",
      source_url: body.youtubeUrl || body.audioUrl || null,
      source_metadata: {
        source_system: "hi-low",
        external_id: externalId,
        episode_title: body.title,
        show_name: body.feedTitle || null,
        audio_url: body.audioUrl || null,
        youtube_id: youtubeId,
        transcript_url: body.transcriptUrl || null,
        processed: false,
      },
      status: "active",
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  await inngest.send({
    name: "source/episode.process",
    data: { sourceId: idea.id, workspaceId: id },
  });

  return NextResponse.json(
    { queued: true, ideaId: idea.id, title: body.title },
    { status: 202 },
  );
}
