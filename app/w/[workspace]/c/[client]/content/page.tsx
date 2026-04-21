import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

type DraftRow = {
  id: string;
  meeting_id: string;
  draft_body: string;
  status: string;
  created_at: string;
  ops_meetings: { title: string | null } | null;
};

type PostRow = {
  id: string;
  title: string | null;
  body: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  post_type: string;
};

export default async function ClientContentPage({
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

  const { data: draftRows } = await db
    .from("ops_meeting_post_drafts")
    .select("id, meeting_id, draft_body, status, created_at, ops_meetings(title)")
    .in(
      "meeting_id",
      (
        await db
          .from("ops_meetings")
          .select("id")
          .eq("client_id", client.id)
      ).data?.map((r: { id: string }) => r.id) ?? [],
    )
    .order("created_at", { ascending: false })
    .limit(20);

  const drafts = (draftRows as unknown as DraftRow[]) ?? [];

  const { data: postRows } = await db
    .from("content_posts")
    .select("id, title, body, status, scheduled_at, published_at, post_type")
    .eq("client_id", client.id)
    .order("scheduled_at", { ascending: false, nullsFirst: false })
    .limit(20);

  const posts = (postRows as PostRow[]) ?? [];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Meeting-generated drafts</h2>
        {drafts.length === 0 ? (
          <p className="text-sm text-ink-light">
            No drafts yet. Open a meeting and click "Draft LinkedIn post".
          </p>
        ) : (
          <ul className="space-y-3">
            {drafts.map((d) => (
              <li
                key={d.id}
                className="rounded-md border border-paper-muted bg-paper-warm/60 p-4 space-y-2"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-ink-light">
                    {d.ops_meetings?.title ?? "Meeting"}
                    {" \u00b7 "}
                    {new Date(d.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-ink-light capitalize">
                    {d.status}
                  </span>
                </div>
                <p className="text-sm text-ink whitespace-pre-wrap measure">
                  {d.draft_body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Scheduled posts</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-ink-light">
            No posts yet. Adam's existing LinkedIn Content Manager at /admin is
            the current composer surface; migrating it into /w in Phase B.
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {posts.map((p) => (
              <li
                key={p.id}
                className="flex items-baseline justify-between py-2 border-b border-paper-muted/50 -mx-2 px-2"
              >
                <span className="text-ink truncate">
                  {p.title || p.body.slice(0, 60)}
                </span>
                <span className="text-xs text-ink-light whitespace-nowrap">
                  {p.published_at
                    ? `Published ${new Date(p.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : p.scheduled_at
                      ? `Scheduled ${new Date(p.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
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
