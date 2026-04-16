import Link from "next/link";
import { getAllUpdates } from "@/lib/studio/queries";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  approved: "Approved",
  sent: "Sent",
};

const STATUS_CLASSES: Record<string, string> = {
  draft: "bg-paper-muted text-ink-muted",
  approved: "bg-clay/20 text-clay",
  sent: "bg-moss/30 text-moss",
};

export default async function UpdatesPage() {
  const updates = await getAllUpdates();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ink">Client updates</h1>

      {updates.length === 0 ? (
        <p className="text-sm text-ink-light">
          No drafts yet. Open a project and hit "Draft this week's update" to generate one.
        </p>
      ) : (
        <ul className="space-y-3">
          {updates.map((update) => {
            const preview = (update.final_body ?? update.draft_body).slice(0, 160);
            return (
              <li key={update.id}>
                <Link
                  href={`/studio/updates/${update.id}`}
                  className="block rounded-md border border-paper-muted bg-paper-warm/60 p-4 hover:border-clay hover:bg-paper-warm transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <div>
                      <p className="font-serif text-base text-ink">
                        {update.project_name}
                      </p>
                      <p className="text-xs text-ink-light">
                        {formatDate(update.generated_at)}
                        {update.source === "cron" && " · auto-drafted"}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs ${STATUS_CLASSES[update.status] ?? ""}`}
                    >
                      {STATUS_LABELS[update.status] ?? update.status}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted measure whitespace-pre-wrap">
                    {preview}
                    {preview.length < (update.final_body ?? update.draft_body).length &&
                      "..."}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
