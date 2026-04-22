import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getWorkspaceBySlug } from "@/lib/ops/scope";

export const dynamic = "force-dynamic";

type LeadRow = {
  id: string;
  name: string;
  company: string | null;
  source: string | null;
  status: string;
  last_touch_at: string | null;
  next_follow_up_at: string | null;
  converted_client_id: string | null;
  created_at: string;
};

const STATUS_ORDER = [
  "prospect",
  "courting",
  "meeting_scheduled",
  "paused",
  "converted",
  "lost",
];

const STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect",
  courting: "Courting",
  meeting_scheduled: "Meeting scheduled",
  paused: "Paused",
  converted: "Converted",
  lost: "Lost",
};

const STATUS_CLASSES: Record<string, string> = {
  prospect: "bg-paper-muted text-ink-muted",
  courting: "bg-clay/20 text-clay",
  meeting_scheduled: "bg-clay/30 text-clay",
  paused: "bg-paper-muted text-ink-light",
  converted: "bg-moss/30 text-moss",
  lost: "bg-terracotta/20 text-terracotta",
};

export default async function PipelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { workspace: workspaceSlug } = await params;
  const { status } = await searchParams;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();

  const db = getSupabase();
  let query = db
    .from("ops_leads")
    .select(
      "id, name, company, source, status, last_touch_at, next_follow_up_at, converted_client_id, created_at",
    )
    .eq("workspace_id", workspace.id)
    .order("last_touch_at", { ascending: false, nullsFirst: false });
  if (status) query = query.eq("status", status);

  const { data } = await query;
  const leads = (data as LeadRow[]) ?? [];

  const followUps = leads.filter(
    (l) =>
      l.next_follow_up_at &&
      new Date(l.next_follow_up_at).getTime() <= Date.now() + 7 * 24 * 60 * 60 * 1000 &&
      l.status !== "converted" &&
      l.status !== "lost",
  );

  return (
    <div className="space-y-8">
      <header className="flex items-baseline justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl text-ink">Pipeline</h1>
          <p className="text-sm text-ink-light">
            Leads the agency is actively courting. Conversations happen here.
            Deal stages and dollar amounts live in Attio.
          </p>
        </div>
        <Link
          href={`/w/${workspace.slug}/pipeline/new`}
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
        >
          New lead
        </Link>
      </header>

      <div className="flex flex-wrap gap-1">
        <Link
          href={`/w/${workspace.slug}/pipeline`}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            !status
              ? "bg-ink text-paper"
              : "text-ink-muted hover:text-ink hover:bg-paper-warm"
          }`}
        >
          All
        </Link>
        {STATUS_ORDER.map((s) => (
          <Link
            key={s}
            href={`/w/${workspace.slug}/pipeline?status=${s}`}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              status === s
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink hover:bg-paper-warm"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {followUps.length > 0 && !status && (
        <section className="rounded-md border border-clay bg-paper-warm p-4 space-y-2">
          <p className="text-xs text-clay uppercase tracking-wide">
            Follow-ups due this week
          </p>
          <ul className="space-y-1 text-sm">
            {followUps.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/w/${workspace.slug}/pipeline/${l.id}`}
                  className="flex items-baseline justify-between hover:bg-paper-warm/50 transition-colors -mx-2 px-2 py-1 rounded"
                >
                  <span className="text-ink">
                    {l.name}
                    {l.company && (
                      <span className="text-xs text-ink-light ml-2">
                        {l.company}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-ink-light">
                    {new Date(l.next_follow_up_at as string).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {leads.length === 0 ? (
        <p className="text-sm text-ink-light py-8">No leads yet.</p>
      ) : (
        <ul className="space-y-1">
          {leads.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/w/${workspace.slug}/pipeline/${lead.id}`}
                className="flex items-baseline justify-between gap-3 py-3 border-b border-paper-muted/50 hover:bg-paper-warm/50 transition-colors -mx-2 px-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-ink">{lead.name}</p>
                  {lead.company && (
                    <p className="text-xs text-ink-light">{lead.company}</p>
                  )}
                </div>
                <div className="flex items-baseline gap-3">
                  {lead.last_touch_at && (
                    <span className="text-xs text-ink-light whitespace-nowrap">
                      last touch{" "}
                      {new Date(lead.last_touch_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${STATUS_CLASSES[lead.status] ?? ""}`}
                  >
                    {STATUS_LABELS[lead.status] ?? lead.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
