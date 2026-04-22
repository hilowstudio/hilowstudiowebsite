import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

type PostRow = {
  id: string;
  title: string | null;
  body: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  post_type: string;
};

export default async function WorkspaceContentPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();
  const { data } = await db
    .from("content_posts")
    .select("id, title, body, status, scheduled_at, published_at, post_type")
    .eq("workspace_id", workspace.id)
    .is("client_id", null)
    .order("scheduled_at", { ascending: false, nullsFirst: false })
    .limit(50);

  const posts = (data as PostRow[]) ?? [];

  return (
    <div className="space-y-8">
      <header className="flex items-baseline justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl text-ink">
            {workspace.brand_name || workspace.name} content
          </h1>
          <p className="text-sm text-ink-light measure">
            Posts published on {workspace.brand_name || workspace.name}&apos;s
            own LinkedIn. For a client&apos;s content, open their client page.
          </p>
        </div>
        <Link
          href={`/w/${workspace.slug}/content/new`}
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
        >
          New post
        </Link>
      </header>

      <div className="flex gap-3 text-sm">
        <Link
          href={`/w/${workspace.slug}/voice`}
          className="text-clay hover:text-ink transition-colors"
        >
          Edit voice guide
        </Link>
        <span className="text-ink-light">\u00b7</span>
        <Link
          href={`/w/${workspace.slug}/pillars`}
          className="text-clay hover:text-ink transition-colors"
        >
          Edit pillars
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-ink-light py-8">
          No workspace-level posts yet.
        </p>
      ) : (
        <ul className="space-y-1 text-sm">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/w/${workspace.slug}/content/${p.id}`}
                className="flex items-baseline justify-between py-2 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
