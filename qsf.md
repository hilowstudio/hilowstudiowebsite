# The Quiet Standards Framework (QSF)
## Auditable Certification Standard for Attention-Respecting Software

---

## Framework Structure: 7 Domains, 104 Criteria (27 must-pass, 77 scored = 134 points)

### Domain 1: ATTENTION (23 criteria, 6 must-pass)
*"Design for the smallest possible amount of your attention"*

**1A. Notification Architecture (8 criteria)**
- **ATT-01** [Must-Pass]: No push notifications unless user-configured trigger. Marketing/re-engagement = auto-fail.
- **ATT-02** [Must-Pass]: Single control to disable ALL non-critical notifications.
- **ATT-03** [Must-Pass]: Default notifications = minimum. User opts IN, not OUT.
- **ATT-04** [2 pts]: User-defined quiet hours (queued, not just muted).
- **ATT-05** [2 pts]: Notifications contain enough context to act without opening app.
- **ATT-06** [2 pts]: Non-urgent notifications batched into digests.
- **ATT-07** [1 pt]: User-accessible notification log (last 30 days).
- **ATT-08** [1 pt]: Respects OS-level Do Not Disturb / Focus modes.

**1B. Engagement Pattern Prohibition (7 criteria)**
- **ATT-09** [Must-Pass]: No infinite scroll. Feeds must terminate or paginate.
- **ATT-10** [Must-Pass]: No streaks, loss-aversion timers, or penalties for non-use.
- **ATT-11** [Must-Pass]: No gamification (points, badges, leaderboards, XP) unless the product IS a game.
- **ATT-12** [2 pts]: No auto-play media without explicit per-content initiation.
- **ATT-13** [2 pts]: No variable-ratio reinforcement (pull-to-refresh-for-new-content, random rewards).
- **ATT-14** [2 pts]: Session length visible to user (timer, summary, or periodic check-in).
- **ATT-15** [1 pt]: No social comparison metrics (follower/like/view counts) unless product purpose requires it.

**1C. Interface Restraint (8 criteria)**
- **ATT-16** [2 pts]: Primary task flow completable in ≤3 screens from launch.
- **ATT-17** [2 pts]: No interstitials/splash screens exceeding 2s when content is ready.
- **ATT-18** [2 pts]: Modals only for destructive/critical confirmations — not promos or upsells.
- **ATT-19** [2 pts]: Supports `prefers-reduced-motion`.
- **ATT-20** [1 pt]: Clear visual hierarchy — no competing CTAs of equal weight.
- **ATT-21** [1 pt]: Empty states are calm and informative, not upsells.
- **ATT-22** [1 pt]: No false urgency (red, pulsing elements, "Act now!" language).
- **ATT-23** [1 pt]: Body text line length 45–80 characters.

---

### Domain 2: DATA SOVEREIGNTY (18 criteria, 5 must-pass)
*"Your data belongs to you"*

**2A. Data Portability (6 criteria)**
- **DAT-01** [Must-Pass]: Full data export in open, machine-readable format (JSON, CSV, XML).
- **DAT-02** [Must-Pass]: Export includes ALL user-generated content, metadata, config, history.
- **DAT-03** [Must-Pass]: Export accessible within 3 clicks, no support ticket or waiting period >24h.
- **DAT-04** [3 pts]: API/webhook for real-time data sync with external systems.
- **DAT-05** [2 pts]: Exported data documented well enough for import into competing product.
- **DAT-06** [2 pts]: Supports import from ≥1 competitor or common format.

**2B. Data Collection Minimalism (6 criteria)**
- **DAT-07** [Must-Pass]: No data collection beyond what active features require.
- **DAT-08** [Must-Pass]: Never sells/shares data with advertisers or data brokers.
- **DAT-09** [3 pts]: Real-time user-accessible data inventory (not just privacy policy categories).
- **DAT-10** [2 pts]: Analytics/telemetry opt-in (not opt-out) with clear explanation.
- **DAT-11** [2 pts]: Core features work when all optional data collection is declined.
- **DAT-12** [1 pt]: Stated retention periods with automatic purge when purpose expires.

**2C. Data Security & Deletion (6 criteria)**
- **DAT-13** [3 pts]: Sensitive data encrypted at rest (AES-256 or equivalent).
- **DAT-14** [3 pts]: Account deletion is complete, permanent, in-app. No "contact support."
- **DAT-15** [2 pts]: Clear distinction between deactivation (data retained) and deletion (data destroyed).
- **DAT-16** [2 pts]: Backups purged within 30 days of deletion request.
- **DAT-17** [1 pt]: Supports standard auth (OAuth 2.0, passkeys); phone number not mandatory.
- **DAT-18** [1 pt]: TLS 1.2+ exclusively for data transmission.

---

### Domain 3: HONESTY (16 criteria, 5 must-pass)
*"Amplify the best of people and technology without confusing the two"*

**3A. Dark Pattern Prohibition (8 criteria)**
- **HON-01** [Must-Pass]: No confirmshaming.
- **HON-02** [Must-Pass]: No roach motel patterns (easy signup, hard cancellation).
- **HON-03** [Must-Pass]: No bait-and-switch.
- **HON-04** [Must-Pass]: Cancellation flow ≤ signup flow in steps.
- **HON-05** [2 pts]: No pre-checked consent boxes, newsletter signups, or add-ons.
- **HON-06** [2 pts]: Clear pricing at point of decision. No hidden fees.
- **HON-07** [2 pts]: No false urgency (fake timers, fake scarcity).
- **HON-08** [1 pt]: No visual misdirection toward company-preferred options.

**3B. Algorithmic Transparency (4 criteria)**
- **HON-09** [3 pts]: If algorithmic curation exists, primary ranking factors disclosed in plain language.
- **HON-10** [2 pts]: Non-algorithmic content view available (chronological, alpha, user-defined).
- **HON-11** [2 pts]: AI-generated content clearly labeled and distinguishable.
- **HON-12** [1 pt]: No dynamic pricing personalized by user behavior.

**3C. Business Model Transparency (4 criteria)**
- **HON-13** [Must-Pass]: Monetization model stated plainly on marketing site and in-app.
- **HON-14** [3 pts]: If free, explains how it's funded.
- **HON-15** [2 pts]: No degrading existing features to upsell paid tiers.
- **HON-16** [2 pts]: TOS available in plain-language summary (≤8th-grade reading level).

---

### Domain 4: DEPARTURE (12 criteria, 4 must-pass)
*"Solve the problem, then get out of your way"*

**4A. Session Closure (4 criteria)**
- **DEP-01** [2 pts]: No retention dialogs or emotional appeals on close (unsaved-work warnings OK).
- **DEP-02** [2 pts]: Auto-saves state so user can close anytime without data loss.
- **DEP-03** [1 pt]: No re-engagement emails within 72h of last session.
- **DEP-04** [1 pt]: No ads/surveys/promos at logout/close.

**4B. Account Offboarding (4 criteria)**
- **DEP-05** [Must-Pass]: Subscription cancellable entirely in-app/web. No phone calls or letters.
- **DEP-06** [Must-Pass]: After cancellation, data accessible and exportable for ≥30 days.
- **DEP-07** [Must-Pass]: Clear, immediate cancellation confirmation with effective date and data fate.
- **DEP-08** [2 pts]: Transfer ownership capability for shared/team/family accounts.

**4C. Graceful Degradation (4 criteria)**
- **DEP-09** [Must-Pass]: If internet required for core function, stated before signup and in marketing.
- **DEP-10** [3 pts]: Meaningful offline functionality; core features degrade gracefully.
- **DEP-11** [2 pts]: Documented plan for user data if company shuts down (referenced in TOS).
- **DEP-12** [2 pts]: No mandatory updates that remove features or reset preferences without choice.

---

### Domain 5: RESPECT (14 criteria, 3 must-pass)
*"Respect your time and social norms"*

**5A. Temporal Respect (5 criteria)**
- **RES-01** [3 pts]: User-defined schedules governing notifications, syncs, background activity.
- **RES-02** [2 pts]: Default notification times restricted to 8AM–9PM user-local unless configured otherwise.
- **RES-03** [2 pts]: No time-based urgency messaging ("Weekend sale ends tonight!").
- **RES-04** [1 pt]: Recurring actions respect calendar integrations/quiet periods.
- **RES-05** [1 pt]: Anniversary/milestone notifications opt-in only.

**5B. Contextual Intelligence (5 criteria)**
- **RES-06** [Must-Pass]: No sensor access (camera, mic, location, contacts, health) without explicit, revocable consent.
- **RES-07** [Must-Pass]: No sensor use beyond stated functionality.
- **RES-08** [2 pts]: Respects OS Focus/DND states, adjusts behavior accordingly.
- **RES-09** [2 pts]: Location "only while using" option; no core degradation if background location denied.
- **RES-10** [1 pt]: Just-in-time permission requests only (not all at first launch).

**5C. Resource Respect (4 criteria)**
- **RES-11** [Must-Pass]: No crypto mining or unauthorized device resource usage.
- **RES-12** [2 pts]: Background resource usage proportionate to functionality.
- **RES-13** [2 pts]: No keeping device awake or persistent background connections when inactive (unless required by stated function).
- **RES-14** [1 pt]: Install size and storage usage documented and reasonable.

---

### Domain 6: DURABILITY (12 criteria, 3 must-pass)
*"Software degrades gracefully"*

**6A. Accessibility (6 criteria)**
- **DUR-01** [Must-Pass]: WCAG 2.1 Level AA for all primary user flows.
- **DUR-02** [Must-Pass]: Minimum 44×44px touch targets (mobile) / keyboard-navigable focus states (desktop).
- **DUR-03** [3 pts]: Fully keyboard-navigable (no mouse/touch-only primary interactions).
- **DUR-04** [2 pts]: Screen reader support with appropriate ARIA.
- **DUR-05** [2 pts]: Color never sole means of conveying information.
- **DUR-06** [1 pt]: Text scales to 200% without content/functionality loss.

**6B. Standards & Interoperability (3 criteria)**
- **DUR-07** [Must-Pass]: Uses open web standards; no proprietary plugins for core function.
- **DUR-08** [2 pts]: Supports relevant open protocols (CalDAV, RSS, SMTP, ActivityPub, etc.).
- **DUR-09** [2 pts]: Data format publicly documented.

**6C. Longevity (3 criteria)**
- **DUR-10** [2 pts]: Public changelog.
- **DUR-11** [2 pts]: Stated support/security update policy and EOL plan.
- **DUR-12** [1 pt]: Runs on OS versions within 2 major releases; no unreasonable hardware requirements.

---

### Domain 7: GOVERNANCE (9 criteria, 1 must-pass)
*"Transparent and verifiable"*

**7A. Privacy & Legal Clarity (4 criteria)**
- **GOV-01** [Must-Pass]: Privacy policy exists, accessible in-app, updated within 12 months.
- **GOV-02** [3 pts]: Plain-language privacy summary (≤500 words, 8th-grade level).
- **GOV-03** [2 pts]: Users notified of material policy changes BEFORE they take effect.
- **GOV-04** [2 pts]: All third-party SDKs/trackers identified with data practices disclosed.

**7B. User Communication (3 criteria)**
- **GOV-05** [2 pts]: Public bug/feature/feedback channel not requiring social media.
- **GOV-06** [2 pts]: Actual user documentation (not just marketing copy).
- **GOV-07** [1 pt]: Stated support response time, met ≥80%.

**7C. Ethical Commitments (2 criteria)**
- **GOV-08** [2 pts]: Funding sources publicly disclosed, including investor interests in ad/data industries.
- **GOV-09** [2 pts]: Published design principles or ethical commitments predating certification.

---

## Scoring & Tiers

**Must-Pass Gate**: Fail ANY of 27 must-pass criteria → no certification at any tier.

**Point Scoring**: 77 scored criteria, 134 total points.

**Domain Minimum**: Silver and Gold require ≥40% of scored points in EVERY domain (no compensating weak areas with strong ones).

| Tier | Name | Requirement |
|------|------|-------------|
| — | Not Certified | Fails any must-pass OR <40% scored |
| 🟫 | **QSF Verified** | All must-pass + 54+ pts (40%) |
| ⬜ | **QSF Certified** | All must-pass + 80+ pts (60%) + domain minimums |
| 🟨 | **QSF Exemplary** | All must-pass + 107+ pts (80%) + domain minimums |

---

## Audit Evidence Types

Each criterion specifies one of four evidence methods:
- **(T) Technical Inspection**: Examine running app, source, or network traffic
- **(D) Documentation Review**: Review published policies, changelogs, docs
- **(U) User Journey Walkthrough**: Complete a user flow, count steps, record experience
- **(A) Declarative Attestation**: Company attests to non-externally-verifiable practice; false attestation voids certification

**Recertification**: Valid 12 months. Delta audit on changed criteria + 20% random sample of unchanged. Material changes (new monetization, acquisition, new data collection) trigger mandatory re-audit.

---