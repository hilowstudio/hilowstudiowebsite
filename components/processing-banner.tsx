"use client";

import { motion } from "framer-motion";

interface ProcessingBannerProps {
  message: string;
  submessage?: string;
}

export function ProcessingBanner({ message, submessage }: ProcessingBannerProps) {
  return (
    <div className="rounded-lg border border-clay/30 bg-clay/5 px-4 py-3 flex items-center gap-3">
      <div className="shrink-0">
        <motion.div
          className="w-4 h-4 rounded-full border-2 border-clay border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div>
        <p className="text-sm text-ink">{message}</p>
        {submessage && (
          <p className="text-xs text-ink-muted mt-0.5">{submessage}</p>
        )}
      </div>
    </div>
  );
}
