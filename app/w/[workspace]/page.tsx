import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

type ClientRow = {
  id: string;
  slug: string;
  name: string;
  company: string | null;
  status: string;
};

type MeetingSummary = {
  client_id: string;
  latest_started_at: string | null;
  meeting_count: number;
};

type InsightSummary = {
  client_id: string;
  open_action_items: number;
};

export default async function WorkspaceDashboard({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();

  const { data: clients } = await db
    .from("ops_clients")
    .select("id, slug, name, company, status")
    .eq("workspace_id", workspace.id)
    .neq("status", "archived")
    .order("name", { ascending: true });

  const clientRows = (clients as ClientRow[]) ?? [];
  const clientIds = clientRows.map((c) => c.id);

  let meetingSummaries: Map<string, MeetingSummary> = new Map();
  let insightSummaries: Map<string, InsightSummary> = new Map();

  if (clientIds.length > 0) {
    const { data: meetings } = await db
      .from("ops_meetings")
      .select("client_id, started_at")
      .in("client_id", clientIds);

    for (const row of ((meetings ?? []) as {
      client_id: string;
      started_at: string | null;
    }[])) {
      const current = meetingSummaries.get(row.client_id) ?? {
        client_id: row.client_id,
        latest_started_at: null,
        meeting_count: 0,
      };
      current.meeting_count += 1;
      if (
        row.started_at &&
        (!current.latest_started_at ||
          row.started_at > current.latest_started_at)
      ) {
        current.latest_started_at = row.started_at;
      }
      meetingSummaries.set(row.client_id, current);
    }

    const { data: insights } = await db
      .from("ops_meeting_insights")
      .select("meeting_id, kind, status, ops_meetings!inner(client_id)")
      .eq("kind", "action_item")
      .eq("status", "open")
      .in("ops_meetings.client_id", clientIds);

    for (const row of ((insights ?? []) as unknown as {
      ops_meetings: { client_id: string } | null;
    }[])) {
      const clientId = row.ops_meetings?.client_id;
      if (!clientId) continue;
      const current = insightSummaries.get(clientId) ?? {
        client_id: clientId,
        open_action_items: 0,
      };
      current.open_action_items += 1;
      insightSummaries.set(clientId, current);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs text-ink-muted uppercase tracking-wide">
            Workspace
          </p>
          <h1 className="font-serif text-3xl text-ink">
            {workspace.brand_name || workspace.name}
          </h1>
        </div>
        <Link
          href={`/w/${workspace.slug}/clients/new`}
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
        >
          New client
        </Link>
      </div>

      {clientRows.length === 0 ? (
        <div className="rounded-md border border-paper-muted bg-paper-warm/60 p-8 text-center space-y-3">
          <p className="text-ink-muted text-sm">No clients yet.</p>
          <Link
            href={`/w/${workspace.slug}/clients/new`}
            className="inline-block px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
          >
            Add your first client
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clientRows.map((client) => {
            const meetings = meetingSummaries.get(client.id);
            const insights = insightSummaries.get(client.id);
            return (
              <li key={client.id}>
                <Link
                  href={`/w/${workspace.slug}/c/${client.slug}`}
                  className="block rounded-md border border-paper-muted bg-paper-warm/60 p-4 hover:border-clay hover:bg-paper-warm transition-colors space-y-3"
                >
                  <div>
                    <p className="font-serif text-base text-ink">{client.name}</p>
                    {client.company && (
                      <p className="text-xs text-ink-light">{client.company}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-ink-muted uppercase tracking-wide">
                        Last meeting
                      </p>
                      <p className="text-ink">
                        {meetings?.latest_started_at
                          ? new Date(meetings.latest_started_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "\u2014"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-muted uppercase tracking-wide">
                        Open actions
                      </p>
                      <p className="text-ink">
                        {insights?.open_action_items ?? 0}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
