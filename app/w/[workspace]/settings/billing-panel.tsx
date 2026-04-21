"use client";

import { useState } from "react";

const PAID_PLANS = [
  {
    slug: "starter" as const,
    label: "Starter",
    price: "$69 / mo / client",
    blurb: "500k LLM tokens, 300 transcription minutes, 50 posts per client per month.",
  },
  {
    slug: "growth" as const,
    label: "Growth",
    price: "$149 / mo / client",
    blurb: "2M LLM tokens, 1500 transcription minutes, 200 posts per client per month.",
  },
];

export function BillingPanel({
  workspaceId,
  currentPlan,
}: {
  workspaceId: string;
  currentPlan: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function subscribe(plan: "starter" | "growth") {
    setBusy(plan);
    setError("");
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/billing/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      },
    );
    if (res.ok) {
      const data = (await res.json()) as { url: string };
      window.location.href = data.url;
    } else {
      const data = await res.json();
      setError(data.error || "Could not start checkout");
      setBusy(null);
    }
  }

  async function openPortal() {
    setBusy("portal");
    setError("");
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/billing/portal`,
      { method: "POST" },
    );
    if (res.ok) {
      const data = (await res.json()) as { url: string };
      window.location.href = data.url;
    } else {
      const data = await res.json();
      setError(data.error || "Could not open billing portal");
      setBusy(null);
    }
  }

  const isOnPaidPlan = currentPlan === "starter" || currentPlan === "growth";

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-ink-muted">
        Current plan:{" "}
        <span className="text-ink font-medium capitalize">{currentPlan}</span>
      </p>

      {isOnPaidPlan && (
        <div className="rounded-md border border-paper-muted bg-paper-warm/60 p-3">
          <button
            type="button"
            onClick={openPortal}
            disabled={busy === "portal"}
            className="text-sm text-clay hover:text-ink transition-colors"
          >
            {busy === "portal"
              ? "Opening..."
              : "Manage subscription + invoices"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAID_PLANS.map((plan) => (
          <div
            key={plan.slug}
            className={`rounded-md border p-4 space-y-2 ${
              currentPlan === plan.slug
                ? "border-clay bg-paper-warm"
                : "border-paper-muted bg-paper-warm/50"
            }`}
          >
            <p className="font-serif text-base text-ink">{plan.label}</p>
            <p className="text-xs text-ink-light">{plan.price}</p>
            <p className="text-xs text-ink-muted measure">{plan.blurb}</p>
            <button
              type="button"
              onClick={() => subscribe(plan.slug)}
              disabled={busy === plan.slug || currentPlan === plan.slug}
              className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
            >
              {currentPlan === plan.slug
                ? "Current"
                : busy === plan.slug
                  ? "Starting..."
                  : isOnPaidPlan
                    ? "Switch"
                    : "Subscribe"}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}

      <p className="text-xs text-ink-light measure">
        Caps are per-client, per-month. BYOK overflow is always free — plug an
        Anthropic or Deepgram key at the client level and those calls bypass the
        platform meter.
      </p>
    </div>
  );
}
