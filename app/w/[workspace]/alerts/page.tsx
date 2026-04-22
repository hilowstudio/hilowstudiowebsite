import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { AlertsPanels } from "./alerts-panels";

export const dynamic = "force-dynamic";

type AlertRow = {
  id: string;
  kind: string;
  body: string;
  status: string;
  created_at: string;
  speaker: string | null;
  meeting_id: string;
  ops_meetings: {
    id: string;
    title: string | null;
    started_at: string | null;
    client_id: string;
    ops_clients: { slug: string; name: string } | null;
  } | null;
};

type ClientSummary = {
  id: string;
  slug: string;
  name: string;
};

const ALERT_KINDS = [
  "churn_signal",
  "upsell_signal",
  "referral_signal",
  "action_item",
];

export default async function AlertsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ kind?: string; include_done?: string; client?: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const { kind, include_done, client: clientFilter } = await searchParams;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();

  const { data: clientRows } = await db
    .from("ops_clients")
    .select("id, slug, name")
    .eq("workspace_id", workspace.id)
    .neq("status", "archived")
    .order("name", { ascending: true });
  const clients = (clientRows as ClientSummary[]) ?? [];
  const clientIds = clients.map((c) => c.id);

  let alerts: AlertRow[] = [];
  if (clientIds.length > 0) {
    let query = db
      .from("ops_meeting_insights")
      .select(
        "id, kind, body, status, created_at, speaker, meeting_id, ops_meetings!inner(id, title, started_at, client_id, ops_clients(slug, name))",
      )
      .in("kind", kind && ALERT_KINDS.includes(kind) ? [kind] : ALERT_KINDS)
      .in("ops_meetings.client_id", clientIds)
      .order("created_at", { ascending: false })
      .limit(200);

    if (include_done !== "true") {
      query = query.eq("status", "open");
    }

    if (clientFilter) {
      query = query.eq("ops_meetings.client_id", clientFilter);
    }

    const { data } = await query;
    alerts = (data as unknown as AlertRow[]) ?? [];
  }

  return (
    <AlertsPanels
      workspaceSlug={workspace.slug}
      alerts={alerts}
      clients={clients}
      activeKind={kind ?? ""}
      activeClient={clientFilter ?? ""}
      includeDone={include_done === "true"}
    />
  );
}
