import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentUserFromRequest } from "@/lib/ops/auth";

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

async function uniqueSlug(base: string): Promise<string> {
  const { data } = await supabase
    .from("ops_workspaces")
    .select("slug")
    .like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user || !user.isPlatformAdmin) {
    return NextResponse.json(
      { error: "Only platform admins can create workspaces" },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    brand_name?: string;
    billing_email?: string;
    primary_color?: string;
    logo_url?: string;
    plan?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const slug = await uniqueSlug(slugify(body.name) || "workspace");

  const { data, error } = await supabase
    .from("ops_workspaces")
    .insert({
      slug,
      name: body.name.trim(),
      brand_name: body.brand_name?.trim() || null,
      billing_email: body.billing_email?.trim() || null,
      primary_color: body.primary_color?.trim() || null,
      logo_url: body.logo_url?.trim() || null,
      plan: body.plan || "starter",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
