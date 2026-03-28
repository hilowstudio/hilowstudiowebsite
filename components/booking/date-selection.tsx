"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type AvailableDates = Record<string, Array<{ start: string; end: string }>>;

interface DateSelectionProps {
    onSelect: (date: string, slots: Array<{ start: string; end: string }>) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthString(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function getMonthDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
}

function formatDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DateSelection({ onSelect }: DateSelectionProps) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });
    const [availability, setAvailability] = useState<AvailableDates>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const today = new Date();
    const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    // Clamp navigation: don't go before current month or more than ~2 months out
    const now = new Date();
    const minMonth = { year: now.getFullYear(), month: now.getMonth() };
    const maxDate = new Date(now.getTime() + 4 * 7 * 24 * 60 * 60 * 1000);
    const maxMonth = { year: maxDate.getFullYear(), month: maxDate.getMonth() };

    const canGoBack =
        currentMonth.year > minMonth.year ||
        (currentMonth.year === minMonth.year && currentMonth.month > minMonth.month);
    const canGoForward =
        currentMonth.year < maxMonth.year ||
        (currentMonth.year === maxMonth.year && currentMonth.month < maxMonth.month);

    useEffect(() => {
        const monthStr = getMonthString(currentMonth.year, currentMonth.month);
        setLoading(true);
        setError(null);

        fetch(`/api/booking/availability?month=${monthStr}`)
            .then((r) => {
                if (!r.ok) throw new Error("Failed to load availability");
                return r.json();
            })
            .then((data) => {
                setAvailability(data.availableDates || {});
                setLoading(false);
            })
            .catch(() => {
                setError("Could not load availability. Please try again.");
                setLoading(false);
            });
    }, [currentMonth]);

    const { firstDay, daysInMonth } = getMonthDays(currentMonth.year, currentMonth.month);

    const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });

    const handlePrevMonth = () => {
        if (!canGoBack) return;
        setCurrentMonth((prev) => {
            if (prev.month === 0) return { year: prev.year - 1, month: 11 };
            return { year: prev.year, month: prev.month - 1 };
        });
    };

    const handleNextMonth = () => {
        if (!canGoForward) return;
        setCurrentMonth((prev) => {
            if (prev.month === 11) return { year: prev.year + 1, month: 0 };
            return { year: prev.year, month: prev.month + 1 };
        });
    };

    const handleDayClick = (day: number) => {
        const dateKey = formatDateKey(currentMonth.year, currentMonth.month, day);
        const slots = availability[dateKey];
        if (slots && slots.length > 0) {
            onSelect(dateKey, slots);
        }
    };

    // Build the calendar grid cells
    const cells: Array<{ day: number | null; key: string }> = [];
    for (let i = 0; i < firstDay; i++) {
        cells.push({ day: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, key: `day-${d}` });
    }

    return (
        <div className="w-full max-w-lg">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={handlePrevMonth}
                    disabled={!canGoBack}
                    className="p-2 rounded-md hover:bg-ink/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous month"
                >
                    <CaretLeft weight="bold" className="w-4 h-4 text-ink" />
                </button>
                <h3 className="font-serif text-xl text-ink">{monthName}</h3>
                <button
                    onClick={handleNextMonth}
                    disabled={!canGoForward}
                    className="p-2 rounded-md hover:bg-ink/5 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next month"
                >
                    <CaretRight weight="bold" className="w-4 h-4 text-ink" />
                </button>
            </div>

            {/* Calendar grid */}
            <div
                className="rounded-lg border border-ink/5 bg-paper-warm p-5 md:p-6"
                role="grid"
                aria-label={`Calendar for ${monthName}`}
            >
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-3" role="row">
                    {DAY_LABELS.map((label) => (
                        <div
                            key={label}
                            className="text-center text-sm text-ink-light py-2"
                            role="columnheader"
                        >
                            {label}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div
                    className="grid grid-cols-7 border-t border-l border-ink/10"
                    role="rowgroup"
                >
                    {cells.map(({ day, key }) => {
                        if (day === null) {
                            return (
                                <div
                                    key={key}
                                    className="aspect-square border-r border-b border-ink/10"
                                />
                            );
                        }

                        const dateKey = formatDateKey(
                            currentMonth.year,
                            currentMonth.month,
                            day
                        );
                        const hasSlots = availability[dateKey]?.length > 0;
                        const isToday = dateKey === todayKey;

                        return (
                            <button
                                key={key}
                                onClick={() => handleDayClick(day)}
                                disabled={!hasSlots || loading}
                                aria-label={`${day} ${monthName}${hasSlots ? ", available" : ", unavailable"}`}
                                aria-disabled={!hasSlots}
                                className={cn(
                                    "aspect-square flex flex-col items-end justify-start p-1.5 text-sm transition-all duration-200 relative border-r border-b border-ink/10",
                                    hasSlots && !loading
                                        ? "text-ink hover:bg-clay/10 hover:text-clay cursor-pointer font-medium"
                                        : "bg-dither text-ink-light/40 cursor-not-allowed",
                                    isToday && "underline underline-offset-2 decoration-clay"
                                )}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>

                {/* Loading overlay */}
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center py-4"
                    >
                        <p className="text-xs text-ink-light">Loading availability...</p>
                    </motion.div>
                )}

                {/* Error state */}
                {error && (
                    <p className="text-xs text-terracotta text-center py-4">{error}</p>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-ink-light">
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm border border-ink/10 bg-paper-warm" />
                    Available
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm border border-ink/10 bg-dither" />
                    Unavailable
                </span>
            </div>
        </div>
    );
}
