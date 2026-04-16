import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { project_id, name, position } = body as {
    project_id?: string;
    name?: string;
    position?: number;
  };

  if (!project_id || !name) {
    return NextResponse.json(
      { error: "project_id and name required" },
      { status: 400 },
    );
  }

  let resolvedPosition = position;
  if (resolvedPosition == null) {
    const { data: last } = await supabase
      .from("studio_phases")
      .select("position")
      .eq("project_id", project_id)
      .order("position", { ascending: false })
      .limit(1);
    resolvedPosition = (last?.[0]?.position ?? -1) + 1;
  }

  const { data, error } = await supabase
    .from("studio_phases")
    .insert({
      project_id,
      name,
      position: resolvedPosition,
      is_current: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
