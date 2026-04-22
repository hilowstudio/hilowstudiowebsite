import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { ContentSubNav } from "./content-sub-nav";

export default async function WorkspaceContentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  return (
    <div>
      <ContentSubNav workspaceSlug={workspace.slug} />
      <div className="max-w-3xl mx-auto pt-10">{children}</div>
    </div>
  );
}
