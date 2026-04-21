import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { NewClientForm } from "./new-client-form";

export const dynamic = "force-dynamic";

export default async function NewClientPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  return (
    <div className="max-w-lg space-y-6">
      <a
        href={`/w/${workspace.slug}`}
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Dashboard
      </a>
      <h1 className="font-serif text-2xl text-ink">New client</h1>
      <NewClientForm workspaceId={workspace.id} workspaceSlug={workspace.slug} />
    </div>
  );
}
