import { Resend } from "resend";
import { getSupabase } from "@/lib/supabase";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Missing RESEND_API_KEY env var");
  _resend = new Resend(key);
  return _resend;
}

function platformOrigin(): string {
  return (
    process.env.OPS_PUBLIC_ORIGIN ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://hilowstudio.dev"
  );
}

type ProspectRow = {
  id: string;
  score: number;
  reasons: string[];
  ops_network_contacts: {
    name: string | null;
    company: string | null;
    linkedin_url: string | null;
  } | null;
};

export async function sendWarmProspectDigest(
  clientId: string,
): Promise<{ sent: boolean; recipients: number; prospects: number }> {
  const db = getSupabase();

  const { data: clientRow } = await db
    .from("ops_clients")
    .select("id, slug, name, workspace_id, ops_workspaces(brand_name, name, email_from_name, email_from_address)")
    .eq("id", clientId)
    .maybeSingle();
  if (!clientRow) return { sent: false, recipients: 0, prospects: 0 };

  const client = clientRow as unknown as {
    id: string;
    slug: string;
    name: string;
    workspace_id: string;
    ops_workspaces: {
      brand_name: string | null;
      name: string;
      email_from_name: string | null;
      email_from_address: string | null;
    } | null;
  };

  const { data: prospects } = await db
    .from("ops_warm_prospects")
    .select(
      "id, score, reasons, ops_network_contacts(name, company, linkedin_url)",
    )
    .eq("client_id", clientId)
    .is("dismissed_at", null)
    .order("score", { ascending: false })
    .limit(10);

  const rows = (prospects as unknown as ProspectRow[]) ?? [];
  if (rows.length === 0) return { sent: false, recipients: 0, prospects: 0 };

  // Recipients: client_owner + client_contributor for this client, plus
  // workspace_owner/staff as a CC (workspace is the agency driving outreach).
  const { data: clientMembers } = await db
    .from("ops_client_members")
    .select("user_id, role, ops_users(email, name)")
    .eq("client_id", clientId)
    .in("role", ["client_owner", "client_contributor"]);

  const { data: workspaceMembers } = await db
    .from("ops_workspace_members")
    .select("user_id, role, ops_users(email, name)")
    .eq("workspace_id", client.workspace_id);

  const clientRecipients = ((clientMembers ?? []) as unknown as {
    ops_users: { email: string; name: string | null } | null;
  }[])
    .map((m) => m.ops_users?.email)
    .filter((e): e is string => Boolean(e));

  const workspaceRecipients = ((workspaceMembers ?? []) as unknown as {
    ops_users: { email: string; name: string | null } | null;
  }[])
    .map((m) => m.ops_users?.email)
    .filter((e): e is string => Boolean(e));

  const recipients = Array.from(
    new Set([...clientRecipients, ...workspaceRecipients]),
  );

  if (recipients.length === 0 || !process.env.RESEND_API_KEY) {
    return { sent: false, recipients: recipients.length, prospects: rows.length };
  }

  const brand =
    client.ops_workspaces?.brand_name ||
    client.ops_workspaces?.name ||
    "Hi Low Ops";
  const fromAddress =
    client.ops_workspaces?.email_from_address || "hello@hilowstudio.dev";
  const fromName = client.ops_workspaces?.email_from_name || brand;

  const listHtml = rows
    .map((row) => {
      const name = row.ops_network_contacts?.name || "Unknown contact";
      const company = row.ops_network_contacts?.company ?? "";
      const url = row.ops_network_contacts?.linkedin_url;
      return `
        <li style="padding: 12px 0; border-bottom: 1px solid #e5e0d8;">
          <div style="font-size: 15px; color: #333;">
            ${url ? `<a href="${url}" style="color: #1f1b16; text-decoration: none;">${name}</a>` : name}
            ${company ? `<span style="color: #888;"> &middot; ${company}</span>` : ""}
          </div>
          <div style="font-size: 13px; color: #888; margin-top: 4px;">
            Score: ${row.score} &middot; ${row.reasons.slice(0, 3).join(" &middot; ")}
          </div>
        </li>
      `;
    })
    .join("");

  const portalLink = `${platformOrigin()}/c/${client.slug}`;

  await getResend().emails.send({
    from: `${fromName} <${fromAddress}>`,
    to: recipients,
    subject: `Warm prospects for ${client.name}`,
    html: `
      <div style="font-family: Georgia, serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="font-weight: 400; margin-bottom: 4px;">Warm prospects — ${client.name}</h2>
        <p style="color: #888; margin-top: 4px;">Top people engaging with content or competitors this week.</p>
        <ol style="list-style: none; padding: 0; margin: 20px 0;">${listHtml}</ol>
        <p style="margin-top: 24px;">
          <a href="${portalLink}" style="color: #7a5c3e;">Open in ${brand} →</a>
        </p>
      </div>
    `,
  });

  return { sent: true, recipients: recipients.length, prospects: rows.length };
}
