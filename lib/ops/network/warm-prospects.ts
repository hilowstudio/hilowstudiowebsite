import { getSupabase } from "@/lib/supabase";

type EngagementRow = {
  network_contact_id: string | null;
  kind: string;
  post_id: string | null;
  observed_at: string;
  raw: Record<string, unknown> | null;
};

type ContactRow = {
  id: string;
  name: string | null;
  company: string | null;
  linkedin_url: string | null;
};

export type ScoredProspect = {
  client_id: string;
  network_contact_id: string;
  score: number;
  reasons: string[];
  contact: ContactRow | null;
};

const WEIGHT_LIKE = 1;
const WEIGHT_COMMENT = 3;
const WEIGHT_RESHARE = 5;
const WEIGHT_COMPETITOR = 4;
const WEIGHT_MULTIPLE_POSTS = 2;

function kindWeight(kind: string): number {
  if (kind === "comment") return WEIGHT_COMMENT;
  if (kind === "reshare") return WEIGHT_RESHARE;
  return WEIGHT_LIKE;
}

export async function rebuildWarmProspectsForWorkspace(
  workspaceId: string,
  windowDays = 30,
): Promise<{ workspaceId: string; top: ScoredProspect[] }> {
  const db = getSupabase();
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const { data: events } = await db
    .from("ops_engagement_events")
    .select("network_contact_id, kind, post_id, observed_at, raw, client_id")
    .eq("workspace_id", workspaceId)
    .gte("observed_at", since.toISOString());

  const rows = (events as (EngagementRow & { client_id: string | null })[]) ?? [];

  const byContact = new Map<
    string,
    { score: number; reasons: string[]; postIds: Set<string> }
  >();

  for (const row of rows) {
    if (!row.network_contact_id) continue;
    const current = byContact.get(row.network_contact_id) ?? {
      score: 0,
      reasons: [] as string[],
      postIds: new Set<string>(),
    };

    current.score += kindWeight(row.kind);
    current.reasons.push(
      `${row.kind} on ${row.post_id ? "your content" : "logged activity"}`,
    );

    if (row.raw && (row.raw as { competitor_id?: unknown }).competitor_id) {
      current.score += WEIGHT_COMPETITOR;
      current.reasons.push("engaged with competitor");
    }

    if (row.post_id) current.postIds.add(row.post_id);

    byContact.set(row.network_contact_id, current);
  }

  for (const entry of byContact.values()) {
    if (entry.postIds.size > 1) {
      entry.score += WEIGHT_MULTIPLE_POSTS * (entry.postIds.size - 1);
      entry.reasons.push(`${entry.postIds.size} posts engaged`);
    }
  }

  const contactIds = Array.from(byContact.keys());
  const contactMap = new Map<string, ContactRow>();
  if (contactIds.length > 0) {
    const { data: contacts } = await db
      .from("ops_network_contacts")
      .select("id, name, company, linkedin_url")
      .in("id", contactIds);
    for (const c of ((contacts ?? []) as ContactRow[])) {
      contactMap.set(c.id, c);
    }
  }

  const prospects: ScoredProspect[] = Array.from(byContact.entries()).map(
    ([contactId, data]) => ({
      client_id: workspaceId, // reused field; semantic is scope id
      network_contact_id: contactId,
      score: data.score,
      reasons: Array.from(new Set(data.reasons)),
      contact: contactMap.get(contactId) ?? null,
    }),
  );

  prospects.sort((a, b) => b.score - a.score);
  const top = prospects.slice(0, 50);

  for (const p of top) {
    const { data: existing } = await db
      .from("ops_warm_prospects")
      .select("id")
      .eq("workspace_id", workspaceId)
      .is("client_id", null)
      .eq("network_contact_id", p.network_contact_id)
      .maybeSingle();
    if (existing) {
      await db
        .from("ops_warm_prospects")
        .update({
          score: p.score,
          reasons: p.reasons,
          surfaced_at: new Date().toISOString(),
          dismissed_at: null,
        })
        .eq("id", (existing as { id: string }).id);
    } else {
      await db.from("ops_warm_prospects").insert({
        workspace_id: workspaceId,
        client_id: null,
        network_contact_id: p.network_contact_id,
        score: p.score,
        reasons: p.reasons,
      });
    }
  }

  return { workspaceId, top };
}

export async function rebuildWarmProspects(
  clientId: string,
  windowDays = 30,
): Promise<ScoredProspect[]> {
  const db = getSupabase();
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const { data: events } = await db
    .from("ops_engagement_events")
    .select("network_contact_id, kind, post_id, observed_at, raw")
    .eq("client_id", clientId)
    .gte("observed_at", since.toISOString());

  const rows = (events as EngagementRow[]) ?? [];

  const byContact = new Map<string, { score: number; reasons: string[]; postIds: Set<string> }>();

  for (const row of rows) {
    if (!row.network_contact_id) continue;
    const current = byContact.get(row.network_contact_id) ?? {
      score: 0,
      reasons: [] as string[],
      postIds: new Set<string>(),
    };

    current.score += kindWeight(row.kind);
    current.reasons.push(`${row.kind} on ${row.post_id ? "client post" : "logged activity"}`);

    if (row.raw && (row.raw as { competitor_id?: unknown }).competitor_id) {
      current.score += WEIGHT_COMPETITOR;
      current.reasons.push("engaged with competitor");
    }

    if (row.post_id) current.postIds.add(row.post_id);

    byContact.set(row.network_contact_id, current);
  }

  for (const entry of byContact.values()) {
    if (entry.postIds.size > 1) {
      entry.score += WEIGHT_MULTIPLE_POSTS * (entry.postIds.size - 1);
      entry.reasons.push(`${entry.postIds.size} posts engaged`);
    }
  }

  const contactIds = Array.from(byContact.keys());
  let contactMap = new Map<string, ContactRow>();
  if (contactIds.length > 0) {
    const { data: contacts } = await db
      .from("ops_network_contacts")
      .select("id, name, company, linkedin_url")
      .in("id", contactIds);
    for (const c of ((contacts ?? []) as ContactRow[])) {
      contactMap.set(c.id, c);
    }
  }

  const prospects: ScoredProspect[] = Array.from(byContact.entries()).map(
    ([contactId, data]) => ({
      client_id: clientId,
      network_contact_id: contactId,
      score: data.score,
      reasons: Array.from(new Set(data.reasons)),
      contact: contactMap.get(contactId) ?? null,
    }),
  );

  prospects.sort((a, b) => b.score - a.score);

  // Upsert into ops_warm_prospects: keep top 50, reset dismissed_at so
  // re-surfaced prospects show up again.
  const top = prospects.slice(0, 50);

  if (top.length > 0) {
    for (const p of top) {
      const { data: existing } = await db
        .from("ops_warm_prospects")
        .select("id")
        .eq("client_id", p.client_id)
        .eq("network_contact_id", p.network_contact_id)
        .maybeSingle();
      if (existing) {
        await db
          .from("ops_warm_prospects")
          .update({
            score: p.score,
            reasons: p.reasons,
            surfaced_at: new Date().toISOString(),
            dismissed_at: null,
          })
          .eq("id", (existing as { id: string }).id);
      } else {
        await db.from("ops_warm_prospects").insert({
          client_id: p.client_id,
          network_contact_id: p.network_contact_id,
          score: p.score,
          reasons: p.reasons,
        });
      }
    }
  }

  return top;
}
