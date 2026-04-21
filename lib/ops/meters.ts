import { getSupabase } from "@/lib/supabase";

export type MeterKey = "llm_tokens" | "transcription_minutes" | "posts_published";

export class QuotaExceededError extends Error {
  readonly code = "quota_exceeded";
  readonly clientId: string;
  readonly meter: MeterKey;
  constructor(clientId: string, meter: MeterKey, message: string) {
    super(message);
    this.name = "QuotaExceededError";
    this.clientId = clientId;
    this.meter = meter;
  }
}

type PlanRow = {
  slug: string;
  llm_tokens_cap: number;
  transcription_minutes_cap: number;
  posts_published_cap: number;
};

function currentPeriod(): string {
  const now = new Date();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}`;
}

async function loadPlanForClient(clientId: string): Promise<PlanRow | null> {
  const db = getSupabase();
  const { data } = await db
    .from("ops_clients")
    .select("ops_workspaces(plan)")
    .eq("id", clientId)
    .maybeSingle();
  const workspacePlan =
    (data as unknown as { ops_workspaces: { plan: string } | null } | null)
      ?.ops_workspaces?.plan ?? null;
  if (!workspacePlan) return null;

  const { data: plan } = await db
    .from("ops_plans")
    .select("slug, llm_tokens_cap, transcription_minutes_cap, posts_published_cap")
    .eq("slug", workspacePlan)
    .maybeSingle();
  return plan as PlanRow | null;
}

export async function getCap(
  clientId: string,
  meter: MeterKey,
): Promise<number> {
  const plan = await loadPlanForClient(clientId);
  if (!plan) return 0;
  if (meter === "llm_tokens") return plan.llm_tokens_cap;
  if (meter === "transcription_minutes") return plan.transcription_minutes_cap;
  return plan.posts_published_cap;
}

export async function getUsage(
  clientId: string,
  meter: MeterKey,
): Promise<{ count: number; cap: number; byokOverride: boolean }> {
  const db = getSupabase();
  const period = currentPeriod();
  const { data } = await db
    .from("ops_usage_meters")
    .select("count, cap, byok_override")
    .eq("client_id", clientId)
    .eq("period", period)
    .eq("meter", meter)
    .maybeSingle();

  const row = data as {
    count: number;
    cap: number | null;
    byok_override: boolean;
  } | null;

  const cap = row?.cap ?? (await getCap(clientId, meter));
  return {
    count: row?.count ?? 0,
    cap,
    byokOverride: row?.byok_override ?? false,
  };
}

/**
 * Check whether a call is allowed. If byokPresent is true, callers are
 * self-funding; we don't enforce caps. Otherwise we compare current usage
 * against the plan cap.
 *
 * Returns {allowed:true, usePlatformKey:boolean}. When false, throws.
 */
export async function assertCapOrBYOK(
  clientId: string,
  meter: MeterKey,
  options: { byokPresent: boolean },
): Promise<{ usePlatformKey: boolean; remaining: number; cap: number }> {
  if (options.byokPresent) {
    return { usePlatformKey: false, remaining: -1, cap: -1 };
  }

  const { count, cap } = await getUsage(clientId, meter);
  if (cap > 0 && count >= cap) {
    throw new QuotaExceededError(
      clientId,
      meter,
      `Monthly ${meter} cap reached (${count}/${cap}). Connect a workspace-level ${meter.startsWith("llm") ? "LLM" : "integration"} key to override.`,
    );
  }
  const remaining = cap > 0 ? cap - count : Number.MAX_SAFE_INTEGER;
  return { usePlatformKey: true, remaining, cap };
}

export async function incrementUsage(
  clientId: string,
  meter: MeterKey,
  amount: number,
  options?: { byokOverride?: boolean },
): Promise<void> {
  if (amount <= 0) return;
  const db = getSupabase();
  const period = currentPeriod();

  const { data: existing } = await db
    .from("ops_usage_meters")
    .select("id, count, cap, byok_override")
    .eq("client_id", clientId)
    .eq("period", period)
    .eq("meter", meter)
    .maybeSingle();

  if (existing) {
    const row = existing as {
      id: string;
      count: number;
      cap: number | null;
      byok_override: boolean;
    };
    await db
      .from("ops_usage_meters")
      .update({
        count: row.count + amount,
        byok_override: options?.byokOverride ?? row.byok_override,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    return;
  }

  const cap = await getCap(clientId, meter);
  await db.from("ops_usage_meters").insert({
    client_id: clientId,
    period,
    meter,
    count: amount,
    cap: cap > 0 ? cap : null,
    byok_override: options?.byokOverride ?? false,
  });
}
