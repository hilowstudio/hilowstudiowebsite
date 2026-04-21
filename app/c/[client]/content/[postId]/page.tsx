import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";
import { PostCollaboration } from "@/components/ops/post-collaboration";
import { PostBodyEditor } from "@/components/ops/post-body-editor";

export const dynamic = "force-dynamic";

type PostRow = {
  id: string;
  title: string | null;
  body: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
};

export default async function ClientPortalPostDetail({
  params,
}: {
  params: Promise<{ client: string; postId: string }>;
}) {
  const { client: clientSlug, postId } = await params;
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

  const { data } = await db
    .from("content_posts")
    .select("id, title, body, status, scheduled_at, published_at")
    .eq("id", postId)
    .eq("client_id", authorized.id)
    .maybeSingle();
  const post = data as PostRow | null;
  if (!post) notFound();

  const canApprove = user.memberships.some(
    (m) =>
      m.scope === "client" &&
      m.scopeId === authorized.id &&
      (m.role === "client_owner" || m.role === "client_contributor"),
  );

  return (
    <div className="space-y-6">
      <Link
        href={`/c/${clientSlug}/content`}
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Content
      </Link>

      <header className="space-y-1">
        <p className="text-xs text-ink-light capitalize">
          {post.status}
          {post.scheduled_at &&
            ` \u00b7 Scheduled ${new Date(post.scheduled_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`}
        </p>
        {post.title && (
          <h2 className="font-serif text-2xl text-ink">{post.title}</h2>
        )}
      </header>

      <PostBodyEditor
        postId={post.id}
        initialTitle={post.title}
        initialBody={post.body}
        canEdit={canApprove}
      />

      <PostCollaboration postId={post.id} canApprove={canApprove} />
    </div>
  );
}
