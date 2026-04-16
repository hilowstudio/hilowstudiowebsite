"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    billing_address: "",
    default_rate: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const rate = form.default_rate.trim();
    const rateCents = rate ? Math.round(Number(rate) * 100) : null;
    if (rate && (rateCents === null || Number.isNaN(rateCents))) {
      setError("Default rate must be a number");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/studio/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        company: form.company || null,
        email: form.email || null,
        billing_address: form.billing_address || null,
        default_rate_cents: rateCents,
        notes: form.notes || null,
      }),
    });

    if (res.ok) {
      const client = await res.json();
      router.push(`/studio/clients/${client.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create client");
      setSaving(false);
    }
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";
  const labelClass = "text-xs text-ink-muted uppercase tracking-wide block mb-1";

  return (
    <div className="max-w-lg space-y-6">
      <button
        onClick={() => router.push("/studio/clients")}
        className="text-sm text-ink-light hover:text-ink transition-colors"
      >
        &larr; Clients
      </button>

      <h1 className="font-serif text-2xl text-ink">Add client</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Billing address</label>
          <textarea
            value={form.billing_address}
            onChange={(e) => update("billing_address", e.target.value)}
            rows={3}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div>
          <label className={labelClass}>Default hourly rate (USD)</label>
          <input
            type="number"
            step="1"
            min="0"
            value={form.default_rate}
            onChange={(e) => update("default_rate", e.target.value)}
            className={inputClass}
            placeholder="e.g. 175"
          />
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            className={`${inputClass} resize-y`}
          />
        </div>

        {error && <p className="text-terracotta text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create client"}
        </button>
      </form>
    </div>
  );
}
