"use client";

import { motion } from "framer-motion";

export function PrivacyContent() {
    return (
        <article className="py-24 md:py-32">
            <div className="container-calm max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <p className="text-sm text-ink-muted mb-6">Legal</p>
                    <h1 className="text-4xl md:text-5xl mb-8">
                        Privacy Policy
                    </h1>
                    <p className="text-xs text-ink-light mb-12">
                        Last updated: March 28, 2026
                    </p>

                    {/* Plain-Language Summary */}
                    <div className="p-8 rounded-lg border border-ink/5 bg-paper-warm mb-12">
                        <h2 className="text-xl mb-4">
                            The Short Version
                        </h2>
                        <div className="space-y-4 text-sm text-ink-muted leading-relaxed">
                            <p>
                                We collect your name and email when you use our
                                contact form, book a discovery call, or
                                subscribe to our newsletter. That is all we
                                collect.
                            </p>
                            <p>
                                We use your information only for the purpose you
                                gave it: to respond to your message, to schedule
                                your call, or to send you occasional dispatches.
                                We never sell, share, or provide your data to
                                advertisers, data brokers, or ad networks.
                            </p>
                            <p>
                                When you book a call, your name, email, and
                                booking details are sent to Google Calendar to
                                create the calendar event. This is the only
                                third-party service that receives your data.
                            </p>
                            <p>
                                We do not use analytics, tracking pixels,
                                cookies, or any form of behavioral monitoring on
                                this website.
                            </p>
                            <p>
                                You can request deletion of your data at any
                                time by emailing{" "}
                                <a
                                    href="mailto:hello@hilowstudio.dev"
                                    className="text-clay hover:text-clay-muted transition-colors duration-300"
                                >
                                    hello@hilowstudio.dev
                                </a>
                                . We will respond within 2 business days.
                            </p>
                            <p>
                                If we make material changes to this policy, we
                                will notify affected users by email before the
                                changes take effect.
                            </p>
                        </div>
                    </div>

                    {/* Full Policy */}
                    <div className="space-y-10 text-sm text-ink-muted leading-relaxed">
                        <section>
                            <h2 className="text-lg text-ink mb-4">
                                What We Collect
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-ink mb-1">
                                        Contact Form
                                    </h3>
                                    <p>
                                        Name, email address, inquiry type
                                        (optional), vertical (optional), and
                                        your message. This information is used
                                        solely to respond to your inquiry.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-ink mb-1">
                                        Discovery Call Booking
                                    </h3>
                                    <p>
                                        Name, email address, optional message,
                                        selected date and time, and your
                                        timezone. This information is used to
                                        create a Google Calendar event for your
                                        call.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-ink mb-1">
                                        Newsletter
                                    </h3>
                                    <p>
                                        Email address only. Used to send
                                        occasional dispatches about building for
                                        the parallel economy. You can
                                        unsubscribe at any time.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg text-ink mb-4">
                                What We Do Not Collect
                            </h2>
                            <p>
                                We do not use cookies, analytics tools, tracking
                                pixels, session recording, heatmaps, device
                                fingerprinting, or any form of behavioral
                                monitoring. We do not access your camera,
                                microphone, location, contacts, or any device
                                sensors. We do not collect data beyond what you
                                explicitly provide through our forms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg text-ink mb-4">
                                Third-Party Services
                            </h2>
                            <p className="mb-4">
                                We use one third-party service:
                            </p>
                            <div className="p-4 rounded-md border border-ink/5">
                                <p className="font-medium text-ink mb-1">
                                    Google Calendar API
                                </p>
                                <p>
                                    When you book a discovery call, your name,
                                    email, message, and selected time slot are
                                    sent to the Google Calendar API to create a
                                    calendar event. This data is governed by{" "}
                                    <a
                                        href="https://policies.google.com/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-clay hover:text-clay-muted transition-colors duration-300"
                                    >
                                        Google&apos;s Privacy Policy
                                    </a>
                                    . We use a service account for
                                    authentication and do not access your
                                    personal Google account.
                                </p>
                            </div>
                            <p className="mt-4">
                                We do not use advertising services, data
                                brokers, social media tracking pixels, or
                                analytics providers of any kind.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg text-ink mb-4">
                                Data Retention
                            </h2>
                            <div className="space-y-2">
                                <p>
                                    <span className="font-medium text-ink">
                                        Contact form submissions:
                                    </span>{" "}
                                    Retained only for the duration needed to
                                    respond to your inquiry.
                                </p>
                                <p>
                                    <span className="font-medium text-ink">
                                        Booking data:
                                    </span>{" "}
                                    Stored in Google Calendar for the duration
                                    of the scheduled event and any follow-up.
                                </p>
                                <p>
                                    <span className="font-medium text-ink">
                                        Newsletter email:
                                    </span>{" "}
                                    Retained until you unsubscribe.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg text-ink mb-4">
                                Your Rights
                            </h2>
                            <p>
                                You can request access to, correction of, or
                                deletion of your data at any time by emailing{" "}
                                <a
                                    href="mailto:hello@hilowstudio.dev"
                                    className="text-clay hover:text-clay-muted transition-colors duration-300"
                                >
                                    hello@hilowstudio.dev
                                </a>
                                . We will respond within 2 business days and
                                complete any deletion request within 30 days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg text-ink mb-4">
                                Changes to This Policy
                            </h2>
                            <p>
                                If we make material changes to this privacy
                                policy, we will notify affected users by email
                                before the changes take effect, with a clear
                                summary of what changed. Non-material changes
                                (typo fixes, clarifications) may be made without
                                notice. The &ldquo;last updated&rdquo; date at
                                the top of this page reflects the most recent
                                revision.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-lg text-ink mb-4">
                                Contact
                            </h2>
                            <p>
                                Questions about this policy? Email{" "}
                                <a
                                    href="mailto:hello@hilowstudio.dev"
                                    className="text-clay hover:text-clay-muted transition-colors duration-300"
                                >
                                    hello@hilowstudio.dev
                                </a>
                                .
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </article>
    );
}
