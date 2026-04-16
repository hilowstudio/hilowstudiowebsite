"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client } from "@/lib/studio/queries";

const DEFAULT_PHASES = ["Discovery", "Design", "Build", "Handoff"];

export function NewProjectForm({
  clients,
  preselectedClientId,
}: {
  clients: Client[];
  preselectedClientId: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState<string>(preselectedClientId ?? "");
  const [rate, setRate] = useState("");
  const [phases, setPhases] = useState<string[]>(DEFAULT_PHASES);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const rateCents = rate.trim() ? Math.round(Number(rate) * 100) : null;
    if (rate.trim() && (rateCents === null || Number.isNaN(rateCents))) {
      setError("Rate must be a number");
      setSaving(false);
      return;
    }

    const cleanPhases = phases
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => ({ name: p }));

    const res = await fetch("/api/studio/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        client_id: clientId || null,
        rate_cents: rateCents,
        phases: cleanPhases.length ? cleanPhases : undefined,
      }),
    });

    if (res.ok) {
      const project = await res.json();
      router.push(`/studio/projects/${project.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create project");
      setSaving(false);
    }
  }

  function updatePhase(index: number, value: string) {
    setPhases((prev) => prev.map((p, i) => (i === index ? value : p)));
  }

  function addPhase() {
    setPhases((prev) => [...prev, ""]);
  }

  function removePhase(index: number) {
    setPhases((prev) => prev.filter((_, i) => i !== index));
  }

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";
  const labelClass = "text-xs text-ink-muted uppercase tracking-wide block mb-1";

  return (
    <div className="max-w-lg space-y-6">
      <button
        onClick={() => router.push("/studio/projects")}
        className="text-sm text-ink-light hover:text-ink transition-colors"
      >
        &larr; Projects
      </button>

      <h1 className="font-serif text-2xl text-ink">New project</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="e.g. Magical Teams — AI intake"
          />
        </div>

        <div>
          <label className={labelClass}>Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={inputClass}
          >
            <option value="">No client yet</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Rate (USD/hour)</label>
          <input
            type="number"
            step="1"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className={inputClass}
            placeholder="Overrides client default"
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Phases</label>
          {phases.map((phase, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={phase}
                onChange={(e) => updatePhase(index, e.target.value)}
                className={inputClass}
                placeholder={`Phase ${index + 1}`}
              />
              {phases.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhase(index)}
                  className="text-sm text-ink-light hover:text-terracotta px-2"
                  aria-label="Remove phase"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPhase}
            className="text-sm text-clay hover:text-ink transition-colors"
          >
            + Add phase
          </button>
        </div>

        {error && <p className="text-terracotta text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create project"}
        </button>
      </form>
    </div>
  );
}
