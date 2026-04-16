import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, getClientProjects } from "@/lib/studio/queries";
import { ClientEditor } from "./client-editor";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, projects] = await Promise.all([
    getClient(id),
    getClientProjects(id),
  ]);

  if (!client) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/studio/clients"
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Clients
      </Link>

      <ClientEditor client={client} />

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Projects</h2>
        {projects.length === 0 ? (
          <p className="text-ink-light text-sm">No projects yet.</p>
        ) : (
          <ul className="space-y-1">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/studio/projects/${project.id}`}
                  className="flex items-baseline justify-between py-2 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
                >
                  <span className="text-ink">{project.name}</span>
                  <span className="text-xs text-ink-light capitalize">
                    {project.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/studio/projects/new?client=${client.id}`}
          className="text-sm text-clay hover:text-ink transition-colors inline-block pt-2"
        >
          + New project for {client.name}
        </Link>
      </section>
    </div>
  );
}
