import { supabase } from "@/lib/supabase";
import type { ContentPillarRow } from "@/lib/types/database";

let _cache: ContentPillarRow[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

/** Fetch content pillars from the DB. Cached for 1 minute server-side. */
export async function getContentPillars(): Promise<ContentPillarRow[]> {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache;

  const { data, error } = await supabase
    .from("content_pillars")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  _cache = data || [];
  _cacheTime = now;
  return _cache;
}

/** Invalidate the server-side cache after writes. */
export function invalidatePillarCache() {
  _cache = null;
}
