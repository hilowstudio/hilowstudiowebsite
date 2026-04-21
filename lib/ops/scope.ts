import { getSupabase } from "@/lib/supabase";

export type WorkspaceRole = "owner" | "staff";
export type ClientRole = "client_owner" | "client_contributor" | "client_viewer";

export type Membership =
  | { scope: "workspace"; scopeId: string; role: WorkspaceRole }
  | { scope: "client"; scopeId: string; role: ClientRole }
  | { scope: "platform"; scopeId: null; role: "platform_admin" };

export type OpsUser = {
  id: string;
  email: string;
  name: string | null;
  memberships: Membership[];
  isPlatformAdmin: boolean;
};

export async function loadUserMemberships(userId: string): Promise<Membership[]> {
  const db = getSupabase();

  const [workspaces, clients] = await Promise.all([
    db
      .from("ops_workspace_members")
      .select("workspace_id, role")
      .eq("user_id", userId),
    db
      .from("ops_client_members")
      .select("client_id, role")
      .eq("user_id", userId),
  ]);

  const memberships: Membership[] = [];

  for (const row of (workspaces.data ?? []) as {
    workspace_id: string;
    role: WorkspaceRole;
  }[]) {
    memberships.push({
      scope: "workspace",
      scopeId: row.workspace_id,
      role: row.role,
    });
  }

  for (const row of (clients.data ?? []) as {
    client_id: string;
    role: ClientRole;
  }[]) {
    memberships.push({
      scope: "client",
      scopeId: row.client_id,
      role: row.role,
    });
  }

  return memberships;
}

const WORKSPACE_ROLE_RANK: Record<WorkspaceRole, number> = {
  staff: 1,
  owner: 2,
};

const CLIENT_ROLE_RANK: Record<ClientRole, number> = {
  client_viewer: 1,
  client_contributor: 2,
  client_owner: 3,
};

export function hasWorkspaceAccess(
  memberships: Membership[],
  workspaceId: string,
  minRole: WorkspaceRole = "staff",
  isPlatformAdmin = false,
): boolean {
  if (isPlatformAdmin) return true;
  const match = memberships.find(
    (m): m is Extract<Membership, { scope: "workspace" }> =>
      m.scope === "workspace" && m.scopeId === workspaceId,
  );
  if (!match) return false;
  return WORKSPACE_ROLE_RANK[match.role] >= WORKSPACE_ROLE_RANK[minRole];
}

export function hasClientAccess(
  memberships: Membership[],
  clientId: string,
  workspaceId: string | null,
  minRole: ClientRole = "client_viewer",
  isPlatformAdmin = false,
): boolean {
  if (isPlatformAdmin) return true;

  const clientMatch = memberships.find(
    (m): m is Extract<Membership, { scope: "client" }> =>
      m.scope === "client" && m.scopeId === clientId,
  );
  if (clientMatch && CLIENT_ROLE_RANK[clientMatch.role] >= CLIENT_ROLE_RANK[minRole]) {
    return true;
  }

  if (workspaceId) {
    const workspaceMatch = memberships.find(
      (m): m is Extract<Membership, { scope: "workspace" }> =>
        m.scope === "workspace" && m.scopeId === workspaceId,
    );
    if (workspaceMatch) return true;
  }

  return false;
}

export async function getWorkspaceBySlug(slug: string) {
  const db = getSupabase();
  const { data } = await db
    .from("ops_workspaces")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as {
    id: string;
    slug: string;
    name: string;
    brand_name: string | null;
    logo_url: string | null;
    primary_color: string | null;
    accent_color: string | null;
    tagline: string | null;
    custom_domain: string | null;
    domain_verified_at: string | null;
    billing_email: string | null;
    email_from_name: string | null;
    email_from_address: string | null;
    plan: string;
  } | null;
}

export async function getClientBySlug(workspaceId: string, slug: string) {
  const db = getSupabase();
  const { data } = await db
    .from("ops_clients")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("slug", slug)
    .maybeSingle();
  return data as {
    id: string;
    workspace_id: string;
    slug: string;
    name: string;
    company: string | null;
    timezone: string;
    status: string;
  } | null;
}
