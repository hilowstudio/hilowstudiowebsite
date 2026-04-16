import { getSupabase } from "@/lib/supabase";
import { getAnthropic, SONNET_MODEL } from "@/lib/anthropic";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";

type ProjectContext = {
  project_id: string;
  project_name: string;
  client_display: string | null;
  current_phase_name: string | null;
  completed_since: string[];
  in_progress: string[];
  recent_task_closes: string[];
  next_up: string[];
  recent_notes: string[];
};

async function gatherContext(
  projectId: string,
  since: Date,
): Promise<ProjectContext | null> {
  const db = getSupabase();

  const { data: project } = await db
    .from("studio_projects")
    .select("id, name, studio_clients(name, company)")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return null;
  const row = project as unknown as {
    id: string;
    name: string;
    studio_clients: { name: string; company: string | null } | null;
  };

  const { data: phases } = await db
    .from("studio_phases")
    .select("id, name, position, is_current, completed_at")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  const phaseList = (phases ?? []) as {
    id: string;
    name: string;
    position: number;
    is_current: boolean;
    completed_at: string | null;
  }[];
  const current =
    phaseList.find((p) => p.is_current && !p.completed_at) ??
    phaseList.find((p) => !p.completed_at) ??
    null;

  const sinceIso = since.toISOString();
  let completedSince: string[] = [];
  let inProgress: string[] = [];
  let nextUp: string[] = [];

  if (current) {
    const { data: deliverables } = await db
      .from("studio_deliverables")
      .select("title, done, completed_at, position")
      .eq("phase_id", current.id)
      .order("position", { ascending: true });

    const list = (deliverables ?? []) as {
      title: string;
      done: boolean;
      completed_at: string | null;
      position: number;
    }[];

    completedSince = list
      .filter((d) => d.done && d.completed_at && d.completed_at >= sinceIso)
      .map((d) => d.title);

    inProgress = list.filter((d) => !d.done).map((d) => d.title);
    nextUp = inProgress.slice(0, 3);
  }

  const { data: taskCloses } = await db
    .from("studio_tasks")
    .select("title, completed_at")
    .eq("project_id", projectId)
    .eq("done", true)
    .gte("completed_at", sinceIso)
    .order("completed_at", { ascending: false })
    .limit(10);

  const { data: recentNotes } = await db
    .from("studio_notes")
    .select("body, created_at")
    .eq("project_id", projectId)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    project_id: row.id,
    project_name: row.name,
    client_display:
      row.studio_clients?.company || row.studio_clients?.name || null,
    current_phase_name: current?.name ?? null,
    completed_since: completedSince,
    in_progress: inProgress,
    next_up: nextUp,
    recent_task_closes: ((taskCloses ?? []) as { title: string }[]).map(
      (t) => t.title,
    ),
    recent_notes: ((recentNotes ?? []) as { body: string }[])
      .map((n) => n.body.slice(0, 400))
      .filter(Boolean),
  };
}

function buildUserMessage(ctx: ProjectContext): string {
  const lines: string[] = [];
  lines.push(
    `Write a short client update email for the project "${ctx.project_name}"${ctx.client_display ? ` for ${ctx.client_display}` : ""}. One or two short paragraphs. Warm but grounded. No em dashes. No banned words. No contrastive framing.`,
  );
  lines.push("");
  lines.push("Context:");
  if (ctx.current_phase_name) {
    lines.push(`- Current phase: ${ctx.current_phase_name}`);
  }
  if (ctx.completed_since.length) {
    lines.push(
      `- Completed since last update: ${ctx.completed_since.join("; ")}`,
    );
  }
  if (ctx.recent_task_closes.length) {
    lines.push(
      `- Tasks closed recently: ${ctx.recent_task_closes.join("; ")}`,
    );
  }
  if (ctx.in_progress.length) {
    lines.push(`- Still open in this phase: ${ctx.in_progress.join("; ")}`);
  }
  if (ctx.next_up.length) {
    lines.push(`- Next up: ${ctx.next_up.join("; ")}`);
  }
  if (ctx.recent_notes.length) {
    lines.push("- Recent notes (summarize, don't quote):");
    for (const note of ctx.recent_notes) {
      lines.push(`  • ${note}`);
    }
  }
  lines.push("");
  lines.push(
    "Structure: greeting with first name (skip if unknown), one paragraph about what moved since last time, one paragraph about what's next, sign off. No subject line. No hype. No corporate filler. If nothing substantive happened, say so honestly.",
  );
  return lines.join("\n");
}

export async function composeClientUpdate(
  projectId: string,
  options?: { since?: Date },
): Promise<string | null> {
  const since = options?.since ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const ctx = await gatherContext(projectId, since);
  if (!ctx) return null;

  const client = getAnthropic();
  const response = await client.messages.create({
    model: SONNET_MODEL,
    max_tokens: 1000,
    system: PERSONA_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserMessage(ctx) }],
  });

  const first = response.content[0];
  if (!first || first.type !== "text") return null;
  return first.text.trim();
}

export async function draftAndStoreUpdate(
  projectId: string,
  source: "manual" | "cron",
  options?: { since?: Date },
): Promise<{ id: string } | null> {
  const text = await composeClientUpdate(projectId, options);
  if (!text) return null;

  const db = getSupabase();
  const { data, error } = await db
    .from("studio_client_updates")
    .insert({
      project_id: projectId,
      draft_body: text,
      source,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data as { id: string };
}
