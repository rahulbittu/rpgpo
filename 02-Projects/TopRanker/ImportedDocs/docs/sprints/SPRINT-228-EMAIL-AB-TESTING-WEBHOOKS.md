# Sprint 228 — Email A/B Testing + Resend Webhook Integration

**Date:** 2026-03-09
**Story Points:** 5
**Status:** Complete

---

## Mission Alignment

Sprint 228 turns email from a one-way channel into a measured, optimizable pipeline. A/B testing enables subject line experiments — which phrasing drives more opens? Resend webhooks close the measurement loop: we now know when emails are opened, clicked, or bounced.

---

## Team Discussion

**Jasmine Taylor (Marketing):** "A/B testing is the tool I've been asking for since Sprint 222. Two subject lines, deterministic assignment, auto-stats. We'll run our first experiment on the Day 2 drip email — 'Top 5 near you' vs 'Discover your neighborhood's best'. Open rate decides the winner."

**Sarah Nakamura (Lead Eng):** "The A/B framework is deterministic: SHA-256 hash of experimentId+memberId mod weight. Same user always gets the same variant. No random drift. getSubjectForMember() is a drop-in replacement for hardcoded subjects."

**Marcus Chen (CTO):** "Resend webhooks complete the email analytics loop. Sprint 224 built tracking, Sprint 226 wired it into sendEmail, now Sprint 228 receives delivery events back from Resend. Full circle."

**Nadia Kaur (Security):** "Webhook signature verification via HMAC-SHA256 with RESEND_WEBHOOK_SECRET. In dev mode, verification is skipped with a warning — not silently. Production must have the secret set."

**Rachel Wei (CFO):** "Email optimization directly impacts revenue. If we improve drip open rates from 20% to 30%, that's 50% more users hitting the rating unlock step. More raters = more credibility = more business value."

**David Okonkwo (VP Product):** "The webhook handler processes 5 event types: opened, clicked, bounced, delivery_error, complained. Each maps to our tracking module. The admin dashboard can now show real email engagement."

---

## Deliverables

### Email A/B Testing (`server/email-ab-testing.ts`)

- createExperiment with named variants and weight-based assignment
- Deterministic variant assignment via SHA-256 hash
- getSubjectForMember convenience function
- completeExperiment with winner tracking
- getExperimentStats for variant assignment counts
- In-memory store (50 max experiments)

### Resend Webhook Handler (`server/routes-webhooks.ts`)

- POST /api/webhooks/resend endpoint
- HMAC-SHA256 signature verification
- Handles: email.opened, email.clicked, email.bounced, email.delivery_error, email.complained
- Maps to trackEmailOpened/Clicked/Bounced/Failed
- Registered in routes.ts

---

## Tests

- 25 new tests in `sprint228-email-ab-testing-webhooks.test.ts`
- Full suite: 4,190+ tests across 158 files, all passing
