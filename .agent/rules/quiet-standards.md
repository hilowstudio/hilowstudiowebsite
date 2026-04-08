---
trigger: always_on
---

# HI-LOW STUDIO
# Context: "Digital Supports for Analog Living."
# Framework: Quiet Standards Framework v1.0
# Goal: Pass our own audit by construction, not by remediation.

YOU ARE BUILDING SOFTWARE THAT WILL BE AUDITED AGAINST THE QSF.
This document is the proactive companion to `qsf-audit-kit/`.
The audit kit is for evaluation. THIS document is for design.
Build it right the first time.

For visual rules see `.agent/rules/user-interfaces.md`.
For full criteria see `qsf-audit-kit/qsf-criteria.json`.
For audit workflow see `qsf-audit-kit/qsf-audit-rules.md`.

Each rule is tagged `[CRIT-ID]` traceable to the audit kit.
Many criteria are N/A for marketing sites and static products.
**N/A is not an exemption.** If you build the feature, you build it with the rule.

---

## 0. THE 27 GATES (NON-NEGOTIABLE)

A FAIL on any of these voids QSF certification at every tier.
Scan this list before starting any task.

### ATTENTION GATES
- NEVER request notification permissions without a user-configured trigger. Marketing/re-engagement notifications are auto-fail. [ATT-01]
- ALWAYS provide a single control to disable ALL non-critical notifications in one action. [ATT-02]
- DEFAULT notification settings to the minimum permission state. Opt-in, never opt-out. [ATT-03]
- NEVER use infinite scroll. Feeds MUST paginate or terminate with a clear endpoint. [ATT-09]
- NEVER use streak mechanics, loss-aversion timers, or any "we miss you" guilt mechanism. [ATT-10]
- NEVER use gamification (points, badges, leaderboards, levels, XP) unless the product is explicitly a game. [ATT-11]

### DATA GATES
- ALWAYS provide full data export in an open, machine-readable format (JSON, CSV, XML). [DAT-01]
- ALWAYS make exports complete — content, metadata, configuration, history, the lot. [DAT-02]
- ALWAYS make export accessible within 3 clicks from settings. No support tickets, no waiting periods, no discouragement flow. [DAT-03]
- NEVER collect data beyond what an actively-used feature requires. [DAT-07]
- NEVER sell, share, or provide user data to advertisers, brokers, or ad networks. [DAT-08]

### HONESTY GATES
- NEVER use confirmshaming language on decline buttons. [HON-01]
- NEVER make cancellation harder than signup ("roach motel" pattern). [HON-02]
- NEVER bait-and-switch features, prices, or capabilities after commitment. [HON-03]
- NEVER make the cancel/downgrade flow longer than the signup/upgrade flow. [HON-04]
- ALWAYS state the monetization model plainly on marketing site and inside the application. [HON-13]

### DEPARTURE GATES
- ALWAYS allow subscription cancellation entirely in-app or in-web. No phone calls, no retention agents, no mailed letters. [DEP-05]
- ALWAYS keep paid-for data accessible and exportable for 30 days post-cancel. [DEP-06]
- ALWAYS confirm cancellation immediately, with effective date and what happens to user data. [DEP-07]
- ALWAYS state on marketing materials if internet is required for primary functionality. [DEP-09]

### RESPECT GATES
- NEVER access camera, mic, location, contacts, or health data without explicit, per-session consent that is revocable at any time. [RES-06]
- NEVER use sensors for purposes beyond stated functionality. [RES-07]
- NEVER mine cryptocurrency, run distributed computation, or use device resources for unrelated purposes. [RES-11]

### DURABILITY GATES
- ALWAYS meet WCAG 2.1 Level AA on every primary user flow. [DUR-01] *(See user-interfaces.md §4 for the contrast and focus rules already in force.)*
- ALWAYS provide 44x44 touch targets and keyboard-equivalent focus for all interactive elements. [DUR-02] *(See user-interfaces.md §3 ATOMS — already in force.)*
- ALWAYS use open web standards. NEVER require proprietary plugins, browser-specific features, or single-vendor runtimes. [DUR-07]

### GOVERNANCE GATE
- ALWAYS publish a privacy policy accessible inside the application, updated within the last 12 months. [GOV-01]

---

## 1. ATTENTION
> Principle: Design for the smallest possible amount of your attention.
> Must-pass gates in this domain: ATT-01, ATT-02, ATT-03, ATT-09, ATT-10, ATT-11 (see Section 0).

### 1A. NOTIFICATION ARCHITECTURE
- PROVIDE user-defined quiet hours that **queue and hold** notifications, not just mute them. [ATT-04]
- WRITE notification copy that contains enough context to be actionable without opening the app. [ATT-05]
- BATCH non-urgent notifications into digest form rather than sending them individually. [ATT-06]
- EXPOSE a user-accessible notification log showing the count and content of every notification sent in the last 30 days. [ATT-07]
- RESPECT OS-level Do Not Disturb and Focus modes. NEVER circumvent them. [ATT-08]

### 1B. ENGAGEMENT PATTERN PROHIBITION
- NEVER auto-play media. Require explicit user initiation on each piece of content. [ATT-12]
- NEVER use variable-ratio reinforcement. No pull-to-refresh revealing new content, no randomized rewards. [ATT-13]
- MAKE session length transparent. PROVIDE a visible timer, session summary, or periodic check-in if sessions can run long. [ATT-14]
- AVOID social comparison metrics (follower counts, likes, view counts) unless the product's explicit purpose requires them. [ATT-15]

### 1C. INTERFACE RESTRAINT
- COMPLETE the primary task flow in **3 screens or fewer** from launch. [ATT-16]
- NEVER show interstitial screens or splash animations longer than 2 seconds when content is available. [ATT-17]
- USE modal dialogs ONLY for destructive actions or critical confirmations. NEVER for promotions, upsells, or announcements. [ATT-18]
- RESPECT `prefers-reduced-motion`. [ATT-19] *(See user-interfaces.md §2 — already in force.)*
- ENFORCE clear visual hierarchy. NEVER place two competing calls-to-action of equal weight. [ATT-20]
- WRITE empty states that are informative and calm. NEVER use empty states for upselling, cross-promotion, or anxiety. [ATT-21]
- NEVER use the color red, urgency language, or pulsing/animating elements to manufacture false urgency. NO badges like "Popular," "New," "Limited." [ATT-22]
- MAINTAIN a 45–80 character measure for body text. [ATT-23] *(See user-interfaces.md §1 TYPOGRAPHY — already in force.)*

---

## 2. DATA SOVEREIGNTY
> Principle: The user owns the data, not the product.
> Must-pass gates in this domain: DAT-01, DAT-02, DAT-03, DAT-07, DAT-08 (see Section 0).

### 2A. DATA PORTABILITY
- BUILD an API or webhook for real-time sync with external systems the user chooses. [DAT-04]
- DOCUMENT the export schema sufficiently that a competing product or custom tool can import it. [DAT-05]
- SUPPORT import from at least one competing product or common format in the category. [DAT-06]

### 2B. DATA COLLECTION MINIMALISM
- BUILD a real-time, user-accessible inventory of all data held about the user. NOT a privacy-policy category list — an actual data viewer. [DAT-09]
- IF analytics or telemetry are present, they MUST be opt-in (not opt-out) with a plain-language explanation of what is collected and why. [DAT-10]
- ENSURE core features function with all optional data collection declined. [DAT-11]
- STATE data retention periods explicitly. AUTO-PURGE when the stated purpose expires. [DAT-12]

### 2C. DATA SECURITY & DELETION
- ENCRYPT sensitive user data at rest with AES-256 or equivalent. [DAT-13]
- BUILD account deletion that is complete, permanent, and accessible inside the application. NEVER "contact support to delete." [DAT-14]
- DISTINGUISH "deactivation" (data retained) from "deletion" (data destroyed). OFFER both. [DAT-15]
- PURGE backups within 30 days of a deletion request. [DAT-16]
- SUPPORT industry-standard authentication (OAuth 2.0, passkeys). NEVER make a phone number mandatory. [DAT-17]
- USE TLS 1.2 or higher for all data transmission. NO exceptions. [DAT-18]

**Build prompt:** Every Supabase table that holds user data needs three companion features before it ships: an export endpoint (open format), a delete endpoint (in-app, complete), and a viewer the user can open today. If you can't sketch all three in one breath, you don't have a feature yet.

---

## 3. HONESTY
> Principle: Say what you do. Do what you say.
> Must-pass gates in this domain: HON-01, HON-02, HON-03, HON-04, HON-13 (see Section 0).

### 3A. DARK PATTERN PROHIBITION
- NEVER pre-check optional consent boxes, newsletter signups, or add-on purchases. [HON-05]
- ALWAYS show price clearly at the point of decision. NO hidden fees, NO "starting at" pricing that escalates. [HON-06]
- NEVER use false urgency. NO fake countdown timers, NO "only 3 left!" when inventory is not genuinely scarce. [HON-07]
- NEVER use visual misdirection — equal weight for the user's choice and the company's preferred choice, every time. [HON-08]

### 3B. ALGORITHMIC TRANSPARENCY
- IF any algorithmic curation exists, DISCLOSE the primary ranking factors in plain language, accessible from the interface. [HON-09]
- ALWAYS provide at least one non-algorithmic view (chronological, alphabetical, or user-defined sort). [HON-10]
- LABEL AI-generated content clearly. It MUST be distinguishable from human-authored content. [HON-11]
- NEVER use dynamic pricing personalized by user behavior or inferred willingness to pay. [HON-12]

### 3C. BUSINESS MODEL TRANSPARENCY
- IF the product is free, EXPLAIN how it is funded — on the marketing site and in the app. [HON-14]
- NEVER degrade existing features to upsell paid tiers without advance notice and a data export option. [HON-15]
- PUBLISH a plain-language summary of the Terms of Service at maximum 8th-grade reading level. [HON-16]

**Copy rule:** If a sentence could appear on a Black Friday landing page, rewrite it. Calm tech describes; it does not pressure.

---

## 4. DEPARTURE
> Principle: Every door must open both ways.
> Must-pass gates in this domain: DEP-05, DEP-06, DEP-07, DEP-09 (see Section 0).

### 4A. SESSION CLOSURE
- NEVER show retention dialogs, "Are you sure?" prompts, or emotional appeals when the user closes the app. (Unsaved-work warnings are permitted.) [DEP-01]
- AUTO-SAVE state continuously. The user MUST be able to close at any moment without loss of work. [DEP-02]
- NEVER send re-engagement emails within 72 hours of a user's last session. [DEP-03]
- NEVER show ads, surveys, or promotional content at the close/logout moment. [DEP-04]

### 4B. ACCOUNT OFFBOARDING
- BUILD ownership transfer for any shared account, team, or family plan. [DEP-08]

### 4C. GRACEFUL DEGRADATION
- DESIGN core features to degrade gracefully offline rather than failing completely. [DEP-10]
- DOCUMENT a plan for user data if the company shuts down. REFERENCE it in the Terms of Service. [DEP-11]
- NEVER push mandatory updates that remove features, change the interface substantially, or reset preferences without giving the user a choice. [DEP-12]

**Build prompt:** Before adding a paywall, write the cancel flow first. Before adding a sync feature, write the offline fallback first. The exit door is part of the feature, not an afterthought.

---

## 5. RESPECT
> Principle: Respect time, context, and resources.
> Must-pass gates in this domain: RES-06, RES-07, RES-11 (see Section 0).

### 5A. TEMPORAL RESPECT
- LET the user define schedules governing when the application may send notifications, sync, or do background work. [RES-01]
- DEFAULT notification times to 8:00 AM – 9:00 PM in the user's timezone unless the user explicitly configures otherwise. [RES-02]
- NEVER use time-of-day or day-of-week urgency messaging ("Weekend sale ends tonight!"). [RES-03]
- IF you offer calendar integration or quiet periods, RECURRING actions MUST respect them. [RES-04]
- ANNIVERSARY, milestone, or commemorative notifications are opt-in only. [RES-05]

### 5B. CONTEXTUAL INTELLIGENCE
- RESPECT OS-level Focus or Do Not Disturb states and adjust behavior accordingly. [RES-08]
- IF location data is used, PROVIDE "only while using" as an option. NEVER degrade core functionality if background location is denied. [RES-09]
- REQUEST permissions just-in-time only. NEVER request a permission at first launch for a feature the user has not yet attempted. [RES-10]

### 5C. RESOURCE RESPECT
- BACKGROUND CPU, memory, and battery use MUST be proportionate to functionality. [RES-12]
- NEVER keep the device awake or maintain persistent background connections when the user is not actively using the application. [RES-13]
- DOCUMENT installation size and ongoing storage usage. KEEP both reasonable for the product's category. [RES-14]

---

## 6. DURABILITY
> Principle: Build for ten years, not ten quarters.
> Must-pass gates in this domain: DUR-01, DUR-02, DUR-07 (see Section 0).

### 6A. ACCESSIBILITY
*(Cross-reference: user-interfaces.md §3–4 already enforces touch targets, focus rings, contrast, and semantic HTML. The rules below are additive.)*
- BUILD primary functionality so it is fully navigable via keyboard alone. NO mouse-only or touch-only interactions in the critical path. [DUR-03]
- ADD ARIA labels, roles, and live regions for dynamic content. SCREEN READERS MUST be a first-class user. [DUR-04]
- NEVER use color as the sole means of conveying information. Pair color with icon, label, or pattern for errors, status, validation. [DUR-05]
- SUPPORT user-configurable text size scaling up to 200% without loss of content or functionality. [DUR-06]

### 6B. STANDARDS & INTEROPERABILITY
- IMPLEMENT relevant open protocols for the domain (CalDAV, RSS/Atom, SMTP, ActivityPub, iCal, etc.). [DUR-08]
- DOCUMENT the data format publicly so third-party tools can read exported data. [DUR-09]

### 6C. LONGEVITY
- PUBLISH a changelog. Document changes, removals, and additions. [DUR-10]
- PUBLISH a support policy: how long the current version receives security updates, and what happens at end-of-life. [DUR-11]
- RUN on OS versions within 2 major releases. NEVER require unreasonably recent hardware. [DUR-12]

**Build prompt:** A new feature isn't shipped until it has a changelog entry, a keyboard path, and a screen-reader path. If those three are missing, the feature is half-built.

---

## 7. GOVERNANCE
> Principle: Make the rules legible.
> Must-pass gate in this domain: GOV-01 (see Section 0).

### 7A. PRIVACY & LEGAL CLARITY
- PUBLISH a plain-language privacy summary: maximum 500 words, 8th-grade reading level, covering what data is collected, why, who can see it, how long it is kept, and how to delete it. [GOV-02]
- NOTIFY users of material privacy/TOS changes BEFORE they take effect, with a clear summary of what changed. [GOV-03]
- IDENTIFY every third-party service, SDK, and tracker. DISCLOSE its data practices. [GOV-04]

### 7B. USER COMMUNICATION
- PROVIDE a public bug-report and feature-request channel that does NOT require a social media account. [GOV-05]
- WRITE actual user documentation covering all primary features. NOT marketing copy disguised as docs. [GOV-06]
- STATE an estimated support response time. MEET it at least 80% of the time. [GOV-07]

### 7C. ETHICAL COMMITMENTS
- DISCLOSE funding sources publicly, including any investors or board members with interests in advertising, data brokerage, or attention-extraction industries. [GOV-08]
- PUBLISH a statement of design principles or ethical commitments that PREDATES and is INDEPENDENT of any QSF certification. [GOV-09]

---

## 8. WHEN A RULE DOESN'T APPLY

Many criteria are N/A for marketing sites, static apps, and minimal products. Examples:
- A static portfolio has no notifications, no sensors, no algorithmic curation, no deletion endpoint.
- A read-only blog has no user accounts, no cancel flow, no telemetry.

**N/A is honest absence, not strategic absence.** The rule:
1. If the feature does not exist and is not planned, the criterion is N/A. Move on.
2. If the feature is planned, the criterion APPLIES the moment the design starts. Build the rule into the feature, not after.
3. You cannot dodge a rule by silently removing the underlying feature. If you remove a cancel flow to dodge DEP-05, you have broken the product, not the audit.

---

## 9. PRE-SHIP CHECKLIST

Run this before declaring any feature done. If you answer "yes" to a question, the listed rules apply. If you cannot point to where you handled them, the feature is not shipped.

1. **Did this feature touch user data?**
   → DAT-01 export, DAT-07 minimum collection, DAT-14 in-app delete, DAT-09 viewer.

2. **Did this feature add a notification, sensor, or background task?**
   → ATT-01/02/03 gates. RES-06/10 just-in-time consent. RES-12/13 resource proportionality.

3. **Did this feature change the cancel, exit, or offboarding flow?**
   → DEP-04 gates. HON-04 symmetry with the signup flow. DEP-01 no retention dialog.

4. **Did this feature change pricing, terms, or third-party services?**
   → HON-06 clear pricing. HON-13 monetization stated. GOV-03 user notification of material change. GOV-04 third-party disclosure.

5. **Does any new copy invoke urgency, scarcity, social proof, or shame?**
   → ATT-22, HON-01, HON-07, RES-03. Rewrite.

6. **Did this feature add a content feed, list, or ranked output?**
   → ATT-09 no infinite scroll. HON-09/10 transparent ranking with at least one non-algorithmic view.

7. **Did this feature add an interactive element, form, or modal?**
   → DUR-02 touch + keyboard. DUR-03/04 keyboard navigation + screen reader. DUR-05 not color-only. ATT-18 modal restraint.

8. **Did this feature add an integration, API, or sync?**
   → DAT-04 user-chosen sync. DUR-07 open standards. DUR-08 open protocols.

If every relevant question has a clear answer, ship it. If any answer is "I'll handle it later," it is not done.

---

*This document tracks QSF v1.0. When the framework version changes, update this file alongside `qsf-audit-kit/qsf-criteria.json` so the rules and the audit stay in lockstep.*
