# Sprint 441: Photo Moderation DB Persistence

**Date:** 2026-03-10
**Type:** Infrastructure / Production Readiness
**Story Points:** 3

## Mission

Migrate the photo moderation pipeline from an in-memory Map to PostgreSQL persistence via Drizzle ORM. This is P1 per SLT-440 — server restart currently loses all pending photo submissions. Required before any marketing push.

## Team Discussion

**Marcus Chen (CTO):** "This is the highest-priority infrastructure item. The in-memory store was acceptable for Sprint 254's initial build, but with community photo upload live since Sprint 438, we can't afford data loss on restart. Clean migration: same API shape, just DB-backed."

**Rachel Wei (CFO):** "Non-negotiable before marketing. If a user uploads a photo and it disappears because we restarted the server, that's a trust violation. This sprint directly protects user-generated content."

**Amir Patel (Architecture):** "The migration pattern is clean: add `photoSubmissions` table to schema.ts, make all moderation functions async, replace Map operations with Drizzle queries. The admin routes just need async/await wrappers. Four indexes cover the query patterns: by business, by member, by status, by submission date."

**Sarah Nakamura (Lead Eng):** "Key changes: (1) New `photo_submissions` table with 14 columns matching the old interface, (2) all exported functions become async, (3) admin route handlers become async, (4) routes-businesses.ts adds `await` before `submitPhoto`. The `clearSubmissions` export is removed — no longer needed with DB. `getAllowedMimeTypes` and `getMaxFileSize` stay synchronous since they're pure utilities."

**Nadia Kaur (Security):** "The migration improves security posture. In-memory store had a `MAX_SUBMISSIONS = 3000` cap that could be exploited for data loss by flooding. DB-backed store scales naturally. The moderatorId foreign key to members table ensures audit trail integrity."

**Priya Sharma (Design):** "No UI changes — this is a backend migration. The upload flow, moderation queue, and approved photo display all work identically from the user's perspective."

## Changes

### Modified Files
- `shared/schema.ts` (+24 LOC) — New `photoSubmissions` table with indexes, FK constraints, PhotoSubmission type export
- `server/photo-moderation.ts` (113→120 LOC) — Replaced in-memory Map with Drizzle DB queries; all functions async
- `server/routes-admin-photos.ts` (70→70 LOC) — Added async/await to all route handlers
- `server/routes-businesses.ts` (282→282 LOC) — Added `await` before `submitPhoto` call

### Schema Addition
```
photo_submissions (
  id, business_id, member_id, url, caption, status, rejection_reason,
  moderator_id, moderator_note, file_size, mime_type, submitted_at, reviewed_at
)
Indexes: idx_photo_sub_business, idx_photo_sub_member, idx_photo_sub_status, idx_photo_sub_submitted
```

### Key Migration Details
- **Removed:** `clearSubmissions()` export, `MAX_SUBMISSIONS` cap, in-memory `Map<string, PhotoSubmission>`
- **Added:** `PhotoSubmissionRow` interface matching DB columns
- **Unchanged:** `getAllowedMimeTypes()`, `getMaxFileSize()` (pure utilities, no DB)
- **All consumers updated:** routes-admin-photos.ts (async handlers), routes-businesses.ts (await)

## Test Results
- **336 files**, **~8,050 tests**, all passing
- Server build: ~610kb, 32 tables (was 31)
- Sprint 254 tests updated: runtime tests → source analysis tests (DB required for runtime)

## Production Readiness
- Photo submissions now survive server restarts
- No data migration needed (in-memory store was ephemeral)
- Indexes cover all query patterns: admin queue (status), business photos (businessId + approved), member history (memberId)
- Foreign keys ensure referential integrity (businesses, members)
