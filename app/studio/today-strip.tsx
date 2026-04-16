"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InboxItem, NextUpTask } from "@/lib/studio/queries";

type ProjectOption = { id: string; name: string };

export function TodayStrip({
  inbox,
  tasks,
  projects,
}: {
  inbox: InboxItem[];
  tasks: NextUpTask[];
  projects: ProjectOption[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [error, setError] = useState("");

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function completeTask(id: string) {
    const res = await fetch(`/api/studio/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update");
      return;
    }
    refresh();
  }

  async function unpinTask(id: string) {
    const res = await fetch(`/api/studio/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ next_up: false }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update");
      return;
    }
    refresh();
  }

  async function fileInbox(
    itemId: string,
    projectId: string,
    as: "task" | "note",
  ) {
    const res = await fetch(`/api/studio/inbox/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_to_project_id: projectId, as }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to file");
      return;
    }
    refresh();
  }

  async function tossInbox(id: string) {
    const res = await fetch(`/api/studio/inbox/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to toss");
      return;
    }
    refresh();
  }

  if (tasks.length === 0 && inbox.length === 0) return null;

  return (
    <section className="rounded-md border border-paper-muted bg-paper-warm/60 p-4 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-base text-ink">Today</h2>
        <span className="text-xs text-ink-light">⌘K to capture</span>
      </div>

      {tasks.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-ink-muted uppercase tracking-wide">
            Pinned
          </p>
          <ul className="space-y-1">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="group flex items-center gap-2 py-1 text-sm"
              >
                <button
                  type="button"
                  onClick={() => completeTask(task.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                  aria-label="Complete task"
                >
                  <span className="inline-block w-4 h-4 rounded border border-ink-light group-hover:border-moss transition-colors" />
                  <span className="text-ink">{task.title}</span>
                  <span className="text-xs text-ink-light">
                    · {task.project_name}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => unpinTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-ink-light hover:text-ink transition-opacity"
                >
                  unpin
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {inbox.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-ink-muted uppercase tracking-wide">
            Inbox
          </p>
          <ul className="space-y-2">
            {inbox.map((item) => (
              <InboxRow
                key={item.id}
                item={item}
                projects={projects}
                onFile={fileInbox}
                onToss={tossInbox}
              />
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </section>
  );
}

function InboxRow({
  item,
  projects,
  onFile,
  onToss,
}: {
  item: InboxItem;
  projects: ProjectOption[];
  onFile: (itemId: string, projectId: string, as: "task" | "note") => void;
  onToss: (id: string) => void;
}) {
  const [filing, setFiling] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [as, setAs] = useState<"task" | "note">("task");

  return (
    <li className="rounded border border-paper-muted bg-paper p-3 space-y-2">
      <p className="text-sm text-ink whitespace-pre-wrap measure">
        {item.body}
      </p>
      {filing ? (
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="px-2 py-1 rounded border border-paper-muted bg-paper-warm text-ink"
          >
            <option value="">Pick a project...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={as}
            onChange={(e) => setAs(e.target.value as "task" | "note")}
            className="px-2 py-1 rounded border border-paper-muted bg-paper-warm text-ink"
          >
            <option value="task">as task</option>
            <option value="note">as note</option>
          </select>
          <button
            type="button"
            onClick={() => {
              if (!projectId) return;
              onFile(item.id, projectId, as);
            }}
            disabled={!projectId}
            className="px-2 py-1 rounded bg-ink text-paper hover:bg-ink-muted transition-colors disabled:opacity-50"
          >
            File
          </button>
          <button
            type="button"
            onClick={() => setFiling(false)}
            className="text-ink-light hover:text-ink transition-colors"
          >
            cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-3 text-xs">
          <button
            type="button"
            onClick={() => setFiling(true)}
            className="text-clay hover:text-ink transition-colors"
          >
            File to project
          </button>
          <button
            type="button"
            onClick={() => onToss(item.id)}
            className="text-ink-light hover:text-terracotta transition-colors"
          >
            Toss
          </button>
        </div>
      )}
    </li>
  );
}
