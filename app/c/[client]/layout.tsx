import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/ops/auth";
import { getSupabase } from "@/lib/supabase";
import { hasClientAccess } from "@/lib/ops/scope";
import { ClientPortalShell } from "@/components/ops/client-portal-shell";

export const dynamic = "force-dynamic";

export default async function ClientPortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ client: string }>;
}) {
  const { client: clientSlug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/app/login?next=/c/${clientSlug}`);
  }

  const db = getSupabase();

  const clientIds = user.memberships
    .filter((m) => m.scope === "client")
    .map((m) => m.scopeId);

  const { data: clients } = await db
    .from("ops_clients")
    .select("id, slug, name, company, workspace_id, ops_workspaces(brand_name, name, primary_color, logo_url)")
    .eq("slug", clientSlug);

  const matches = ((clients ?? []) as unknown as {
    id: string;
    slug: string;
    name: string;
    company: string | null;
    workspace_id: string;
    ops_workspaces: {
      brand_name: string | null;
      name: string;
      primary_color: string | null;
      logo_url: string | null;
    } | null;
  }[]).filter((c) =>
    hasClientAccess(
      user.memberships,
      c.id,
      c.workspace_id,
      "client_viewer",
      user.isPlatformAdmin,
    ),
  );

  if (matches.length === 0) {
    // The user isn't a client member anywhere with this slug.
    // If they're workspace staff who can see it via any workspace, keep first match we can find.
    const workspaceMembershipIds = user.memberships
      .filter((m) => m.scope === "workspace")
      .map((m) => m.scopeId);
    const staffMatch = ((clients ?? []) as unknown as {
      id: string;
      slug: string;
      name: string;
      company: string | null;
      workspace_id: string;
      ops_workspaces: {
        brand_name: string | null;
        name: string;
        primary_color: string | null;
        logo_url: string | null;
      } | null;
    }[]).find(
      (c) =>
        workspaceMembershipIds.includes(c.workspace_id) || user.isPlatformAdmin,
    );
    if (!staffMatch) notFound();
    // Fall through with staffMatch by putting it in matches
    matches.push(staffMatch);
  }

  if (clientIds.length > 1 && matches.length > 1) {
    // Ambiguous slug (same client slug owned across workspaces). For safety,
    // send the user back to /app to pick explicitly.
    redirect("/app");
  }

  const client = matches[0];
  const primary = client.ops_workspaces?.primary_color ?? null;

  return (
    <ClientPortalShell
      client={{
        id: client.id,
        slug: client.slug,
        name: client.name,
        company: client.company,
      }}
      workspaceBrand={{
        brandName: client.ops_workspaces?.brand_name ?? client.ops_workspaces?.name ?? "Agency",
        logoUrl: client.ops_workspaces?.logo_url ?? null,
        primaryColor: primary,
      }}
      userName={user.name || user.email}
    >
      {children}
    </ClientPortalShell>
  );
}
