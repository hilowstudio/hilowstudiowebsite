import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { VoiceEditor } from "./voice-editor";

export const dynamic = "force-dynamic";

type VoiceRow = {
  id: string;
  category: string;
  content: string;
  sort_order: number;
};

export default async function VoicePage({
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
    .from("voice_guide")
    .select("id, category, content, sort_order")
    .eq("client_id", client.id)
    .order("sort_order", { ascending: true });

  const rows = (data as VoiceRow[]) ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <header className="space-y-1">
        <h2 className="font-serif text-lg text-ink">Voice guide</h2>
        <p className="text-sm text-ink-light">
          These principles feed every AI draft made for this client. Keep them
          specific. What they say, what they don't, which words they own.
        </p>
      </header>

      <VoiceEditor clientId={client.id} initial={rows} />
    </div>
  );
}
