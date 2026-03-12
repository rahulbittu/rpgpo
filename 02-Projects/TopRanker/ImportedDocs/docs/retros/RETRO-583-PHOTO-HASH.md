# Retrospective: Sprint 583

**Date:** 2026-03-10
**Duration:** 1 session
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

- **Nadia Kaur:** "Clean anti-gaming layer. SHA-256 is deterministic — same bytes always produce same hash. No false positives for exact matches. The moderation queue integration means we don't have to build a separate review surface."
- **Amir Patel:** "106 LOC for the hash module, 27 LOC added to the upload route. Minimal footprint. The detectDuplicate pipeline function encapsulates the full flow — hash → check → classify."
- **Sarah Nakamura:** "Non-blocking design was key. We don't reject duplicate uploads — we flag them. This means legitimate edge cases (re-uploading after failure) aren't penalized."

## What Could Improve

- **Hash index is cold on restart** — loses all tracked hashes when server restarts. Should preload from `ratingPhotos` table in a future sprint.
- **No perceptual hashing** — only catches exact byte matches. A cropped or resized version of the same photo bypasses detection. pHash is the V2 upgrade.
- **No `contentHash` column in schema** — hash is in memory only. Adding a DB column would enable cross-restart persistence and SQL-based duplicate queries.

## Action Items

- [ ] Add `contentHash` column to `ratingPhotos` table for persistence (Owner: Amir)
- [ ] Preload hash index from DB on server startup (Owner: Sarah)
- [ ] Evaluate perceptual hashing library (sharp/blurhash) for V2 (Owner: Nadia)

## Team Morale

**8/10** — Solid infrastructure sprint. Closes a real anti-gaming gap identified in Audit #580 (M2).
