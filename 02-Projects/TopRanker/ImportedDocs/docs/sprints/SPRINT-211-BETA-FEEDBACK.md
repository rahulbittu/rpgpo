# Sprint 211 — Beta Feedback Collection + Wave 3 Monitoring

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Wave 3 invites go out. 100 beta users need a way to report bugs, request features, and share what they love. Structured feedback collection replaces anecdotal reports with categorized, quantifiable data that feeds directly into Sprint 212+ prioritization.

## Team Discussion

**Marcus Chen (CTO):** "We can't launch without knowing what beta users think. The feedback form is simple — rating, category, message — but it gives us structured data instead of scattered Slack messages."

**Rachel Wei (CFO):** "Every piece of feedback is a signal about product-market fit. If 80% of feedback is 'praise' category with 4-5 stars, we're on track. If 50% is 'bug' with 1-2 stars, we delay."

**Sarah Nakamura (Lead Eng):** "Schema is clean: betaFeedback table with member reference, 1-5 rating, category enum, message, screen context, app version. Two indexes for common queries. Storage module has create + read + stats."

**Leo Hernandez (Frontend):** "The feedback endpoint is user-facing at POST /api/feedback — any authenticated user can submit. Admin view at GET /api/admin/feedback shows recent + stats. Both validate inputs strictly."

**Jasmine Taylor (Marketing):** "Wave 3 invites are ready. 100 users across 4 Texas cities. The feedback form gives them a voice from day one. I'll monitor the admin dashboard for patterns."

**Nadia Kaur (Security):** "Message length capped at 2000 chars, screenContext at 100, appVersion at 50. Category is validated against an allowlist. No injection risk."

**Jordan Blake (Compliance):** "Feedback data is linked to memberId but the message content is free-form. No PII concerns beyond what the user voluntarily writes. Retention follows analytics policy."

## Deliverables

### Beta Feedback Schema (`shared/schema.ts`)
- `betaFeedback` table: id, memberId, rating (1-5), category, message, screenContext, appVersion, createdAt
- Indexes on memberId and createdAt

### Feedback Storage (`server/storage/feedback.ts`)
- `createFeedback(params)` — insert with validation
- `getRecentFeedback(limit)` — ordered by createdAt desc
- `getFeedbackStats()` — count by category, total count

### User Feedback API (`server/routes.ts`)
- `POST /api/feedback` — authenticated users submit feedback
- Validates: rating 1-5, category allowlist, message required
- Input length limits: message 2000, screenContext 100, appVersion 50

### Admin Feedback View (`server/routes-admin.ts`)
- `GET /api/admin/feedback` — recent feedback + stats
- Parallel fetch: recent items + category stats

## Tests

- 32 new tests in `tests/sprint211-beta-feedback.test.ts`
- Full suite: **3,734+ tests across 141 files, all passing**
