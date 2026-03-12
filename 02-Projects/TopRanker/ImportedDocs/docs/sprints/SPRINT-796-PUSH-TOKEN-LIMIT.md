# Sprint 796 — Push Token Store Size Limit

**Date:** 2026-03-12
**Theme:** Cap in-memory push token store per member (Audit M1 fix)
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **Security:** Unbounded in-memory growth is a denial-of-service vector
- **Database hygiene:** Even in-memory stores need eviction policies

---

## Problem

The `tokens` Map in `server/push-notifications.ts` allowed unbounded growth per member. A malicious or buggy client could register thousands of push tokens for a single member ID, consuming server memory. The `messageLog` array already had `MAX_MESSAGES = 5000` cap, but token registration had no limit.

## Fix

Added `MAX_TOKENS_PER_MEMBER = 10` constant with oldest-eviction policy:
- When a new token is registered and the member already has 10 tokens, the oldest token (by registration time) is evicted via `shift()`
- Eviction is logged for observability
- Re-registering an existing token updates `lastUsed` without counting toward the limit

---

## Team Discussion

**Amir Patel (Architecture):** "This closes M1 from Audit #790 and #795. 10 tokens per member is generous — a user with an iPhone, iPad, and web browser needs 3. The extra headroom covers device replacement cycles where old tokens haven't expired yet."

**Sarah Nakamura (Lead Eng):** "The `shift()` eviction is O(n) but n=10, so it's a constant-time operation in practice. No need for a more complex data structure."

**Derek Okonkwo (Mobile):** "Expo Push SDK automatically deregisters stale tokens when they get an error response from Apple/Google. In production, the actual token count per member should be 1-3."

**Nadia Kaur (Cybersecurity):** "This prevents the memory exhaustion vector. A malicious client that rapid-fires registerPushToken calls will just keep evicting, never growing past 10. The logging ensures we'd see the attack pattern."

**Marcus Chen (CTO):** "Simple, correct, auditable. The constant is exported so tests can verify the exact limit."

**Rachel Wei (CFO):** "Railway has memory limits. Even with 10,000 users × 10 tokens, that's 100,000 token objects — well within bounds. But without the cap, one bad actor could cause issues."

---

## Changes

| File | Change |
|------|--------|
| `server/push-notifications.ts` | Added `MAX_TOKENS_PER_MEMBER = 10` + eviction in `registerPushToken()` |
| `__tests__/sprint796-push-token-limit.test.ts` | 11 tests (source checks + functional behavior) |

---

## Tests

- **New:** 11 tests in `__tests__/sprint796-push-token-limit.test.ts`
- **Total:** 13,398 tests across 598 files — all passing
- **Build:** 667.2kb (max 750kb)
