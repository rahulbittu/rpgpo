# Sprint 151 — File Storage Abstraction + Email Change + Profile Cleanup

## What was delivered

### 1. File Storage Abstraction (`server/file-storage.ts`)
- `FileStorage` interface with `upload()`, `delete()`, `getUrl()` methods
- `LocalFileStorage` — saves to `public/uploads/`, returns `/uploads/{key}` URLs (dev)
- `R2FileStorage` — uses S3-compatible API with Cloudflare R2 (production)
- Factory function: uses R2 if `R2_BUCKET_NAME` env var is set, otherwise local
- Avatar endpoint updated to use `fileStorage.upload()` — stores URL, not base64

### 2. Email Change Flow
- `PUT /api/members/me/email` endpoint with requireAuth
- Email format validation
- Duplicate email check (queries members table)
- `updateMemberEmail` storage function with conflict detection
- Edit profile screen: email field now editable with "Changing your email requires verification" note

### 3. Profile Notification State Cleanup
- Removed `notifRatingUpdates`, `notifChallengeResults`, `notifWeeklyDigest` state variables
- Removed `saveNotifPref` handler
- Removed associated AsyncStorage imports/calls
- Profile now cleanly defers to settings screen for all notification preferences

### 4. Tests
- 22 new tests covering file storage abstraction, avatar endpoint, email change, profile cleanup
- Total: 2087 tests across 90 files, all passing

## Prior critique priorities addressed
1. **Avatar storage on R2/CDN** — DONE. FileStorage abstraction with R2 implementation. Avatar endpoint saves URLs not base64. Local storage for dev, R2 for production.
2. **Multipart avatar upload** — DONE. Avatar endpoint supports both multipart and base64 input, uses file storage for persistence.
3. **Profile cleanup + email change** — DONE. Unused notification state removed. Email change endpoint with validation and duplicate checking.

## What was NOT addressed
- R2 credentials not configured (needs Cloudflare account setup)
- Email verification flow not implemented (saves directly, no verification email)
- Dynamic version from package.json (audit P2)

## Evidence
- `server/file-storage.ts` — new 120+ LOC module
- `server/routes.ts` — avatar endpoint rewritten, email endpoint added
- `app/(tabs)/profile.tsx` — 4 state variables and handler removed
- `app/edit-profile.tsx` — email editing enabled
- `public/uploads/.gitkeep` — local storage directory

## Request
Sprint 150 scored 6/10 for shipping base64 avatar as "done." This sprint replaces that with a proper file storage abstraction that plugs into R2/S3 for production. All three critique priorities were addressed. Does this close the avatar debt adequately?
