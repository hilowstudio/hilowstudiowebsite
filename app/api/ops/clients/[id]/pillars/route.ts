import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasClientAccess } from "@/lib/ops/scope";

async function loadClient(clientId: string) {
  const { data } = await supabase
    .from("ops_clients")
    .select("id, workspace_id")
    .eq("id", clientId)
    .maybeSingle();
  return data as { id: string; workspace_id: string } | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const client = await loadClient(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasClientAccess(
      user.memberships,
      client.id,
      client.workspace_id,
      "client_viewer",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await supabase
    .from("content_pillars")
    .select("*")
    .eq("client_id", client.id)
    .order("sort_order", { ascending: true });

  return NextResponse.json(data ?? []);
}

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const client = await loadClient(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !hasClientAccess(
      user.memberships,
      client.id,
      client.workspace_id,
      "client_contributor",
      user.isPlatformAdmin,
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    label?: string;
    short_label?: string;
    description?: string;
    funnel_role?: string;
    color_class?: string;
    sort_order?: number;
  };
  if (!body.label?.trim()) {
    return NextResponse.json({ error: "label required" }, { status: 400 });
  }

  const slug = slugify(body.label);

  const { data, error } = await supabase
    .from("content_pillars")
    .insert({
      workspace_id: client.workspace_id,
      client_id: client.id,
      slug,
      label: body.label.trim(),
      short_label: body.short_label?.trim() || body.label.trim().slice(0, 24),
      description: body.description?.trim() || "",
      funnel_role: body.funnel_role?.trim() || "TOFU",
      color_class: body.color_class?.trim() || "bg-clay/15 text-clay",
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
