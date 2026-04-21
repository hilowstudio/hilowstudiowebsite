import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

export default async function WorkspaceClientsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();
  const { data } = await db
    .from("ops_clients")
    .select("id, slug, name, company, status")
    .eq("workspace_id", workspace.id)
    .order("name", { ascending: true });

  const clients =
    (data as { id: string; slug: string; name: string; company: string | null; status: string }[]) ??
    [];

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-2xl text-ink">Clients</h1>
        <Link
          href={`/w/${workspace.slug}/clients/new`}
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
        >
          New client
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-ink-light text-sm py-8">No clients yet.</p>
      ) : (
        <ul className="space-y-1">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/w/${workspace.slug}/c/${client.slug}`}
                className="flex items-baseline justify-between py-3 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
              >
                <div>
                  <span className="text-ink">{client.name}</span>
                  {client.company && (
                    <span className="text-xs text-ink-light ml-2">
                      {client.company}
                    </span>
                  )}
                </div>
                <span className="text-xs text-ink-light capitalize">
                  {client.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
