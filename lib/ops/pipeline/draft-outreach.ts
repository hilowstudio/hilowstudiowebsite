import { getSupabase } from "@/lib/supabase";
import { PERSONA_SYSTEM_PROMPT } from "@/lib/voice-persona";
import { opsCreateMessage, SONNET_MODEL } from "@/lib/ops/llm";

type Lead = {
  id: string;
  workspace_id: string;
  name: string;
  company: string | null;
  linkedin_url: string | null;
  notes: string | null;
  source: string | null;
};

const SYSTEM_PROMPT_OVERLAY = `${PERSONA_SYSTEM_PROMPT}

---

You are drafting a short outreach message to a lead the operator is courting. The goal is to start or continue a conversation; not to close. Warmth over polish. Specificity over buzzwords. No "I hope this finds you well." No pitch deck language. Assume the reader can smell a template from a mile away.

Keep it tight:
- DM: 2-4 sentences. One clear why-now hook, one soft ask.
- InMail: 3-5 sentences. One paragraph of context, one of the ask.
- Email: 4-7 sentences, subject line + body. Plain prose. No marketing headers.

Never invent details you don't have. If you're short on context, stay short in the message. Don't fabricate common connections or mutual interests.`;

async function fetchWorkspaceVoice(
  workspaceId: string,
): Promise<string | null> {
  const db = getSupabase();
  const { data } = await db
    .from("voice_guide")
    .select("content, sort_order")
    .eq("category", "principle")
    .eq("workspace_id", workspaceId)
    .is("client_id", null)
    .order("sort_order", { ascending: true });

  if (data && data.length > 0) {
    return (data as { content: string }[]).map((r) => r.content).join("\n\n");
  }
  return null;
}

function outputConstraint(kind: "dm" | "inmail" | "email"): string {
  switch (kind) {
    case "dm":
      return "Output only the DM body. No preamble, no greeting fluff, no signature. One block of text.";
    case "inmail":
      return "Output only the InMail body. Include a subject line on the first line prefixed with 'Subject: '. Then a blank line, then the body.";
    case "email":
      return "Output only the email. Include a subject line on the first line prefixed with 'Subject: '. Then a blank line, then the body. Sign off with just a first name in brackets like [Your name].";
  }
}

export async function draftOutreachForLead(params: {
  leadId: string;
  kind: "dm" | "inmail" | "email";
  angle: string;
}): Promise<{ id: string; body: string } | null> {
  const db = getSupabase();

  const { data: leadRow } = await db
    .from("ops_leads")
    .select("id, workspace_id, name, company, linkedin_url, notes, source")
    .eq("id", params.leadId)
    .maybeSingle();

  if (!leadRow) return null;
  const lead = leadRow as Lead;

  const { data: outreachRows } = await db
    .from("ops_outreach")
    .select("kind, direction, subject, body, completed_at")
    .eq("lead_id", lead.id)
    .order("completed_at", { ascending: false, nullsFirst: false })
    .limit(5);
  const history =
    (outreachRows as {
      kind: string;
      direction: string;
      subject: string | null;
      body: string | null;
      completed_at: string | null;
    }[]) ?? [];

  const voice = await fetchWorkspaceVoice(lead.workspace_id);
  const voiceBlock = voice
    ? `\n\n---\n\n## Workspace voice guide\n\n${voice}`
    : "";

  const historyBlock =
    history.length > 0
      ? `Recent touches (most recent first):\n${history
          .map((h) => {
            const when = h.completed_at
              ? new Date(h.completed_at).toLocaleDateString()
              : "";
            return `- ${when} ${h.direction} ${h.kind}${h.subject ? ` (${h.subject})` : ""}${h.body ? `: ${h.body.slice(0, 200)}` : ""}`;
          })
          .join("\n")}`
      : "No prior touches. This is first-contact.";

  const userContent = [
    `Lead: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
    lead.linkedin_url ? `LinkedIn: ${lead.linkedin_url}` : null,
    lead.source ? `How they came in: ${lead.source.replace("_", " ")}` : null,
    lead.notes ? `Operator notes:\n${lead.notes}` : null,
    historyBlock,
    `Angle for this message: ${params.angle}`,
    outputConstraint(params.kind),
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await opsCreateMessage(
    { workspaceId: lead.workspace_id, clientId: null },
    {
      model: SONNET_MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT_OVERLAY + voiceBlock,
      messages: [{ role: "user", content: userContent }],
    },
  );

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") return null;
  const body = block.text.trim();

  const { data: inserted, error } = await db
    .from("ops_outreach_drafts")
    .insert({
      workspace_id: lead.workspace_id,
      lead_id: lead.id,
      kind: params.kind,
      draft_body: body,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !inserted) return null;
  return { id: (inserted as { id: string }).id, body };
}
