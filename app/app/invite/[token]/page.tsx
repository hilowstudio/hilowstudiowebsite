import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AcceptInviteForm } from "./accept-form";

export const dynamic = "force-dynamic";

type InviteRow = {
  id: string;
  email: string;
  scope: "workspace" | "client";
  scope_id: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
};

async function getInvite(token: string): Promise<InviteRow | null> {
  const { data } = await supabase
    .from("ops_invites")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .maybeSingle();
  if (!data) return null;
  const row = data as InviteRow;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return row;
}

async function scopeLabel(invite: InviteRow): Promise<{ label: string; subtitle: string }> {
  if (invite.scope === "workspace") {
    const { data } = await supabase
      .from("ops_workspaces")
      .select("name, brand_name")
      .eq("id", invite.scope_id)
      .maybeSingle();
    const name = (data as { name: string; brand_name: string | null } | null);
    return {
      label: name?.brand_name || name?.name || "a workspace",
      subtitle: `Agency workspace \u00b7 role: ${invite.role}`,
    };
  }
  const { data } = await supabase
    .from("ops_clients")
    .select("name, ops_workspaces(name, brand_name)")
    .eq("id", invite.scope_id)
    .maybeSingle();
  const row = data as unknown as {
    name: string;
    ops_workspaces: { name: string; brand_name: string | null } | null;
  } | null;
  const workspaceName =
    row?.ops_workspaces?.brand_name || row?.ops_workspaces?.name || "workspace";
  return {
    label: row?.name || "a client",
    subtitle: `Client of ${workspaceName} \u00b7 role: ${invite.role.replace("_", " ")}`,
  };
}

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite) notFound();

  const { label, subtitle } = await scopeLabel(invite);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="w-full max-w-sm p-8 space-y-6">
        <div className="space-y-1">
          <p className="text-xs text-ink-muted uppercase tracking-wide">
            You're invited to
          </p>
          <h1 className="font-serif text-2xl text-ink">{label}</h1>
          <p className="text-xs text-ink-light">{subtitle}</p>
        </div>
        <AcceptInviteForm token={invite.token} email={invite.email} />
      </div>
    </div>
  );
}
