import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

type PostRow = {
  id: string;
  title: string | null;
  body: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
};

export default async function ClientPortalContent({
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

  const { data } = await db
    .from("content_posts")
    .select("id, title, body, status, scheduled_at, published_at")
    .eq("client_id", authorized.id)
    .in("status", ["scheduled", "published", "approved"])
    .order("scheduled_at", { ascending: false, nullsFirst: false });

  const posts = (data as PostRow[]) ?? [];

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-lg text-ink">Your content</h2>
      {posts.length === 0 ? (
        <p className="text-sm text-ink-light">
          No content shared with you yet. Your agency will publish posts here
          as they're approved.
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id}>
              <a
                href={`/c/${clientSlug}/content/${p.id}`}
                className="block rounded-md border border-paper-muted bg-paper-warm/60 p-4 space-y-2 hover:border-clay transition-colors"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-ink-light capitalize">
                    {p.status}
                    {p.scheduled_at &&
                      ` · Scheduled ${new Date(p.scheduled_at).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}`}
                    {p.published_at &&
                      ` · Published ${new Date(p.published_at).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}`}
                  </span>
                  <span className="text-xs text-clay">Open →</span>
                </div>
                {p.title && (
                  <p className="font-serif text-base text-ink">{p.title}</p>
                )}
                <p className="text-sm text-ink whitespace-pre-wrap measure">
                  {p.body}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
