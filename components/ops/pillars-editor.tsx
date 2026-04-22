"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PillarRow = {
  id: string;
  slug: string;
  label: string;
  short_label: string;
  description: string;
  funnel_role: string;
  sort_order: number;
};

export function PillarsEditor({
  addUrl,
  initial,
}: {
  addUrl: string;
  initial: PillarRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState({
    label: "",
    description: "",
    funnel_role: "TOFU",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function addPillar() {
    if (!form.label.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch(addUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: form.label.trim(),
        short_label: form.label.trim().slice(0, 24),
        description: form.description.trim(),
        funnel_role: form.funnel_role,
        sort_order: rows.length,
      }),
    });
    if (res.ok) {
      const row = (await res.json()) as PillarRow;
      setRows((prev) => [...prev, row]);
      setForm({ label: "", description: "", funnel_role: "TOFU" });
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not add pillar");
    }
    setBusy(false);
  }

  async function patchPillar(id: string, updates: Record<string, unknown>) {
    const prev = rows;
    setRows((list) =>
      list.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
    const res = await fetch(`/api/ops/pillars/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      setRows(prev);
      const data = await res.json();
      setError(data.error || "Could not update");
    } else {
      router.refresh();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this pillar?")) return;
    const res = await fetch(`/api/ops/pillars/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Could not delete");
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";
  const labelClass = "text-xs text-ink-muted uppercase tracking-wide block mb-1";

  return (
    <div className="space-y-6">
      {rows.length === 0 && (
        <p className="text-sm text-ink-light">
          No pillars yet. Add 3-5 strategic themes below.
        </p>
      )}

      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-md border border-paper-muted bg-paper-warm/60 p-4 space-y-2"
          >
            <input
              type="text"
              value={row.label}
              onChange={(e) =>
                setRows((list) =>
                  list.map((r) =>
                    r.id === row.id ? { ...r, label: e.target.value } : r,
                  ),
                )
              }
              onBlur={(e) => patchPillar(row.id, { label: e.target.value })}
              className={`${inputClass} font-serif text-base`}
            />
            <textarea
              value={row.description}
              onChange={(e) =>
                setRows((list) =>
                  list.map((r) =>
                    r.id === row.id
                      ? { ...r, description: e.target.value }
                      : r,
                  ),
                )
              }
              onBlur={(e) => patchPillar(row.id, { description: e.target.value })}
              rows={2}
              className={`${inputClass} resize-y`}
            />
            <div className="flex items-center gap-3">
              <select
                value={row.funnel_role}
                onChange={(e) =>
                  patchPillar(row.id, { funnel_role: e.target.value })
                }
                className="px-2 py-1 rounded border border-paper-muted bg-paper text-ink text-xs"
              >
                <option>TOFU</option>
                <option>MOFU</option>
                <option>BOFU</option>
                <option>TOFU + MOFU</option>
                <option>MOFU + BOFU</option>
              </select>
              <span className="text-xs text-ink-light">{row.slug}</span>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => remove(row.id)}
                className="text-xs text-ink-light hover:text-terracotta transition-colors"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-md border border-paper-muted bg-paper-warm/30 p-4 space-y-3">
        <div>
          <label className={labelClass}>Add pillar</label>
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            placeholder="Label (e.g. 'Workflow automation for teams')"
            className={inputClass}
          />
        </div>
        <div>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={2}
            placeholder="Description"
            className={`${inputClass} resize-y`}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={form.funnel_role}
            onChange={(e) =>
              setForm((p) => ({ ...p, funnel_role: e.target.value }))
            }
            className="px-2 py-1 rounded border border-paper-muted bg-paper text-ink text-sm"
          >
            <option>TOFU</option>
            <option>MOFU</option>
            <option>BOFU</option>
            <option>TOFU + MOFU</option>
            <option>MOFU + BOFU</option>
          </select>
          <div className="flex-1" />
          <button
            type="button"
            onClick={addPillar}
            disabled={busy || !form.label.trim()}
            className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </div>
  );
}
