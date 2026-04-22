"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Alert = {
  id: string;
  kind: string;
  body: string;
  status: string;
  created_at: string;
  speaker: string | null;
  meeting_id: string;
  ops_meetings: {
    id: string;
    title: string | null;
    started_at: string | null;
    client_id: string;
    ops_clients: { slug: string; name: string } | null;
  } | null;
};

type ClientSummary = {
  id: string;
  slug: string;
  name: string;
};

const KIND_TABS = [
  { value: "", label: "All signals" },
  { value: "churn_signal", label: "Churn risk" },
  { value: "upsell_signal", label: "Upsell" },
  { value: "referral_signal", label: "Referral" },
  { value: "action_item", label: "Action items" },
];

const KIND_LABELS: Record<string, string> = {
  churn_signal: "Churn risk",
  upsell_signal: "Upsell",
  referral_signal: "Referral",
  action_item: "Action item",
};

const KIND_CLASSES: Record<string, string> = {
  churn_signal: "bg-terracotta/20 text-terracotta",
  upsell_signal: "bg-moss/30 text-moss",
  referral_signal: "bg-clay/20 text-clay",
  action_item: "bg-paper-muted text-ink-muted",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AlertsPanels({
  workspaceSlug,
  alerts,
  clients,
  activeKind,
  activeClient,
  includeDone,
}: {
  workspaceSlug: string;
  alerts: Alert[];
  clients: ClientSummary[];
  activeKind: string;
  activeClient: string;
  includeDone: boolean;
}) {
  const router = useRouter();
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState("");

  const counts = {
    churn: alerts.filter(
      (a) => a.kind === "churn_signal" && a.status === "open",
    ).length,
    upsell: alerts.filter(
      (a) => a.kind === "upsell_signal" && a.status === "open",
    ).length,
    referral: alerts.filter(
      (a) => a.kind === "referral_signal" && a.status === "open",
    ).length,
    action: alerts.filter(
      (a) => a.kind === "action_item" && a.status === "open",
    ).length,
  };

  async function updateStatus(id: string, status: string) {
    setLocalStatuses((prev) => ({ ...prev, [id]: status }));
    setError("");
    const res = await fetch(`/api/ops/insights/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setLocalStatuses((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      const data = await res.json();
      setError(data.error || "Could not update");
      return;
    }
    router.refresh();
  }

  function buildQuery(
    next: Partial<{ kind: string; client: string; include_done: string }>,
  ): string {
    const query = new URLSearchParams();
    const nextKind = "kind" in next ? next.kind : activeKind;
    const nextClient = "client" in next ? next.client : activeClient;
    const nextDone =
      "include_done" in next
        ? next.include_done
        : includeDone
          ? "true"
          : "";
    if (nextKind) query.set("kind", nextKind);
    if (nextClient) query.set("client", nextClient);
    if (nextDone) query.set("include_done", nextDone);
    const s = query.toString();
    return s ? `?${s}` : "";
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-serif text-2xl text-ink">Signals</h1>
        <p className="text-sm text-ink-light measure">
          Cross-client alerts extracted from every meeting. Churn risks, upsell
          moments, referral openings, and open action items. Triage here before
          they slip.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href={`/w/${workspaceSlug}/alerts${buildQuery({ kind: "churn_signal" })}`}
          className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 hover:border-terracotta transition-colors"
        >
          <p className="text-xs text-ink-muted uppercase tracking-wide">
            Churn risk
          </p>
          <p className="font-serif text-xl text-terracotta">{counts.churn}</p>
        </Link>
        <Link
          href={`/w/${workspaceSlug}/alerts${buildQuery({ kind: "upsell_signal" })}`}
          className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 hover:border-moss transition-colors"
        >
          <p className="text-xs text-ink-muted uppercase tracking-wide">
            Upsell
          </p>
          <p className="font-serif text-xl text-moss">{counts.upsell}</p>
        </Link>
        <Link
          href={`/w/${workspaceSlug}/alerts${buildQuery({ kind: "referral_signal" })}`}
          className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 hover:border-clay transition-colors"
        >
          <p className="text-xs text-ink-muted uppercase tracking-wide">
            Referral
          </p>
          <p className="font-serif text-xl text-clay">{counts.referral}</p>
        </Link>
        <Link
          href={`/w/${workspaceSlug}/alerts${buildQuery({ kind: "action_item" })}`}
          className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 hover:border-ink transition-colors"
        >
          <p className="text-xs text-ink-muted uppercase tracking-wide">
            Open actions
          </p>
          <p className="font-serif text-xl text-ink">{counts.action}</p>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 items-center text-sm">
        {KIND_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/w/${workspaceSlug}/alerts${buildQuery({ kind: tab.value })}`}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeKind === tab.value
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            {tab.label}
          </Link>
        ))}
        <div className="flex-1" />
        {clients.length > 0 && (
          <select
            value={activeClient}
            onChange={(e) => {
              router.push(
                `/w/${workspaceSlug}/alerts${buildQuery({ client: e.target.value })}`,
              );
            }}
            className="px-3 py-1.5 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
          >
            <option value="">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <Link
          href={`/w/${workspaceSlug}/alerts${buildQuery({ include_done: includeDone ? "" : "true" })}`}
          className="text-xs text-ink-light hover:text-ink transition-colors"
        >
          {includeDone ? "Hide done" : "Show done"}
        </Link>
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-ink-light py-8">
          {includeDone
            ? "No signals match the filter."
            : "Nothing open. Churn, upsell, and referral cues will show up here as meetings come in."}
        </p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => {
            const currentStatus = localStatuses[a.id] ?? a.status;
            const clientName = a.ops_meetings?.ops_clients?.name ?? "—";
            const clientSlug = a.ops_meetings?.ops_clients?.slug;
            const isDone = currentStatus === "done";
            const isDismissed = currentStatus === "dismissed";
            return (
              <li
                key={a.id}
                className={`rounded-md border border-paper-muted bg-paper-warm/60 p-4 space-y-2 ${
                  isDone || isDismissed ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs ${KIND_CLASSES[a.kind] ?? ""}`}
                    >
                      {KIND_LABELS[a.kind] ?? a.kind}
                    </span>
                    <span className="text-sm text-ink">{clientName}</span>
                    {a.speaker && (
                      <span className="text-xs text-ink-light">
                        from {a.speaker}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-ink-light whitespace-nowrap">
                    {formatDate(a.created_at)}
                  </span>
                </div>
                <p className="text-sm text-ink measure whitespace-pre-wrap">
                  {a.body}
                </p>
                <div className="flex gap-3 text-xs justify-end">
                  {clientSlug && (
                    <Link
                      href={`/w/${workspaceSlug}/c/${clientSlug}/meetings/${a.meeting_id}`}
                      className="text-clay hover:text-ink transition-colors"
                    >
                      Open meeting
                    </Link>
                  )}
                  {!isDone && (
                    <button
                      type="button"
                      onClick={() => updateStatus(a.id, "done")}
                      className="text-ink-light hover:text-moss transition-colors"
                    >
                      Mark done
                    </button>
                  )}
                  {isDone && (
                    <button
                      type="button"
                      onClick={() => updateStatus(a.id, "open")}
                      className="text-ink-light hover:text-ink transition-colors"
                    >
                      Reopen
                    </button>
                  )}
                  {!isDismissed && (
                    <button
                      type="button"
                      onClick={() => updateStatus(a.id, "dismissed")}
                      className="text-ink-light hover:text-terracotta transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </div>
  );
}
