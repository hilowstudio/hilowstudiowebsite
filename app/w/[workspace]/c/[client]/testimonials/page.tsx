import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { getClientBySlug, getWorkspaceBySlug } from "@/lib/ops/scope";
import { TestimonialsList } from "./testimonials-list";

export const dynamic = "force-dynamic";

type TestimonialRow = {
  id: string;
  body: string;
  attributed_to: string | null;
  attribution_role: string | null;
  approved: boolean;
  private_notes: string | null;
  created_at: string;
  source_meeting_id: string | null;
};

export default async function TestimonialsPage({
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
    .from("ops_testimonials")
    .select(
      "id, body, attributed_to, attribution_role, approved, private_notes, created_at, source_meeting_id",
    )
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  const testimonials = (data as TestimonialRow[]) ?? [];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="font-serif text-lg text-ink">Testimonial library</h2>
        <p className="text-sm text-ink-light">
          Promote quotes from meetings (see Meetings → each meeting → Quotable
          moments → Promote). Approved testimonials become reusable across
          content.
        </p>
      </header>

      <TestimonialsList
        testimonials={testimonials}
        workspaceSlug={workspace.slug}
        clientSlug={client.slug}
      />
    </div>
  );
}
