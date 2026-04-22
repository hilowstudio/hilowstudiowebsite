import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { WorkspaceContentList } from "./content-list";

export const dynamic = "force-dynamic";

export default async function WorkspaceContentPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  return (
    <WorkspaceContentList
      workspaceId={workspace.id}
      workspaceSlug={workspace.slug}
      brandName={workspace.brand_name || workspace.name}
    />
  );
}
