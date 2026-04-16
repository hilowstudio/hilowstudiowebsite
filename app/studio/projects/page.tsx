import Link from "next/link";
import { getProjects } from "@/lib/studio/queries";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  done: "Done",
  archived: "Archived",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const { archived } = await searchParams;
  const includeArchived = archived === "true";
  const projects = await getProjects({ includeArchived });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Projects</h1>
        <Link
          href="/studio/projects/new"
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
        >
          New project
        </Link>
      </div>

      <div className="flex gap-2 text-sm">
        <Link
          href="/studio/projects"
          className={`px-3 py-1.5 rounded-md transition-colors ${
            !includeArchived
              ? "bg-ink text-paper"
              : "text-ink-muted hover:text-ink hover:bg-paper-warm"
          }`}
        >
          Current
        </Link>
        <Link
          href="/studio/projects?archived=true"
          className={`px-3 py-1.5 rounded-md transition-colors ${
            includeArchived
              ? "bg-ink text-paper"
              : "text-ink-muted hover:text-ink hover:bg-paper-warm"
          }`}
        >
          All
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-ink-light text-sm py-8">No projects yet.</p>
      ) : (
        <ul className="space-y-1">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/studio/projects/${project.id}`}
                className="flex items-baseline justify-between py-3 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
              >
                <span className="flex items-baseline gap-3">
                  <span className="text-ink">{project.name}</span>
                  {project.client_name && (
                    <span className="text-xs text-ink-light">
                      {project.client_name}
                    </span>
                  )}
                </span>
                <span className="text-xs text-ink-light">
                  {statusLabels[project.status] ?? project.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
