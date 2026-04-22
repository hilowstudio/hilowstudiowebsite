import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { WorkspaceAnalytics } from "./workspace-analytics";

export const dynamic = "force-dynamic";

export default async function WorkspaceAnalyticsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  return <WorkspaceAnalytics workspaceId={workspace.id} />;
}
