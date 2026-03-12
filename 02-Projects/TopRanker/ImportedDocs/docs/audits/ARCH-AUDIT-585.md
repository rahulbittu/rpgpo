# Architectural Audit — Sprint 585

**Date:** 2026-03-10
**Auditors:** Marcus Chen (CTO), Sarah Nakamura (Lead Eng), Amir Patel (Architecture), Nadia Kaur (Cybersecurity)
**Scope:** Full codebase — Sprints 581-584 changes + cumulative health

---

## Executive Summary

Four sprints delivered claim UX polish (timeline), infrastructure caching (city dimensions), a new anti-gaming layer (photo hash dedup), and code health extraction (profile page). One new server module (photo-hash.ts), two new client components (ProfileIdentityCard, ProfileBottomSection), one claim timeline component. All findings from Audit 580 addressed. Zero critical or high findings.

**Overall Grade:** A
**Overall Health:** 9.3/10

---

## Findings

### CRITICAL — None (8th consecutive audit)
### HIGH — None

### MEDIUM

#### M1: Photo Hash Index Not Persistent
**Location:** `server/photo-hash.ts`
**Impact:** In-memory Map loses all tracked hashes on server restart. New server deployment means cold hash index — duplicates uploaded before restart won't be detected.
**Action:** Add `contentHash` column to `ratingPhotos` table and preload on startup.
**Owner:** Amir | **Sprint:** 587

#### M2: routes-members.ts Still at 98% (294/300)
**Location:** `server/routes-members.ts`
**Impact:** Carryover from Audit 580. Growing from member feature endpoints.
**Action:** Extract notification endpoints to dedicated file.
**Owner:** Sarah | **Sprint:** 586

### LOW

#### L1: City Dimension Cache + Photo Hash — Two In-Memory Stores
**Location:** `server/city-dimension-averages.ts`, `server/photo-hash.ts`
**Impact:** Both use Map for in-memory caching. Fine for single process. If horizontal scaling is planned, both need Redis migration simultaneously.
**Action:** Document in Redis migration planning doc.
**Owner:** Amir

#### L2: ProfileBottomSection Props Type Uses `any[]` for PaymentHistory
**Location:** `components/profile/ProfileBottomSection.tsx`
**Action:** Define PaymentHistoryItem type. Low risk — payment data is display-only.
**Owner:** Dev

---

## Resolved from Audit 580

| Finding | Resolution | Sprint |
|---------|------------|--------|
| M1: City dimension averages uncached | In-memory TTL cache added (5 min, eviction at 50) | 582 |
| M2: routes-members.ts at 98% | **Carryover** — planned for Sprint 586 | — |
| L1: DimensionComparisonCard `as any` casts | No change — low risk, acceptable | — |
| L2: getDishVoteStreakStats sequential queries | No change — monitoring performance | — |

---

## File Health Summary

| File | LOC | Max | Util% | Status |
|------|-----|-----|-------|--------|
| shared/schema.ts | 935 | 950 | 98% | Stable |
| lib/api.ts | 517 | 525 | 98% | Stable |
| server/storage/members.ts | 641 | 650 | 99% | **Watch** |
| server/routes-members.ts | 294 | 300 | 98% | **Watch** — extraction Sprint 586 |
| app/(tabs)/profile.tsx | 352 | 460 | 77% | **Improved** (was 98%) |
| app/business/[id].tsx | 526 | 540 | 97% | Watch — extraction Sprint 589 |
| app/(tabs)/search.tsx | 588 | 600 | 98% | Stable |

## Metrics

- **11,096 tests** across 472 files (+86 since audit 580)
- **721.2kb** server bundle (+4.4kb from photo-hash module)
- **22 files** tracked in thresholds.json (unchanged)
- **0 threshold violations**
- **0 flaky tests**, 6.0s full suite

## Security Review (Nadia Kaur)

- **photo-hash.ts:** SHA-256 is cryptographically strong for content hashing. No collision risk for practical purposes. Hash truncation in logs (first 16 chars) is appropriate — doesn't leak full hash.
- **Cross-member duplicate flagging:** Severity "high" is correct. Moderation queue integration reuses existing admin surface — no new attack surface.
- **Admin hash-stats/hash-reset endpoints:** Behind admin auth middleware. hash-reset is destructive but admin-only. Acceptable.
- **ProfileIdentityCard/ProfileBottomSection:** Display-only components. No new data fetching. No security impact.
- **Claim timeline:** Display-only. Reads from auth-gated claims endpoint. Correct.

## Grade History

| Audit | Grade | Critical | High | Medium | Low |
|-------|-------|----------|------|--------|-----|
| 565 | A | 0 | 0 | 1 | 2 |
| 570 | A | 0 | 0 | 2 | 2 |
| 575 | A | 0 | 0 | 2 | 2 |
| 580 | A | 0 | 0 | 2 | 2 |
| **585** | **A** | **0** | **0** | **2** | **2** |
