# QSF Audit Scorecard

## Audit Information

| Field | Value |
|---|---|
| **Product** | [Product Name] |
| **URL** | [Product URL] |
| **Audit Date** | [YYYY-MM-DD] |
| **Audit Mode** | [Public Surface / Source Code / Full] |
| **Auditor** | [Name] |
| **QSF Version** | 1.0 |

---

## Result Summary

| | Result |
|---|---|
| **Must-Pass Gate** | [PASS / FAIL — X of 27 passed] |
| **Total Scored Points** | [X of 134] |
| **Domain Minimums Met** | [Yes / No — list any failing domains] |
| **Certification Tier** | [Not Certified / QSF Verified / QSF Certified / QSF Exemplary] |

---

## Domain Summary

| Domain | Must-Pass | Scored | Available | % | Min Met? |
|---|---|---|---|---|---|
| 01 Attention | X/6 | X | 26 | X% | [Y/N] |
| 02 Data Sovereignty | X/5 | X | 30 | X% | [Y/N] |
| 03 Honesty | X/5 | X | 24 | X% | [Y/N] |
| 04 Departure | X/4 | X | 18 | X% | [Y/N] |
| 05 Respect | X/3 | X | 20 | X% | [Y/N] |
| 06 Durability | X/3 | X | 16 | X% | [Y/N] |
| 07 Governance | X/1 | X | 16 | X% | [Y/N] |
| **Total** | **X/27** | **X** | **134** | **X%** | |

---

## Detailed Findings

### Domain 01: Attention

#### 1A. Notification Architecture

**ATT-01** [Must-Pass]
- **Result:** [PASS / FAIL]
- **Confidence:** [High / Medium / Low]
- **Evidence:** [Description of evidence collected]
- **Notes:** [Any additional context]

**ATT-02** [Must-Pass]
- **Result:** [PASS / FAIL]
- **Confidence:** [High / Medium / Low]
- **Evidence:** [Description of evidence collected]
- **Notes:** [Any additional context]

<!-- Repeat for all criteria in this subdomain -->

#### 1B. Engagement Pattern Prohibition

<!-- Repeat pattern for each criterion -->

#### 1C. Interface Restraint

<!-- Repeat pattern for each criterion -->

---

### Domain 02: Data Sovereignty

#### 2A. Data Portability

<!-- Repeat pattern -->

#### 2B. Data Collection Minimalism

<!-- Repeat pattern -->

#### 2C. Data Security & Deletion

<!-- Repeat pattern -->

---

### Domain 03: Honesty

#### 3A. Dark Pattern Prohibition

<!-- Repeat pattern -->

#### 3B. Algorithmic Transparency

<!-- Repeat pattern -->

#### 3C. Business Model Transparency

<!-- Repeat pattern -->

---

### Domain 04: Departure

#### 4A. Session Closure

<!-- Repeat pattern -->

#### 4B. Account Offboarding

<!-- Repeat pattern -->

#### 4C. Graceful Degradation

<!-- Repeat pattern -->

---

### Domain 05: Respect

#### 5A. Temporal Respect

<!-- Repeat pattern -->

#### 5B. Contextual Intelligence

<!-- Repeat pattern -->

#### 5C. Resource Respect

<!-- Repeat pattern -->

---

### Domain 06: Durability

#### 6A. Accessibility

<!-- Repeat pattern -->

#### 6B. Standards & Interoperability

<!-- Repeat pattern -->

#### 6C. Longevity

<!-- Repeat pattern -->

---

### Domain 07: Governance

#### 7A. Privacy & Legal Clarity

<!-- Repeat pattern -->

#### 7B. User Communication

<!-- Repeat pattern -->

#### 7C. Ethical Commitments

<!-- Repeat pattern -->

---

## Attestation Questionnaire

*For criteria requiring declarative attestation (automationLevel: manual). To be completed by the product team.*

| # | Criterion | Question | Response |
|---|---|---|---|
| 1 | DAT-13 | Is sensitive user data encrypted at rest? What algorithm and key length? How are keys managed? | [Pending] |
| 2 | DAT-16 | What is your backup retention policy after user deletion? Max days to complete purge from all backup systems? | [Pending] |
| 3 | DEP-03 | Does the application send re-engagement emails? Minimum delay after last activity? | [Pending] |
| 4 | DEP-12 | Have any updates in the last 12 months removed features or substantially changed the interface? Were users given choice? | [Pending] |
| 5 | GOV-03 | How are users notified of material policy changes? Is notification pre-effective-date? Does it include a change summary? | [Pending] |
| 6 | GOV-07 | What is the stated support response time? What percentage of requests meet that target? | [Pending] |
| 7 | HON-15 | Have any previously free features been moved behind a paywall in the last 24 months? Were users notified in advance? | [Pending] |

*Note: False attestation voids certification. Attestation answers are cross-referenced against observable evidence.*

---

## Attestation Cross-Reference

| Attestation | Observable Evidence | Consistent? | Notes |
|---|---|---|---|
| [Attestation claim] | [What was observed] | [Yes / No / Unable to verify] | [Details] |

---

## Flagged for Auditor Review

*Criteria where the automated assessment has Medium or Low confidence, or where judgment calls are needed.*

| Criterion | Finding | Confidence | Reason for Flag |
|---|---|---|---|
| [ID] | [PASS/FAIL] | [Medium/Low] | [Why this needs human judgment] |

---

## Recommendations

*Optional section for remediation guidance. Not part of the scoring.*

### High Priority (Must-Pass Failures)

1. [Criterion ID]: [What needs to change and why]

### Medium Priority (High-Value Scored Criteria)

1. [Criterion ID]: [What needs to change and estimated effort]

### Quick Wins (Low-Effort Improvements)

1. [Criterion ID]: [What needs to change]

---

*This audit was conducted using the Quiet Standards Framework v1.0, published by Hi-Low Studio LLC. The specification is open at hilowstudio.dev/standards/spec.*
