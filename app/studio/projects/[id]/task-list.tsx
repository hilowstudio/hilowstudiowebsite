"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Task, Phase } from "@/lib/studio/queries";

export function TaskList({
  projectId,
  tasks,
  phases,
}: {
  projectId: string;
  tasks: Task[];
  phases: Phase[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [phaseId, setPhaseId] = useState<string>("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    setError("");
    const res = await fetch("/api/studio/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        title: title.trim(),
        phase_id: phaseId || null,
      }),
    });
    if (res.ok) {
      setTitle("");
      refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add task");
    }
    setAdding(false);
  }

  async function patch(id: string, payload: Record<string, unknown>) {
    const res = await fetch(`/api/studio/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update task");
      return;
    }
    refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/studio/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete");
      return;
    }
    refresh();
  }

  const nextUp = tasks.filter((t) => !t.done && t.next_up);
  const open = tasks.filter((t) => !t.done && !t.next_up);
  const done = tasks.filter((t) => t.done);

  const inputClass =
    "flex-1 px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-lg text-ink">Tasks</h2>

      <form onSubmit={addTask} className="flex gap-2 flex-wrap">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          className={inputClass}
        />
        {phases.length > 0 && (
          <select
            value={phaseId}
            onChange={(e) => setPhaseId(e.target.value)}
            className="px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay"
          >
            <option value="">Any phase</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
        <button
          type="submit"
          disabled={adding || !title.trim()}
          className="px-3 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {nextUp.length > 0 && (
        <TaskGroup
          label="Pinned to Today"
          tasks={nextUp}
          phases={phases}
          onToggleDone={(t) => patch(t.id, { done: !t.done })}
          onToggleNextUp={(t) => patch(t.id, { next_up: !t.next_up })}
          onDelete={remove}
        />
      )}

      {open.length > 0 && (
        <TaskGroup
          label="Open"
          tasks={open}
          phases={phases}
          onToggleDone={(t) => patch(t.id, { done: !t.done })}
          onToggleNextUp={(t) => patch(t.id, { next_up: !t.next_up })}
          onDelete={remove}
        />
      )}

      {done.length > 0 && (
        <TaskGroup
          label="Done"
          tasks={done}
          phases={phases}
          onToggleDone={(t) => patch(t.id, { done: !t.done })}
          onToggleNextUp={(t) => patch(t.id, { next_up: !t.next_up })}
          onDelete={remove}
          muted
        />
      )}

      {tasks.length === 0 && (
        <p className="text-sm text-ink-light">No tasks yet.</p>
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </section>
  );
}

function TaskGroup({
  label,
  tasks,
  phases,
  onToggleDone,
  onToggleNextUp,
  onDelete,
  muted = false,
}: {
  label: string;
  tasks: Task[];
  phases: Phase[];
  onToggleDone: (task: Task) => void;
  onToggleNextUp: (task: Task) => void;
  onDelete: (id: string) => void;
  muted?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-ink-muted uppercase tracking-wide">{label}</p>
      <ul className="space-y-1">
        {tasks.map((task) => {
          const phaseName = phases.find((p) => p.id === task.phase_id)?.name;
          return (
            <li
              key={task.id}
              className={`group flex items-center gap-2 py-1.5 text-sm ${
                muted ? "opacity-60" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleDone(task)}
                className="flex items-center gap-2 flex-1 text-left"
                aria-label={task.done ? "Reopen task" : "Complete task"}
              >
                <span
                  className={`inline-block w-4 h-4 rounded border transition-colors ${
                    task.done
                      ? "bg-moss border-moss"
                      : "border-ink-light group-hover:border-ink"
                  }`}
                  aria-hidden
                />
                <span
                  className={
                    task.done ? "line-through text-ink-light" : "text-ink"
                  }
                >
                  {task.title}
                </span>
                {phaseName && !task.done && (
                  <span className="text-xs text-ink-light">· {phaseName}</span>
                )}
              </button>
              {!task.done && (
                <button
                  type="button"
                  onClick={() => onToggleNextUp(task)}
                  className={`text-xs transition-colors ${
                    task.next_up
                      ? "text-clay"
                      : "text-ink-light opacity-0 group-hover:opacity-100 hover:text-clay"
                  }`}
                  aria-label={task.next_up ? "Unpin from Today" : "Pin to Today"}
                >
                  {task.next_up ? "★ pinned" : "☆ pin"}
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 text-xs text-ink-light hover:text-terracotta transition-opacity"
                aria-label="Delete task"
              >
                &times;
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
