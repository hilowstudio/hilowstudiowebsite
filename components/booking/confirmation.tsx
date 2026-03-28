"use client";

import { motion } from "framer-motion";
import { Check, VideoCamera } from "@phosphor-icons/react";

interface ConfirmationProps {
    confirmation: {
        meetLink: string | null;
        start: string;
        end: string;
    };
    name: string;
}

export function Confirmation({ confirmation, name }: ConfirmationProps) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const dateStr = new Date(confirmation.start).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: tz,
    });

    const startTime = new Date(confirmation.start).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: tz,
    });

    const endTime = new Date(confirmation.end).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: tz,
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg"
        >
            <div className="rounded-lg border border-ink/10 bg-paper-warm p-8">
                {/* Success icon */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-moss/20 flex items-center justify-center">
                        <Check weight="bold" className="w-5 h-5 text-moss" />
                    </div>
                    <h3 className="text-xl">You&apos;re Booked</h3>
                </div>

                <p className="text-ink-muted text-sm mb-8">
                    Thanks, {name}. A calendar invite with a Google Meet link
                    has been sent to your email.
                </p>

                {/* Meeting details */}
                <div className="space-y-3 mb-8">
                    <div>
                        <p className="text-xs text-ink-light mb-1">Date</p>
                        <p className="text-sm text-ink font-medium">{dateStr}</p>
                    </div>
                    <div>
                        <p className="text-xs text-ink-light mb-1">Time</p>
                        <p className="text-sm text-ink font-medium">
                            {startTime} &ndash; {endTime}
                        </p>
                    </div>
                </div>

                {/* Google Meet link */}
                {confirmation.meetLink && (
                    <a
                        href={confirmation.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                    >
                        <VideoCamera weight="fill" className="w-4 h-4" />
                        Join Google Meet
                    </a>
                )}
            </div>
        </motion.div>
    );
}
