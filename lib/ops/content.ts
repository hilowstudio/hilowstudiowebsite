import { getSupabase } from "@/lib/supabase";
import {
  hasClientAccess,
  hasWorkspaceAccess,
  type Membership,
} from "@/lib/ops/scope";

export type ContentPostScope = {
  id: string;
  clientId: string | null;
  workspaceId: string;
};

export async function resolveContentPostScope(
  postId: string,
): Promise<ContentPostScope | null> {
  const db = getSupabase();
  const { data } = await db
    .from("content_posts")
    .select(
      "id, client_id, workspace_id, ops_clients(workspace_id)",
    )
    .eq("id", postId)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as {
    id: string;
    client_id: string | null;
    workspace_id: string | null;
    ops_clients: { workspace_id: string } | null;
  };
  const workspaceId =
    row.workspace_id || row.ops_clients?.workspace_id || null;
  if (!workspaceId) return null;
  return { id: row.id, clientId: row.client_id, workspaceId };
}

export type PostAccessLevel = "viewer" | "contributor" | "owner";

/**
 * Check whether a caller can access a content post.
 * Client-scoped posts require the matching client membership (or workspace
 * membership, which cascades). Workspace-scoped posts require workspace
 * membership at the mapped level.
 */
export function canAccessContentPost(
  memberships: Membership[],
  scope: ContentPostScope,
  level: PostAccessLevel,
  isPlatformAdmin: boolean,
): boolean {
  if (isPlatformAdmin) return true;

  if (scope.clientId) {
    const clientRole =
      level === "owner"
        ? "client_owner"
        : level === "contributor"
          ? "client_contributor"
          : "client_viewer";
    return hasClientAccess(
      memberships,
      scope.clientId,
      scope.workspaceId,
      clientRole,
      false,
    );
  }

  const workspaceRole = level === "owner" ? "owner" : "staff";
  return hasWorkspaceAccess(memberships, scope.workspaceId, workspaceRole, false);
}
