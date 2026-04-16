import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const runningOnly = request.nextUrl.searchParams.get("running") === "true";

  let query = supabase
    .from("studio_time_entries")
    .select("*, studio_projects(name)")
    .order("started_at", { ascending: false });

  if (runningOnly) {
    query = query.is("ended_at", null);
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

  const body = (await request.json()) as {
    project_id?: string;
    started_at?: string;
    ended_at?: string | null;
    description?: string | null;
    rate_cents?: number | null;
  };

  if (!body.project_id) {
    return NextResponse.json({ error: "project_id required" }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabase
    .from("studio_projects")
    .select("rate_cents, client_id, studio_clients(default_rate_cents)")
    .eq("id", body.project_id)
    .maybeSingle();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const projectRow = project as unknown as {
    rate_cents: number | null;
    client_id: string | null;
    studio_clients: { default_rate_cents: number | null } | null;
  };

  const rate =
    body.rate_cents !== undefined && body.rate_cents !== null
      ? body.rate_cents
      : (projectRow.rate_cents ??
        projectRow.studio_clients?.default_rate_cents ??
        null);

  const { data: existingRunning } = await supabase
    .from("studio_time_entries")
    .select("id")
    .is("ended_at", null);

  if (!body.ended_at && existingRunning && existingRunning.length > 0) {
    return NextResponse.json(
      {
        error: "A timer is already running. Stop it first.",
        running_id: existingRunning[0].id,
      },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("studio_time_entries")
    .insert({
      project_id: body.project_id,
      started_at: body.started_at || new Date().toISOString(),
      ended_at: body.ended_at || null,
      description: body.description || null,
      rate_cents: rate,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
