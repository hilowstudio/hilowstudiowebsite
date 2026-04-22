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

  let signalCounts = { churn: 0, upsell: 0, referral: 0 };

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
      .in("kind", ["action_item", "churn_signal", "upsell_signal", "referral_signal"])
      .eq("status", "open")
      .in("ops_meetings.client_id", clientIds);

    for (const row of ((insights ?? []) as unknown as {
      kind: string;
      ops_meetings: { client_id: string } | null;
    }[])) {
      const clientId = row.ops_meetings?.client_id;
      if (!clientId) continue;
      if (row.kind === "action_item") {
        const current = insightSummaries.get(clientId) ?? {
          client_id: clientId,
          open_action_items: 0,
        };
        current.open_action_items += 1;
        insightSummaries.set(clientId, current);
      } else if (row.kind === "churn_signal") {
        signalCounts.churn += 1;
      } else if (row.kind === "upsell_signal") {
        signalCounts.upsell += 1;
      } else if (row.kind === "referral_signal") {
        signalCounts.referral += 1;
      }
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

      {(signalCounts.churn > 0 ||
        signalCounts.upsell > 0 ||
        signalCounts.referral > 0) && (
        <Link
          href={`/w/${workspace.slug}/alerts`}
          className="block rounded-md border border-clay bg-paper-warm p-4 hover:bg-paper-warm/80 transition-colors"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs text-clay uppercase tracking-wide">
              Signals waiting
            </p>
            <span className="text-xs text-ink-light">Open alerts →</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            {signalCounts.churn > 0 && (
              <span className="text-terracotta">
                {signalCounts.churn} churn risk{signalCounts.churn === 1 ? "" : "s"}
              </span>
            )}
            {signalCounts.upsell > 0 && (
              <span className="text-moss">
                {signalCounts.upsell} upsell
                {signalCounts.upsell === 1 ? "" : "s"}
              </span>
            )}
            {signalCounts.referral > 0 && (
              <span className="text-clay">
                {signalCounts.referral} referral
                {signalCounts.referral === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </Link>
      )}

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
