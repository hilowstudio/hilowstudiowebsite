import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const showProcessed =
    request.nextUrl.searchParams.get("processed") === "true";

  let query = supabase
    .from("studio_inbox_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (!showProcessed) {
    query = query.eq("processed", false);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { body } = (await request.json()) as { body?: string };

  if (!body?.trim()) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("studio_inbox_items")
    .insert({ body: body.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
