import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    file_to_project_id?: string | null;
    as?: "task" | "note";
    processed?: boolean;
  };

  const { data: item, error: fetchError } = await supabase
    .from("studio_inbox_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.file_to_project_id) {
    const target = body.as === "note" ? "studio_notes" : "studio_tasks";
    const payload =
      target === "studio_notes"
        ? { project_id: body.file_to_project_id, body: item.body }
        : {
            project_id: body.file_to_project_id,
            title: item.body,
            done: false,
            next_up: false,
          };

    const { error: insertError } = await supabase.from(target).insert(payload);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  const updates: Record<string, unknown> = {};
  if (body.processed !== undefined) updates.processed = body.processed;
  if (body.file_to_project_id) updates.processed = true;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(item);
  }

  const { data, error } = await supabase
    .from("studio_inbox_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("studio_inbox_items")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
