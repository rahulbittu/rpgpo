# Sprint 254: Photo Moderation Pipeline

**Date:** 2026-03-09
**Sprint Goal:** Build a photo moderation pipeline so user-uploaded photos go through admin review before appearing on business pages.

---

## Mission Alignment

User-uploaded photos are one of the highest-trust signals on any review platform. Fake, low-quality, or inappropriate photos erode credibility instantly. By routing every submission through a moderation queue with explicit approve/reject workflows and rejection reasons, TopRanker ensures that the photo content on business pages meets the same trust bar as our credibility-weighted ratings. This is foundational infrastructure for the visual layer of trust.

---

## Team Discussion

**Marcus Chen (CTO):** Photo moderation is a prerequisite for enabling user-generated photo uploads at all. We cannot ship a photo upload feature without a review gate -- that is how platforms end up with spam and inappropriate content. The pipeline is intentionally simple: in-memory Map, pending/approved/rejected states, typed rejection reasons. When we scale, the interface stays the same and the storage layer swaps to Postgres. The 3000-entry cap with oldest-first eviction is a safety valve, not a scaling strategy.

**Sarah Nakamura (Lead Engineer):** The module follows our established pattern -- tagged logger, clearX() for test isolation, defensive copies on getAllowedMimeTypes(), MAX_SUBMISSIONS eviction. The route layer is thin -- five endpoints, each delegating to the domain module. No business logic leaks into the HTTP layer. The reject endpoint requires a reason in the request body, which is the right constraint for audit trails. We have 40 tests covering static analysis, runtime behavior, route wiring, and integration.

**Nadia Kaur (Cybersecurity):** The MIME type allowlist is critical -- only JPEG, PNG, and WebP. No SVG (XSS vector), no GIF (abuse vector), no BMP (bloat). The 10MB cap prevents resource exhaustion on upload. In a future sprint we should add content-type sniffing to verify that the actual file bytes match the declared MIME type -- header-only checks are bypassable. The admin endpoints still lack isAdminEmail verification, which was an action item from Sprint 253. We are tracking this for a consolidated fix.

**Jordan Blake (Compliance):** Rejection reasons are typed enums -- inappropriate, low_quality, irrelevant, copyright, spam, other. This gives us structured data for compliance reporting and appeals. Under GDPR, users have the right to know why their content was rejected, and these reason codes map directly to the notification templates we will build. The moderatorNote field allows free-text context for edge cases. We should add a user-facing appeal endpoint in a future sprint.

**Amir Patel (Architecture):** The submission-to-review pipeline is a clean state machine: pending -> approved | rejected. No transitions back, which simplifies reasoning about the data. The dual query pattern -- getPendingPhotos for admins, getPhotosByBusiness for public -- mirrors the business responses dual-map approach. When we move to persistent storage, the status column plus businessId index will handle both queries efficiently. The route file imports only from the domain module, maintaining our HTTP/domain separation.

**Jasmine Taylor (Marketing):** User photos are our most shareable content. When we launch the frontend upload flow, the approved photos become the hero images on business cards across rankings, search, and challengers. The moderation queue ensures we are only surfacing high-quality visuals. This also unlocks a future "Photo of the Week" feature for social media content -- curated from the approved queue. The rejection reasons help us provide constructive feedback to users so they submit better content next time.

---

## Changes

### 1. Photo Moderation Module
- **File:** `server/photo-moderation.ts` (new)
- `submitPhoto(businessId, memberId, url, caption, fileSize, mimeType)` -- validates and creates pending submission
- `approvePhoto(photoId, moderatorId, note?)` -- transitions to approved
- `rejectPhoto(photoId, moderatorId, reason, note?)` -- transitions to rejected with typed reason
- `getPendingPhotos(limit?)` -- admin queue view
- `getPhotosByBusiness(businessId)` -- public approved photos
- `getPhotoStats()` -- aggregate counts with byReason breakdown
- `getAllowedMimeTypes()` / `getMaxFileSize()` -- config accessors
- `clearSubmissions()` -- test isolation
- Validation: MIME allowlist (jpeg/png/webp), 10MB max, 500-char caption limit
- Eviction: oldest-first when exceeding 3000 submissions

### 2. Admin Photo Routes
- **File:** `server/routes-admin-photos.ts` (new)
- `GET /api/admin/photos/pending` -- moderation queue with optional limit
- `GET /api/admin/photos/stats` -- aggregate stats with rejection reason breakdown
- `POST /api/admin/photos/:id/approve` -- approve with optional note
- `POST /api/admin/photos/:id/reject` -- reject with required reason and optional note
- `GET /api/photos/business/:businessId` -- public approved photos for a business

### 3. Route Wiring
- **File:** `server/routes.ts`
- Added import of `registerAdminPhotoRoutes` from `./routes-admin-photos`
- Added `registerAdminPhotoRoutes(app)` registration call

### 4. Tests
- **File:** `tests/sprint254-photo-moderation.test.ts`
- 12 static analysis tests (file exists, exports, MIME types, file size, logger tag)
- 16 runtime tests (submit success/failure, approve, reject, pending filter, business filter, stats, clear, defensive copy)
- 8 admin route static tests (file exists, export, 5 endpoints, import source)
- 4 integration tests (routes.ts wiring, crypto usage)
- **Total: 40 tests**

---

## PRD Gap Updates

- Photo moderation pipeline now exists as infrastructure -- frontend upload UI and user notification on rejection still needed
- Admin photo review dashboard pending frontend work
- Content-type byte sniffing not yet implemented (Nadia's recommendation)
- No user-facing appeal flow yet (Jordan's compliance recommendation)
