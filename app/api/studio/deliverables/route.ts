import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { phase_id, title, position } = body as {
    phase_id?: string;
    title?: string;
    position?: number;
  };

  if (!phase_id || !title) {
    return NextResponse.json(
      { error: "phase_id and title required" },
      { status: 400 },
    );
  }

  let resolvedPosition = position;
  if (resolvedPosition == null) {
    const { data: last } = await supabase
      .from("studio_deliverables")
      .select("position")
      .eq("phase_id", phase_id)
      .order("position", { ascending: false })
      .limit(1);
    resolvedPosition = (last?.[0]?.position ?? -1) + 1;
  }

  const { data, error } = await supabase
    .from("studio_deliverables")
    .insert({
      phase_id,
      title,
      position: resolvedPosition,
      done: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
