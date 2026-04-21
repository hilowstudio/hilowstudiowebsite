"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewWorkspaceForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    brand_name: "",
    billing_email: "",
    primary_color: "",
    logo_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/ops/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        brand_name: form.brand_name || null,
        billing_email: form.billing_email || null,
        primary_color: form.primary_color || null,
        logo_url: form.logo_url || null,
      }),
    });
    if (res.ok) {
      const ws = (await res.json()) as { slug: string };
      router.push(`/w/${ws.slug}`);
    } else {
      const data = await res.json();
      setError(data.error || "Could not create workspace");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";
  const labelClass = "text-xs text-ink-muted uppercase tracking-wide block mb-1";

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ink">New workspace</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Magical Teams"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Brand name (shown to their clients)</label>
          <input
            type="text"
            value={form.brand_name}
            onChange={(e) => update("brand_name", e.target.value)}
            placeholder="e.g. Magical Teams Ops"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Billing email</label>
          <input
            type="email"
            value={form.billing_email}
            onChange={(e) => update("billing_email", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Primary color</label>
            <input
              type="text"
              value={form.primary_color}
              onChange={(e) => update("primary_color", e.target.value)}
              placeholder="#a07a55"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Logo URL</label>
            <input
              type="url"
              value={form.logo_url}
              onChange={(e) => update("logo_url", e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="text-terracotta text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving || !form.name.trim()}
          className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create workspace"}
        </button>
      </form>
    </div>
  );
}
