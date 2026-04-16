"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientUpdate } from "@/lib/studio/queries";

const STATUS_LABELS: Record<ClientUpdate["status"], string> = {
  draft: "Draft",
  approved: "Approved",
  sent: "Sent",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function UpdatesSection({
  projectId,
  updates,
}: {
  projectId: string;
  updates: ClientUpdate[];
}) {
  const router = useRouter();
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState("");

  async function draft() {
    setDrafting(true);
    setError("");
    const res = await fetch("/api/studio/updates/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId }),
    });
    if (res.ok) {
      const data = (await res.json()) as { id: string };
      router.push(`/studio/updates/${data.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to generate draft");
      setDrafting(false);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-lg text-ink">Client updates</h2>
        <button
          type="button"
          onClick={draft}
          disabled={drafting}
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors disabled:opacity-50"
        >
          {drafting ? "Drafting..." : "Draft this week's update"}
        </button>
      </div>

      {updates.length === 0 ? (
        <p className="text-sm text-ink-light">
          No drafts yet. The AI uses your logged work, completed deliverables, and recent notes from the last 7 days.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {updates.slice(0, 5).map((update) => {
            const preview = (update.final_body ?? update.draft_body).slice(0, 100);
            return (
              <li key={update.id}>
                <Link
                  href={`/studio/updates/${update.id}`}
                  className="flex items-baseline justify-between gap-3 py-2 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-ink-light">
                      {formatDate(update.generated_at)}
                      {update.source === "cron" && " · auto"}
                    </p>
                    <p className="text-sm text-ink truncate">{preview}</p>
                  </div>
                  <span className="text-xs text-ink-light whitespace-nowrap">
                    {STATUS_LABELS[update.status]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="text-terracotta text-sm">{error}</p>}
    </section>
  );
}
