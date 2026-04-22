import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { NewWorkspacePostForm } from "./new-post-form";

export const dynamic = "force-dynamic";

type Template = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  prompt_body: string;
  category: string;
};

export default async function NewWorkspacePostPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();
  const [wsRes, platformRes] = await Promise.all([
    db
      .from("ops_prompt_templates")
      .select("id, slug, label, description, prompt_body, category")
      .eq("workspace_id", workspace.id)
      .order("sort_order", { ascending: true }),
    db
      .from("ops_prompt_templates")
      .select("id, slug, label, description, prompt_body, category")
      .is("workspace_id", null)
      .order("sort_order", { ascending: true }),
  ]);

  const templates = [
    ...((wsRes.data as Template[]) ?? []),
    ...((platformRes.data as Template[]) ?? []),
  ];

  return (
    <NewWorkspacePostForm
      workspaceId={workspace.id}
      workspaceSlug={workspace.slug}
      brandName={workspace.brand_name || workspace.name}
      templates={templates}
    />
  );
}
