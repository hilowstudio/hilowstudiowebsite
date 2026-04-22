import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";
import { hasWorkspaceAccess } from "@/lib/ops/scope";

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

  const { data: workspaceTemplates } = await supabase
    .from("ops_prompt_templates")
    .select("id, slug, label, description, prompt_body, category, sort_order, workspace_id")
    .eq("workspace_id", id)
    .order("sort_order", { ascending: true });

  const { data: platformTemplates } = await supabase
    .from("ops_prompt_templates")
    .select("id, slug, label, description, prompt_body, category, sort_order, workspace_id")
    .is("workspace_id", null)
    .order("sort_order", { ascending: true });

  return NextResponse.json({
    workspace: workspaceTemplates ?? [],
    platform: platformTemplates ?? [],
  });
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
    description?: string;
    prompt_body?: string;
    category?: string;
    sort_order?: number;
  };
  if (!body.label?.trim() || !body.prompt_body?.trim()) {
    return NextResponse.json(
      { error: "label and prompt_body required" },
      { status: 400 },
    );
  }

  const slug = slugify(body.label);

  const { data, error } = await supabase
    .from("ops_prompt_templates")
    .insert({
      workspace_id: id,
      slug,
      label: body.label.trim(),
      description: body.description?.trim() || null,
      prompt_body: body.prompt_body.trim(),
      category: body.category?.trim() || "general",
      sort_order: body.sort_order ?? 100,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
