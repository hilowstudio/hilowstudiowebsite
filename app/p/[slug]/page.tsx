import { notFound } from "next/navigation";
import { getPublicProject } from "@/lib/studio/queries";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) return { title: "Not found" };
  return {
    title: `${project.name} | Hi Low Studio`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProject(slug);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-paper bg-dither">
      <div className="container-calm py-16 md:py-24 space-y-12">
        <header className="space-y-3">
          {project.client_display && (
            <p className="text-xs text-ink-light uppercase tracking-wide">
              For {project.client_display}
            </p>
          )}
          <h1 className="font-serif text-4xl md:text-5xl text-ink">
            {project.name}
          </h1>
        </header>

        <section className="space-y-6">
          <div>
            <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">
              Current phase
            </p>
            <p className="font-serif text-2xl text-ink">
              {project.current_phase_name ?? "Getting started"}
            </p>
          </div>

          {(project.completed_deliverables.length > 0 ||
            project.remaining_deliverables.length > 0) && (
            <div className="space-y-4 pt-2">
              {project.completed_deliverables.length > 0 && (
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">
                    Complete
                  </p>
                  <ul className="space-y-1.5 measure">
                    {project.completed_deliverables.map((title) => (
                      <li
                        key={title}
                        className="flex items-baseline gap-2 text-ink"
                      >
                        <span className="text-moss">✓</span>
                        <span className="line-through text-ink-muted">
                          {title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.remaining_deliverables.length > 0 && (
                <div>
                  <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">
                    Up next in this phase
                  </p>
                  <ul className="space-y-1.5 measure">
                    {project.remaining_deliverables.map((title) => (
                      <li
                        key={title}
                        className="flex items-baseline gap-2 text-ink"
                      >
                        <span className="text-ink-light">○</span>
                        <span>{title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {project.next_phase_name && (
            <div className="pt-4 border-t border-paper-muted">
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">
                After this
              </p>
              <p className="text-ink">{project.next_phase_name}</p>
            </div>
          )}
        </section>

        <footer className="pt-12 border-t border-paper-muted">
          <a
            href="https://hilowstudio.dev"
            className="text-xs text-ink-light hover:text-ink transition-colors"
          >
            Built with calm at Hi Low Studio
          </a>
        </footer>
      </div>
    </div>
  );
}
