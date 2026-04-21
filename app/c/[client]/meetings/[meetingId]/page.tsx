import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = {
  brief: "Brief",
  action_item: "Action items",
  quote: "Quotable moments",
  churn_signal: "Churn signals",
  upsell_signal: "Upsell signals",
  referral_signal: "Referral signals",
};

const KIND_ORDER = [
  "brief",
  "action_item",
  "quote",
  "churn_signal",
  "upsell_signal",
  "referral_signal",
];

const PORTAL_VISIBLE_KINDS = new Set(["brief", "action_item"]);

type Meeting = {
  id: string;
  title: string | null;
  started_at: string | null;
  duration_minutes: number | null;
  participants: string[];
};

type Insight = {
  id: string;
  kind: string;
  body: string;
  status: string;
};

export default async function ClientPortalMeetingDetail({
  params,
}: {
  params: Promise<{ client: string; meetingId: string }>;
}) {
  const { client: clientSlug, meetingId } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const db = getSupabase();
  const { data: clients } = await db
    .from("ops_clients")
    .select("id, slug, workspace_id")
    .eq("slug", clientSlug);
  const authorized = ((clients ?? []) as {
    id: string;
    slug: string;
    workspace_id: string;
  }[]).find((c) =>
    hasClientAccess(
      user.memberships,
      c.id,
      c.workspace_id,
      "client_viewer",
      user.isPlatformAdmin,
    ),
  );
  if (!authorized) notFound();

  const { data: meetingRow } = await db
    .from("ops_meetings")
    .select("id, title, started_at, duration_minutes, participants")
    .eq("id", meetingId)
    .eq("client_id", authorized.id)
    .maybeSingle();
  const meeting = meetingRow as Meeting | null;
  if (!meeting) notFound();

  const { data: insightData } = await db
    .from("ops_meeting_insights")
    .select("id, kind, body, status")
    .eq("meeting_id", meeting.id)
    .in("kind", Array.from(PORTAL_VISIBLE_KINDS))
    .order("kind", { ascending: true })
    .order("created_at", { ascending: true });
  const insights = (insightData as Insight[]) ?? [];

  const grouped = new Map<string, Insight[]>();
  for (const insight of insights) {
    const list = grouped.get(insight.kind) ?? [];
    list.push(insight);
    grouped.set(insight.kind, list);
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/c/${clientSlug}/meetings`}
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Meetings
      </Link>

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
      </header>

      {insights.length === 0 ? (
        <p className="text-sm text-ink-light">
          Your team hasn't shared notes from this meeting yet.
        </p>
      ) : (
        <div className="space-y-6">
          {KIND_ORDER.filter((k) => grouped.has(k)).map((kind) => (
            <section key={kind} className="space-y-2">
              <h3 className="font-serif text-lg text-ink">
                {KIND_LABELS[kind] ?? kind}
              </h3>
              <ul className="space-y-2">
                {(grouped.get(kind) ?? []).map((insight) => (
                  <li
                    key={insight.id}
                    className={`rounded-md border border-paper-muted bg-paper-warm/60 p-3 ${insight.status === "done" ? "opacity-60" : ""}`}
                  >
                    <p className="text-sm text-ink measure whitespace-pre-wrap">
                      {insight.body}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
