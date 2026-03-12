# Sprint 813 — Push Token LRU Eviction + Logger Counter Semantics

**Date:** 2026-03-12
**Theme:** Close decisions on token eviction policy and logger counter behavior per external critique
**Story Points:** 1 (architecture decisions)

---

## Mission Alignment

- **Architecture closure:** Two open decisions from critique 795-799 are now formally closed
- **Correctness:** LRU eviction keeps actively-used devices over abandoned newer ones
- **Transparency:** Logger counter semantics are explicitly documented

---

## External Critique Response

### 1. Push token eviction: oldest → LRU (critique item #2)
**Decision:** Changed from oldest-by-registration (`shift()`) to least-recently-used by `lastUsed` timestamp.

**Rationale:** A user who registered a phone 2 years ago but uses it daily should not lose push notifications because they added a new tablet last week that they never open. LRU eviction matches real device usage patterns.

**Implementation:** Linear scan for lowest `lastUsed`, then `splice()` at that index. O(n) with n ≤ 10 — negligible cost.

### 2. Logger counter semantics (critique item #3)
**Decision:** Counters are **event counters**, not emitted-log counters. This is permanent and intentional.

**Rationale:** In production, `shouldLog("warn")` is true (info is the minimum). But even if a future log level change suppressed warnings, operators need to know events occurred. The counter tracks "how many times did something bad happen" — not "how many lines went to stdout."

**Documentation:** Added explicit block comment in logger.ts explaining this.

---

## Team Discussion

**Amir Patel (Architecture):** "Both decisions are simple and correct. LRU is the right eviction policy for push tokens. Event counters are the right semantics for operational monitoring."

**Sarah Nakamura (Lead Eng):** "The LRU implementation is clean — 6 lines of code for a linear scan over a max-10 array. No performance concern."

**Nadia Kaur (Cybersecurity):** "LRU eviction is better for security too — an attacker can't push out actively-used tokens by registering many new ones quickly."

**Marcus Chen (CTO):** "This closes the last two open items from the 795-799 critique. Clean decisioning."

---

## Changes

| File | Change |
|------|--------|
| `server/push-notifications.ts` | Eviction: shift() → LRU by lastUsed with splice() |
| `server/logger.ts` | Documented counter semantics as event counters |
| `__tests__/sprint813-eviction-semantics.test.ts` | 11 new tests |
| `__tests__/sprint796-push-token-limit.test.ts` | Updated eviction assertions |

---

## Tests

- **New:** 11 tests in `__tests__/sprint813-eviction-semantics.test.ts`
- **Total:** 13,580 tests across 612 files — all passing
- **Build:** 689.6kb (max 750kb)
