import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { listSettingsForScope } from "@/lib/ops/settings";
import { IntegrationsForm } from "./integrations-form";
import { MatchRulesEditor } from "./match-rules-editor";

export const dynamic = "force-dynamic";

type ClientRules = {
  title_keywords: string[] | null;
  participant_emails: string[] | null;
  participant_domains: string[] | null;
};

export default async function ClientIntegrationsPage({
  params,
}: {
  params: Promise<{ workspace: string; client: string }>;
}) {
  const { workspace: workspaceSlug, client: clientSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();
  const client = await getClientBySlug(workspace.id, clientSlug);
  if (!client) notFound();

  const settings = await listSettingsForScope("client", client.id);
  const existingKeys = new Set(
    settings.filter((s) => s.hasValue).map((s) => s.key),
  );

  const db = getSupabase();
  const { data: rulesRow } = await db
    .from("ops_clients")
    .select("title_keywords, participant_emails, participant_domains")
    .eq("id", client.id)
    .maybeSingle();
  const rules = (rulesRow as ClientRules | null) ?? null;

  return (
    <div className="space-y-10 max-w-2xl">
      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">API keys</h2>
        <p className="text-sm text-ink-muted measure">
          Connect meeting sources + LLM providers for this client. Keys are
          encrypted at rest. Leave blank to fall back to the workspace or
          platform defaults.
        </p>
        <IntegrationsForm
          clientId={client.id}
          existingKeys={Array.from(existingKeys)}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Meeting match rules</h2>
        <MatchRulesEditor
          clientId={client.id}
          initial={{
            title_keywords: rules?.title_keywords ?? [],
            participant_emails: rules?.participant_emails ?? [],
            participant_domains: rules?.participant_domains ?? [],
          }}
        />
      </section>
    </div>
  );
}
