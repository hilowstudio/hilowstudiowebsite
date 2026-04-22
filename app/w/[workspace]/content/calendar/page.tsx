import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { WorkspaceContentCalendar } from "./workspace-calendar";

export const dynamic = "force-dynamic";

export default async function WorkspaceCalendarPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  return (
    <WorkspaceContentCalendar
      workspaceId={workspace.id}
      workspaceSlug={workspace.slug}
    />
  );
}
