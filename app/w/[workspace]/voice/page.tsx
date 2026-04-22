import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { WorkspaceVoiceGuide } from "./workspace-voice-guide";

export const dynamic = "force-dynamic";

export default async function WorkspaceVoicePage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  return (
    <WorkspaceVoiceGuide
      workspaceId={workspace.id}
      workspaceSlug={workspace.slug}
      brandName={workspace.brand_name || workspace.name}
    />
  );
}
