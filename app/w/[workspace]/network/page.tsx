import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { WorkspaceNetworkPanels } from "./network-panels";

export const dynamic = "force-dynamic";

type ContactRow = {
  id: string;
  name: string | null;
  company: string | null;
  headline: string | null;
  linkedin_url: string | null;
  imported_via: string;
};

type CompetitorRow = {
  id: string;
  name: string;
  linkedin_url: string | null;
  client_id: string | null;
};

type ProspectRow = {
  id: string;
  score: number;
  reasons: string[];
  surfaced_at: string;
  network_contact_id: string;
  ops_network_contacts: {
    name: string | null;
    company: string | null;
    linkedin_url: string | null;
  } | null;
};

type EngagementRow = {
  id: string;
  kind: string;
  observed_at: string;
  post_id: string | null;
  raw: Record<string, unknown> | null;
  client_id: string | null;
  ops_network_contacts: {
    name: string | null;
    linkedin_url: string | null;
  } | null;
};

export default async function WorkspaceNetworkPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();

  const [contactsRes, competitorsRes, prospectsRes, eventsRes, contactCountRes] =
    await Promise.all([
      db
        .from("ops_network_contacts")
        .select("id, name, company, headline, linkedin_url, imported_via")
        .eq("workspace_id", workspace.id)
        .order("name", { ascending: true })
        .limit(200),
      db
        .from("ops_competitors")
        .select("id, name, linkedin_url, client_id")
        .eq("workspace_id", workspace.id)
        .order("name", { ascending: true }),
      db
        .from("ops_warm_prospects")
        .select(
          "id, score, reasons, surfaced_at, network_contact_id, ops_network_contacts(name, company, linkedin_url)",
        )
        .eq("workspace_id", workspace.id)
        .is("client_id", null)
        .is("dismissed_at", null)
        .order("score", { ascending: false })
        .limit(25),
      db
        .from("ops_engagement_events")
        .select(
          "id, kind, observed_at, post_id, raw, client_id, ops_network_contacts(name, linkedin_url)",
        )
        .eq("workspace_id", workspace.id)
        .order("observed_at", { ascending: false })
        .limit(30),
      db
        .from("ops_network_contacts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspace.id),
    ]);

  const contacts = (contactsRes.data as ContactRow[]) ?? [];
  const competitors = (competitorsRes.data as CompetitorRow[]) ?? [];
  const prospects = (prospectsRes.data as unknown as ProspectRow[]) ?? [];
  const events = (eventsRes.data as unknown as EngagementRow[]) ?? [];
  const totalContacts = contactCountRes.count ?? 0;

  return (
    <WorkspaceNetworkPanels
      workspaceId={workspace.id}
      totalContacts={totalContacts}
      contacts={contacts}
      competitors={competitors}
      prospects={prospects}
      events={events}
    />
  );
}
