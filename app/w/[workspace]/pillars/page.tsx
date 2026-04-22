import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { PillarsEditor } from "@/components/ops/pillars-editor";

export const dynamic = "force-dynamic";

type PillarRow = {
  id: string;
  slug: string;
  label: string;
  short_label: string;
  description: string;
  funnel_role: string;
  sort_order: number;
};

export default async function WorkspacePillarsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();
  const { data } = await db
    .from("content_pillars")
    .select("id, slug, label, short_label, description, funnel_role, sort_order")
    .eq("workspace_id", workspace.id)
    .is("client_id", null)
    .order("sort_order", { ascending: true });

  const rows = (data as PillarRow[]) ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <a
        href={`/w/${workspace.slug}/content`}
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Content
      </a>
      <header className="space-y-1">
        <h1 className="font-serif text-2xl text-ink">
          {workspace.brand_name || workspace.name} pillars
        </h1>
        <p className="text-sm text-ink-light measure">
          Strategic themes for {workspace.brand_name || workspace.name}&apos;s own
          content. Each client has its own pillars on its client page.
        </p>
      </header>

      <PillarsEditor
        addUrl={`/api/ops/workspaces/${workspace.id}/pillars`}
        initial={rows}
      />
    </div>
  );
}
