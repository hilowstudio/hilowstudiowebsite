import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { project_id, body: noteBody } = body as {
    project_id?: string;
    body?: string;
  };

  if (!project_id || !noteBody?.trim()) {
    return NextResponse.json(
      { error: "project_id and body required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("studio_notes")
    .insert({
      project_id,
      body: noteBody,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
