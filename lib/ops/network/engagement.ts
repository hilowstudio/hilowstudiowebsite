import { supabase } from "@/lib/supabase";

const LINKEDIN_API = "https://api.linkedin.com/v2";

export type EngagementActor = {
  urn: string;
  name: string | null;
};

async function getClientToken(clientId: string): Promise<string | null> {
  const { data } = await supabase
    .from("linkedin_connections")
    .select("access_token")
    .eq("status", "active")
    .eq("client_id", clientId)
    .maybeSingle();
  const row = data as { access_token: string } | null;
  return row?.access_token ?? null;
}

async function fetchActor(
  token: string,
  urn: string,
): Promise<{ name: string | null }> {
  const id = urn.split(":").pop();
  if (!id) return { name: null };
  try {
    const res = await fetch(
      `${LINKEDIN_API}/people/(id:${encodeURIComponent(id)})`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "LinkedIn-Version": "202603",
        },
      },
    );
    if (!res.ok) return { name: null };
    const data = (await res.json()) as {
      localizedFirstName?: string;
      localizedLastName?: string;
    };
    const name =
      `${data.localizedFirstName ?? ""} ${data.localizedLastName ?? ""}`.trim();
    return { name: name || null };
  } catch {
    return { name: null };
  }
}

export async function fetchPostComments(
  clientId: string,
  postUrn: string,
): Promise<{ actor: EngagementActor; text: string }[]> {
  const token = await getClientToken(clientId);
  if (!token) return [];

  try {
    const res = await fetch(
      `${LINKEDIN_API}/socialActions/${encodeURIComponent(postUrn)}/comments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "LinkedIn-Version": "202603",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      },
    );
    if (!res.ok) return [];
    const payload = (await res.json()) as {
      elements?: {
        actor: string;
        message?: { text?: string };
      }[];
    };
    const out: { actor: EngagementActor; text: string }[] = [];
    for (const element of payload.elements ?? []) {
      const { name } = await fetchActor(token, element.actor);
      out.push({
        actor: { urn: element.actor, name },
        text: element.message?.text ?? "",
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function fetchPostLikes(
  clientId: string,
  postUrn: string,
): Promise<EngagementActor[]> {
  const token = await getClientToken(clientId);
  if (!token) return [];

  try {
    const res = await fetch(
      `${LINKEDIN_API}/socialActions/${encodeURIComponent(postUrn)}/likes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "LinkedIn-Version": "202603",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      },
    );
    if (!res.ok) return [];
    const payload = (await res.json()) as {
      elements?: { actor: string }[];
    };
    const out: EngagementActor[] = [];
    for (const element of payload.elements ?? []) {
      const { name } = await fetchActor(token, element.actor);
      out.push({ urn: element.actor, name });
    }
    return out;
  } catch {
    return [];
  }
}

export async function recordEngagementEvents(params: {
  clientId: string;
  postId: string;
  postUrn: string;
}): Promise<{ likes: number; comments: number }> {
  const [likes, comments] = await Promise.all([
    fetchPostLikes(params.clientId, params.postUrn),
    fetchPostComments(params.clientId, params.postUrn),
  ]);

  const actors = [
    ...likes.map((a) => ({ ...a, kind: "like" as const, text: "" })),
    ...comments.map((c) => ({
      urn: c.actor.urn,
      name: c.actor.name,
      kind: "comment" as const,
      text: c.text,
    })),
  ];
  if (actors.length === 0) return { likes: 0, comments: 0 };

  const uniqueUrns = Array.from(new Set(actors.map((a) => a.urn)));
  const { data: existingContacts } = await supabase
    .from("ops_network_contacts")
    .select("id, linkedin_urn")
    .eq("client_id", params.clientId)
    .in("linkedin_urn", uniqueUrns);

  const urnToContactId = new Map<string, string>();
  for (const row of ((existingContacts ?? []) as {
    id: string;
    linkedin_urn: string;
  }[])) {
    urnToContactId.set(row.linkedin_urn, row.id);
  }

  // Create network contacts for any engagers not yet in the CSV import.
  const missing = actors.filter((a) => !urnToContactId.has(a.urn));
  if (missing.length > 0) {
    const deduped = new Map<string, { urn: string; name: string | null }>();
    for (const m of missing) {
      if (!deduped.has(m.urn)) deduped.set(m.urn, { urn: m.urn, name: m.name });
    }
    const { data: inserted } = await supabase
      .from("ops_network_contacts")
      .insert(
        Array.from(deduped.values()).map((m) => ({
          client_id: params.clientId,
          linkedin_urn: m.urn,
          name: m.name,
          imported_via: "linkedin_api",
        })),
      )
      .select("id, linkedin_urn");
    for (const row of ((inserted ?? []) as {
      id: string;
      linkedin_urn: string;
    }[])) {
      urnToContactId.set(row.linkedin_urn, row.id);
    }
  }

  const events = actors.map((a) => ({
    client_id: params.clientId,
    network_contact_id: urnToContactId.get(a.urn) ?? null,
    post_id: params.postId,
    kind: a.kind,
    raw: a.text ? { text: a.text } : {},
  }));

  if (events.length > 0) {
    await supabase.from("ops_engagement_events").insert(events);
  }

  return { likes: likes.length, comments: comments.length };
}
