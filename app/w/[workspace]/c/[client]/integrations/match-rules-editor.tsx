"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Rules = {
  title_keywords: string[];
  participant_emails: string[];
  participant_domains: string[];
};

export function MatchRulesEditor({
  clientId,
  initial,
}: {
  clientId: string;
  initial: Rules;
}) {
  const router = useRouter();
  const [rules, setRules] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState("");

  function updateField(field: keyof Rules, raw: string) {
    const list = raw
      .split(/[\n,]/g)
      .map((s) => s.trim())
      .filter(Boolean);
    setRules((prev) => ({ ...prev, [field]: list }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch(`/api/ops/clients/${clientId}/match-rules`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rules),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Save failed");
    }
    setSaving(false);
  }

  async function clearMeetings() {
    if (
      !confirm(
        "Delete every meeting + its insights + its post drafts for this client? Can't be undone.",
      )
    )
      return;
    setClearing(true);
    setClearMessage("");
    const res = await fetch(`/api/ops/clients/${clientId}/meetings`, {
      method: "DELETE",
    });
    if (res.ok) {
      setClearMessage("All meetings cleared.");
      router.refresh();
    } else {
      const data = await res.json();
      setClearMessage(`Error: ${data.error || "Delete failed"}`);
    }
    setClearing(false);
  }

  const labelClass = "text-xs text-ink-muted uppercase tracking-wide block mb-1";
  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay resize-y";

  const hasAny =
    rules.title_keywords.length +
      rules.participant_emails.length +
      rules.participant_domains.length >
    0;

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-ink-muted measure">
        A shared Fireflies/Fathom account captures every meeting the agency
        records. Tell us how to route meetings to this client. A meeting is
        routed if its title contains a keyword, OR a participant email matches,
        OR a participant domain matches. Add at least one.
      </p>

      <div>
        <label className={labelClass}>Title keywords</label>
        <textarea
          value={rules.title_keywords.join("\n")}
          onChange={(e) => updateField("title_keywords", e.target.value)}
          rows={3}
          placeholder={`Antonym\nMT x Antonym\nweekly sync`}
          className={inputClass}
        />
        <p className="text-xs text-ink-light mt-1">
          Case-insensitive substring match. One per line or comma-separated.
        </p>
      </div>

      <div>
        <label className={labelClass}>Participant emails</label>
        <textarea
          value={rules.participant_emails.join("\n")}
          onChange={(e) => updateField("participant_emails", e.target.value)}
          rows={3}
          placeholder={`founder@antonym.com\nchief@antonym.com`}
          className={inputClass}
        />
        <p className="text-xs text-ink-light mt-1">
          Exact email match against the meeting&apos;s participant list.
        </p>
      </div>

      <div>
        <label className={labelClass}>Participant domains</label>
        <textarea
          value={rules.participant_domains.join("\n")}
          onChange={(e) => updateField("participant_domains", e.target.value)}
          rows={2}
          placeholder={`antonym.com`}
          className={inputClass}
        />
        <p className="text-xs text-ink-light mt-1">
          Catches everyone on the client&apos;s side. Usually the easiest single
          rule. Leave off the @.
        </p>
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}
      {saved && <p className="text-moss text-sm">Saved.</p>}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save rules"}
        </button>
        <span className="text-xs text-ink-light">
          {hasAny
            ? "Syncs will only pull meetings that match."
            : "No rules: syncs are blocked until you add at least one."}
        </span>
      </div>

      <div className="pt-4 border-t border-paper-muted">
        <p className="text-xs text-ink-muted mb-2">
          Imported the wrong meetings before match rules? Clear them all and
          re-sync with your rules in place.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearMeetings}
            disabled={clearing}
            className="text-sm text-ink-light hover:text-terracotta transition-colors disabled:opacity-50"
          >
            {clearing ? "Clearing..." : "Delete all meetings for this client"}
          </button>
          {clearMessage && (
            <span className="text-xs text-moss">{clearMessage}</span>
          )}
        </div>
      </div>
    </div>
  );
}
