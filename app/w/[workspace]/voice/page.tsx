import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { VoiceEditor } from "@/components/ops/voice-editor";
import { HookPreferences } from "@/components/ops/hook-preferences";

export const dynamic = "force-dynamic";

type VoiceRow = {
  id: string;
  category: string;
  content: string;
  sort_order: number;
};

export default async function WorkspaceVoicePage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();
  const { data } = await db
    .from("voice_guide")
    .select("id, category, content, sort_order")
    .eq("workspace_id", workspace.id)
    .is("client_id", null)
    .order("sort_order", { ascending: true });

  const rows = (data as VoiceRow[]) ?? [];

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
          {workspace.brand_name || workspace.name} voice
        </h1>
        <p className="text-sm text-ink-light measure">
          Principles that feed every AI draft for {workspace.brand_name || workspace.name}&apos;s own
          content. Each client has its own voice guide on its client page.
        </p>
      </header>

      <VoiceEditor
        addUrl={`/api/ops/workspaces/${workspace.id}/voice`}
        initial={rows}
      />

      <section className="space-y-3 pt-6 border-t border-paper-muted">
        <h2 className="font-serif text-lg text-ink">Hook preferences</h2>
        <HookPreferences workspaceId={workspace.id} />
      </section>
    </div>
  );
}
