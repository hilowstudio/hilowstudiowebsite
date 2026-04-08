"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { ContentPost, FunnelStage, ContentPillar } from "@/lib/types/database";
import { FUNNEL_STAGES, FLYWHEEL_TARGET, getISOWeek, CONTENT_PILLARS } from "@/lib/content-strategy";

interface CalendarData {
  scheduled: ContentPost[];
  unscheduled: ContentPost[];
  week: { year: number; week: number; start: string; end: string };
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getFunnelColor(stage: FunnelStage | null): string {
  const found = FUNNEL_STAGES.find((f) => f.value === stage);
  return found?.colorClass || "bg-paper-muted text-ink-muted";
}

export default function CalendarPage() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    return getISOWeek(now);
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/content/calendar?year=${currentWeek.year}&week=${currentWeek.week}`
    );
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }, [currentWeek]);

  useEffect(() => {
    load();
  }, [load]);

  function prevWeek() {
    setCurrentWeek((prev) => {
      if (prev.week <= 1) return { year: prev.year - 1, week: 52 };
      return { ...prev, week: prev.week - 1 };
    });
  }

  function nextWeek() {
    setCurrentWeek((prev) => {
      if (prev.week >= 52) return { year: prev.year + 1, week: 1 };
      return { ...prev, week: prev.week + 1 };
    });
  }

  // Group scheduled posts by day of week (0=Mon .. 6=Sun)
  function getPostsByDay(): ContentPost[][] {
    const days: ContentPost[][] = Array.from({ length: 7 }, () => []);
    if (!data) return days;

    for (const post of data.scheduled) {
      if (post.scheduled_at) {
        const d = new Date(post.scheduled_at);
        const dayIdx = (d.getUTCDay() + 6) % 7; // Convert Sun=0 to Mon=0
        days[dayIdx].push(post);
      }
    }
    return days;
  }

  // Compute flywheel counts for this week
  function getFlywheelCounts(): Record<FunnelStage, number> {
    const counts: Record<FunnelStage, number> = { tofu: 0, mofu: 0, bofu: 0 };
    if (!data) return counts;

    const allPosts = [...data.scheduled, ...data.unscheduled];
    for (const post of allPosts) {
      if (post.funnel_stage && post.funnel_stage in counts) {
        counts[post.funnel_stage as FunnelStage]++;
      }
    }
    return counts;
  }

  const postsByDay = getPostsByDay();
  const flywheel = getFlywheelCounts();

  const weekDates = data
    ? Array.from({ length: 7 }, (_, i) => {
        const start = new Date(data.week.start);
        return new Date(start.getTime() + i * 86400000);
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Content Calendar</h1>
        <Link
          href="/admin/content/new"
          className="px-3 py-1.5 rounded-md bg-ink text-paper text-sm hover:bg-ink-muted transition-colors"
        >
          New post
        </Link>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={prevWeek}
          className="px-3 py-1.5 rounded-md border border-paper-muted text-sm text-ink-muted hover:text-ink hover:bg-paper-warm transition-colors"
          aria-label="Previous week"
        >
          &larr;
        </button>
        <span className="text-sm text-ink font-medium">
          {currentWeek.year} · W{String(currentWeek.week).padStart(2, "0")}
          {weekDates.length > 0 && (
            <span className="text-ink-light ml-2">
              {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" – "}
              {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </span>
        <button
          onClick={nextWeek}
          className="px-3 py-1.5 rounded-md border border-paper-muted text-sm text-ink-muted hover:text-ink hover:bg-paper-warm transition-colors"
          aria-label="Next week"
        >
          &rarr;
        </button>
      </div>

      {/* Flywheel indicator */}
      <section className="rounded-lg border border-paper-muted p-4">
        <h2 className="text-xs text-ink-muted uppercase tracking-wide mb-3">
          Weekly Flywheel (4·2·1)
        </h2>
        <div className="flex gap-6">
          {(["tofu", "mofu", "bofu"] as FunnelStage[]).map((stage) => {
            const count = flywheel[stage];
            const target = FLYWHEEL_TARGET[stage];
            const met = count >= target;
            return (
              <div key={stage} className="flex items-center gap-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs ${getFunnelColor(stage)}`}
                >
                  {stage.toUpperCase()}
                </span>
                <span className={`text-sm font-medium ${met ? "text-moss" : "text-ink-muted"}`}>
                  {count}
                  <span className="text-ink-light">/{target}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Day grid */}
      {loading ? (
        <p className="text-ink-light text-sm py-8">Loading...</p>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {DAY_LABELS.map((label, idx) => (
            <div key={label} className="space-y-2">
              <div className="text-center">
                <p className="text-xs text-ink-muted uppercase tracking-wide">{label}</p>
                {weekDates[idx] && (
                  <p className="text-xs text-ink-light">
                    {weekDates[idx].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>
              <div className="min-h-[120px] rounded-lg border border-paper-muted/60 bg-paper-warm/30 p-2 space-y-2">
                {postsByDay[idx].map((post) => (
                  <Link
                    key={post.id}
                    href={`/admin/content/${post.id}`}
                    className="block rounded-md border border-paper-muted bg-paper p-2 hover:border-clay/40 transition-colors"
                  >
                    <p className="text-xs text-ink line-clamp-2">
                      {post.title || post.body.slice(0, 60)}
                    </p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {post.funnel_stage && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getFunnelColor(post.funnel_stage)}`}>
                          {post.funnel_stage.toUpperCase()}
                        </span>
                      )}
                      {post.content_pillar && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          CONTENT_PILLARS.find((p) => p.value === post.content_pillar)?.colorClass || ""
                        }`}>
                          {CONTENT_PILLARS.find((p) => p.value === post.content_pillar)?.shortLabel}
                        </span>
                      )}
                      {post.hook_type && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-paper-muted text-ink-muted">
                          {post.hook_type}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unscheduled drafts for this week */}
      {data && data.unscheduled.length > 0 && (
        <section>
          <h2 className="text-xs text-ink-muted uppercase tracking-wide mb-3">
            Unscheduled This Week
          </h2>
          <div className="space-y-2">
            {data.unscheduled.map((post) => (
              <Link
                key={post.id}
                href={`/admin/content/${post.id}`}
                className="flex items-center justify-between rounded-lg border border-paper-muted p-3 hover:bg-paper-warm/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink truncate">
                    {post.title || post.body.slice(0, 80)}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {post.funnel_stage && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${getFunnelColor(post.funnel_stage)}`}>
                        {post.funnel_stage.toUpperCase()}
                      </span>
                    )}
                    {post.content_pillar && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        CONTENT_PILLARS.find((p) => p.value === post.content_pillar)?.colorClass || ""
                      }`}>
                        {CONTENT_PILLARS.find((p) => p.value === post.content_pillar)?.shortLabel}
                      </span>
                    )}
                    {post.hook_type && (
                      <span className="text-xs text-ink-light">{post.hook_type}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-ink-muted shrink-0 ml-4">draft</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
