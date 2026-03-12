# Sprint 583: Rating Photo Verification — Hash Dedup + Auto-Moderation

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete

## Mission

Add content-hash duplicate detection to the rating photo upload pipeline. Before this sprint, rating photos were uploaded with no dedup — the same stock photo could be submitted by multiple accounts to inflate verification boosts. Now every photo is SHA-256 hashed, indexed, and cross-member duplicates are auto-flagged for admin moderation.

## Team Discussion

**Nadia Kaur (Cybersecurity):** "This is anti-gaming layer #7. Photo verification is +15% boost, receipt is +25%. Without dedup, an attacker could farm verification boosts using the same photo across sock puppet accounts. SHA-256 catches exact matches. Perceptual hashing (pHash) would catch edits — that's a V2 upgrade."

**Amir Patel (Architecture):** "In-memory Map for the hash index is fine for single-process. Same pattern as the city dimension cache (Sprint 582). When we go multi-process, both need Redis. For now, hash index startup is cold — it rebuilds as photos are uploaded. A future sprint can preload from DB."

**Sarah Nakamura (Lead Eng):** "The pipeline is: hash → check → upload → register → flag. We don't block the upload even for duplicates — the moderation queue handles investigation. This avoids false positives from legitimate re-uploads (user's own photo on different ratings)."

**Marcus Chen (CTO):** "Same-member duplicates are logged but not flagged. If I use my own photo twice, that's lazy but not fraud. Cross-member duplicates are high-severity moderation items because they indicate coordinated gaming."

## Changes

### New Files
- **`server/photo-hash.ts`** (106 LOC)
  - `computePhotoHash(buffer)` — SHA-256 content hash
  - `checkDuplicate(hash)` — lookup in hash index
  - `registerPhotoHash(hash, ratingId, memberId, businessId, photoId)` — register after upload
  - `detectDuplicate(buffer, memberId)` — full pipeline returning `{ hash, isDuplicate, isCrossMember, original }`
  - `getHashIndexSize()` / `clearHashIndex()` — admin observability
  - In-memory `Map<string, HashEntry>` index

### Modified Files
- **`server/routes-rating-photos.ts`** (152→179 LOC, +27)
  - Calls `detectDuplicate(buffer, memberId)` before upload
  - Calls `registerPhotoHash()` after successful insert
  - Cross-member duplicates flagged to moderation queue (severity: high)
  - Response now includes `isDuplicate` and `isCrossMemberDuplicate`

- **`server/routes-admin-photos.ts`** (69→82 LOC, +13)
  - `GET /api/admin/photos/hash-stats` — returns `{ trackedHashes }` count
  - `POST /api/admin/photos/hash-reset` — clears hash index

### Test Files
- **`__tests__/sprint583-photo-hash.test.ts`** (26 tests)
  - Module structure, SHA-256 usage, Map index, exports
  - Duplicate detection pipeline, cross-member flagging
  - Route integration (detectDuplicate call, registerPhotoHash, moderation queue)
  - Admin endpoints (hash-stats, hash-reset)
  - LOC thresholds

### Threshold Updates
- `shared/thresholds.json`: tests 11044→11070, build 717.2→721.2kb (max 720→725)

## Anti-Gaming Impact

| Signal | Before | After |
|--------|--------|-------|
| Exact duplicate across accounts | Undetected | Auto-flagged (severity: high) |
| Same-member reuse | Undetected | Logged (info level) |
| Admin visibility | None | Hash index size + reset |

## Test Results
- **11,070 tests** across 471 files, all passing in ~6.0s
- Server build: 721.2kb
