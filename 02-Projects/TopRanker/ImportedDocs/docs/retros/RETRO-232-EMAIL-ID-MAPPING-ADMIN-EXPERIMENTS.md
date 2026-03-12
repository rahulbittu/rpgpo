# Retrospective — Sprint 232: Email ID Mapping + Admin A/B Experiment UI

**Date:** 2026-03-09
**Duration:** 1 day
**Story Points:** 5
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Sarah Nakamura:** "The email-id-mapping module came together in under an hour. Two Maps, FIFO eviction, five exported functions — done. The bidirectional design means webhooks and admin dashboards both get O(1) lookups without duplicating storage logic."

**Jasmine Taylor:** "I tested the admin experiment endpoints from Postman and the full lifecycle works: create experiment, check stats, declare winner. This is the first time marketing can run A/B tests end-to-end without an engineering ticket. Massive productivity unlock for Nashville pre-launch."

**Marcus Chen:** "Clean separation of concerns. routes-admin-experiments.ts owns experiment admin, routes-webhooks.ts owns webhook processing, email-id-mapping.ts owns the bridge between them. No circular dependencies, no shared mutable state beyond the mapping module itself."

---

## What Could Improve

1. **Email ID mapping is in-memory only.** A server restart loses all mappings. For production, we should consider Redis or a lightweight DB table to persist mappings across deploys. Not urgent at current volume but will matter at scale.

2. **Admin experiment endpoints lack pagination.** The GET list endpoint returns all experiments. Fine for 10 experiments, problematic at 100+. Should add limit/offset before the marketing team scales up their testing cadence.

3. **No rate limiting on experiment creation.** The POST create endpoint validates input but doesn't throttle. An accidental script loop could create hundreds of experiments. A simple rate limit or daily cap would prevent this.

4. **Webhook tracking ID fallback is silent.** When getTrackingIdFromResend returns undefined, routes-webhooks.ts falls back to the raw email_id without logging a warning. Adding a debug log would help diagnose mapping gaps.

---

## Action Items

| Sprint | Action | Owner |
|--------|--------|-------|
| 233 | Add Redis-backed persistence option for email ID mappings | Sarah Nakamura |
| 233 | Add pagination to GET /api/admin/experiments | Amir Patel |
| 234 | Add rate limiting to experiment creation endpoint | Nadia Kaur |
| 234 | Add debug logging when tracking ID fallback is used in webhooks | Marcus Chen |

---

## Team Morale

**8 / 10** — Focused sprint with clear deliverables that directly serve the email analytics and marketing self-service goals. The team appreciates the small scope (5 story points) that still delivers meaningful capability. Momentum is strong heading into Sprint 233.
