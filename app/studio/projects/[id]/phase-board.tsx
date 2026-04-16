"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Phase, Deliverable } from "@/lib/studio/queries";

type PhaseWithDeliverables = Phase & { deliverables: Deliverable[] };

export function PhaseBoard({
  projectId,
  phases,
}: {
  projectId: string;
  phases: PhaseWithDeliverables[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [newPhaseName, setNewPhaseName] = useState("");
  const [addingPhase, setAddingPhase] = useState(false);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function toggleDeliverable(deliverable: Deliverable) {
    const res = await fetch(
      `/api/studio/deliverables/${deliverable.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !deliverable.done }),
      },
    );
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update");
      return;
    }
    refresh();
  }

  async function addDeliverable(phaseId: string, title: string) {
    if (!title.trim()) return;
    const res = await fetch("/api/studio/deliverables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase_id: phaseId, title: title.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add");
      return;
    }
    refresh();
  }

  async function markPhaseCurrent(phaseId: string) {
    const res = await fetch(`/api/studio/phases/${phaseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_current: true, completed_at: null }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update");
      return;
    }
    refresh();
  }

  async function markPhaseComplete(phase: PhaseWithDeliverables) {
    const res = await fetch(`/api/studio/phases/${phase.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed_at: phase.completed_at ? null : new Date().toISOString(),
        is_current: false,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update");
      return;
    }
    refresh();
  }

  async function deletePhase(phaseId: string) {
    if (!confirm("Delete this phase and its deliverables?")) return;
    const res = await fetch(`/api/studio/phases/${phaseId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete");
      return;
    }
    refresh();
  }

  async function deleteDeliverable(id: string) {
    const res = await fetch(`/api/studio/deliverables/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete");
      return;
    }
    refresh();
  }

  async function addPhase(e: React.FormEvent) {
    e.preventDefault();
    const name = newPhaseName.trim();
    if (!name) return;
    setAddingPhase(true);
    const res = await fetch("/api/studio/phases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, name }),
    });
    if (res.ok) {
      setNewPhaseName("");
      refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add phase");
    }
    setAddingPhase(false);
  }

  return (
    <section className="space-y-6">
      <h2 className="font-serif text-lg text-ink">Phases</h2>

      {phases.map((phase) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          onToggleDeliverable={toggleDeliverable}
          onAddDeliverable={addDeliverable}
          onMarkCurrent={markPhaseCurrent}
          onToggleComplete={markPhaseComplete}
          onDelete={deletePhase}
          onDeleteDeliverable={deleteDeliverable}
        />
      ))}

      <form onSubmit={addPhase} className="flex gap-2 pt-2">
        <input
          type="text"
          value={newPhaseName}
          onChange={(e) => setNewPhaseName(e.target.value)}
          placeholder="Add phase"
          className="flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
        />
        <button
          type="submit"
          disabled={addingPhase || !newPhaseName.trim()}
          className="px-3 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </section>
  );
}

function PhaseCard({
  phase,
  onToggleDeliverable,
  onAddDeliverable,
  onMarkCurrent,
  onToggleComplete,
  onDelete,
  onDeleteDeliverable,
}: {
  phase: PhaseWithDeliverables;
  onToggleDeliverable: (d: Deliverable) => void;
  onAddDeliverable: (phaseId: string, title: string) => void;
  onMarkCurrent: (phaseId: string) => void;
  onToggleComplete: (phase: PhaseWithDeliverables) => void;
  onDelete: (phaseId: string) => void;
  onDeleteDeliverable: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const complete = Boolean(phase.completed_at);

  return (
    <div
      className={`rounded-md border p-4 space-y-3 transition-colors ${
        phase.is_current
          ? "bg-paper-warm border-clay"
          : "bg-paper-warm/60 border-paper-muted"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-base text-ink">
          {phase.name}
          {phase.is_current && (
            <span className="ml-2 text-xs text-clay uppercase tracking-wide">
              current
            </span>
          )}
          {complete && (
            <span className="ml-2 text-xs text-moss uppercase tracking-wide">
              done
            </span>
          )}
        </h3>
        <div className="flex gap-3 text-xs">
          {!phase.is_current && !complete && (
            <button
              onClick={() => onMarkCurrent(phase.id)}
              className="text-ink-light hover:text-clay transition-colors"
            >
              Make current
            </button>
          )}
          <button
            onClick={() => onToggleComplete(phase)}
            className="text-ink-light hover:text-moss transition-colors"
          >
            {complete ? "Reopen" : "Mark done"}
          </button>
          <button
            onClick={() => onDelete(phase.id)}
            className="text-ink-light hover:text-terracotta transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {phase.deliverables.length === 0 ? (
        <p className="text-xs text-ink-light">No deliverables yet.</p>
      ) : (
        <ul className="space-y-1">
          {phase.deliverables.map((d) => (
            <li
              key={d.id}
              className="group flex items-center gap-2 py-1 text-sm"
            >
              <button
                type="button"
                onClick={() => onToggleDeliverable(d)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <span
                  className={`inline-block w-4 h-4 rounded border transition-colors ${
                    d.done
                      ? "bg-moss border-moss"
                      : "border-ink-light group-hover:border-ink"
                  }`}
                  aria-hidden
                />
                <span
                  className={
                    d.done ? "line-through text-ink-light" : "text-ink"
                  }
                >
                  {d.title}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteDeliverable(d.id)}
                className="opacity-0 group-hover:opacity-100 text-xs text-ink-light hover:text-terracotta transition-opacity"
                aria-label="Delete deliverable"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAddDeliverable(phase.id, title);
          setTitle("");
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add deliverable"
          className="flex-1 px-2 py-1.5 rounded border border-paper-muted bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-2 py-1.5 rounded text-xs text-ink-muted hover:text-ink transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}
