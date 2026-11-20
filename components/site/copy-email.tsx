"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
    const [copied, setCopied] = useState(false);
    async function copy() {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            setCopied(false);
        }
    }
    return (
        <>
            <button type="button" className="hl-btn" data-variant="quiet" onClick={copy}>
                {copied ? "Copied" : "Copy address"}
            </button>
            <span className="hl-sr" role="status" aria-live="polite">
                {copied ? "Email address copied" : ""}
            </span>
        </>
    );
}
