"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Contact = {
  id: string;
  name: string | null;
  company: string | null;
  headline: string | null;
  linkedin_url: string | null;
  imported_via: string;
};

type Competitor = {
  id: string;
  name: string;
  linkedin_url: string | null;
  client_id: string | null;
};

type Prospect = {
  id: string;
  score: number;
  reasons: string[];
  surfaced_at: string;
  network_contact_id: string;
  ops_network_contacts: {
    name: string | null;
    company: string | null;
    linkedin_url: string | null;
  } | null;
};

type EngagementEvent = {
  id: string;
  kind: string;
  observed_at: string;
  post_id: string | null;
  raw: Record<string, unknown> | null;
  client_id: string | null;
  ops_network_contacts: {
    name: string | null;
    linkedin_url: string | null;
  } | null;
};

export function WorkspaceNetworkPanels({
  workspaceId,
  totalContacts,
  contacts,
  competitors,
  prospects,
  events,
}: {
  workspaceId: string;
  totalContacts: number;
  contacts: Contact[];
  competitors: Competitor[];
  prospects: Prospect[];
  events: EngagementEvent[];
}) {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [competitorName, setCompetitorName] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [competitorError, setCompetitorError] = useState("");
  const [rescoring, setRescoring] = useState(false);
  const [rescoreMessage, setRescoreMessage] = useState("");

  async function handleCsvImport(e: React.FormEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMessage("");
    setImportError("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/network/import`,
      { method: "POST", body: form },
    );
    if (res.ok) {
      const data = (await res.json()) as {
        parsed: number;
        inserted: number;
        skipped_duplicate: number;
      };
      setImportMessage(
        `Parsed ${data.parsed}, inserted ${data.inserted}, skipped ${data.skipped_duplicate} duplicates.`,
      );
      router.refresh();
    } else {
      const data = await res.json();
      setImportError(data.error || "Import failed");
    }
    setImporting(false);
    e.currentTarget.value = "";
  }

  async function addCompetitor(e: React.FormEvent) {
    e.preventDefault();
    if (!competitorName.trim()) return;
    setCompetitorError("");
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/competitors`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: competitorName.trim(),
          linkedin_url: competitorUrl.trim() || null,
        }),
      },
    );
    if (res.ok) {
      setCompetitorName("");
      setCompetitorUrl("");
      router.refresh();
    } else {
      const data = await res.json();
      setCompetitorError(data.error || "Could not add");
    }
  }

  async function deleteCompetitor(id: string) {
    if (!confirm("Delete competitor?")) return;
    const res = await fetch(`/api/ops/competitors/${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  async function rescore() {
    setRescoring(true);
    setRescoreMessage("");
    const res = await fetch(
      `/api/ops/workspaces/${workspaceId}/network/rescore`,
      { method: "POST" },
    );
    if (res.ok) {
      const data = (await res.json()) as { top: number };
      setRescoreMessage(`Rebuilt: ${data.top} warm prospects surfaced.`);
      router.refresh();
    } else {
      const data = await res.json();
      setRescoreMessage(`Error: ${data.error || "rescore failed"}`);
    }
    setRescoring(false);
  }

  const inputClass =
    "px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="font-serif text-2xl text-ink">Network</h1>
        <p className="text-sm text-ink-light measure">
          The agency&apos;s full contact graph. Warm prospects score against
          every engagement event, not just one client&apos;s posts.
        </p>
      </header>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-ink">Connections</h2>
          <span className="text-xs text-ink-light">
            {totalContacts.toLocaleString()} in the graph
          </span>
        </div>
        <p className="text-sm text-ink-muted measure">
          Import a LinkedIn connections CSV export. Engagers on your clients&apos;
          published posts auto-append.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvImport}
            disabled={importing}
            className="text-sm"
          />
          {importing && (
            <span className="text-xs text-ink-light">Parsing...</span>
          )}
          {importMessage && (
            <span className="text-xs text-moss">{importMessage}</span>
          )}
          {importError && (
            <span className="text-xs text-terracotta">{importError}</span>
          )}
        </div>

        {contacts.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm max-h-96 overflow-auto rounded-md border border-paper-muted bg-paper-warm/30">
            {contacts.map((c) => (
              <li
                key={c.id}
                className="flex items-baseline justify-between px-3 py-2 border-b border-paper-muted/40 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  {c.linkedin_url ? (
                    <a
                      href={c.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink hover:text-clay transition-colors"
                    >
                      {c.name || "Unknown"}
                    </a>
                  ) : (
                    <span className="text-ink">{c.name || "Unknown"}</span>
                  )}
                  {c.company && (
                    <span className="text-xs text-ink-light ml-2">
                      {c.company}
                    </span>
                  )}
                </div>
                <span className="text-xs text-ink-light capitalize">
                  {c.imported_via.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-ink">Warm prospects</h2>
          <div className="flex items-baseline gap-3">
            {rescoreMessage && (
              <span className="text-xs text-ink-light">{rescoreMessage}</span>
            )}
            <button
              type="button"
              onClick={rescore}
              disabled={rescoring}
              className="px-3 py-1 rounded-md text-xs text-ink-muted hover:text-ink hover:bg-paper-warm transition-colors disabled:opacity-50"
            >
              {rescoring ? "Rebuilding..." : "Rebuild"}
            </button>
          </div>
        </div>
        {prospects.length === 0 ? (
          <p className="text-sm text-ink-light">
            No warm prospects surfaced yet. Engagement on client posts and
            manually-logged competitor engagement feed the scorer.
          </p>
        ) : (
          <ul className="space-y-2">
            {prospects.map((p) => (
              <li
                key={p.id}
                className="rounded-md border border-paper-muted bg-paper-warm/60 p-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-ink font-serif">
                    {p.ops_network_contacts?.linkedin_url ? (
                      <a
                        href={p.ops_network_contacts.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-clay transition-colors"
                      >
                        {p.ops_network_contacts.name || "Unknown"}
                      </a>
                    ) : (
                      (p.ops_network_contacts?.name || "Unknown")
                    )}
                    {p.ops_network_contacts?.company && (
                      <span className="text-xs text-ink-light ml-2">
                        {p.ops_network_contacts.company}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-clay">Score {p.score}</span>
                </div>
                <p className="text-xs text-ink-light mt-1">
                  {p.reasons.slice(0, 4).join(" \u00b7 ")}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/w/${workspaceId}/pipeline/new?contact=${p.network_contact_id}`}
                    className="text-xs text-clay hover:text-ink transition-colors"
                  >
                    Promote to lead →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Competitors</h2>
        <p className="text-sm text-ink-muted measure">
          Define who you&apos;re watching. Log competitor engagement against
          any contact (Pipeline tab) to weight the warm-prospect scorer.
        </p>
        <form onSubmit={addCompetitor} className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={competitorName}
            onChange={(e) => setCompetitorName(e.target.value)}
            placeholder="Competitor name"
            className={`${inputClass} flex-1 min-w-[160px]`}
          />
          <input
            type="url"
            value={competitorUrl}
            onChange={(e) => setCompetitorUrl(e.target.value)}
            placeholder="LinkedIn URL (optional)"
            className={`${inputClass} flex-1 min-w-[200px]`}
          />
          <button
            type="submit"
            disabled={!competitorName.trim()}
            className="px-3 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {competitorError && (
          <p className="text-terracotta text-sm">{competitorError}</p>
        )}
        {competitors.length > 0 && (
          <ul className="space-y-1 text-sm">
            {competitors.map((c) => (
              <li
                key={c.id}
                className="flex items-baseline justify-between py-2 border-b border-paper-muted/40"
              >
                <span>
                  {c.linkedin_url ? (
                    <a
                      href={c.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink hover:text-clay transition-colors"
                    >
                      {c.name}
                    </a>
                  ) : (
                    <span className="text-ink">{c.name}</span>
                  )}
                  {c.client_id && (
                    <span className="text-xs text-ink-light ml-2">
                      client-specific
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => deleteCompetitor(c.id)}
                  className="text-xs text-ink-light hover:text-terracotta transition-colors"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Recent engagement events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-ink-light">No events yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {events.map((e) => {
              const rawMeta = (e.raw ?? {}) as {
                source?: string;
                note?: string;
              };
              return (
                <li
                  key={e.id}
                  className="flex items-baseline justify-between gap-3 py-2 border-b border-paper-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-ink">
                      {e.ops_network_contacts?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-ink-light ml-2 capitalize">
                      {e.kind}
                      {rawMeta.source === "manual" && " (manual)"}
                      {e.client_id && " \u00b7 on a client post"}
                    </span>
                    {rawMeta.note && (
                      <p className="text-xs text-ink-light truncate mt-0.5">
                        {rawMeta.note}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-ink-light whitespace-nowrap">
                    {new Date(e.observed_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
