import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

type UsageRow = {
  client_id: string;
  meter: string;
  count: number;
  cap: number | null;
  byok_override: boolean;
  period: string;
};

type ClientRow = { id: string; slug: string; name: string; company: string | null };

type PlanRow = {
  name: string;
  llm_tokens_cap: number;
  transcription_minutes_cap: number;
  posts_published_cap: number;
};

function currentPeriod(): string {
  const now = new Date();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}`;
}

function formatCount(meter: string, count: number): string {
  if (meter === "llm_tokens") return `${count.toLocaleString()} tokens`;
  if (meter === "transcription_minutes") return `${count} min`;
  return `${count} posts`;
}

function formatCap(meter: string, cap: number | null): string {
  if (cap === null || cap <= 0) return "unlimited";
  if (meter === "llm_tokens") return cap.toLocaleString();
  return String(cap);
}

export default async function UsagePage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();

  const [clientsRes, planRes] = await Promise.all([
    db
      .from("ops_clients")
      .select("id, slug, name, company")
      .eq("workspace_id", workspace.id)
      .neq("status", "archived")
      .order("name", { ascending: true }),
    db
      .from("ops_plans")
      .select("name, llm_tokens_cap, transcription_minutes_cap, posts_published_cap")
      .eq("slug", workspace.plan)
      .maybeSingle(),
  ]);

  const clients = (clientsRes.data as ClientRow[]) ?? [];
  const plan = planRes.data as PlanRow | null;

  const period = currentPeriod();
  const periodsToShow: string[] = [];
  {
    const d = new Date();
    for (let i = 0; i < 6; i++) {
      periodsToShow.push(
        `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, "0")}`,
      );
      d.setUTCMonth(d.getUTCMonth() - 1);
    }
  }

  const { data: usageData } = clients.length
    ? await db
        .from("ops_usage_meters")
        .select("client_id, meter, count, cap, byok_override, period")
        .in("period", periodsToShow)
        .in(
          "client_id",
          clients.map((c) => c.id),
        )
    : { data: [] };
  const allUsage = (usageData as UsageRow[]) ?? [];
  const usage = allUsage.filter((u) => u.period === period);

  type HistoryKey = string; // `${meter}:${period}`
  const totalsByMeterPeriod = new Map<HistoryKey, number>();
  for (const row of allUsage) {
    const key: HistoryKey = `${row.meter}:${row.period}`;
    totalsByMeterPeriod.set(
      key,
      (totalsByMeterPeriod.get(key) ?? 0) + row.count,
    );
  }

  const meters = ["llm_tokens", "transcription_minutes", "posts_published"];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs text-ink-muted uppercase tracking-wide">
          Current period: {period}
        </p>
        <h1 className="font-serif text-2xl text-ink">Usage</h1>
        {plan && (
          <p className="text-sm text-ink-light">
            Plan: {plan.name} &middot; LLM tokens cap{" "}
            {plan.llm_tokens_cap.toLocaleString()}, transcription minutes cap{" "}
            {plan.transcription_minutes_cap}, posts cap{" "}
            {plan.posts_published_cap} (per client, per month)
          </p>
        )}
      </header>

      {clients.length === 0 ? (
        <p className="text-sm text-ink-light">No clients yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-muted border-b border-paper-muted">
                <th className="pb-2 pr-4 font-medium">Client</th>
                {meters.map((m) => (
                  <th key={m} className="pb-2 pr-4 font-medium capitalize">
                    {m.replace("_", " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-paper-muted/50"
                >
                  <td className="py-3 pr-4">
                    <span className="text-ink">{client.name}</span>
                    {client.company && (
                      <span className="text-xs text-ink-light ml-2">
                        {client.company}
                      </span>
                    )}
                  </td>
                  {meters.map((meter) => {
                    const row = usage.find(
                      (u) => u.client_id === client.id && u.meter === meter,
                    );
                    const count = row?.count ?? 0;
                    const cap = row?.cap ?? null;
                    const byok = row?.byok_override ?? false;
                    return (
                      <td key={meter} className="py-3 pr-4">
                        <span className="text-ink">
                          {formatCount(meter, count)}
                        </span>
                        <span className="text-xs text-ink-light ml-1">
                          / {formatCap(meter, cap)}
                        </span>
                        {byok && (
                          <span className="ml-2 text-xs text-moss">BYOK</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {clients.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-serif text-lg text-ink">Last 6 months</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {meters.map((meter) => {
              const bars = periodsToShow
                .slice()
                .reverse()
                .map((p) => ({
                  period: p,
                  count: totalsByMeterPeriod.get(`${meter}:${p}`) ?? 0,
                }));
              const max = Math.max(1, ...bars.map((b) => b.count));
              return (
                <div
                  key={meter}
                  className="rounded-md border border-paper-muted bg-paper-warm/60 p-4 space-y-3"
                >
                  <p className="text-xs text-ink-muted uppercase tracking-wide capitalize">
                    {meter.replace("_", " ")}
                  </p>
                  <div className="flex items-end gap-2 h-24">
                    {bars.map((b) => (
                      <div
                        key={b.period}
                        className="flex-1 flex flex-col items-center gap-1"
                        title={`${b.period}: ${b.count}`}
                      >
                        <div className="flex-1 w-full flex items-end">
                          <div
                            className="w-full bg-clay/60 rounded-sm"
                            style={{
                              height: `${(b.count / max) * 100}%`,
                              minHeight: b.count > 0 ? "2px" : "0",
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-ink-light">
                          {b.period.slice(5)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-ink">
                    {formatCount(
                      meter,
                      bars[bars.length - 1]?.count ?? 0,
                    )}{" "}
                    this month
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
