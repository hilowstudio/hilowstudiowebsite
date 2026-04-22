"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Lead = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  linkedin_url: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  last_touch_at: string | null;
  next_follow_up_at: string | null;
  converted_client_id: string | null;
  converted_at: string | null;
};

const STATUS_OPTIONS = [
  "prospect",
  "courting",
  "meeting_scheduled",
  "paused",
  "lost",
];

const STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect",
  courting: "Courting",
  meeting_scheduled: "Meeting scheduled",
  paused: "Paused",
  converted: "Converted",
  lost: "Lost",
};

export function LeadHeader({
  lead,
  workspaceSlug,
  convertedClientSlug,
}: {
  lead: Lead;
  workspaceSlug: string;
  convertedClientSlug: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function patch(updates: Record<string, unknown>) {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/ops/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Save failed");
    } else {
      router.refresh();
    }
    setSaving(false);
  }

  async function convert() {
    if (!confirm(`Convert ${lead.name} into a client? Creates a new client workspace.`)) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/ops/leads/${lead.id}/convert`, {
      method: "POST",
    });
    if (res.ok) {
      const data = (await res.json()) as { client_slug: string };
      router.push(`/w/${workspaceSlug}/c/${data.client_slug}`);
    } else {
      const data = await res.json();
      setError(data.error || "Could not convert");
    }
    setSaving(false);
  }

  async function deleteLead() {
    if (!confirm("Delete this lead and its outreach history?")) return;
    setSaving(true);
    const res = await fetch(`/api/ops/leads/${lead.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push(`/w/${workspaceSlug}/pipeline`);
    } else {
      const data = await res.json();
      setError(data.error || "Delete failed");
      setSaving(false);
    }
  }

  return (
    <header className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-ink">{lead.name}</h1>
          <p className="text-sm text-ink-light">
            {lead.company && <span>{lead.company}</span>}
            {lead.company && (lead.email || lead.linkedin_url) && (
              <span className="mx-2">&middot;</span>
            )}
            {lead.email && <span>{lead.email}</span>}
            {lead.linkedin_url && (
              <>
                {(lead.email || lead.company) && <span className="mx-2">&middot;</span>}
                <a
                  href={lead.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-clay hover:text-ink transition-colors"
                >
                  LinkedIn
                </a>
              </>
            )}
          </p>
          {lead.source && (
            <p className="text-xs text-ink-light">
              Source: {lead.source.replace("_", " ")}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {lead.converted_client_id && convertedClientSlug ? (
            <Link
              href={`/w/${workspaceSlug}/c/${convertedClientSlug}`}
              className="text-sm text-moss hover:text-ink transition-colors"
            >
              Converted \u2192 open client
            </Link>
          ) : (
            <button
              type="button"
              onClick={convert}
              disabled={saving}
              className="px-3 py-1.5 rounded-md bg-moss text-paper text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Convert to client
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 text-xs">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              patch({ status: s });
            }}
            disabled={saving || status === "converted"}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              status === s
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            } disabled:opacity-60`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        {status === "converted" && (
          <span className="px-2.5 py-1 rounded-md bg-moss text-paper">
            Converted
          </span>
        )}
      </div>

      <div>
        <label className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== (lead.notes ?? "")) {
              patch({ notes: notes || null });
            }
          }}
          rows={3}
          placeholder="What's the story here? Why are you courting them?"
          className="w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y measure"
        />
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={deleteLead}
          className="text-xs text-ink-light hover:text-terracotta transition-colors"
        >
          Delete lead
        </button>
      </div>
    </header>
  );
}
