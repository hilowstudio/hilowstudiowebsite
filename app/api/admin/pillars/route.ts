import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { invalidatePillarCache } from "@/lib/pillars";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("content_pillars")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      { status: 400 }
    );
  }

  // Delete existing and replace
  await supabase.from("content_pillars").delete().neq("slug", "");

  const { data, error } = await supabase
    .from("content_pillars")
    .insert(pillars)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidatePillarCache();
  return NextResponse.json(data);
}
