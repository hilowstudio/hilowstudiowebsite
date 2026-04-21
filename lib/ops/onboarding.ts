import { getSupabase } from "@/lib/supabase";

const DEFAULT_VOICE_PRINCIPLES = [
  {
    category: "principle",
    sort_order: 0,
    content:
      "Placeholder voice principle. Edit this to capture how this client sounds. Concrete, grounded, specific. Cut corporate filler.",
  },
  {
    category: "principle",
    sort_order: 1,
    content:
      "Example: Name real things. Prefer the specific verb over the vague one. Vary sentence length. Write with a point of view.",
  },
];

const DEFAULT_PILLARS = [
  {
    slug: "expertise",
    label: "Expertise in practice",
    short_label: "Expertise",
    description:
      "Signature insights from the work. What this client sees that others miss.",
    funnel_role: "TOFU primary",
    color_class: "bg-moss/15 text-moss",
    sort_order: 0,
  },
  {
    slug: "case-studies",
    label: "Case studies and stories",
    short_label: "Stories",
    description:
      "Customer wins, anonymized lessons, and before/after transformations.",
    funnel_role: "MOFU primary",
    color_class: "bg-clay/15 text-clay",
    sort_order: 1,
  },
  {
    slug: "opinion",
    label: "Sharp opinions",
    short_label: "Opinion",
    description:
      "Contrarian takes, industry critique, principled stances the audience recognizes.",
    funnel_role: "TOFU + MOFU",
    color_class: "bg-ink/10 text-ink",
    sort_order: 2,
  },
];

export async function seedClientDefaults(
  clientId: string,
  workspaceId: string,
): Promise<void> {
  const db = getSupabase();

  const { data: existingVoice } = await db
    .from("voice_guide")
    .select("id")
    .eq("client_id", clientId)
    .limit(1);
  if (!existingVoice || existingVoice.length === 0) {
    await db.from("voice_guide").insert(
      DEFAULT_VOICE_PRINCIPLES.map((row) => ({
        ...row,
        client_id: clientId,
        workspace_id: workspaceId,
      })),
    );
  }

  const { data: existingPillars } = await db
    .from("content_pillars")
    .select("id")
    .eq("client_id", clientId)
    .limit(1);
  if (!existingPillars || existingPillars.length === 0) {
    await db.from("content_pillars").insert(
      DEFAULT_PILLARS.map((row) => ({
        ...row,
        client_id: clientId,
        workspace_id: workspaceId,
      })),
    );
  }
}
