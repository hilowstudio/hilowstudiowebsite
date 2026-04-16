import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { project_id, phase_id, title, next_up } = body as {
    project_id?: string;
    phase_id?: string | null;
    title?: string;
    next_up?: boolean;
  };

  if (!project_id || !title) {
    return NextResponse.json(
      { error: "project_id and title required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("studio_tasks")
    .insert({
      project_id,
      phase_id: phase_id || null,
      title,
      next_up: next_up === true,
      done: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
