"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PaperPlaneTilt, Check } from "@phosphor-icons/react";

const inquiryTypeOptions = [
    "Product Inquiry",
    "Consulting / Services",
    "Partnership",
    "General",
    "Other",
];

const verticalOptions = [
    "Education",
    "End of Life",
    "Health & Wellness",
    "Finance",
    "Food & Agriculture",
    "Energy & Utilities",
    "Community & Housing",
    "Other",
];

export function ContactForm() {
    const searchParams = useSearchParams();
    const initialInquiryType =
        searchParams.get("type") === "consulting" ? "Consulting / Services" : "";

    const [formData, setFormData] = useState({
        inquiryType: initialInquiryType,
        name: "",
        email: "",
        vertical: "",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.message) return;

        // Simulate submission - replace with actual form handling
        setStatus("loading");
        setTimeout(() => {
            setStatus("success");
        }, 1500);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    if (status === "success") {
        return (
            <section className="pb-24">
                <div className="container-calm">
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
                            <h3 className="text-xl">Message Sent</h3>
                        </div>
                        <p className="text-ink-muted text-sm">
                            Thanks for reaching out. We&apos;ll get back to you within 2 business days.
                        </p>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="pb-24">
            <div className="container-calm">
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-lg space-y-6"
                >
                    {/* Inquiry Type */}
                    <div className="space-y-2">
                        <label htmlFor="inquiryType" className="block text-sm font-medium text-ink">
                            What brings you here? <span className="text-ink-light">(optional)</span>
                        </label>
                        <select
                            id="inquiryType"
                            name="inquiryType"
                            value={formData.inquiryType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-md border border-ink/10 bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        >
                            <option value="">Select an inquiry type</option>
                            {inquiryTypeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-ink">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            className="w-full px-4 py-3 rounded-md border border-ink/10 bg-paper text-ink placeholder:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-ink">
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

                    {/* Vertical (Optional) */}
                    <div className="space-y-2">
                        <label htmlFor="vertical" className="block text-sm font-medium text-ink">
                            Which vertical interests you? <span className="text-ink-light">(optional)</span>
                        </label>
                        <select
                            id="vertical"
                            name="vertical"
                            value={formData.vertical}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-md border border-ink/10 bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300"
                        >
                            <option value="">Select a vertical</option>
                            {verticalOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label htmlFor="message" className="block text-sm font-medium text-ink">
                            Message <span className="text-clay">*</span>
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            placeholder="Tell us about your project..."
                            className="w-full px-4 py-3 rounded-md border border-ink/10 bg-paper text-ink placeholder:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 transition-all duration-300 resize-none"
                        />
                    </div>

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
                                <span>Send Message</span>
                                <PaperPlaneTilt weight="regular" className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <p className="text-xs text-ink-light">
                        Or email us directly at{" "}
                        <a href="mailto:hello@hilowstudio.dev" className="text-ink hover:text-clay transition-colors">
                            hello@hilowstudio.dev
                        </a>
                    </p>
                </motion.form>
            </div>
        </section>
    );
}
