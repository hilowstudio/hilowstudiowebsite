import { getSupabase } from "@/lib/supabase";
import { extractInsightsFromTranscript } from "./insights";

export type IngestSource = "fireflies" | "fathom" | "granola" | "manual" | "zoom_bot";

export type MeetingPayload = {
  clientId: string;
  sourceType: IngestSource;
  externalId: string;
  title: string | null;
  startedAt: string | null;
  durationMinutes: number | null;
  participants: string[];
  transcriptUrl: string | null;
  transcriptText: string;
  audioUrl: string | null;
};

export type IngestResult = {
  meetingId: string;
  insightsExtracted: boolean;
  error?: string;
};

async function ensureSource(
  clientId: string,
  sourceType: IngestSource,
): Promise<string | null> {
  const db = getSupabase();
  const { data: existing } = await db
    .from("ops_meeting_sources")
    .select("id")
    .eq("client_id", clientId)
    .eq("type", sourceType)
    .maybeSingle();
  if (existing) return (existing as { id: string }).id;
  const { data: created } = await db
    .from("ops_meeting_sources")
    .insert({ client_id: clientId, type: sourceType, enabled: true })
    .select("id")
    .single();
  return (created as { id: string } | null)?.id ?? null;
}

export async function ingestMeeting(
  payload: MeetingPayload,
  options?: {
    clientName?: string;
    skipInsights?: boolean;
    workspaceId?: string;
  },
): Promise<IngestResult> {
  const db = getSupabase();

  let workspaceId = options?.workspaceId;
  if (!workspaceId) {
    const { data } = await db
      .from("ops_clients")
      .select("workspace_id")
      .eq("id", payload.clientId)
      .maybeSingle();
    workspaceId =
      (data as { workspace_id: string } | null)?.workspace_id ?? undefined;
  }

  const sourceId = await ensureSource(payload.clientId, payload.sourceType);
  if (sourceId) {
    await db
      .from("ops_meeting_sources")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", sourceId);
  }

  const { data: upserted, error: upsertError } = await db
    .from("ops_meetings")
    .upsert(
      {
        client_id: payload.clientId,
        source_id: sourceId,
        external_id: payload.externalId,
        title: payload.title,
        started_at: payload.startedAt,
        duration_minutes: payload.durationMinutes,
        participants: payload.participants,
        transcript_url: payload.transcriptUrl,
        transcript_text: payload.transcriptText,
        audio_url: payload.audioUrl,
        status: "ready",
      },
      { onConflict: "client_id,external_id" },
    )
    .select("id")
    .single();

  if (upsertError || !upserted) {
    return {
      meetingId: "",
      insightsExtracted: false,
      error: upsertError?.message || "meeting upsert failed",
    };
  }

  const meetingId = (upserted as { id: string }).id;

  if (options?.skipInsights || !payload.transcriptText) {
    return { meetingId, insightsExtracted: false };
  }

  const { data: existingInsights } = await db
    .from("ops_meeting_insights")
    .select("id")
    .eq("meeting_id", meetingId)
    .limit(1);
  if ((existingInsights ?? []).length > 0) {
    return { meetingId, insightsExtracted: false };
  }

  if (!workspaceId) {
    return {
      meetingId,
      insightsExtracted: false,
      error: "Cannot resolve workspace for insight extraction",
    };
  }

  try {
    const insights = await extractInsightsFromTranscript({
      workspaceId,
      clientId: payload.clientId,
      transcriptText: payload.transcriptText,
      meetingTitle: payload.title,
      clientName: options?.clientName,
    });
    if (insights.length === 0) {
      return { meetingId, insightsExtracted: false };
    }

    const { error: insertError } = await db
      .from("ops_meeting_insights")
      .insert(
        insights.map((i) => ({
          meeting_id: meetingId,
          kind: i.kind,
          body: i.body,
          speaker: "speaker" in i ? i.speaker ?? null : null,
          timestamp_seconds:
            "timestamp_seconds" in i ? i.timestamp_seconds ?? null : null,
          metadata: i.metadata ?? {},
          status: "open",
        })),
      );

    if (insertError) {
      return {
        meetingId,
        insightsExtracted: false,
        error: insertError.message,
      };
    }

    return { meetingId, insightsExtracted: true };
  } catch (err) {
    return {
      meetingId,
      insightsExtracted: false,
      error: err instanceof Error ? err.message : "insight extraction failed",
    };
  }
}

export async function lookupClientForIngest(
  clientId: string,
): Promise<{ id: string; workspace_id: string; name: string } | null> {
  const db = getSupabase();
  const { data } = await db
    .from("ops_clients")
    .select("id, workspace_id, name")
    .eq("id", clientId)
    .maybeSingle();
  return data as { id: string; workspace_id: string; name: string } | null;
}
