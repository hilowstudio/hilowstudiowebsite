import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/ops/auth";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type WorkspaceRow = {
  id: string;
  slug: string;
  name: string;
  brand_name: string | null;
  primary_color: string | null;
};

export default async function AppHome() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/app/login");
  }

  const db = getSupabase();
  const workspaceIds = user.memberships
    .filter((m) => m.scope === "workspace")
    .map((m) => m.scopeId);

  let workspaces: WorkspaceRow[] = [];

  if (user.isPlatformAdmin) {
    const { data } = await db
      .from("ops_workspaces")
      .select("id, slug, name, brand_name, primary_color")
      .order("name", { ascending: true });
    workspaces = (data as WorkspaceRow[]) ?? [];
  } else if (workspaceIds.length > 0) {
    const { data } = await db
      .from("ops_workspaces")
      .select("id, slug, name, brand_name, primary_color")
      .in("id", workspaceIds)
      .order("name", { ascending: true });
    workspaces = (data as WorkspaceRow[]) ?? [];
  }

  const clientIds = user.memberships
    .filter((m) => m.scope === "client")
    .map((m) => m.scopeId);
  let clientWorkspaces: { client_slug: string; client_name: string; workspace_slug: string; workspace_name: string }[] = [];
  if (clientIds.length > 0) {
    const { data } = await db
      .from("ops_clients")
      .select("slug, name, workspace_id, ops_workspaces(slug, name)")
      .in("id", clientIds);
    clientWorkspaces = ((data ?? []) as unknown as {
      slug: string;
      name: string;
      workspace_id: string;
      ops_workspaces: { slug: string; name: string } | null;
    }[]).map((row) => ({
      client_slug: row.slug,
      client_name: row.name,
      workspace_slug: row.ops_workspaces?.slug ?? "",
      workspace_name: row.ops_workspaces?.name ?? "",
    }));
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-paper-muted">
        <div className="container-calm py-4 flex items-baseline justify-between">
          <span className="font-serif text-lg text-ink">Hi Low Ops</span>
          <form action="/api/ops/auth/logout" method="post">
            <button
              type="submit"
              className="text-sm text-ink-light hover:text-ink transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="container-calm py-12 space-y-10">
        <div className="space-y-1">
          <p className="text-xs text-ink-muted uppercase tracking-wide">Welcome</p>
          <h1 className="font-serif text-3xl text-ink">{user.name ?? user.email}</h1>
        </div>

        {user.isPlatformAdmin && (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-xl text-ink">All workspaces</h2>
              <Link
                href="/app/workspaces/new"
                className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
              >
                New workspace
              </Link>
            </div>
            {workspaces.length === 0 ? (
              <p className="text-ink-light text-sm">No workspaces yet.</p>
            ) : (
              <WorkspaceGrid workspaces={workspaces} />
            )}
          </section>
        )}

        {!user.isPlatformAdmin && workspaces.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-ink">Your workspaces</h2>
            <WorkspaceGrid workspaces={workspaces} />
          </section>
        )}

        {clientWorkspaces.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-ink">Client access</h2>
            <ul className="space-y-1">
              {clientWorkspaces.map((cw) => (
                <li key={`${cw.workspace_slug}-${cw.client_slug}`}>
                  <Link
                    href={`/c/${cw.client_slug}`}
                    className="flex items-baseline justify-between py-3 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
                  >
                    <span className="text-ink">{cw.client_name}</span>
                    <span className="text-xs text-ink-light">
                      via {cw.workspace_name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {workspaces.length === 0 && clientWorkspaces.length === 0 && (
          <p className="text-ink-light text-sm">
            You don't belong to any workspaces yet. Wait for an invite or ask an admin.
          </p>
        )}
      </main>
    </div>
  );
}

function WorkspaceGrid({ workspaces }: { workspaces: WorkspaceRow[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {workspaces.map((ws) => (
        <li key={ws.id}>
          <Link
            href={`/w/${ws.slug}`}
            className="block rounded-md border border-paper-muted bg-paper-warm/60 p-4 hover:border-clay hover:bg-paper-warm transition-colors"
            style={
              ws.primary_color
                ? ({ borderLeftColor: ws.primary_color, borderLeftWidth: 4 } as React.CSSProperties)
                : undefined
            }
          >
            <p className="font-serif text-base text-ink">
              {ws.brand_name || ws.name}
            </p>
            <p className="text-xs text-ink-light mt-1">/{ws.slug}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
