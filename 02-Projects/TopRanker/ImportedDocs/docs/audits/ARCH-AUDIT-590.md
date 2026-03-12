# Architectural Audit — Sprint 590

**Date:** 2026-03-10
**Auditors:** Marcus Chen (CTO), Sarah Nakamura (Lead Eng), Amir Patel (Architecture), Nadia Kaur (Cybersecurity)
**Scope:** Full codebase — Sprints 586-589 changes + cumulative health

---

## Executive Summary

Four sprints delivered server route extraction (notification endpoints), two anti-gaming photo layers (hash persistence + perceptual hash), and client component extraction (business detail). All findings from Audit 585 resolved. Build size at 99.4% utilization is the primary concern.

**Overall Grade:** A
**Overall Health:** 9.2/10

---

## Findings

### CRITICAL — None (9th consecutive audit)
### HIGH — None

### MEDIUM

#### M1: Build Size at 99.4% Utilization (725.9kb / 730kb)
**Location:** `server_dist/index.js`
**Impact:** Every new server module risks exceeding the ceiling. Two sprints (587, 588) each added ~2-3kb. At this rate, two more server feature sprints will breach 730kb.
**Action:** Sprint 591 — tree-shake unused imports, extract admin routes to lazy-load, or justify 750kb ceiling.
**Owner:** Amir | **Sprint:** 591

#### M2: pHash Index Not Persistent
**Location:** `server/phash.ts`
**Impact:** Perceptual hash index is in-memory only. Server restart loses all near-duplicate detection history. Exact hash has DB persistence but pHash doesn't.
**Action:** Add pHash column to ratingPhotos table and preload on startup (mirror Sprint 587 pattern).
**Owner:** Amir | **Sprint:** 592

### LOW

#### L1: Three In-Memory Stores (City Cache + Hash Index + PHash Index)
**Location:** `server/city-dimension-averages.ts`, `server/photo-hash.ts`, `server/phash.ts`
**Impact:** All use in-memory structures. Acceptable for single-process. Redis migration recommended before horizontal scaling.
**Action:** Document in Redis migration planning. Target Sprint 600.
**Owner:** Amir

#### L2: routes-rating-photos.ts at 203 LOC (Growing)
**Location:** `server/routes-rating-photos.ts`
**Impact:** Grew from 152→203 LOC across Sprints 583-588. Two hash integrations added ~50 LOC. Still well under typical extraction threshold but monitor.
**Action:** Monitor. Consider extraction if it reaches 250+ LOC.
**Owner:** Sarah

---

## Resolved from Audit 585

| Finding | Resolution | Sprint |
|---------|------------|--------|
| M1: Photo hash index not persistent | contentHash column + preloadHashIndex() | 587 |
| M2: routes-members.ts at 98% | Notification endpoints extracted to routes-member-notifications.ts | 586 |
| L1: Two in-memory stores | Third added (pHash) — documented as L1 | 588 |
| L2: ProfileBottomSection `any[]` | No change — low risk | — |

---

## File Health Summary

| File | LOC | Max | Util% | Status |
|------|-----|-----|-------|--------|
| shared/schema.ts | 936 | 950 | 99% | **Watch** — 1 LOC added for contentHash |
| lib/api.ts | 517 | 525 | 98% | Stable |
| server/routes-members.ts | 220 | 300 | 73% | **Improved** (was 98%) |
| server/routes-rating-photos.ts | 203 | 250 | 81% | Growing — monitor |
| server/photo-hash.ts | 145 | 160 | 91% | Grew from preload |
| server/phash.ts | 136 | 160 | 85% | New |
| app/(tabs)/profile.tsx | 352 | 460 | 77% | Stable |
| app/business/[id].tsx | 410 | 500 | 82% | **Improved** (was 97%) |
| app/(tabs)/search.tsx | 588 | 600 | 98% | **Watch** — next extraction target |

## Metrics

- **11,202 tests** across 477 files (+106 since audit 585)
- **725.9kb** server bundle (+4.7kb from photo hash features)
- **22 files** tracked in thresholds.json (unchanged)
- **0 threshold violations**
- **0 flaky tests**, ~9.3s full suite

## Security Review (Nadia Kaur)

- **photo-hash.ts preload:** Reads via inner join — no new attack surface. Preload is async, non-blocking. Failure logs error but doesn't crash server. Correct.
- **phash.ts:** Average hash is NOT cryptographically secure — intentionally. It measures visual similarity, not integrity. For anti-gaming, this is the right tool. Exact SHA-256 handles integrity.
- **Near-duplicate threshold (Hamming ≤ 10):** 10 out of 64 bits = 15.6% tolerance. May need tuning in production — too low catches too little, too high creates false positives. Monitor.
- **pHash O(n) scan:** Linear scan is fine at current scale (<1K photos). At 10K+ photos, could add latency to upload path. Future optimization needed.
- **routes-member-notifications.ts:** All endpoints maintain requireAuth. Extraction didn't change auth boundaries. Correct.

## Grade History

| Audit | Grade | Critical | High | Medium | Low |
|-------|-------|----------|------|--------|-----|
| 570 | A | 0 | 0 | 2 | 2 |
| 575 | A | 0 | 0 | 2 | 2 |
| 580 | A | 0 | 0 | 2 | 2 |
| 585 | A | 0 | 0 | 2 | 2 |
| **590** | **A** | **0** | **0** | **2** | **2** |
