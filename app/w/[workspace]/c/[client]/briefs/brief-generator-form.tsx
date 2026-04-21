"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BriefGeneratorForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/ops/clients/${clientId}/briefs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meeting_title: title.trim(),
        meeting_context: context.trim() || null,
        scheduled_for: scheduledFor
          ? new Date(scheduledFor).toISOString()
          : null,
      }),
    });
    if (res.ok) {
      setTitle("");
      setContext("");
      setScheduledFor("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Brief failed");
    }
    setBusy(false);
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";
  const labelClass = "text-xs text-ink-muted uppercase tracking-wide block mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-xl">
      <h2 className="font-serif text-lg text-ink">Generate a pre-meeting brief</h2>

      <div>
        <label className={labelClass}>Meeting title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. Weekly check-in with Antonym"
        />
      </div>

      <div>
        <label className={labelClass}>Scheduled for</label>
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Context (optional)</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={3}
          placeholder="Agenda, attendees, specific thing on your mind..."
          className={`${inputClass} resize-y`}
        />
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}

      <button
        type="submit"
        disabled={busy || !title.trim()}
        className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
      >
        {busy ? "Generating..." : "Generate brief"}
      </button>
    </form>
  );
}
