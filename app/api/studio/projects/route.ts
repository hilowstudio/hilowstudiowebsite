import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";
import { uniqueProjectSlug } from "@/lib/studio/slug";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const includeArchived =
    request.nextUrl.searchParams.get("archived") === "true";

  let query = supabase
    .from("studio_projects")
    .select("*, studio_clients(name)")
    .order("last_movement_at", { ascending: false });

  if (!includeArchived) {
    query = query.neq("status", "archived");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

type PhaseSeed = { name: string; deliverables?: string[] };

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, client_id, rate_cents, phases } = body as {
    name?: string;
    client_id?: string | null;
    rate_cents?: number | null;
    phases?: PhaseSeed[];
  };

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const slug = await uniqueProjectSlug(name);

  const { data: project, error } = await supabase
    .from("studio_projects")
    .insert({
      name,
      slug,
      client_id: client_id || null,
      rate_cents: typeof rate_cents === "number" ? rate_cents : null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const seedPhases = Array.isArray(phases) && phases.length
    ? phases
    : [
        { name: "Discovery" },
        { name: "Design" },
        { name: "Build" },
        { name: "Handoff" },
      ];

  const phaseRows = seedPhases.map((phase, index) => ({
    project_id: project.id,
    name: phase.name,
    position: index,
    is_current: index === 0,
  }));

  const { data: insertedPhases, error: phasesError } = await supabase
    .from("studio_phases")
    .insert(phaseRows)
    .select();

  if (phasesError) {
    return NextResponse.json({ error: phasesError.message }, { status: 500 });
  }

  const deliverableRows: {
    phase_id: string;
    title: string;
    position: number;
  }[] = [];

  for (let i = 0; i < seedPhases.length; i++) {
    const seed = seedPhases[i];
    const inserted = insertedPhases?.[i];
    if (!inserted || !seed.deliverables) continue;
    seed.deliverables.forEach((title, idx) => {
      if (title.trim()) {
        deliverableRows.push({
          phase_id: inserted.id,
          title: title.trim(),
          position: idx,
        });
      }
    });
  }

  if (deliverableRows.length) {
    await supabase.from("studio_deliverables").insert(deliverableRows);
  }

  return NextResponse.json(project, { status: 201 });
}
