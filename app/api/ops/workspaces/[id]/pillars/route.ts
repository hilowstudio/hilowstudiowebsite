import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";
import { invalidatePillarCache } from "@/lib/pillars";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!hasWorkspaceAccess(user.memberships, id, "staff", user.isPlatformAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await supabase
    .from("content_pillars")
    .select("*")
    .eq("workspace_id", id)
    .is("client_id", null)
    .order("sort_order", { ascending: true });

  return NextResponse.json(data ?? []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!hasWorkspaceAccess(user.memberships, id, "staff", user.isPlatformAdmin)) {
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

  const { data, error } = await supabase
    .from("content_pillars")
    .insert({
      workspace_id: id,
      client_id: null,
      slug: slugify(body.label),
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
  invalidatePillarCache();
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!hasWorkspaceAccess(user.memberships, id, "staff", user.isPlatformAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pillars = (await request.json()) as {
    slug: string;
    label: string;
    short_label: string;
    description: string;
    funnel_role: string;
    color_class: string;
    sort_order: number;
  }[];

  if (!Array.isArray(pillars) || pillars.length < 3 || pillars.length > 5) {
    return NextResponse.json(
      { error: "Must provide 3-5 pillars" },
      { status: 400 },
    );
  }

  await supabase
    .from("content_pillars")
    .delete()
    .eq("workspace_id", id)
    .is("client_id", null);

  const { data, error } = await supabase
    .from("content_pillars")
    .insert(
      pillars.map((p) => ({
        ...p,
        workspace_id: id,
        client_id: null,
      })),
    )
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  invalidatePillarCache();
  return NextResponse.json(data);
}
