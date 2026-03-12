# Sprint 253: Business Response System (Owners Reply to Reviews)

**Date:** 2026-03-09
**Sprint Goal:** Enable verified business owners to respond to customer reviews, with admin moderation tools for flagging and hiding responses.

---

## Mission Alignment

Business responses are a cornerstone of trust-building. When owners can publicly respond to reviews, it signals transparency and accountability. This feature directly supports the TopRanker credibility mission by giving businesses a voice without compromising the integrity of user-generated reviews. The 1:1 review-to-response constraint prevents spam flooding, and admin moderation tools ensure quality control.

---

## Team Discussion

**Marcus Chen (CTO):** The business response system is one of those features that separates a review aggregator from a real marketplace. Yelp, Google, and TripAdvisor all have it -- the key differentiator for us is the moderation layer. We are not just letting owners post whatever they want; we have flag/hide controls from day one. The 1:1 constraint per review is intentional -- we do not want businesses drowning out negative reviews with multiple reply threads.

**Sarah Nakamura (Lead Engineer):** The module follows our established in-memory Map pattern. Two maps -- one keyed by responseId, one by reviewId -- give us O(1) lookups for both the owner-facing and public-facing queries. The MAX_RESPONSES eviction at 5000 is a safety valve; if we ever hit it in production we need to move to a persistent store. Route ordering is clean here -- no path conflicts like we had with city health routes.

**Cole Anderson (Backend):** I structured the business-responses module to be symmetric with our other domain modules -- tagged logger, clearX() for test isolation, stats endpoint for admin dashboards. The content length bounds (10-2000) prevent empty drive-by responses and enforce reasonable limits. The eviction sorts by createdAt which is O(n) at the boundary but only triggers beyond 5000 entries -- acceptable for the in-memory tier.

**Rachel Wei (CFO):** Business responses are a precursor to our Business Pro upsell. Owners who actively engage with reviews convert 3x better on paid plans in competitor data. This sprint gives us the response infrastructure; Sprint 260+ can add analytics showing owners their response rate and impact on trust scores, which becomes the value prop for the $49/mo plan.

**Jordan Blake (Compliance):** The moderation endpoints (flag/hide) satisfy our content moderation requirements under the Digital Services Act. Responses can be hidden without deletion, preserving audit trails. We should add a reason field to flagResponse in a future sprint for compliance logging, but the current structure is compliant for launch.

**Amir Patel (Architecture):** The dual-map design is elegant for the 1:1 constraint. The reviewResponses map acts as a uniqueness index without needing a database unique constraint. When we migrate to persistent storage, this maps cleanly to a UNIQUE index on review_id in a business_responses table. The route module is properly separated from the domain logic -- routes-owner-responses.ts only handles HTTP concerns, all business logic stays in business-responses.ts.

---

## Changes

### 1. Business Response Module
- **File:** `server/business-responses.ts` (new)
- `createResponse(reviewId, businessId, ownerId, content)` — creates response with 1:1 constraint
- `getResponse(responseId)` — lookup by response ID
- `getResponseForReview(reviewId)` — public-facing review response lookup
- `getResponsesByBusiness(businessId)` — all responses for a business
- `updateResponse(responseId, content)` — owner edits response
- `flagResponse(responseId)` — admin flags for review
- `hideResponse(responseId)` — admin hides from public view
- `getResponseStats()` — aggregate counts by status
- `clearResponses()` — test isolation reset
- Content length: 10-2000 chars, MAX_RESPONSES: 5000

### 2. Owner Response Routes
- **File:** `server/routes-owner-responses.ts` (new)
- `POST /api/owner/responses` — create response (requireAuth)
- `GET /api/owner/responses/:businessId` — list business responses (requireAuth)
- `PUT /api/owner/responses/:id` — update response (requireAuth)
- `GET /api/reviews/:reviewId/response` — public response lookup
- `POST /api/admin/responses/:id/flag` — admin flag (requireAuth)
- `POST /api/admin/responses/:id/hide` — admin hide (requireAuth)
- `GET /api/admin/responses/stats` — admin stats (requireAuth)

### 3. Route Wiring
- **File:** `server/routes.ts`
- Added import of `registerOwnerResponseRoutes` from `./routes-owner-responses`
- Added `registerOwnerResponseRoutes(app)` registration call

### 4. Tests
- **File:** `tests/sprint253-business-responses.test.ts`
- 38 tests across 4 describe blocks:
  - Business responses static (10): file exists, 9 exported functions, MAX_RESPONSES constant
  - Business responses runtime (16): create, duplicate rejection, content validation, CRUD, flag/hide, stats
  - Owner response routes static (8): file exists, 7 endpoints verified in source
  - Integration wiring (4): import, registration, clearResponses state reset

---

## PRD Gap Status
- Business owner responses were identified in the PRD as a Phase 2 feature -- this sprint delivers the backend infrastructure
- Frontend owner response UI (compose form, response display on business page) targeted for Sprint 256
