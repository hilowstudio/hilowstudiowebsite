import { getSupabase } from "@/lib/supabase";

export type ContentPostScope = {
  id: string;
  clientId: string;
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
  const clientId = row.client_id;
  const workspaceId =
    row.workspace_id || row.ops_clients?.workspace_id || null;
  if (!clientId || !workspaceId) return null;
  return { id: row.id, clientId, workspaceId };
}
