import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

export default async function ClientPortalMeetings({
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
    .from("ops_meetings")
    .select("id, title, started_at, duration_minutes, participants")
    .eq("client_id", authorized.id)
    .order("started_at", { ascending: false, nullsFirst: false });

  const meetings =
    (data as {
      id: string;
      title: string | null;
      started_at: string | null;
      duration_minutes: number | null;
      participants: string[];
    }[]) ?? [];

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-lg text-ink">Meetings</h2>
      {meetings.length === 0 ? (
        <p className="text-sm text-ink-light">No meetings yet.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {meetings.map((m) => (
            <li key={m.id}>
              <Link
                href={`/c/${clientSlug}/meetings/${m.id}`}
                className="flex items-baseline justify-between gap-3 py-3 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-ink truncate">
                    {m.title || "Untitled meeting"}
                  </p>
                  {Array.isArray(m.participants) && m.participants.length > 0 && (
                    <p className="text-xs text-ink-light truncate">
                      {m.participants.slice(0, 4).join(", ")}
                    </p>
                  )}
                </div>
                <span className="text-xs text-ink-light whitespace-nowrap">
                  {m.started_at
                    ? new Date(m.started_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                  {m.duration_minutes ? ` · ${m.duration_minutes}m` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
