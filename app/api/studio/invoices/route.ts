import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    project_id?: string;
    number?: string | null;
    amount_cents?: number;
    state?: "draft" | "sent" | "paid" | "overdue";
    sent_at?: string | null;
    due_at?: string | null;
    paid_at?: string | null;
    notes?: string | null;
  };

  if (!body.project_id || typeof body.amount_cents !== "number") {
    return NextResponse.json(
      { error: "project_id and amount_cents required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("studio_invoices")
    .insert({
      project_id: body.project_id,
      number: body.number || null,
      amount_cents: body.amount_cents,
      state: body.state || "draft",
      sent_at: body.sent_at || null,
      due_at: body.due_at || null,
      paid_at: body.paid_at || null,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
