import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { NewLeadForm } from "./new-lead-form";

export const dynamic = "force-dynamic";

export default async function NewLeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ contact?: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const { contact: contactId } = await searchParams;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  let prefill: {
    name: string;
    company: string;
    linkedin_url: string;
    network_contact_id: string;
  } | null = null;

  if (contactId) {
    const db = getSupabase();
    const { data } = await db
      .from("ops_network_contacts")
      .select("id, name, company, linkedin_url")
      .eq("id", contactId)
      .eq("workspace_id", workspace.id)
      .maybeSingle();
    const row = data as {
      id: string;
      name: string | null;
      company: string | null;
      linkedin_url: string | null;
    } | null;
    if (row) {
      prefill = {
        name: row.name ?? "",
        company: row.company ?? "",
        linkedin_url: row.linkedin_url ?? "",
        network_contact_id: row.id,
      };
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <a
        href={`/w/${workspace.slug}/pipeline`}
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Pipeline
      </a>
      <h1 className="font-serif text-2xl text-ink">New lead</h1>
      <NewLeadForm workspaceId={workspace.id} workspaceSlug={workspace.slug} prefill={prefill} />
    </div>
  );
}
