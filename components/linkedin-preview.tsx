"use client";

import { useState, useRef, useEffect } from "react";

interface LinkedInPreviewProps {
  body: string;
}

// LinkedIn's truncation behavior:
// Desktop: ~5 lines visible before "...see more" (at 552px width, 14px/20px font)
// Mobile: ~3 lines visible before "...see more"
const DESKTOP_VISIBLE_LINES = 5;
const MOBILE_VISIBLE_LINES = 3;
const LINE_HEIGHT = 20; // px

export function LinkedInPreview({ body }: LinkedInPreviewProps) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const [actualLines, setActualLines] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);

  const visibleLines =
    mode === "desktop" ? DESKTOP_VISIBLE_LINES : MOBILE_VISIBLE_LINES;
  const foldHeight = visibleLines * LINE_HEIGHT;

  useEffect(() => {
    if (measureRef.current) {
      const height = measureRef.current.scrollHeight;
      setActualLines(Math.ceil(height / LINE_HEIGHT));
    }
  }, [body, mode]);

  const isTruncated = actualLines > visibleLines;
  const containerWidth = mode === "desktop" ? 552 : 340;

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-ink-muted uppercase tracking-wide">
          Preview
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode("desktop")}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              mode === "desktop"
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setMode("mobile")}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              mode === "mobile"
                ? "bg-ink text-paper"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Mobile
          </button>
        </div>
        <span className="text-xs text-ink-light ml-auto">
          {actualLines} line{actualLines !== 1 ? "s" : ""}
          {isTruncated
            ? ` (fold at line ${visibleLines})`
            : " (no truncation)"}
        </span>
      </div>

      {/* Preview container */}
      <div
        className="rounded-lg border border-paper-muted bg-white p-4 relative overflow-hidden"
        style={{ maxWidth: containerWidth }}
      >
        {/* Simulated post text */}
        <div
          ref={measureRef}
          className="whitespace-pre-wrap break-words"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: "14px",
            lineHeight: `${LINE_HEIGHT}px`,
            color: "rgba(0,0,0,0.9)",
            width: "100%",
          }}
        >
          {body || "Start typing to see preview..."}
        </div>

        {/* Fold indicator */}
        {isTruncated && (
          <>
            {/* Gradient fade at fold point */}
            <div
              className="absolute left-0 right-0 pointer-events-none"
              style={{
                top: foldHeight - 20,
                height: 40,
                background:
                  "linear-gradient(to bottom, transparent, white)",
              }}
            />
            {/* "...see more" line */}
            <div
              className="absolute left-0 right-0 flex items-center"
              style={{ top: foldHeight }}
            >
              <div className="flex-1 border-t-2 border-dashed border-clay/40" />
              <span className="px-2 text-xs text-clay font-medium bg-white">
                ...see more
              </span>
              <div className="flex-1 border-t-2 border-dashed border-clay/40" />
            </div>
          </>
        )}
      </div>

      {/* Guidance */}
      <p className="text-xs text-ink-light">
        {isTruncated
          ? `Your hook should land before line ${visibleLines}. The strongest posts place an open loop or provocative statement right before the fold.`
          : "Your post is short enough to display fully without truncation."}
      </p>
    </div>
  );
}
