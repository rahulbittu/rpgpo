# Sprint 266: Rating Photo Upload (Phase 2a)

**Date:** March 9, 2026
**Story Points:** 8
**Focus:** Photo upload in rating flow with verification boost messaging + async CDN upload

## Mission
Enable users to attach photos to their ratings. Photos provide a +15% verification boost, making the rating carry more weight. This is the first piece of Rating Integrity Phase 2 — verification as an additive, optional signal.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The key design choice was making photo upload async. The rating submits immediately — the photo uploads in the background after confirmation. This means the user never waits on a slow upload. If the upload fails, the rating still exists; the user just doesn't get the verification boost. Non-blocking, non-critical."

**Amir Patel (Architecture):** "We already had the `fileStorage` abstraction from Sprint 253 — LocalFileStorage for dev, R2FileStorage for prod. The new `routes-rating-photos.ts` module uses it directly. I created a `rating_photos` table with `cdnKey` for storage management and `isVerifiedReceipt` for the future receipt verification feature (+25% boost)."

**Nadia Kaur (Cybersecurity):** "Photo upload validates: MIME type (JPEG/PNG/WebP only), file size (max 10MB), minimum size (1KB to reject corrupted files), and ownership (you can only upload to your own rating). The verification boost is computed server-side — the client sees the messaging but can't fake the boost value."

**Marcus Chen (CTO):** "The photo UI already existed in `RatingExtrasStep` from Sprint 172 — image picker, preview, remove button. We just needed to wire the upload and add the verification boost messaging. The '+15% verification boost' hint on the add button and the '+15% boost' badge overlay on the preview give users immediate feedback."

**Jasmine Taylor (Marketing):** "The verification boost messaging is subtle but powerful. Users see that photos make their rating 'count more.' This incentivizes genuine reviews with real food photos — exactly what makes our rankings trustworthy. WhatsApp campaigns can highlight: 'Add a photo and your rating carries 15% more weight.'"

**Jordan Blake (Compliance):** "Photos are stored with CDN keys that include the businessId and ratingId — making it traceable for any GDPR deletion requests. The rating_photos table has a clear foreign key to ratings, so cascading deletion is straightforward."

## Changes

### Schema
- **`shared/schema.ts`**: New `rating_photos` table (id, ratingId, photoUrl, cdnKey, isVerifiedReceipt, uploadedAt)
- **`docs/ARCHITECTURE.md`**: Updated to 32 Tables, added rating_photos entry

### Server — Photo Upload Routes
- **`server/routes-rating-photos.ts`** (NEW):
  - `POST /api/ratings/:id/photo` — base64 upload, CDN storage, verification boost
  - `GET /api/ratings/:id/photos` — list photos for a rating
  - Ownership validation, MIME type check, size limits
  - Computes verification boost: photo +15%, receipt +25%, capped at 50%
  - Triggers score recalculation after upload
- **`server/routes.ts`**: Imports and registers `registerRatingPhotoRoutes`

### Client — Async Photo Upload
- **`lib/hooks/useRatingSubmit.ts`**:
  - Added `photoUri` parameter to options
  - New `uploadRatingPhoto()` helper: reads URI as base64, POSTs to `/api/ratings/:id/photo`
  - Upload triggered in `onSuccess` callback — non-blocking, fire-and-forget with catch
- **`app/rate/[id].tsx`**: Passes `photoUri` to `useRatingSubmit` hook

### UI — Verification Boost Messaging
- **`components/rate/RatingExtrasStep.tsx`**:
  - Photo add button: "+15% verification boost" hint text (gold color)
  - Photo preview: green "verified" badge overlay with "+15% boost" text
  - New styles: `photoBoostHint`, `photoVerifiedBadge`, `photoVerifiedText`

### Tests
- **22 new tests** in `tests/sprint266-rating-photos.test.ts`
- Schema, route registration, validation, CDN integration, verification boost, client wiring, UI messaging

## Test Results
- **189 test files, 5,295 tests, all passing** (~2.7s)
- +22 new tests from Sprint 266
- 0 regressions

## Rating Integrity Part 4 Status
- [x] Photo upload: +15% verification boost
- [x] Receipt flag: +25% boost (endpoint supports it, UI for receipt selection in Phase 2b)
- [ ] Dish detail: +5% boost (already exists via dish selection, needs formal boost computation)
- [ ] Time plausibility: +5% boost (needs time-on-page tracking)
- [ ] Verification boost persisted in ratings table (needs schema migration, Phase 2b)
