import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { WorkspaceSourceMaterial } from "../../idea-sources/source-material";

export const dynamic = "force-dynamic";

export default async function WorkspaceContentSourcesPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  return <WorkspaceSourceMaterial workspaceId={workspace.id} />;
}
