import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { WorkspacePostEditor } from "./workspace-post-editor";

export const dynamic = "force-dynamic";

export default async function WorkspacePostDetail({
  params,
}: {
  params: Promise<{ workspace: string; postId: string }>;
}) {
  const { workspace: workspaceSlug, postId } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  return (
    <WorkspacePostEditor
      workspaceId={workspace.id}
      workspaceSlug={workspace.slug}
      postId={postId}
    />
  );
}
