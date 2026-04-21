import { inngest } from "@/lib/inngest/client";
import { supabase } from "@/lib/supabase";
import {
  concatenateSentences,
  fetchTranscriptDetail,
  listRecentTranscripts,
} from "@/lib/ops/meetings/fireflies";
import { ingestMeeting } from "@/lib/ops/meetings/ingest";

export const opsFirefliesSync = inngest.createFunction(
  {
    id: "ops-fireflies-sync",
    retries: 1,
    triggers: [{ cron: "TZ=America/Chicago */15 * * * *" }],
  },
  async ({ step }) => {
    const sources = await step.run("list-fireflies-sources", async () => {
      const { data } = await supabase
        .from("ops_meeting_sources")
        .select("id, client_id, ops_clients(workspace_id, name)")
        .eq("type", "fireflies")
        .eq("enabled", true);
      return (data ?? []) as unknown as {
        id: string;
        client_id: string;
        ops_clients: { workspace_id: string; name: string } | null;
      }[];
    });

    if (sources.length === 0) {
      return { processed: 0, ingested: 0 };
    }

    let ingested = 0;

    for (const source of sources) {
      if (!source.ops_clients) continue;
      const clientId = source.client_id;
      const workspaceId = source.ops_clients.workspace_id;
      const clientName = source.ops_clients.name;

      await step.run(`sync-${clientId}`, async () => {
        let transcripts;
        try {
          transcripts = await listRecentTranscripts({
            workspaceId,
            clientId,
            limit: 5,
          });
        } catch {
          return;
        }

        for (const t of transcripts) {
          const { data: existing } = await supabase
            .from("ops_meetings")
            .select("id, status")
            .eq("client_id", clientId)
            .eq("external_id", t.id)
            .maybeSingle();
          if (existing && (existing as { status: string }).status === "ready") {
            continue;
          }

          try {
            const detail = await fetchTranscriptDetail({
              workspaceId,
              clientId,
              externalId: t.id,
            });
            const transcriptText = concatenateSentences(detail.sentences ?? []);
            const participants = detail.speakers?.map((s) => s.name) ?? [];

            const result = await ingestMeeting(
              {
                clientId,
                sourceType: "fireflies",
                externalId: t.id,
                title: detail.title,
                startedAt: detail.date
                  ? new Date(detail.date).toISOString()
                  : null,
                durationMinutes: detail.duration
                  ? Math.round(detail.duration / 60)
                  : null,
                participants,
                transcriptUrl: detail.transcript_url,
                transcriptText,
                audioUrl: detail.audio_url,
              },
              { clientName },
            );
            if (result.meetingId) ingested += 1;
          } catch {
            // swallow and move on; next cron picks it back up
          }
        }
      });
    }

    return { processed: sources.length, ingested };
  },
);
