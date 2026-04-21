import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import {
  concatenateSentences,
  fetchTranscriptDetail,
  listRecentTranscripts,
} from "@/lib/ops/meetings/fireflies";
import { extractInsightsFromTranscript } from "@/lib/ops/meetings/insights";

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

  let sourceId: string | null = null;
  const { data: existingSource } = await supabase
    .from("ops_meeting_sources")
    .select("id")
    .eq("client_id", client.id)
    .eq("type", "fireflies")
    .maybeSingle();
  if (existingSource) {
    sourceId = (existingSource as { id: string }).id;
  } else {
    const { data: created } = await supabase
      .from("ops_meeting_sources")
      .insert({ client_id: client.id, type: "fireflies", enabled: true })
      .select("id")
      .single();
    sourceId = (created as { id: string } | null)?.id ?? null;
  }

  if (sourceId) {
    await supabase
      .from("ops_meeting_sources")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", sourceId);
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

      const { data: upserted, error: upsertError } = await supabase
        .from("ops_meetings")
        .upsert(
          {
            client_id: client.id,
            source_id: sourceId,
            external_id: t.id,
            title: detail.title,
            started_at: detail.date
              ? new Date(detail.date).toISOString()
              : null,
            duration_minutes: detail.duration
              ? Math.round(detail.duration / 60)
              : null,
            participants,
            transcript_url: detail.transcript_url,
            transcript_text: transcriptText,
            audio_url: detail.audio_url,
            status: "ready",
          },
          { onConflict: "client_id,external_id" },
        )
        .select("id")
        .single();

      if (upsertError || !upserted) {
        failures.push({
          external_id: t.id,
          error: upsertError?.message || "upsert failed",
        });
        continue;
      }

      const meetingId = (upserted as { id: string }).id;

      const { data: existingInsights } = await supabase
        .from("ops_meeting_insights")
        .select("id")
        .eq("meeting_id", meetingId)
        .limit(1);
      const alreadyExtracted = (existingInsights ?? []).length > 0;

      if (!alreadyExtracted && transcriptText.length > 0) {
        try {
          const insights = await extractInsightsFromTranscript({
            transcriptText,
            meetingTitle: detail.title,
            clientName: client.name,
          });
          if (insights.length > 0) {
            await supabase.from("ops_meeting_insights").insert(
              insights.map((i) => ({
                meeting_id: meetingId,
                kind: i.kind,
                body: i.body,
                speaker: "speaker" in i ? i.speaker ?? null : null,
                timestamp_seconds:
                  "timestamp_seconds" in i ? i.timestamp_seconds ?? null : null,
                metadata: i.metadata ?? {},
                status: i.kind === "action_item" ? "open" : "open",
              })),
            );
          }
        } catch (err) {
          failures.push({
            external_id: t.id,
            error:
              err instanceof Error
                ? `insight extraction: ${err.message}`
                : "insight extraction failed",
          });
        }
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
