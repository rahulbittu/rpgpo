# Sprint 336: Remove Anti-Requirement Violations (P0)

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Remove Sprint 253 business-responses and Sprint 257 review-helpfulness per CEO decision in SLT-335

## Mission
The Rating Integrity System Part 10 explicitly prohibits two features that were built in earlier sprints:
- **Sprint 253: Business owner responses to ratings** — Violates "NO business owner response to ratings in V1." Creates false equivalence between business voice and rater voice.
- **Sprint 257: Review helpfulness voting** — Violates "NO helpful/not-helpful upvotes." Yelp mechanic. Ratings matter through weighting, not community votes.

These features have been flagged for 82 and 78 sprints respectively. In SLT-335, the CEO made the final decision: remove both in Sprint 336 as P0 priority. This sprint executes that decision comprehensively — removing all code, routes, schema, tests, UI references, and downstream integrations.

## Team Discussion

**Marcus Chen (CTO):** "This is governance in action. When we wrote the Rating Integrity System, we said these things should not exist. Building them was a mistake. Every sprint they stayed was a compounding governance failure. Removal is not a regression — it's alignment. The codebase should reflect our principles."

**Rachel Wei (CFO):** "Zero financial impact from removal. The business-responses feature was gated behind Dashboard Pro but never marketed as a selling point. The helpfulness voting was a free feature with no revenue tie. The reputational risk of keeping features that contradict our own governing documents far outweighs any hypothetical value."

**Amir Patel (Architecture):** "Clean removal across 25+ files. The server build dropped from 607.4kb to 588.7kb — 18.7kb reduction. The reputation system lost the `helpful_votes` signal (0.10 weight) which was redistributed to `rating_count` (+0.05) and `rating_consistency` (+0.05). Schema went from 32 to 31 tables. All remaining tests pass."

**Sarah Nakamura (Lead Eng):** "The removal touched server routes, schema, storage, push notifications, notification preferences, reputation signals, badge definitions, API types, and UI components. Every trace removed. The sprint177 test file was rewritten to keep only the `getRatingById` helper tests — everything else was response-specific."

**Jordan Blake (Compliance):** "This resolves the longest-standing governance violation in the project. Part 10 of the Rating Integrity System is now fully enforced. No features in the codebase contradict the governing document."

**Nadia Kaur (Cybersecurity):** "Removing the business-responses feature also removes an attack surface. Owner response endpoints were authenticated but still represented additional API surface area with input sanitization requirements. Fewer endpoints, smaller attack surface."

**Priya Sharma (QA):** "40 new tests verify comprehensive removal. 253 test files, 6,217 tests, all passing. The test count dropped by 74 (from 6,291) due to removed test files, partially offset by 40 new verification tests."

**Jasmine Taylor (Marketing):** "From a marketing perspective, we never positioned these features. Our differentiator is credibility-weighted ratings, not business responses or helpful votes. Removing them sharpens our story."

## Changes

### Files Deleted (7)
- `server/business-responses.ts` — In-memory business response store
- `server/routes-owner-responses.ts` — Owner response route handlers
- `server/review-helpfulness.ts` — In-memory helpfulness voting store
- `server/routes-review-helpfulness.ts` — Helpfulness route handlers
- `server/storage/responses.ts` — Database storage layer for responses
- `tests/sprint253-business-responses.test.ts` — Business responses test suite
- `tests/sprint257-review-helpfulness.test.ts` — Review helpfulness test suite

### Files Modified (20+)
- `server/routes.ts` — Removed 2 imports + 2 route registrations
- `server/routes-businesses.ts` — Removed 3 response endpoints (POST/GET/DELETE)
- `server/push.ts` — Removed `notifyRatingResponse()` function
- `server/routes-members.ts` — Removed `ratingResponses` from notification preferences
- `server/reputation-v2.ts` — Removed `helpful_votes` signal, redistributed weight
- `server/storage/index.ts` — Removed response exports
- `server/badge-share.ts` — Removed helpful-voice and influencer badges
- `shared/schema.ts` — Removed `ratingResponses` table + type + notification type comment
- `scripts/verify-schema.ts` — Removed `rating_responses` from expected tables
- `docs/ARCHITECTURE.md` — Updated table count from 32 to 31
- `app/settings.tsx` — Removed ratingResponses key, default, and toggle
- `app/(tabs)/profile.tsx` — Removed Helpfulness breakdown rows
- `app/business/enter-dashboard-pro.tsx` — Removed response tools from feature list
- `app/business/claim.tsx` — Removed "response tools" from marketing copy
- `lib/badges.ts` — Removed helpful-voice and influencer checks + helpfulVotes type
- `lib/badge-definitions.ts` — Removed 2 badge definitions
- `lib/api.ts` — Removed helpfulness from breakdown + helpfulVotes from context
- `lib/notifications.ts` — Removed rating_response type and template
- `lib/hooks/useBadgeContext.ts` — Removed helpfulVotes from context

### Tests Updated (8)
- `tests/sprint177-owner-rating-responses.test.ts` — Rewritten to keep only getRatingById
- `tests/sprint175-push-triggers.test.ts` — Removed notifyRatingResponse tests
- `tests/sprint182-push-deep-links.test.ts` — Removed rating_response persistence test
- `tests/sprint153-ui-backend-audit.test.ts` — Removed ratingResponses preference test
- `tests/sprint116-dashboard.test.ts` — Removed ratingResponses default test
- `tests/sprint148-settings-sync.test.ts` — Updated from 6 to 5 notification keys
- `tests/sprint239-reputation-v2.test.ts` — Updated from 7 to 6 reputation signals
- `tests/sprint266-rating-photos.test.ts` — Updated table count from 32 to 31
- `tests/sprint296-badges-extraction.test.ts` — Removed helpfulVotes from context
- `tests/badges.test.ts` — Removed helpfulVotes from context
- `tests/use-badge-context.test.ts` — Removed helpfulVotes from context
- `tests/badge-award-flow.test.ts` — Removed helpfulVotes from context

## Metrics
- **253 test files, 6,217 tests, all passing** (~3.5s)
- **Server build:** 588.7kb (down from 607.4kb, -18.7kb)
- **Schema tables:** 31 (down from 32)
- **Reputation signals:** 6 (down from 7)
- **Files deleted:** 7
- **Files modified:** 20+
- **Tests updated:** 12
