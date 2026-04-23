import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { listSettingsForScope } from "@/lib/ops/settings";
import { SettingsForm } from "./settings-form";
import { InvitesPanel } from "./invites-panel";
import { DomainPanel } from "./domain-panel";
import { BillingPanel } from "./billing-panel";
import {
  IntegrationsForm,
  type IntegrationKey,
} from "@/components/ops/integrations-form";

const WORKSPACE_KEYS: IntegrationKey[] = [
  "anthropic_api_key",
  "openai_api_key",
  "gemini_api_key",
  "xai_api_key",
  "openrouter_api_key",
  "deepgram_api_key",
  "fireflies_api_key",
  "fathom_api_key",
];

export const dynamic = "force-dynamic";

type InviteRow = {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

type MemberRow = {
  id: string;
  role: string;
  user: { id: string; email: string; name: string | null } | null;
};

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();
  const [invitesRes, membersRes] = await Promise.all([
    db
      .from("ops_invites")
      .select("id, email, role, token, expires_at, accepted_at, created_at")
      .eq("scope", "workspace")
      .eq("scope_id", workspace.id)
      .order("created_at", { ascending: false }),
    db
      .from("ops_workspace_members")
      .select("id, role, user:ops_users(id, email, name)")
      .eq("workspace_id", workspace.id)
      .order("joined_at", { ascending: true }),
  ]);

  const invites = (invitesRes.data as InviteRow[]) ?? [];
  const members = ((membersRes.data ?? []) as unknown as MemberRow[]).map((row) => ({
    id: row.id,
    role: row.role,
    email: row.user?.email ?? "",
    name: row.user?.name ?? null,
  }));

  const workspaceSettings = await listSettingsForScope("workspace", workspace.id);
  const workspaceExistingKeys = workspaceSettings
    .filter((s) => s.hasValue)
    .map((s) => s.key);

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-2xl text-ink">Workspace settings</h1>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Brand</h2>
        <SettingsForm workspace={workspace} />
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Members</h2>
        {members.length === 0 ? (
          <p className="text-ink-light text-sm">No members yet.</p>
        ) : (
          <ul className="space-y-1">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-baseline justify-between py-2 border-b border-paper-muted/50 text-sm"
              >
                <span>
                  <span className="text-ink">{m.name || m.email}</span>
                  {m.name && (
                    <span className="text-xs text-ink-light ml-2">{m.email}</span>
                  )}
                </span>
                <span className="text-xs text-ink-light capitalize">{m.role}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Invites</h2>
        <InvitesPanel workspaceId={workspace.id} initialInvites={invites} />
      </section>

      <section className="space-y-3 max-w-2xl">
        <h2 className="font-serif text-lg text-ink">Integrations</h2>
        <p className="text-sm text-ink-muted measure">
          Default API keys for this workspace. Clients inherit these unless they
          override their own key. Everything is encrypted at rest.
        </p>
        <IntegrationsForm
          settingsUrl={`/api/ops/workspaces/${workspace.id}/settings`}
          availableKeys={WORKSPACE_KEYS}
          existingKeys={workspaceExistingKeys}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Custom domain</h2>
        <DomainPanel workspaceId={workspace.id} />
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Billing</h2>
        <BillingPanel workspaceId={workspace.id} currentPlan={workspace.plan} />
      </section>
    </div>
  );
}
