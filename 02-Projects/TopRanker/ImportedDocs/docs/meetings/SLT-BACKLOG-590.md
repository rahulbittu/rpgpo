# SLT Backlog Meeting — Sprint 590

**Date:** 2026-03-10
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)
**Previous:** SLT-585

## Sprint 586-589 Review

### Sprint 586: routes-members.ts Notification Extraction
- 5 notification endpoints moved to `routes-member-notifications.ts` (95 LOC)
- routes-members.ts: 294→220 LOC (25% reduction, 73% utilization)
- Resolves Audit #585 M2 (carryover from Audit #580)
- 16 new tests, 5 test files redirected

### Sprint 587: Photo Hash DB Persistence
- `contentHash` varchar(64) column added to `ratingPhotos` table
- `preloadHashIndex()` reads hashes from DB on startup via inner join with ratings
- Writes hash to DB on every photo upload
- Resolves Audit #585 M1 (photo hash index not persistent)
- 12 new tests

### Sprint 588: Perceptual Hash (pHash) Near-Duplicate Detection
- `phash.ts` (136 LOC) — anti-gaming layer #8
- 64-bit average hash, Hamming distance ≤ 10 threshold for near-duplicates
- Cross-member near-duplicates flagged to moderation queue (severity: medium)
- Admin hash-stats now reports both exact + perceptual hash counts
- 29 new tests

### Sprint 589: Business Detail Page Section Extraction
- `BusinessHeroSection` (153 LOC) — carousel, breadcrumb, name card, stats, badges
- `BusinessAnalyticsSection` (119 LOC) — scores, trust, breakdowns, distributions, history
- [id].tsx: 585→410 LOC (30% reduction)
- 26 new tests, 13 test files redirected

## Delivery Score: 4/4

Twelfth consecutive full-delivery SLT cycle.

## Current Metrics

- **11,202 tests** across 477 files
- **725.9kb** server build (730kb ceiling — 4.1kb headroom)
- **936 LOC** schema (+1 for contentHash column)
- **0 threshold violations** across 22 tracked files
- **File health highlights:**
  - routes-members.ts 73% (220/300) — relieved after extraction
  - routes-rating-photos.ts 203 LOC — grew from pHash integration
  - [id].tsx 70% (410/585) — relieved after extraction
  - photo-hash.ts 145 LOC — grew from preload function

## Roadmap: Sprints 591-595

| Sprint | Feature | Owner | Points |
|--------|---------|-------|--------|
| 591 | Build size optimization (tree-shake / extract unused admin routes) | Amir | 3 |
| 592 | pHash DB persistence (mirror contentHash pattern) | Amir | 3 |
| 593 | search.tsx extraction (588 LOC → extract DiscoverCards section) | Sarah | 3 |
| 594 | Admin moderation dashboard UX (moderation queue filtering/sorting) | Nadia | 5 |
| 595 | Governance (SLT-595 + Audit #595 + Critique) | Sarah | 3 |

## Key Decisions

1. **Build size is critical path.** 725.9kb / 730kb = 99.4% utilization. Sprint 591 must reduce build size or raise ceiling with justification. Options: tree-shake unused admin endpoints, split admin routes to lazy-load, or accept 750kb ceiling.
2. **pHash not yet persistent.** Exact hash has DB persistence (Sprint 587) but pHash is still in-memory only. Sprint 592 adds pHash column to ratingPhotos.
3. **search.tsx at 588 LOC** — next extraction target after business detail. The DiscoverCards section is the natural extraction boundary.
4. **Three in-memory stores now:** city dimension cache, photo hash index, pHash index. Redis migration story needed by Sprint 600 per Amir's recommendation.

## Team Notes

**Marcus Chen:** "Two audit carryovers resolved in this cycle — notification extraction and photo hash persistence. Both were overdue. The anti-gaming photo pipeline now has exact + perceptual + DB persistence. Strong."

**Rachel Wei:** "Build size at 99.4% is not sustainable. Every sprint that adds server code needs to offset with extraction or optimization. Sprint 591 must address this before we're blocked."

**Amir Patel:** "The pHash DB persistence in Sprint 592 will add minimal build size — it mirrors the exact hash pattern. The build optimization sprint should give us 10-15kb of headroom through tree-shaking."

**Sarah Nakamura:** "Business detail extraction was the largest this cycle — 175 LOC removed. The extraction + redirect test pattern is mature. search.tsx at 588 LOC is the last >500 LOC screen file."
