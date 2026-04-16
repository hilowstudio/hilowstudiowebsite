"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/studio/queries";

const STATUSES: Project["status"][] = ["active", "paused", "done", "archived"];
const STATUS_LABELS: Record<Project["status"], string> = {
  active: "Active",
  paused: "Paused",
  done: "Done",
  archived: "Archived",
};

export function ProjectHeader({
  project,
}: {
  project: Project & { client_name: string | null };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Project["status"]>(project.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function changeStatus(next: Project["status"]) {
    const previous = status;
    setStatus(next);
    setSaving(true);
    setError("");

    const res = await fetch(`/api/studio/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      setStatus(previous);
      const data = await res.json();
      setError(data.error || "Failed to update status");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete ${project.name}? This cannot be undone.`)) return;
    const res = await fetch(`/api/studio/projects/${project.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/studio/projects");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete");
    }
  }

  return (
    <header className="space-y-3">
      <h1 className="font-serif text-3xl text-ink">{project.name}</h1>
      {project.client_name && (
        <p className="text-sm text-ink-muted">
          <Link
            href={`/studio/clients/${project.client_id}`}
            className="hover:text-clay transition-colors"
          >
            {project.client_name}
          </Link>
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <div className="flex gap-1 text-xs">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              disabled={saving}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                status === s
                  ? "bg-ink text-paper"
                  : "text-ink-muted hover:text-ink hover:bg-paper-warm"
              } disabled:opacity-60`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={handleDelete}
          className="text-xs text-ink-light hover:text-terracotta transition-colors"
        >
          Delete
        </button>
      </div>

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </header>
  );
}
