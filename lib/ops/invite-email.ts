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

function defaultFrom(
  brandName: string | null,
  sender?: { name?: string | null; address?: string | null },
): string {
  const name = sender?.name || brandName || "Hi Low Ops";
  const addr = sender?.address || "hello@hilowstudio.dev";
  return `${name} <${addr}>`;
}

type InviteContext = {
  email: string;
  token: string;
  scope: "workspace" | "client";
  scopeId: string;
  role: string;
  inviterEmail?: string | null;
};

type Scope =
  | {
      kind: "workspace";
      name: string;
      brandName: string | null;
      senderName: string | null;
      senderAddress: string | null;
    }
  | {
      kind: "client";
      clientName: string;
      workspaceName: string;
      brandName: string | null;
      senderName: string | null;
      senderAddress: string | null;
    };

async function loadScopeLabel(
  scope: InviteContext["scope"],
  scopeId: string,
): Promise<Scope | null> {
  const db = getSupabase();
  if (scope === "workspace") {
    const { data } = await db
      .from("ops_workspaces")
      .select("name, brand_name, email_from_name, email_from_address")
      .eq("id", scopeId)
      .maybeSingle();
    if (!data) return null;
    const row = data as {
      name: string;
      brand_name: string | null;
      email_from_name: string | null;
      email_from_address: string | null;
    };
    return {
      kind: "workspace",
      name: row.name,
      brandName: row.brand_name,
      senderName: row.email_from_name,
      senderAddress: row.email_from_address,
    };
  }
  const { data } = await db
    .from("ops_clients")
    .select(
      "name, ops_workspaces(name, brand_name, email_from_name, email_from_address)",
    )
    .eq("id", scopeId)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as {
    name: string;
    ops_workspaces: {
      name: string;
      brand_name: string | null;
      email_from_name: string | null;
      email_from_address: string | null;
    } | null;
  };
  return {
    kind: "client",
    clientName: row.name,
    workspaceName: row.ops_workspaces?.name ?? "your agency",
    brandName: row.ops_workspaces?.brand_name ?? null,
    senderName: row.ops_workspaces?.email_from_name ?? null,
    senderAddress: row.ops_workspaces?.email_from_address ?? null,
  };
}

/**
 * Sends an invite email. Never throws if Resend isn't configured or fails —
 * returns a reason so the caller can surface a fallback (copy-the-link UX).
 */
export async function sendInviteEmail(
  ctx: InviteContext,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, reason: "RESEND_API_KEY not configured" };
  }

  const scopeLabel = await loadScopeLabel(ctx.scope, ctx.scopeId);
  if (!scopeLabel) {
    return { ok: false, reason: "Scope not found" };
  }

  const link = `${platformOrigin()}/app/invite/${ctx.token}`;

  const headline =
    scopeLabel.kind === "workspace"
      ? `You're invited to ${scopeLabel.brandName || scopeLabel.name}`
      : `You're invited to ${scopeLabel.clientName}`;

  const subline =
    scopeLabel.kind === "workspace"
      ? `Join as ${ctx.role.replace("_", " ")}. Accept below to set a password and sign in.`
      : `You'll see ${scopeLabel.clientName}'s content + briefs inside ${scopeLabel.brandName || scopeLabel.workspaceName}.`;

  const brandName =
    scopeLabel.kind === "workspace"
      ? scopeLabel.brandName
      : scopeLabel.brandName;

  try {
    await getResend().emails.send({
      from: defaultFrom(brandName, {
        name: scopeLabel.senderName,
        address: scopeLabel.senderAddress,
      }),
      to: ctx.email,
      subject: headline,
      html: `
        <div style="font-family: Georgia, serif; color: #333; max-width: 560px; margin: 0 auto;">
          <h2 style="font-weight: 400; margin-bottom: 4px;">${headline}</h2>
          <p style="margin-top: 8px;">${subline}</p>
          <p style="margin: 28px 0;">
            <a href="${link}" style="display: inline-block; background: #1f1b16; color: #faf7f1; padding: 12px 20px; border-radius: 6px; text-decoration: none;">Accept invite</a>
          </p>
          <p style="color: #888; font-size: 13px;">If the button doesn't work, paste this into your browser:<br/>
            <a href="${link}" style="color: #7a5c3e; word-break: break-all;">${link}</a>
          </p>
          ${ctx.inviterEmail ? `<p style="color: #888; font-size: 13px; margin-top: 24px;">Sent by ${ctx.inviterEmail}.</p>` : ""}
        </div>
      `,
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Resend send failed",
    };
  }
}
