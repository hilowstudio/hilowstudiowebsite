import { notFound } from "next/navigation";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { listSettingsForScope } from "@/lib/ops/settings";
import { IntegrationsForm } from "./integrations-form";

export const dynamic = "force-dynamic";

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

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-serif text-lg text-ink">Integrations</h2>

      <section className="space-y-3">
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
    </div>
  );
}
