import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";
import {
  addDomainToVercel,
  getDomainStatus,
  normalizeDomain,
  removeDomainFromVercel,
  verifyDomainOnVercel,
} from "@/lib/ops/domains";

async function requireOwner(
  request: NextRequest,
  workspaceId: string,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (
    !hasWorkspaceAccess(
      user.memberships,
      workspaceId,
      "owner",
      user.isPlatformAdmin,
    )
  ) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gate = await requireOwner(request, id);
  if (!gate.ok) return gate.response;

  const { data } = await supabase
    .from("ops_workspaces")
    .select("custom_domain, domain_verified_at")
    .eq("id", id)
    .maybeSingle();
  const row = data as {
    custom_domain: string | null;
    domain_verified_at: string | null;
  } | null;

  if (!row?.custom_domain) {
    return NextResponse.json({ domain: null, status: null });
  }

  let status = null;
  try {
    status = await getDomainStatus(row.custom_domain);
  } catch (err) {
    return NextResponse.json({
      domain: row.custom_domain,
      verified_at: row.domain_verified_at,
      status: null,
      error: err instanceof Error ? err.message : "Vercel lookup failed",
    });
  }
  return NextResponse.json({
    domain: row.custom_domain,
    verified_at: row.domain_verified_at,
    status,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gate = await requireOwner(request, id);
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as { domain?: string };
  if (!body.domain?.trim()) {
    return NextResponse.json({ error: "domain required" }, { status: 400 });
  }
  const domain = normalizeDomain(body.domain);

  let result;
  try {
    result = await addDomainToVercel(domain);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Vercel add failed" },
      { status: 502 },
    );
  }

  await supabase
    .from("ops_workspaces")
    .update({ custom_domain: domain, domain_verified_at: null })
    .eq("id", id);

  return NextResponse.json(result, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gate = await requireOwner(request, id);
  if (!gate.ok) return gate.response;

  const { data } = await supabase
    .from("ops_workspaces")
    .select("custom_domain")
    .eq("id", id)
    .maybeSingle();
  const domain = (data as { custom_domain: string | null } | null)
    ?.custom_domain;
  if (!domain) {
    return NextResponse.json({ error: "No domain set" }, { status: 400 });
  }

  let result;
  try {
    result = await verifyDomainOnVercel(domain);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verify failed" },
      { status: 502 },
    );
  }

  if (result.verified) {
    await supabase
      .from("ops_workspaces")
      .update({ domain_verified_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json(result);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gate = await requireOwner(request, id);
  if (!gate.ok) return gate.response;

  const { data } = await supabase
    .from("ops_workspaces")
    .select("custom_domain")
    .eq("id", id)
    .maybeSingle();
  const domain = (data as { custom_domain: string | null } | null)
    ?.custom_domain;

  if (domain) {
    try {
      await removeDomainFromVercel(domain);
    } catch {
      // Continue even if Vercel removal fails — the DB state should drop
    }
  }

  await supabase
    .from("ops_workspaces")
    .update({ custom_domain: null, domain_verified_at: null })
    .eq("id", id);

  return new NextResponse(null, { status: 204 });
}
