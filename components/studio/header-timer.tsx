"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type HeaderTimerProps = {
  timer: {
    id: string;
    project_id: string;
    project_name: string;
    started_at: string;
  } | null;
};

function formatElapsed(startIso: string): string {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(startIso).getTime()) / 1000),
  );
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export function HeaderTimer({ timer }: HeaderTimerProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timer) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  if (!timer) return null;

  return (
    <Link
      href={`/studio/projects/${timer.project_id}`}
      className="absolute left-6 top-4 flex items-center gap-1.5 text-xs text-clay hover:text-ink transition-colors"
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
      <span>{formatElapsed(timer.started_at)}</span>
      <span className="text-ink-light">· {timer.project_name}</span>
    </Link>
  );
}
