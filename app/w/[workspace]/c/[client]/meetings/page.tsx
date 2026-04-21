import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { SyncMeetingsButton } from "./sync-meetings-button";
import { UploadMeetingForm } from "./upload-meeting-form";

export const dynamic = "force-dynamic";

export default async function MeetingsListPage({
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
  const { data: meetings } = await db
    .from("ops_meetings")
    .select("id, title, started_at, duration_minutes, status, participants")
    .eq("client_id", client.id)
    .order("started_at", { ascending: false, nullsFirst: false })
    .limit(50);

  const rows =
    (meetings as {
      id: string;
      title: string | null;
      started_at: string | null;
      duration_minutes: number | null;
      status: string;
      participants: string[];
    }[]) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-lg text-ink">Meetings</h2>
        <SyncMeetingsButton clientId={client.id} />
      </div>

      <UploadMeetingForm clientId={client.id} />

      {rows.length === 0 ? (
        <p className="text-sm text-ink-light">
          No meetings yet. Add your Fireflies API key on the Integrations tab,
          then hit Sync.
        </p>
      ) : (
        <ul className="space-y-1 text-sm">
          {rows.map((m) => (
            <li key={m.id}>
              <Link
                href={`/w/${workspace.slug}/c/${client.slug}/meetings/${m.id}`}
                className="flex items-baseline justify-between gap-3 py-3 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-ink truncate">
                    {m.title || "Untitled meeting"}
                  </p>
                  {Array.isArray(m.participants) && m.participants.length > 0 && (
                    <p className="text-xs text-ink-light truncate">
                      {m.participants.slice(0, 4).join(", ")}
                      {m.participants.length > 4 && "..."}
                    </p>
                  )}
                </div>
                <span className="text-xs text-ink-light whitespace-nowrap">
                  {m.started_at
                    ? new Date(m.started_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : m.status}
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
