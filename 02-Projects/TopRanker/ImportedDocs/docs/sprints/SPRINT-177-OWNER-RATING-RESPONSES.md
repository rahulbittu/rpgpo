# Sprint 177: Owner Dashboard Rating Responses

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Business owners can respond to individual ratings — schema, API, access control, push notifications

---

## Mission Alignment
Owner responses create a two-way conversation between businesses and raters. This builds trust from both directions: raters see their feedback acknowledged, owners demonstrate they care. It's also the core value proposition for the $49/mo Dashboard Pro tier — you pay to engage with your customers.

---

## Team Discussion

**Marcus Chen (CTO):** "Second P0 from SLT-175 delivered. The response system is a new table (`ratingResponses`), a storage module (`responses.ts`), three API endpoints, and a push notification trigger. Gated to Pro subscribers — free owners see ratings but can't respond."

**Sarah Nakamura (Lead Eng):** "The submit endpoint has four layers of validation: (1) text exists and is 2-500 chars, (2) rating exists, (3) caller owns the business, (4) business has Pro subscription. The upsert pattern means owners can edit their response by re-submitting. Delete is separate."

**Amir Patel (Architecture):** "The `getResponsesForRatings` batch function returns a Map keyed by ratingId — efficient for rendering multiple ratings with their responses in a single query. No N+1. The business page can fetch responses alongside ratings in one go."

**Priya Sharma (Design):** "The public GET endpoint means responses show on the business page for everyone to see. This is the social proof loop: owner responds → other users see the business cares → trust increases → more ratings."

**Nadia Kaur (Security):** "Response text is sanitized to 500 chars. Owner identity is verified against business.ownerId. Delete checks both ratingId and ownerId (double check). The push notification to the rater respects their `ratingResponses` preference. No way for non-owners to submit responses."

**Rachel Wei (CFO):** "This completes the Dashboard Pro value prop: analytics + response tools + extended history. We can now market the subscription with a clear feature table. Next sprint's QR codes will drive more in-venue ratings for owners to respond to."

---

## Changes

### New Files
| File | Lines | Purpose |
|------|-------|---------|
| `server/storage/responses.ts` | 83 | CRUD for rating responses (submit, get, batch get, delete) |

### Schema (shared/schema.ts)
- New `ratingResponses` table: id, ratingId, businessId, ownerId, responseText, timestamps
- Indexes on ratingId and businessId
- Exported `RatingResponse` type

### Modified Files
| File | Change |
|------|--------|
| `server/routes-businesses.ts` | 3 new endpoints: POST/GET/DELETE /api/ratings/:id/response |
| `server/storage/ratings.ts` | Added `getRatingById()` helper |
| `server/storage/index.ts` | Export response functions + getRatingById |

### API Endpoints (New)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/ratings/:id/response` | Owner + Pro | Submit/update response |
| GET | `/api/ratings/:id/response` | Public | Get response for a rating |
| DELETE | `/api/ratings/:id/response` | Owner | Remove response |

### Access Control
- **Submit:** requireAuth → owner check → Pro subscription check → admin bypass
- **Get:** Public (no auth required)
- **Delete:** requireAuth → owner check

---

## Test Results
- **35 new tests** for owner rating responses
- Full suite: **2,603 tests** across 110 files — all passing, <1.8s
