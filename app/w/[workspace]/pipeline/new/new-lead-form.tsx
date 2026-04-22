"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Prefill = {
  name: string;
  company: string;
  linkedin_url: string;
  network_contact_id: string;
} | null;

export function NewLeadForm({
  workspaceId,
  workspaceSlug,
  prefill,
}: {
  workspaceId: string;
  workspaceSlug: string;
  prefill: Prefill;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: prefill?.name ?? "",
    company: prefill?.company ?? "",
    email: "",
    linkedin_url: prefill?.linkedin_url ?? "",
    source: prefill ? "warm_prospect" : "manual",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/ops/workspaces/${workspaceId}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        company: form.company || null,
        email: form.email || null,
        linkedin_url: form.linkedin_url || null,
        source: form.source,
        notes: form.notes || null,
        network_contact_id: prefill?.network_contact_id ?? null,
      }),
    });
    if (res.ok) {
      const lead = (await res.json()) as { id: string };
      router.push(`/w/${workspaceSlug}/pipeline/${lead.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Could not create lead");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";
  const labelClass = "text-xs text-ink-muted uppercase tracking-wide block mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Name *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Company</label>
        <input
          type="text"
          value={form.company}
          onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>LinkedIn URL</label>
        <input
          type="url"
          value={form.linkedin_url}
          onChange={(e) => setForm((p) => ({ ...p, linkedin_url: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Source</label>
        <select
          value={form.source}
          onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
          className={inputClass}
        >
          <option value="manual">Manual</option>
          <option value="warm_prospect">Warm prospect</option>
          <option value="inbound">Inbound</option>
          <option value="referral">Referral</option>
          <option value="event">Event</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          rows={3}
          className={`${inputClass} resize-y`}
        />
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving || !form.name.trim()}
        className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
      >
        {saving ? "Creating..." : "Create lead"}
      </button>
    </form>
  );
}
