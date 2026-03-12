# Sprint 814 — Push Token Total Member Cap

**Date:** 2026-03-12
**Theme:** Cap total unique members in push token store per external critique
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **Resource safety:** In-memory push token store now fully bounded (per-member + total)
- **Critique closure:** Addresses 790-794 item "No stated decision on whether to cap total unique members"

---

## Problem

The push token store had per-member limits (MAX_TOKENS_PER_MEMBER = 10) but no cap on total unique members. In theory, the Map could grow to millions of entries if every unique user registered a token.

## Fix

Added `MAX_UNIQUE_MEMBERS = 10000` with LRU member eviction. When a new member registers and the store is at capacity, the member whose most recent token activity is oldest gets evicted.

**Two-tier bounding:**
- Per-member: MAX_TOKENS_PER_MEMBER = 10 (LRU token eviction)
- Total members: MAX_UNIQUE_MEMBERS = 10000 (LRU member eviction)

---

## Team Discussion

**Amir Patel (Architecture):** "The in-memory store is now fully bounded at 10,000 × 10 = 100,000 max tokens. Each PushToken is ~200 bytes, so worst case ~20MB. Acceptable for an in-memory store."

**Nadia Kaur (Cybersecurity):** "This closes the last unbounded in-memory growth vector. No DoS via push token registration flooding."

**Sarah Nakamura (Lead Eng):** "10,000 members is well above our beta target of 500 users. When we scale past that, push tokens should be in Redis anyway."

**Marcus Chen (CTO):** "All open items from critiques 790-794, 795-799, and 800-804 are now addressed. Clean closure across 3 critique cycles."

---

## Changes

| File | Change |
|------|--------|
| `server/push-notifications.ts` | Added MAX_UNIQUE_MEMBERS = 10000 + LRU member eviction |
| `__tests__/sprint814-member-cap.test.ts` | 10 new tests |

---

## Tests

- **New:** 10 tests in `__tests__/sprint814-member-cap.test.ts`
- **Total:** 13,588 tests across 613 files — all passing
- **Build:** 690.1kb (max 750kb)
