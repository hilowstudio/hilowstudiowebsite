import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { listSettingsForScope } from "@/lib/ops/settings";
import {
  IntegrationsForm,
  type IntegrationKey,
} from "@/components/ops/integrations-form";
import { MatchRulesEditor } from "./match-rules-editor";

export const dynamic = "force-dynamic";

const CLIENT_KEYS: IntegrationKey[] = [
  "fireflies_api_key",
  "fathom_api_key",
  "anthropic_api_key",
  "openai_api_key",
  "gemini_api_key",
  "xai_api_key",
  "openrouter_api_key",
  "deepgram_api_key",
];

const CLIENT_LABEL_OVERRIDES: Partial<Record<IntegrationKey, string>> = {
  anthropic_api_key: "Anthropic API key (BYOK override)",
  deepgram_api_key: "Deepgram API key (BYOK override)",
  openrouter_api_key: "OpenRouter API key (BYOK override)",
};

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
          Client-specific keys override the workspace defaults set in
          workspace settings. Leave blank to inherit.
        </p>
        <IntegrationsForm
          settingsUrl={`/api/ops/clients/${client.id}/settings`}
          availableKeys={CLIENT_KEYS}
          existingKeys={Array.from(existingKeys)}
          labelOverrides={CLIENT_LABEL_OVERRIDES}
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
