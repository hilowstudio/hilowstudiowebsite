import { notFound } from "next/navigation";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { ClientSubNav } from "@/components/ops/client-sub-nav";

export const dynamic = "force-dynamic";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string; client: string }>;
}) {
  const { workspace: workspaceSlug, client: clientSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();
  const client = await getClientBySlug(workspace.id, clientSlug);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <a
          href={`/w/${workspace.slug}`}
          className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
        >
          &larr; {workspace.brand_name || workspace.name}
        </a>
        <div>
          <p className="text-xs text-ink-muted uppercase tracking-wide">Client</p>
          <h1 className="font-serif text-3xl text-ink">{client.name}</h1>
          {client.company && (
            <p className="text-sm text-ink-light">{client.company}</p>
          )}
        </div>
        <ClientSubNav
          workspaceSlug={workspace.slug}
          clientSlug={client.slug}
        />
      </header>

      {children}
    </div>
  );
}
