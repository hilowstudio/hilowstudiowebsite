import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { PillarsEditor } from "./pillars-editor";

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

export default async function PillarsPage({
  params,
}: {
  params: Promise<{ workspace: string; client: string }>;
}) {
  const { workspace: workspaceSlug, client: clientSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();
  const client = await getClientBySlug(workspace.id, clientSlug);
  if (!client) notFound();

  const db = getSupabase();
  const { data } = await db
    .from("content_pillars")
    .select("id, slug, label, short_label, description, funnel_role, sort_order")
    .eq("client_id", client.id)
    .order("sort_order", { ascending: true });

  const rows = (data as PillarRow[]) ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <header className="space-y-1">
        <h2 className="font-serif text-lg text-ink">Content pillars</h2>
        <p className="text-sm text-ink-light">
          Strategic themes that anchor this client's content. The composer can
          tag posts to a pillar; the agency dashboard rolls up publishing
          cadence per pillar.
        </p>
      </header>

      <PillarsEditor clientId={client.id} initial={rows} />
    </div>
  );
}
