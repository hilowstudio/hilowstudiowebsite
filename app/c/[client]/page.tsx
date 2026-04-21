import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

type ActionItem = {
  id: string;
  body: string;
  status: string;
};

type RecentMeeting = {
  id: string;
  title: string | null;
  started_at: string | null;
};

export default async function ClientPortalHome({
  params,
}: {
  params: Promise<{ client: string }>;
}) {
  const { client: clientSlug } = await params;
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

  const [meetingsRes, insightsRes] = await Promise.all([
    db
      .from("ops_meetings")
      .select("id, title, started_at")
      .eq("client_id", authorized.id)
      .order("started_at", { ascending: false, nullsFirst: false })
      .limit(5),
    db
      .from("ops_meeting_insights")
      .select("id, body, status, ops_meetings!inner(client_id)")
      .eq("ops_meetings.client_id", authorized.id)
      .eq("kind", "action_item")
      .eq("status", "open")
      .limit(10),
  ]);

  const meetings = (meetingsRes.data as RecentMeeting[]) ?? [];
  const actions = (insightsRes.data as unknown as ActionItem[]) ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-ink">Recent meetings</h2>
          <Link
            href={`/c/${clientSlug}/meetings`}
            className="text-xs text-ink-light hover:text-ink transition-colors"
          >
            All meetings
          </Link>
        </div>
        {meetings.length === 0 ? (
          <p className="text-sm text-ink-light">No meetings yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {meetings.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/c/${clientSlug}/meetings/${m.id}`}
                  className="flex items-baseline justify-between py-2 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
                >
                  <span className="text-ink truncate">
                    {m.title || "Meeting"}
                  </span>
                  <span className="text-xs text-ink-light whitespace-nowrap">
                    {m.started_at
                      ? new Date(m.started_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Open action items</h2>
        {actions.length === 0 ? (
          <p className="text-sm text-ink-light">Nothing outstanding.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {actions.map((a) => (
              <li
                key={a.id}
                className="py-2 border-b border-paper-muted/50 -mx-2 px-2"
              >
                <span className="text-ink">{a.body}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
