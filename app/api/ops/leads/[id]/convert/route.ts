import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";
import { seedClientDefaults } from "@/lib/ops/onboarding";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function uniqueClientSlug(
  workspaceId: string,
  base: string,
): Promise<string> {
  const { data } = await supabase
    .from("ops_clients")
    .select("slug")
    .eq("workspace_id", workspaceId)
    .like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: leadRow } = await supabase
    .from("ops_leads")
    .select(
      "id, workspace_id, name, company, status, converted_client_id, network_contact_id",
    )
    .eq("id", id)
    .maybeSingle();
  const lead = leadRow as {
    id: string;
    workspace_id: string;
    name: string;
    company: string | null;
    status: string;
    converted_client_id: string | null;
    network_contact_id: string | null;
  } | null;
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasWorkspaceAccess(
      user.memberships,
      lead.workspace_id,
      "staff",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (lead.converted_client_id) {
    return NextResponse.json(
      { error: "Lead already converted", client_id: lead.converted_client_id },
      { status: 409 },
    );
  }

  const slug = await uniqueClientSlug(
    lead.workspace_id,
    slugify(lead.company || lead.name) || "client",
  );

  const { data: created, error: createError } = await supabase
    .from("ops_clients")
    .insert({
      workspace_id: lead.workspace_id,
      slug,
      name: lead.name,
      company: lead.company,
      status: "active",
    })
    .select("id, slug")
    .single();

  if (createError || !created) {
    return NextResponse.json(
      { error: createError?.message || "Could not create client" },
      { status: 500 },
    );
  }

  const client = created as { id: string; slug: string };

  try {
    await seedClientDefaults(client.id, lead.workspace_id);
  } catch {
    // Non-fatal; the client exists.
  }

  await supabase
    .from("ops_leads")
    .update({
      status: "converted",
      converted_client_id: client.id,
      converted_at: new Date().toISOString(),
    })
    .eq("id", lead.id);

  await supabase
    .from("ops_outreach")
    .update({ client_id: client.id })
    .eq("lead_id", lead.id);

  return NextResponse.json({
    client_id: client.id,
    client_slug: client.slug,
  });
}
