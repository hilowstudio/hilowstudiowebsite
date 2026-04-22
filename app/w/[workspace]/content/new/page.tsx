import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { NewWorkspacePostForm } from "./new-post-form";

export const dynamic = "force-dynamic";

export default async function NewWorkspacePostPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <a
        href={`/w/${workspace.slug}/content`}
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Content
      </a>
      <h2 className="font-serif text-2xl text-ink">
        New post for {workspace.brand_name || workspace.name}
      </h2>
      <NewWorkspacePostForm
        workspaceId={workspace.id}
        workspaceSlug={workspace.slug}
      />
    </div>
  );
}
