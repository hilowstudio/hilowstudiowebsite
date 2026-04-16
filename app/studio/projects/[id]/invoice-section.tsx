"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Invoice } from "@/lib/studio/queries";

const STATES: Invoice["state"][] = ["draft", "sent", "paid", "overdue"];
const STATE_LABELS: Record<Invoice["state"], string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
};
const STATE_CLASSES: Record<Invoice["state"], string> = {
  draft: "bg-paper-muted text-ink-muted",
  sent: "bg-clay/20 text-clay",
  paid: "bg-moss/30 text-moss",
  overdue: "bg-terracotta/20 text-terracotta",
};

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InvoiceSection({
  projectId,
  invoices,
}: {
  projectId: string;
  invoices: Invoice[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const cents = Math.round(Number(amount) * 100);
    if (!amount.trim() || Number.isNaN(cents) || cents <= 0) {
      setError("Amount required");
      setSaving(false);
      return;
    }
    const res = await fetch("/api/studio/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        number: number.trim() || null,
        amount_cents: cents,
        due_at: dueAt || null,
        notes: notes.trim() || null,
      }),
    });
    if (res.ok) {
      setNumber("");
      setAmount("");
      setDueAt("");
      setNotes("");
      setShowForm(false);
      refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create invoice");
    }
    setSaving(false);
  }

  async function patchInvoice(id: string, updates: Record<string, unknown>) {
    setError("");
    const res = await fetch(`/api/studio/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update");
      return;
    }
    refresh();
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this invoice?")) return;
    const res = await fetch(`/api/studio/invoices/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete");
      return;
    }
    refresh();
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";

  const outstandingCents = invoices
    .filter((i) => i.state === "sent" || i.state === "overdue")
    .reduce((sum, i) => sum + i.amount_cents, 0);

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-lg text-ink">Invoices</h2>
        {outstandingCents > 0 && (
          <span className="text-xs text-ink-light">
            {formatCurrency(outstandingCents)} outstanding
          </span>
        )}
      </div>

      {invoices.length === 0 ? (
        <p className="text-sm text-ink-light">No invoices tracked yet.</p>
      ) : (
        <ul className="space-y-2">
          {invoices.map((invoice) => (
            <li
              key={invoice.id}
              className="group rounded-md border border-paper-muted bg-paper-warm/60 p-3 space-y-2"
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-ink">
                    {invoice.number || "—"}
                  </span>
                  <span className="text-ink-muted">
                    {formatCurrency(invoice.amount_cents)}
                  </span>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs ${STATE_CLASSES[invoice.state]}`}
                >
                  {STATE_LABELS[invoice.state]}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs flex-wrap">
                {STATES.map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => patchInvoice(invoice.id, { state })}
                    disabled={invoice.state === state}
                    className={`px-2 py-1 rounded transition-colors ${
                      invoice.state === state
                        ? "bg-ink text-paper"
                        : "text-ink-muted hover:text-ink hover:bg-paper-warm"
                    } disabled:cursor-default`}
                  >
                    {STATE_LABELS[state]}
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => deleteInvoice(invoice.id)}
                  className="opacity-0 group-hover:opacity-100 text-ink-light hover:text-terracotta transition-opacity px-2 py-1"
                >
                  Delete
                </button>
              </div>

              <div className="text-xs text-ink-light flex flex-wrap gap-x-4 gap-y-1">
                {invoice.sent_at && (
                  <span>Sent {formatDate(invoice.sent_at)}</span>
                )}
                {invoice.due_at && <span>Due {formatDate(invoice.due_at)}</span>}
                {invoice.paid_at && (
                  <span>Paid {formatDate(invoice.paid_at)}</span>
                )}
              </div>

              {invoice.notes && (
                <p className="text-xs text-ink-muted measure whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form
          onSubmit={createInvoice}
          className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 space-y-2"
        >
          <div className="flex gap-2 flex-wrap">
            <label className="flex-1 min-w-[120px]">
              <span className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
                Number
              </span>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 2026-014"
                className={inputClass}
              />
            </label>
            <label className="flex-1 min-w-[120px]">
              <span className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
                Amount (USD) *
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className={inputClass}
              />
            </label>
            <label className="flex-1 min-w-[120px]">
              <span className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
                Due
              </span>
              <input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes"
            rows={2}
            className={`${inputClass} resize-y`}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-md text-ink-muted hover:text-ink text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save invoice"}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-sm text-clay hover:text-ink transition-colors"
        >
          + Track an invoice
        </button>
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </section>
  );
}
