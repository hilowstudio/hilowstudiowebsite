import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { PromptLibrary } from "./prompt-library";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  prompt_body: string;
  category: string;
  sort_order: number;
  workspace_id: string | null;
};

export default async function WorkspacePromptsPage({
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
      .select(
        "id, slug, label, description, prompt_body, category, sort_order, workspace_id",
      )
      .eq("workspace_id", workspace.id)
      .order("sort_order", { ascending: true }),
    db
      .from("ops_prompt_templates")
      .select(
        "id, slug, label, description, prompt_body, category, sort_order, workspace_id",
      )
      .is("workspace_id", null)
      .order("sort_order", { ascending: true }),
  ]);

  const workspaceTemplates = (wsRes.data as Row[]) ?? [];
  const platformTemplates = (platformRes.data as Row[]) ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="space-y-1">
        <h1 className="font-serif text-2xl text-ink">Prompt library</h1>
        <p className="text-sm text-ink-light measure">
          Reusable prompts the composer can drop into any post. Platform
          templates are shared with every workspace. Add your own below to
          encode agency-specific angles once and reuse across every client.
        </p>
      </header>

      <PromptLibrary
        workspaceId={workspace.id}
        workspaceTemplates={workspaceTemplates}
        platformTemplates={platformTemplates}
      />
    </div>
  );
}
