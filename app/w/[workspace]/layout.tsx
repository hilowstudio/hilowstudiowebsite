import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/ops/auth";
import { getWorkspaceBySlug, hasWorkspaceAccess } from "@/lib/ops/scope";
import { WorkspaceShell } from "@/components/ops/workspace-shell";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/app/login?next=/w/${workspaceSlug}`);
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  if (
    !hasWorkspaceAccess(
      user.memberships,
      workspace.id,
      "staff",
      user.isPlatformAdmin,
    )
  ) {
    redirect("/app");
  }

  const canManage = hasWorkspaceAccess(
    user.memberships,
    workspace.id,
    "owner",
    user.isPlatformAdmin,
  );

  return (
    <WorkspaceShell
      workspace={workspace}
      canManage={canManage}
      userName={user.name || user.email}
    >
      {children}
    </WorkspaceShell>
  );
}
