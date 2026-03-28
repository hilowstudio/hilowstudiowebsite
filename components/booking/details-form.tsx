"use client";

import { useState } from "react";
import { CaretLeft, PaperPlaneTilt } from "@phosphor-icons/react";

interface DetailsFormProps {
    slot: { start: string; end: string };
    date: string;
    onSubmit: (details: { name: string; email: string; message: string }) => Promise<void>;
    onBack: () => void;
    error: string | null;
    submitting: boolean;
}

function formatSlotSummary(date: string, slot: { start: string; end: string }): string {
    const dateStr = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startTime = new Date(slot.start).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: tz,
    });
    const endTime = new Date(slot.end).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: tz,
    });
    return `${dateStr}, ${startTime} \u2013 ${endTime}`;
}

export function DetailsForm({ slot, date, onSubmit, onBack, error, submitting }: DetailsFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const summary = formatSlotSummary(date, slot);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;
        onSubmit({ name, email, message });
    };

    const inputClasses =
        "w-full px-4 py-3 rounded-md border border-ink/10 bg-paper text-ink placeholder:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300";

    return (
        <div className="max-w-lg">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-6"
            >
                <CaretLeft weight="bold" className="w-3.5 h-3.5" />
                Back to times
            </button>

            {/* Selected slot summary */}
            <div className="rounded-md bg-paper-warm border border-ink/5 px-4 py-3 mb-8">
                <p className="text-xs text-ink-light mb-1">Your selected time</p>
                <p className="text-sm text-ink font-medium">{summary}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="booking-name" className="block text-sm font-medium text-ink">
                        Name <span className="text-clay">*</span>
                    </label>
                    <input
                        type="text"
                        id="booking-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Your name"
                        className={inputClasses}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="booking-email" className="block text-sm font-medium text-ink">
                        Email <span className="text-clay">*</span>
                    </label>
                    <input
                        type="email"
                        id="booking-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className={inputClasses}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="booking-message" className="block text-sm font-medium text-ink">
                        Anything we should know? <span className="text-ink-light">(optional)</span>
                    </label>
                    <textarea
                        id="booking-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder="Tell us briefly about your project or goals..."
                        className={`${inputClasses} resize-none`}
                    />
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-sm text-terracotta">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={submitting || !name || !email}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 disabled:opacity-50 transition-all duration-300"
                >
                    {submitting ? (
                        <span>Booking...</span>
                    ) : (
                        <>
                            <span>Confirm Booking</span>
                            <PaperPlaneTilt weight="regular" className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
