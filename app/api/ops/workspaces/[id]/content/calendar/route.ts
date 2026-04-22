import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireWorkspace } from "@/lib/ops/workspace-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const guard = await requireWorkspace(request, id);
  if (!guard.ok) return guard.response;

  const { searchParams } = request.nextUrl;
  const yearParam = searchParams.get("year");
  const weekParam = searchParams.get("week");

  if (!yearParam || !weekParam) {
    return NextResponse.json(
      { error: "year and week are required" },
      { status: 400 },
    );
  }

  const year = parseInt(yearParam, 10);
  const week = parseInt(weekParam, 10);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const mondayOfWeek1 = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000);
  const weekStart = new Date(mondayOfWeek1.getTime() + (week - 1) * 7 * 86400000);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

  const { data: scheduled, error } = await supabase
    .from("content_posts")
    .select("*")
    .eq("workspace_id", id)
    .is("client_id", null)
    .gte("scheduled_at", weekStart.toISOString())
    .lt("scheduled_at", weekEnd.toISOString())
    .order("scheduled_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: unscheduled } = await supabase
    .from("content_posts")
    .select("*")
    .eq("workspace_id", id)
    .is("client_id", null)
    .eq("week_number", week)
    .is("scheduled_at", null)
    .in("status", ["draft"]);

  return NextResponse.json({
    scheduled: scheduled ?? [],
    unscheduled: unscheduled ?? [],
    week: {
      year,
      week,
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    },
  });
}
