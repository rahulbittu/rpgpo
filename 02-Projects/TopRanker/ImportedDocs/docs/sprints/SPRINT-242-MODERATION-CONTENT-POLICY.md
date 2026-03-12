# Sprint 242 — Review Moderation Queue + Content Policy Engine

**Date**: 2026-03-09
**Theme**: Trust Infrastructure — Content Moderation
**Story Points**: 13
**Tests Added**: 52 (sprint242-moderation-content-policy.test.ts)

---

## Mission Alignment

Trustworthy rankings require trustworthy content. Without automated content moderation,
fake reviews, spam, and abusive content erode platform credibility. The content policy
engine and moderation queue give us the infrastructure to evaluate every piece of
user-generated content against defined policies and route violations to human moderators
for final decisions. This is foundational trust infrastructure.

---

## Team Discussion

**Marcus Chen (CTO)**: "Content moderation is table stakes for any platform that accepts
user-generated content. We're late on this, frankly. The two-tier approach -- automated
policy engine for initial screening, plus a human moderation queue -- is the right
architecture. Fully automated rejection without human review creates legal risk. The
policy engine catches the obvious stuff; moderators handle the edge cases."

**Sarah Nakamura (Lead Engineer)**: "The moderation queue follows our established in-memory
pattern from notifications.ts and alerting.ts. Cap at 2000 items, FIFO with unshift/pop,
tagged logger. The content policy engine is pure functions with no side effects other than
logging -- easy to test, easy to extend. I kept them as separate modules because the policy
engine is reusable beyond just reviews -- we can apply it to photo captions, replies,
business descriptions, any text content."

**Jordan Blake (Compliance)**: "The six policy categories cover our legal exposure: profanity
for community standards, spam for platform integrity, personal info for privacy compliance
(GDPR/CCPA), competitor mentions for business fairness, incentivized reviews for FTC
compliance, and off-topic for content relevance. The severity levels map directly to our
response obligations -- high severity means we must act within 24 hours, medium within
48 hours, low is at moderator discretion."

**Nadia Kaur (Cybersecurity)**: "I reviewed the regex patterns for ReDoS vulnerability.
The patterns are simple alternations and character classes with bounded repetition -- no
nested quantifiers or catastrophic backtracking risk. The (.)\1{4,} pattern for repetitive
characters is bounded by the input length. For production, we should add input length limits
(already capped at review text limits) and consider running pattern matching in a worker
thread for large batch operations."

**Amir Patel (Architecture)**: "Clean module separation. content-policy.ts is a pure
evaluation engine with no dependencies other than logger. moderation-queue.ts is a stateful
queue manager. routes-admin-moderation.ts is a thin HTTP layer that delegates to the queue.
No DB imports means zero migration coupling. When we're ready for persistence, we swap the
in-memory array for Drizzle queries and the API surface stays identical. The admin routes
follow the exact same pattern as routes-admin-reputation.ts -- consistent developer experience."

**Cole Anderson (QA)**: "52 tests across six groups: static analysis for all three modules,
runtime tests for both the policy engine and queue, and integration tests proving the wiring
works end-to-end. I'm particularly pleased with the runtime coverage -- we test every policy
type triggering correctly, the reject-beats-flag priority logic, queue lifecycle operations
including edge cases like approving already-resolved items, and the full content-to-queue
integration flow."

---

## Changes

### New Files
- `server/content-policy.ts` — Content policy engine with 6 rule categories, severity levels, and pattern matching
- `server/moderation-queue.ts` — In-memory moderation queue (2000 cap) with add/approve/reject/stats/query
- `server/routes-admin-moderation.ts` — 5 admin API endpoints for queue management
- `tests/sprint242-moderation-content-policy.test.ts` — 52 tests across 6 groups

### Modified Files
- `server/routes.ts` — Import and register admin moderation routes

---

## API Endpoints Added

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/moderation/queue` | Get pending moderation items (limit param) |
| GET | `/api/admin/moderation/stats` | Queue statistics (total/pending/approved/rejected) |
| POST | `/api/admin/moderation/:id/approve` | Approve a pending item |
| POST | `/api/admin/moderation/:id/reject` | Reject a pending item |
| GET | `/api/admin/moderation/business/:businessId` | Items for a specific business |

---

## Content Policy Rules

| Rule | Severity | Action | Description |
|------|----------|--------|-------------|
| profanity | high | reject | Profane or abusive language |
| spam | medium | flag | Repetitive or promotional content |
| personal_info | high | reject | Phone numbers, emails in reviews |
| competitor_mention | low | flag | References to competitor platforms |
| incentivized | high | reject | Signs of paid/incentivized reviews |
| off_topic | low | flag | Content unrelated to business review |

---

## PRD Gaps Addressed

- Content moderation infrastructure (previously missing)
- Admin moderation dashboard API surface
- Automated policy evaluation for UGC
