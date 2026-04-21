import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import {
  concatenateSentences,
  fetchTranscriptDetail,
  listRecentTranscripts,
} from "@/lib/ops/meetings/fireflies";
import { ingestMeeting } from "@/lib/ops/meetings/ingest";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: clientId } = await params;

  const { data: clientRow } = await supabase
    .from("ops_clients")
    .select("id, workspace_id, name")
    .eq("id", clientId)
    .maybeSingle();

  const client = clientRow as { id: string; workspace_id: string; name: string } | null;
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  if (
    !hasClientAccess(
      user.memberships,
      client.id,
      client.workspace_id,
      "client_viewer",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let transcripts;
  try {
    transcripts = await listRecentTranscripts({
      workspaceId: client.workspace_id,
      clientId: client.id,
      limit: 10,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fireflies sync failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let ingested = 0;
  let skipped = 0;
  const failures: { external_id: string; error: string }[] = [];

  for (const t of transcripts) {
    const { data: existing } = await supabase
      .from("ops_meetings")
      .select("id, status")
      .eq("client_id", client.id)
      .eq("external_id", t.id)
      .maybeSingle();
    if (existing && (existing as { status: string }).status === "ready") {
      skipped += 1;
      continue;
    }

    try {
      const detail = await fetchTranscriptDetail({
        workspaceId: client.workspace_id,
        clientId: client.id,
        externalId: t.id,
      });
      const transcriptText = concatenateSentences(detail.sentences ?? []);
      const participants = detail.speakers?.map((s) => s.name) ?? [];

      const result = await ingestMeeting(
        {
          clientId: client.id,
          sourceType: "fireflies",
          externalId: t.id,
          title: detail.title,
          startedAt: detail.date ? new Date(detail.date).toISOString() : null,
          durationMinutes: detail.duration
            ? Math.round(detail.duration / 60)
            : null,
          participants,
          transcriptUrl: detail.transcript_url,
          transcriptText,
          audioUrl: detail.audio_url,
        },
        { clientName: client.name },
      );

      if (result.error) {
        failures.push({ external_id: t.id, error: result.error });
        continue;
      }
      ingested += 1;
    } catch (err) {
      failures.push({
        external_id: t.id,
        error: err instanceof Error ? err.message : "fetch failed",
      });
    }
  }

  return NextResponse.json({ ingested, skipped, failures });
}
