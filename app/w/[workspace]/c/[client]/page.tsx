import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

export default async function ClientOverview({
  params,
}: {
  params: Promise<{ workspace: string; client: string }>;
}) {
  const { workspace: workspaceSlug, client: clientSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();
  const client = await getClientBySlug(workspace.id, clientSlug);
  if (!client) notFound();

  const db = getSupabase();

  const [meetingsRes, insightsRes, postsRes] = await Promise.all([
    db
      .from("ops_meetings")
      .select("id, title, started_at, status")
      .eq("client_id", client.id)
      .order("started_at", { ascending: false })
      .limit(3),
    db
      .from("ops_meeting_insights")
      .select("id, body, kind, status, ops_meetings!inner(client_id)")
      .eq("ops_meetings.client_id", client.id)
      .eq("kind", "action_item")
      .eq("status", "open")
      .limit(5),
    db
      .from("content_posts")
      .select("id, title, status, scheduled_at")
      .eq("client_id", client.id)
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .limit(3),
  ]);

  const meetings =
    (meetingsRes.data as { id: string; title: string | null; started_at: string | null; status: string }[]) ??
    [];
  const insights =
    (insightsRes.data as unknown as {
      id: string;
      body: string;
      kind: string;
      status: string;
    }[]) ?? [];
  const posts =
    (postsRes.data as { id: string; title: string | null; status: string; scheduled_at: string | null }[]) ??
    [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-ink">Recent meetings</h2>
          <Link
            href={`/w/${workspace.slug}/c/${client.slug}/meetings`}
            className="text-xs text-ink-light hover:text-ink transition-colors"
          >
            View all
          </Link>
        </div>
        {meetings.length === 0 ? (
          <p className="text-sm text-ink-light">No meetings yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {meetings.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/w/${workspace.slug}/c/${client.slug}/meetings/${m.id}`}
                  className="flex items-baseline justify-between py-2 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
                >
                  <span className="text-ink truncate">
                    {m.title || "Untitled meeting"}
                  </span>
                  <span className="text-xs text-ink-light whitespace-nowrap">
                    {m.started_at
                      ? new Date(m.started_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : m.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Open action items</h2>
        {insights.length === 0 ? (
          <p className="text-sm text-ink-light">Nothing outstanding.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {insights.map((i) => (
              <li
                key={i.id}
                className="py-2 border-b border-paper-muted/50 -mx-2 px-2"
              >
                <span className="text-ink">{i.body}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 md:col-span-2">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-ink">Content calendar</h2>
          <Link
            href={`/w/${workspace.slug}/c/${client.slug}/content`}
            className="text-xs text-ink-light hover:text-ink transition-colors"
          >
            Open
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-ink-light">No posts yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {posts.map((p) => (
              <li
                key={p.id}
                className="flex items-baseline justify-between py-2 border-b border-paper-muted/50 -mx-2 px-2"
              >
                <span className="text-ink truncate">
                  {p.title || "Untitled post"}
                </span>
                <span className="text-xs text-ink-light whitespace-nowrap">
                  {p.scheduled_at
                    ? new Date(p.scheduled_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
