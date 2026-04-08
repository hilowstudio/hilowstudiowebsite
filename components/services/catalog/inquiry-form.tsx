"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PaperPlaneTilt, Check } from "@phosphor-icons/react";

interface InquiryFormProps {
    catalogSlug: string;
    catalogName: string;
    submitLabel?: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function InquiryForm({
    catalogSlug,
    catalogName,
    submitLabel = "Send Inquiry",
}: InquiryFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        message: `I'd like to know more about ${catalogName}.`,
    });
    const [status, setStatus] = useState<Status>("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) return;

        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    catalogSlug,
                    catalogName,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error ?? "Something went wrong");
            }

            setStatus("success");
        } catch (err) {
            setStatus("error");
            setErrorMessage(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please email hello@hilowstudio.dev.",
            );
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    if (status === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-lg p-8 rounded-lg border border-ink/10 bg-paper-warm"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-moss/20 flex items-center justify-center">
                        <Check weight="bold" className="w-5 h-5 text-moss" />
                    </div>
                    <h3 className="text-xl">Inquiry Sent</h3>
                </div>
                <p className="text-ink-muted text-sm leading-relaxed">
                    Thanks for reaching out about {catalogName}. We&apos;ll get
                    back to you within two business days.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg space-y-6"
        >
            {/* Name */}
            <div className="space-y-2">
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-ink"
                >
                    Name <span className="text-clay">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-md border border-ink/10 bg-paper text-ink placeholder:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                />
            </div>

            {/* Email */}
            <div className="space-y-2">
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-ink"
                >
                    Email <span className="text-clay">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-md border border-ink/10 bg-paper text-ink placeholder:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                />
            </div>

            {/* Company */}
            <div className="space-y-2">
                <label
                    htmlFor="company"
                    className="block text-sm font-medium text-ink"
                >
                    Company{" "}
                    <span className="text-ink-light">(optional)</span>
                </label>
                <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company"
                    className="w-full px-4 py-3 rounded-md border border-ink/10 bg-paper text-ink placeholder:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                />
            </div>

            {/* Message */}
            <div className="space-y-2">
                <label
                    htmlFor="message"
                    className="block text-sm font-medium text-ink"
                >
                    Message <span className="text-clay">*</span>
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-md border border-ink/10 bg-paper text-ink placeholder:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300 resize-none"
                />
            </div>

            {status === "error" && (
                <p className="text-sm text-terracotta">{errorMessage}</p>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-clay text-paper text-sm font-medium hover:bg-clay-muted focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 disabled:opacity-50 transition-all duration-300"
            >
                {status === "loading" ? (
                    <span>Sending...</span>
                ) : (
                    <>
                        <span>{submitLabel}</span>
                        <PaperPlaneTilt weight="regular" className="w-4 h-4" />
                    </>
                )}
            </button>

            <p className="text-xs text-ink-light">
                Or email us directly at{" "}
                <a
                    href="mailto:hello@hilowstudio.dev"
                    className="text-ink hover:text-clay transition-colors"
                >
                    hello@hilowstudio.dev
                </a>
            </p>
        </motion.form>
    );
}
