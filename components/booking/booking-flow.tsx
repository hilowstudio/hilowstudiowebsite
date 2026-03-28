"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DateSelection } from "./date-selection";
import { TimeSelection } from "./time-selection";
import { DetailsForm } from "./details-form";
import { Confirmation } from "./confirmation";
import { cn } from "@/lib/utils";

type BookingState = {
    step: 1 | 2 | 3 | 4;
    selectedDate: string | null;
    selectedSlots: Array<{ start: string; end: string }>;
    selectedSlot: { start: string; end: string } | null;
    name: string;
    confirmation: {
        meetLink: string | null;
        start: string;
        end: string;
    } | null;
};

const STEPS = [
    { num: 1, label: "Date" },
    { num: 2, label: "Time" },
    { num: 3, label: "Details" },
    { num: 4, label: "Confirmed" },
] as const;

function StepIndicator({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex items-center justify-center gap-3 mb-10 text-xs tracking-wide">
            {STEPS.map((step, i) => (
                <span key={step.num} className="flex items-center gap-3">
                    <span
                        className={cn(
                            "transition-colors duration-300",
                            currentStep === step.num
                                ? "text-clay font-medium"
                                : currentStep > step.num
                                  ? "text-ink-muted"
                                  : "text-ink-light/50"
                        )}
                    >
                        {String(step.num).padStart(2, "0")} {step.label}
                    </span>
                    {i < STEPS.length - 1 && (
                        <span className="text-ink-light/30">&middot;</span>
                    )}
                </span>
            ))}
        </div>
    );
}

const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

export function BookingFlow() {
    const [state, setState] = useState<BookingState>({
        step: 1,
        selectedDate: null,
        selectedSlots: [],
        selectedSlot: null,
        name: "",
        confirmation: null,
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleDateSelect = useCallback(
        (date: string, slots: Array<{ start: string; end: string }>) => {
            setState((prev) => ({
                ...prev,
                step: 2,
                selectedDate: date,
                selectedSlots: slots,
            }));
        },
        []
    );

    const handleSlotSelect = useCallback((slot: { start: string; end: string }) => {
        setState((prev) => ({
            ...prev,
            step: 3,
            selectedSlot: slot,
        }));
        setSubmitError(null);
    }, []);

    const handleBack = useCallback(() => {
        setState((prev) => ({
            ...prev,
            step: (prev.step > 1 ? prev.step - 1 : 1) as 1 | 2 | 3 | 4,
        }));
        setSubmitError(null);
    }, []);

    const handleSubmit = useCallback(
        async (details: { name: string; email: string; message: string }) => {
            if (!state.selectedSlot) return;

            setSubmitting(true);
            setSubmitError(null);

            try {
                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const response = await fetch("/api/booking", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        start: state.selectedSlot.start,
                        end: state.selectedSlot.end,
                        name: details.name,
                        email: details.email,
                        message: details.message,
                        timezone: userTimezone,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 409) {
                        setSubmitError(
                            "This time slot was just booked by someone else. Please go back and choose another time."
                        );
                    } else {
                        setSubmitError(data.error || "Something went wrong. Please try again.");
                    }
                    return;
                }

                setState((prev) => ({
                    ...prev,
                    step: 4,
                    name: details.name,
                    confirmation: {
                        meetLink: data.booking.meetLink,
                        start: data.booking.start,
                        end: data.booking.end,
                    },
                }));
            } catch {
                setSubmitError("Network error. Please check your connection and try again.");
            } finally {
                setSubmitting(false);
            }
        },
        [state.selectedSlot]
    );

    return (
        <section className="pb-24">
            <div className="container-calm">
                <StepIndicator currentStep={state.step} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={state.step}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center"
                    >
                        {state.step === 1 && (
                            <DateSelection onSelect={handleDateSelect} />
                        )}
                        {state.step === 2 && state.selectedDate && (
                            <TimeSelection
                                date={state.selectedDate}
                                slots={state.selectedSlots}
                                onSelect={handleSlotSelect}
                                onBack={handleBack}
                            />
                        )}
                        {state.step === 3 && state.selectedSlot && state.selectedDate && (
                            <DetailsForm
                                slot={state.selectedSlot}
                                date={state.selectedDate}
                                onSubmit={handleSubmit}
                                onBack={handleBack}
                                error={submitError}
                                submitting={submitting}
                            />
                        )}
                        {state.step === 4 && state.confirmation && (
                            <Confirmation
                                confirmation={state.confirmation}
                                name={state.name}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
