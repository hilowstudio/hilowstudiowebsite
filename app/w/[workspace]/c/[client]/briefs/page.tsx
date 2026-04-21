import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { BriefGeneratorForm } from "./brief-generator-form";

export const dynamic = "force-dynamic";

type BriefRow = {
  id: string;
  meeting_title: string;
  meeting_context: string | null;
  scheduled_for: string | null;
  brief_body: string;
  generated_at: string;
};

export default async function BriefsPage({
  params,
}: {
  params: Promise<{ workspace: string; client: string }>;
}) {
  const { workspace: workspaceSlug, client: clientSlug } = await params;
  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace) notFound();
  const client = await getClientBySlug(workspace.id, clientSlug);
  if (!client) notFound();

  const db = getSupabase();
  const { data } = await db
    .from("ops_pre_meeting_briefs")
    .select("id, meeting_title, meeting_context, scheduled_for, brief_body, generated_at")
    .eq("client_id", client.id)
    .order("generated_at", { ascending: false })
    .limit(20);

  const briefs = (data as BriefRow[]) ?? [];

  return (
    <div className="space-y-8">
      <BriefGeneratorForm clientId={client.id} />

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">Briefs</h2>
        {briefs.length === 0 ? (
          <p className="text-sm text-ink-light">
            No briefs yet. Generate one to prep for the next conversation.
          </p>
        ) : (
          <ul className="space-y-4">
            {briefs.map((b) => (
              <li
                key={b.id}
                className="rounded-md border border-paper-muted bg-paper-warm/60 p-4 space-y-2"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-serif text-base text-ink">
                    {b.meeting_title}
                  </p>
                  <span className="text-xs text-ink-light whitespace-nowrap">
                    {new Date(b.generated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {b.scheduled_for && (
                  <p className="text-xs text-ink-light">
                    For{" "}
                    {new Date(b.scheduled_for).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                <p className="text-sm text-ink whitespace-pre-wrap measure">
                  {b.brief_body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
