"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InsightRow = {
  id: string;
  kind: string;
  body: string;
  speaker: string | null;
  timestamp_seconds: number | null;
  status: string;
};

const KIND_LABELS: Record<string, string> = {
  action_item: "Action items",
  quote: "Quotable moments",
  brief: "Brief",
  churn_signal: "Churn signals",
  upsell_signal: "Upsell signals",
  referral_signal: "Referral signals",
};

const KIND_ORDER = [
  "brief",
  "action_item",
  "quote",
  "churn_signal",
  "upsell_signal",
  "referral_signal",
];

export function MeetingInsights({
  meetingId,
  initialInsights,
}: {
  meetingId: string;
  initialInsights: InsightRow[];
}) {
  const router = useRouter();
  const [insights, setInsights] = useState(initialInsights);
  const [error, setError] = useState("");

  if (insights.length === 0) {
    return (
      <section className="space-y-2">
        <h3 className="font-serif text-lg text-ink">Insights</h3>
        <p className="text-sm text-ink-light">
          No insights yet. Sync from Meetings to extract them automatically.
        </p>
      </section>
    );
  }

  const grouped = new Map<string, InsightRow[]>();
  for (const insight of insights) {
    const list = grouped.get(insight.kind) ?? [];
    list.push(insight);
    grouped.set(insight.kind, list);
  }

  async function toggleStatus(id: string, current: string) {
    const nextStatus = current === "open" ? "done" : "open";
    const prev = insights;
    setInsights((list) =>
      list.map((i) => (i.id === id ? { ...i, status: nextStatus } : i)),
    );
    const res = await fetch(`/api/ops/insights/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!res.ok) {
      setInsights(prev);
      const data = await res.json();
      setError(data.error || "Could not update");
      return;
    }
    router.refresh();
  }

  return (
    <section className="space-y-6">
      {KIND_ORDER.filter((k) => grouped.has(k)).map((kind) => (
        <div key={`${meetingId}-${kind}`} className="space-y-2">
          <h3 className="font-serif text-lg text-ink">
            {KIND_LABELS[kind] ?? kind}
          </h3>
          <ul className="space-y-2">
            {(grouped.get(kind) ?? []).map((insight) => {
              const done = insight.status === "done";
              return (
                <li
                  key={insight.id}
                  className={`rounded-md border border-paper-muted bg-paper-warm/60 p-3 ${done ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-ink measure whitespace-pre-wrap">
                      {insight.body}
                    </p>
                    {kind === "action_item" && (
                      <button
                        type="button"
                        onClick={() => toggleStatus(insight.id, insight.status)}
                        className="text-xs text-ink-light hover:text-moss transition-colors whitespace-nowrap"
                      >
                        {done ? "Reopen" : "Mark done"}
                      </button>
                    )}
                  </div>
                  {insight.speaker && (
                    <p className="text-xs text-ink-light mt-1">
                      {insight.speaker}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {error && <p className="text-terracotta text-sm">{error}</p>}
    </section>
  );
}
