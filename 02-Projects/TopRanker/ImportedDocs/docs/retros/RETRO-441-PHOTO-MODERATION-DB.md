# Retro 441: Photo Moderation DB Persistence

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Clean migration with zero API shape changes. The in-memory store was a known liability since Audit #45 flagged it as M-2. Closing this in Sprint 441 — exactly as the SLT-440 roadmap planned — shows the governance process works. Photo submissions now survive restarts."

**Amir Patel:** "The migration pattern is textbook: add table, make functions async, add await at call sites. Four indexes covering the exact query patterns we use. No over-engineering. The `clearSubmissions` removal is good — it was a testing convenience that had no production purpose."

**Nadia Kaur:** "The MAX_SUBMISSIONS cap was a hidden vulnerability — an attacker could flood 3,000 submissions and push legitimate photos out. DB-backed store eliminates this. Foreign keys on moderatorId ensure every moderation action has an audit trail back to a real member."

## What Could Improve

- **No migration script for existing data** — Since the in-memory store was ephemeral, there's nothing to migrate. But future DB migrations should include a migration script template.
- **Sprint 254 tests lost runtime coverage** — The old tests directly called submitPhoto/approvePhoto with in-memory state. Now they're source-based. Consider adding integration tests with a test DB in a future infrastructure sprint.
- **getPhotoStats fetches all rows** — Currently acceptable at low volume, but should switch to COUNT queries if photo_submissions grows past 10K rows.

## Action Items

- [ ] Begin Sprint 442 (Search filters v2 — dietary tags, hours, distance) — **Owner: Sarah**
- [ ] Monitor photo_submissions table growth post-marketing push — **Owner: Amir**
- [ ] Consider COUNT-based getPhotoStats if volume exceeds 10K — **Owner: Amir**

## Team Morale
**8/10** — Solid infrastructure sprint. Closing a known production gap feels good. The team is eager to get back to user-facing features in Sprint 442.
