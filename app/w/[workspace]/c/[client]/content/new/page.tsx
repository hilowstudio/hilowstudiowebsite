import { notFound } from "next/navigation";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { NewPostForm } from "./new-post-form";

export const dynamic = "force-dynamic";

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ workspace: string; client: string }>;
}) {
  const { workspace: workspaceSlug, client: clientSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();
  const client = await getClientBySlug(workspace.id, clientSlug);
  if (!client) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <a
        href={`/w/${workspace.slug}/c/${client.slug}/content`}
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Content
      </a>
      <h2 className="font-serif text-2xl text-ink">New post for {client.name}</h2>
      <NewPostForm
        workspaceSlug={workspace.slug}
        clientSlug={client.slug}
        clientId={client.id}
      />
    </div>
  );
}
