"use client";

import { useMemo } from "react";
import { CaretLeft } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface TimeSelectionProps {
    date: string;
    slots: Array<{ start: string; end: string }>;
    onSelect: (slot: { start: string; end: string }) => void;
    onBack: () => void;
}

function formatTime(isoString: string, timezone: string): string {
    return new Date(isoString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: timezone,
    });
}

function getTimezoneName(): string {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const name = new Date().toLocaleTimeString("en-US", {
            timeZoneName: "short",
            timeZone: tz,
        });
        // Extract just the timezone abbreviation (e.g., "EST", "PST")
        const match = name.match(/[A-Z]{2,5}$/);
        return match ? match[0] : tz;
    } catch {
        return "your timezone";
    }
}

export function TimeSelection({ date, slots, onSelect, onBack }: TimeSelectionProps) {
    const userTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
    const tzAbbr = useMemo(() => getTimezoneName(), []);

    const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="max-w-sm">
            {/* Back button and date header */}
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-6"
            >
                <CaretLeft weight="bold" className="w-3.5 h-3.5" />
                Back to calendar
            </button>

            <h3 className="font-serif text-lg text-ink mb-2">{formattedDate}</h3>
            <p className="text-xs text-ink-light mb-6">Select a time</p>

            {/* Time slots */}
            <div className="space-y-2">
                {slots.map((slot) => (
                    <button
                        key={slot.start}
                        onClick={() => onSelect(slot)}
                        className={cn(
                            "w-full text-left px-4 py-3 rounded-md border transition-all duration-200",
                            "border-ink/10 hover:border-clay/40 hover:bg-clay/5",
                            "text-sm text-ink"
                        )}
                    >
                        {formatTime(slot.start, userTimezone)} &ndash;{" "}
                        {formatTime(slot.end, userTimezone)}
                    </button>
                ))}
            </div>

            {/* Timezone notice */}
            <p className="text-xs text-ink-light mt-4">
                Times shown in {tzAbbr}
            </p>
        </div>
    );
}
