import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { PostCollaboration } from "@/components/ops/post-collaboration";

export const dynamic = "force-dynamic";

type PostRow = {
  id: string;
  title: string | null;
  body: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  post_type: string;
  client_id: string | null;
};

export default async function AgencyPostDetail({
  params,
}: {
  params: Promise<{ workspace: string; client: string; postId: string }>;
}) {
  const { workspace: workspaceSlug, client: clientSlug, postId } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();
  const client = await getClientBySlug(workspace.id, clientSlug);
  if (!client) notFound();

  const db = getSupabase();
  const { data } = await db
    .from("content_posts")
    .select(
      "id, title, body, status, scheduled_at, published_at, post_type, client_id",
    )
    .eq("id", postId)
    .eq("client_id", client.id)
    .maybeSingle();
  const post = data as PostRow | null;
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/w/${workspace.slug}/c/${client.slug}/content`}
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Content
      </Link>

      <header className="space-y-1">
        <p className="text-xs text-ink-light capitalize">
          {post.status}
          {post.scheduled_at &&
            ` \u00b7 Scheduled ${new Date(post.scheduled_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`}
          {post.published_at &&
            ` \u00b7 Published ${new Date(post.published_at).toLocaleString("en-US", { month: "short", day: "numeric" })}`}
        </p>
        {post.title && (
          <h2 className="font-serif text-2xl text-ink">{post.title}</h2>
        )}
      </header>

      <section className="rounded-md border border-paper-muted bg-paper-warm/60 p-4">
        <p className="text-sm text-ink whitespace-pre-wrap measure">
          {post.body}
        </p>
      </section>

      <PostCollaboration postId={post.id} canApprove={false} />
    </div>
  );
}
