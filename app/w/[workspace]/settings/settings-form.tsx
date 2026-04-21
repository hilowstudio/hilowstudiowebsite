"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Workspace = {
  id: string;
  slug: string;
  name: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  billing_email: string | null;
  plan: string;
};

export function SettingsForm({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: workspace.name,
    brand_name: workspace.brand_name ?? "",
    logo_url: workspace.logo_url ?? "",
    primary_color: workspace.primary_color ?? "",
    billing_email: workspace.billing_email ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch(`/api/ops/workspaces/${workspace.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        brand_name: form.brand_name || null,
        logo_url: form.logo_url || null,
        primary_color: form.primary_color || null,
        billing_email: form.billing_email || null,
      }),
    });
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not save");
    }
    setSaving(false);
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";
  const labelClass = "text-xs text-ink-muted uppercase tracking-wide block mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className={labelClass}>Name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Brand name (shown to clients)</label>
        <input
          type="text"
          value={form.brand_name}
          onChange={(e) => setForm((p) => ({ ...p, brand_name: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Logo URL</label>
        <input
          type="url"
          value={form.logo_url}
          onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Primary color</label>
        <input
          type="text"
          value={form.primary_color}
          onChange={(e) =>
            setForm((p) => ({ ...p, primary_color: e.target.value }))
          }
          placeholder="#a07a55"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Billing email</label>
        <input
          type="email"
          value={form.billing_email}
          onChange={(e) =>
            setForm((p) => ({ ...p, billing_email: e.target.value }))
          }
          className={inputClass}
        />
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}
      {saved && <p className="text-moss text-sm">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
