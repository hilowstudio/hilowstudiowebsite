import { supabase } from "@/lib/supabase";
import type { ContentPillarRow } from "@/lib/types/database";

export type PillarScope = {
  workspaceId?: string | null;
  clientId?: string | null;
};

const _cache: Map<string, { data: ContentPillarRow[]; time: number }> =
  new Map();
const CACHE_TTL = 60_000;

function keyFor(scope?: PillarScope): string {
  if (!scope) return "__all__";
  return `ws:${scope.workspaceId ?? "*"}|c:${scope.clientId ?? "*"}`;
}

/** Fetch content pillars. Filters by scope when given; falls back to unfiltered. */
export async function getContentPillars(
  scope?: PillarScope,
): Promise<ContentPillarRow[]> {
  const k = keyFor(scope);
  const now = Date.now();
  const hit = _cache.get(k);
  if (hit && now - hit.time < CACHE_TTL) return hit.data;

  let query = supabase
    .from("content_pillars")
    .select("*")
    .order("sort_order", { ascending: true });

  if (scope?.workspaceId) query = query.eq("workspace_id", scope.workspaceId);
  if (scope && "clientId" in scope) {
    query =
      scope.clientId === null || scope.clientId === undefined
        ? query.is("client_id", null)
        : query.eq("client_id", scope.clientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  const rows = data || [];
  _cache.set(k, { data: rows, time: now });
  return rows;
}

/** Invalidate the server-side cache after writes. */
export function invalidatePillarCache() {
  _cache.clear();
}
