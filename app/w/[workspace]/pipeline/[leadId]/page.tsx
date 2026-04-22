import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";
import { LeadHeader } from "./lead-header";
import { OutreachTimeline } from "./outreach-timeline";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  workspace_id: string;
  network_contact_id: string | null;
  name: string;
  company: string | null;
  email: string | null;
  linkedin_url: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  last_touch_at: string | null;
  next_follow_up_at: string | null;
  converted_client_id: string | null;
  converted_at: string | null;
  created_at: string;
};

type Outreach = {
  id: string;
  kind: string;
  direction: string;
  subject: string | null;
  body: string | null;
  completed_at: string | null;
  scheduled_for: string | null;
  follow_up_at: string | null;
  created_at: string;
};

type Draft = {
  id: string;
  kind: string;
  draft_body: string;
  status: string;
  generated_at: string;
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; leadId: string }>;
}) {
  const { workspace: workspaceSlug, leadId } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();
  const [leadRes, outreachRes, draftsRes] = await Promise.all([
    db
      .from("ops_leads")
      .select("*")
      .eq("id", leadId)
      .eq("workspace_id", workspace.id)
      .maybeSingle(),
    db
      .from("ops_outreach")
      .select(
        "id, kind, direction, subject, body, completed_at, scheduled_for, follow_up_at, created_at",
      )
      .eq("lead_id", leadId)
      .order("completed_at", { ascending: false, nullsFirst: true })
      .order("created_at", { ascending: false }),
    db
      .from("ops_outreach_drafts")
      .select("id, kind, draft_body, status, generated_at")
      .eq("lead_id", leadId)
      .order("generated_at", { ascending: false })
      .limit(10),
  ]);

  const lead = leadRes.data as Lead | null;
  if (!lead) notFound();

  const outreach = (outreachRes.data as Outreach[]) ?? [];
  const drafts = (draftsRes.data as Draft[]) ?? [];

  let convertedClientSlug: string | null = null;
  if (lead.converted_client_id) {
    const { data: clientRow } = await db
      .from("ops_clients")
      .select("slug")
      .eq("id", lead.converted_client_id)
      .maybeSingle();
    convertedClientSlug = (clientRow as { slug: string } | null)?.slug ?? null;
  }

  return (
    <div className="space-y-8">
      <Link
        href={`/w/${workspace.slug}/pipeline`}
        className="text-sm text-ink-light hover:text-ink transition-colors inline-block"
      >
        &larr; Pipeline
      </Link>

      <LeadHeader
        lead={lead}
        workspaceSlug={workspace.slug}
        convertedClientSlug={convertedClientSlug}
      />

      <OutreachTimeline
        leadId={lead.id}
        outreach={outreach}
        drafts={drafts}
      />
    </div>
  );
}
