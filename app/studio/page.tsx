import Link from "next/link";
import { getHomeProjects } from "@/lib/studio/queries";

export const dynamic = "force-dynamic";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 8) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default async function StudioHome() {
  const projects = await getHomeProjects();

  if (projects.length === 0) {
    return (
      <div className="space-y-4 py-12 text-center">
        <h1 className="font-serif text-2xl text-ink">Studio</h1>
        <p className="text-ink-light text-sm">No active projects yet.</p>
        <div className="pt-2">
          <Link
            href="/studio/projects/new"
            className="px-4 py-2 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors inline-block"
          >
            Start your first project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ink">Active projects</h1>

      <ul className="space-y-3">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/studio/projects/${project.id}`}
              className="block rounded-md border border-paper-muted bg-paper-warm/60 p-4 hover:border-clay hover:bg-paper-warm transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-serif text-base text-ink">{project.name}</p>
                  {project.client_name && (
                    <p className="text-xs text-ink-light">{project.client_name}</p>
                  )}
                </div>
                <span className="text-xs text-ink-light whitespace-nowrap">
                  {relativeTime(project.last_movement_at)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wide">
                    Phase
                  </p>
                  <p className="text-ink">
                    {project.current_phase_name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wide">
                    Next up
                  </p>
                  <p className="text-ink">
                    {project.next_deliverable_title ?? "—"}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
