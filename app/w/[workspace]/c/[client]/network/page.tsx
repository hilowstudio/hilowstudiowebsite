import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { NetworkPanels } from "./network-panels";

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
  ops_network_contacts: {
    name: string | null;
    linkedin_url: string | null;
  } | null;
};

export default async function NetworkPage({
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

  const [contactsRes, competitorsRes, prospectsRes, eventsRes, contactCountRes] =
    await Promise.all([
      db
        .from("ops_network_contacts")
        .select("id, name, company, headline, linkedin_url, imported_via")
        .eq("client_id", client.id)
        .order("name", { ascending: true })
        .limit(100),
      db
        .from("ops_competitors")
        .select("id, name, linkedin_url")
        .eq("client_id", client.id)
        .order("name", { ascending: true }),
      db
        .from("ops_warm_prospects")
        .select(
          "id, score, reasons, surfaced_at, network_contact_id, ops_network_contacts(name, company, linkedin_url)",
        )
        .eq("client_id", client.id)
        .is("dismissed_at", null)
        .order("score", { ascending: false })
        .limit(25),
      db
        .from("ops_engagement_events")
        .select(
          "id, kind, observed_at, post_id, raw, ops_network_contacts(name, linkedin_url)",
        )
        .eq("client_id", client.id)
        .order("observed_at", { ascending: false })
        .limit(25),
      db
        .from("ops_network_contacts")
        .select("id", { count: "exact", head: true })
        .eq("client_id", client.id),
    ]);

  const contacts = (contactsRes.data as ContactRow[]) ?? [];
  const competitors = (competitorsRes.data as CompetitorRow[]) ?? [];
  const prospects = (prospectsRes.data as unknown as ProspectRow[]) ?? [];
  const events = (eventsRes.data as unknown as EngagementRow[]) ?? [];
  const totalContacts = contactCountRes.count ?? 0;

  return (
    <NetworkPanels
      clientId={client.id}
      workspaceSlug={workspace.slug}
      clientSlug={client.slug}
      totalContacts={totalContacts}
      contacts={contacts}
      competitors={competitors}
      prospects={prospects}
      events={events}
    />
  );
}
