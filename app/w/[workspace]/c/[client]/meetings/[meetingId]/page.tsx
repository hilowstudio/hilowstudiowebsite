import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { MeetingInsights } from "./meeting-insights";
import { DraftFromMeetingButton } from "./draft-from-meeting-button";
import { DeleteMeetingButton } from "./delete-meeting-button";

export const dynamic = "force-dynamic";

type MeetingRow = {
  id: string;
  client_id: string;
  external_id: string;
  title: string | null;
  started_at: string | null;
  duration_minutes: number | null;
  participants: string[];
  transcript_text: string | null;
  status: string;
  match_reason: string | null;
};

type InsightRow = {
  id: string;
  kind: string;
  body: string;
  speaker: string | null;
  timestamp_seconds: number | null;
  status: string;
};

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; client: string; meetingId: string }>;
}) {
  const { workspace: workspaceSlug, client: clientSlug, meetingId } =
    await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();
  const client = await getClientBySlug(workspace.id, clientSlug);
  if (!client) notFound();

  const db = getSupabase();
  const { data: meetingData } = await db
    .from("ops_meetings")
    .select(
      "id, client_id, external_id, title, started_at, duration_minutes, participants, transcript_text, status, match_reason",
    )
    .eq("id", meetingId)
    .eq("client_id", client.id)
    .maybeSingle();
  const meeting = meetingData as MeetingRow | null;
  if (!meeting) notFound();

  const { data: insightData } = await db
    .from("ops_meeting_insights")
    .select("id, kind, body, speaker, timestamp_seconds, status")
    .eq("meeting_id", meeting.id)
    .order("kind", { ascending: true })
    .order("created_at", { ascending: true });
  const insights = (insightData as InsightRow[]) ?? [];

  const { data: drafts } = await db
    .from("ops_meeting_post_drafts")
    .select("id, draft_body, status, created_at")
    .eq("meeting_id", meeting.id)
    .order("created_at", { ascending: false });
  const postDrafts =
    (drafts as {
      id: string;
      draft_body: string;
      status: string;
      created_at: string;
    }[]) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/w/${workspace.slug}/c/${client.slug}/meetings`}
          className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
        >
          &larr; Meetings
        </Link>
        <DeleteMeetingButton
          meetingId={meeting.id}
          redirectTo={`/w/${workspace.slug}/c/${client.slug}/meetings`}
        />
      </div>

      <header className="space-y-1">
        <h2 className="font-serif text-2xl text-ink">
          {meeting.title || "Untitled meeting"}
        </h2>
        <p className="text-sm text-ink-light">
          {meeting.started_at
            ? new Date(meeting.started_at).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "Date unknown"}
          {meeting.duration_minutes ? ` · ${meeting.duration_minutes} min` : ""}
        </p>
        {Array.isArray(meeting.participants) && meeting.participants.length > 0 && (
          <p className="text-xs text-ink-light">
            {meeting.participants.join(", ")}
          </p>
        )}
        {meeting.match_reason && (
          <p className="text-xs text-moss">
            Matched by {meeting.match_reason}
          </p>
        )}
      </header>

      <MeetingInsights meetingId={meeting.id} initialInsights={insights} />

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="font-serif text-lg text-ink">LinkedIn post drafts</h3>
          <DraftFromMeetingButton meetingId={meeting.id} />
        </div>
        {postDrafts.length === 0 ? (
          <p className="text-sm text-ink-light">
            No drafts yet. Use the button above to turn this meeting into a
            LinkedIn post.
          </p>
        ) : (
          <ul className="space-y-3">
            {postDrafts.map((d) => (
              <li
                key={d.id}
                className="rounded-md border border-paper-muted bg-paper-warm/60 p-4"
              >
                <p className="text-xs text-ink-light mb-2">
                  {new Date(d.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {" · "}
                  <span className="capitalize">{d.status}</span>
                </p>
                <p className="text-sm text-ink whitespace-pre-wrap measure">
                  {d.draft_body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {meeting.transcript_text && (
        <section className="space-y-3">
          <h3 className="font-serif text-lg text-ink">Transcript</h3>
          <pre className="text-xs text-ink-muted whitespace-pre-wrap measure-wide font-sans border border-paper-muted bg-paper-warm/40 p-4 rounded-md max-h-[400px] overflow-auto">
            {meeting.transcript_text}
          </pre>
        </section>
      )}
    </div>
  );
}
