import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticatedRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const yearParam = searchParams.get("year");
  const weekParam = searchParams.get("week");

  if (!yearParam || !weekParam) {
    return NextResponse.json({ error: "year and week are required" }, { status: 400 });
  }

  const year = parseInt(yearParam, 10);
  const week = parseInt(weekParam, 10);

  // Compute Monday of the given ISO week
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const mondayOfWeek1 = new Date(jan4.getTime() - (dayOfWeek - 1) * 86400000);
  const weekStart = new Date(mondayOfWeek1.getTime() + (week - 1) * 7 * 86400000);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .gte("scheduled_at", weekStart.toISOString())
    .lt("scheduled_at", weekEnd.toISOString())
    .order("scheduled_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also fetch unscheduled drafts for this week (by week_number)
  const { data: weekDrafts } = await supabase
    .from("content_posts")
    .select("*")
    .eq("week_number", week)
    .is("scheduled_at", null)
    .in("status", ["draft"]);

  return NextResponse.json({
    scheduled: data || [],
    unscheduled: weekDrafts || [],
    week: { year, week, start: weekStart.toISOString(), end: weekEnd.toISOString() },
  });
}
