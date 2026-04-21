"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewClientForm({
  workspaceId,
  workspaceSlug,
}: {
  workspaceId: string;
  workspaceSlug: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", company: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/ops/workspaces/${workspaceId}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        company: form.company || null,
      }),
    });
    if (res.ok) {
      const client = (await res.json()) as { slug: string };
      router.push(`/w/${workspaceSlug}/c/${client.slug}`);
    } else {
      const data = await res.json();
      setError(data.error || "Could not create client");
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
          placeholder="e.g. Antonym"
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

      {error && <p className="text-terracotta text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving || !form.name.trim()}
        className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
      >
        {saving ? "Creating..." : "Create client"}
      </button>
    </form>
  );
}
