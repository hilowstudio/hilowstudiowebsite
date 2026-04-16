"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TimeEntry } from "@/lib/studio/queries";

function formatDuration(startIso: string, endIso: string | null): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const seconds = Math.max(0, Math.floor((end - start) / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toLocalInputValue(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sumBillableMinutes(entries: TimeEntry[]): number {
  let minutes = 0;
  for (const entry of entries) {
    if (!entry.ended_at) continue;
    const s = new Date(entry.started_at).getTime();
    const e = new Date(entry.ended_at).getTime();
    minutes += Math.max(0, Math.floor((e - s) / 60000));
  }
  return minutes;
}

export function TimeSection({
  projectId,
  entries,
}: {
  projectId: string;
  entries: TimeEntry[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manualStart, setManualStart] = useState(toLocalInputValue());
  const [manualEnd, setManualEnd] = useState(toLocalInputValue());
  const [manualDesc, setManualDesc] = useState("");
  const [, setTick] = useState(0);

  const running = entries.find((e) => !e.ended_at);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function startTimer() {
    setError("");
    const res = await fetch("/api/studio/time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        description: description.trim() || null,
      }),
    });
    if (res.ok) {
      setDescription("");
      refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to start timer");
    }
  }

  async function stopTimer(id: string) {
    setError("");
    const res = await fetch(`/api/studio/time/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stop: true }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to stop timer");
      return;
    }
    refresh();
  }

  async function saveManual(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const startIso = new Date(manualStart).toISOString();
    const endIso = new Date(manualEnd).toISOString();
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      setError("End must be after start");
      return;
    }
    const res = await fetch("/api/studio/time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        started_at: startIso,
        ended_at: endIso,
        description: manualDesc.trim() || null,
      }),
    });
    if (res.ok) {
      setManualDesc("");
      setShowManual(false);
      refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save entry");
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm("Delete this time entry?")) return;
    const res = await fetch(`/api/studio/time/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete");
      return;
    }
    refresh();
  }

  const completed = entries.filter((e) => e.ended_at);
  const totalMinutes = sumBillableMinutes(completed);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemainingMinutes = totalMinutes % 60;

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-paper-muted bg-paper-warm text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay";

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-lg text-ink">Time</h2>
        {totalMinutes > 0 && (
          <span className="text-xs text-ink-light">
            {totalHours}h {totalRemainingMinutes.toString().padStart(2, "0")}m total
          </span>
        )}
      </div>

      {running ? (
        <div className="rounded-md border border-clay bg-paper-warm p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-clay uppercase tracking-wide">
              Running
            </p>
            <p className="text-sm text-ink">
              {formatDuration(running.started_at, null)}
              {running.description && (
                <span className="text-ink-light">
                  {" "}
                  · {running.description}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => stopTimer(running.id)}
            className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
          >
            Stop
          </button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className={inputClass}
          />
          <button
            type="button"
            onClick={startTimer}
            className="px-3 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors whitespace-nowrap"
          >
            Start timer
          </button>
          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            className="px-3 py-2 rounded-md text-ink-muted hover:text-ink hover:bg-paper-warm text-sm transition-colors whitespace-nowrap"
          >
            {showManual ? "Hide manual" : "Add manual"}
          </button>
        </div>
      )}

      {showManual && !running && (
        <form
          onSubmit={saveManual}
          className="rounded-md border border-paper-muted bg-paper-warm/60 p-3 space-y-2"
        >
          <div className="flex gap-2 flex-wrap">
            <label className="flex-1 min-w-[160px]">
              <span className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
                Start
              </span>
              <input
                type="datetime-local"
                value={manualStart}
                onChange={(e) => setManualStart(e.target.value)}
                className={inputClass}
                required
              />
            </label>
            <label className="flex-1 min-w-[160px]">
              <span className="text-xs text-ink-muted uppercase tracking-wide block mb-1">
                End
              </span>
              <input
                type="datetime-local"
                value={manualEnd}
                onChange={(e) => setManualEnd(e.target.value)}
                className={inputClass}
                required
              />
            </label>
          </div>
          <input
            type="text"
            value={manualDesc}
            onChange={(e) => setManualDesc(e.target.value)}
            placeholder="Optional description"
            className={inputClass}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
            >
              Save entry
            </button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-ink-light">No entries yet.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {entries.map((entry) => {
            const live = !entry.ended_at;
            return (
              <li
                key={entry.id}
                className="group flex items-baseline gap-3 py-1.5 border-b border-paper-muted/50"
              >
                <span className="text-ink-light text-xs w-24 shrink-0">
                  {formatDateTime(entry.started_at)}
                </span>
                <span className={live ? "text-clay" : "text-ink"}>
                  {formatDuration(entry.started_at, entry.ended_at)}
                </span>
                <span className="text-ink-muted flex-1 truncate">
                  {entry.description || ""}
                </span>
                {!live && (
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-ink-light hover:text-terracotta transition-opacity"
                  >
                    Delete
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </section>
  );
}
