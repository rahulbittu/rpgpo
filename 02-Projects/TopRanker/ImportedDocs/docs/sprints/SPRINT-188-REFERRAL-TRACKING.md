# Sprint 188 — Social Sharing + Referral Tracking

**Date:** 2026-03-09
**Story Points:** 13
**Status:** Complete

## Mission Alignment

Referral tracking turns our most engaged members into growth ambassadors. When a trusted member invites someone who actually rates businesses, both sides benefit — growing the network of credibility-weighted reviews that makes TopRanker trustworthy.

## Team Discussion

**Marcus Chen (CTO):** "Referral codes based on uppercase usernames keep it simple and memorable. No need for random codes — usernames are unique and brandable. The signed_up → activated lifecycle ensures we only reward referrals that produce real engagement."

**Sarah Nakamura (Lead Engineer):** "The activation trigger on first rating is elegant — we hook into submitRating when totalRatings === 0, making it a natural side effect of the rating flow. Lazy import keeps the referral module out of the hot path for non-first-time raters."

**Amir Patel (Architecture):** "Good separation: referrals.ts as its own storage module, routes-referrals.ts as its own route file. The unique constraint on referredId prevents double-referral exploitation. The barrel re-export pattern keeps import paths stable."

**Nadia Kaur (Cybersecurity):** "Self-referral prevention (referrerId !== member.id) is critical. The graceful error handling via .catch() on both signup referral tracking and first-rating activation prevents referral failures from blocking core flows."

**Jasmine Taylor (Marketing):** "The share URL format (topranker.com/join?ref=CODE) is clean for social sharing. Referral stats endpoint gives members visibility into their impact — total referrals, activated count, and who they referred."

**Jordan Blake (Compliance):** "Referral data falls under GDPR personal data — the referredId unique constraint also means one clean deletion path per user. The validate endpoint is public but read-only, no enumeration risk since it only returns valid/invalid."

## Changes

### Schema (`shared/schema.ts`)
- Added `referrals` table: id, referrerId, referredId, referralCode, status (signed_up/activated), createdAt, activatedAt
- Unique constraint on referredId (one referrer per user)
- Indexes on referrerId and referredId for query performance
- Exported `Referral` type

### Storage (`server/storage/referrals.ts` — NEW)
- `createReferral(referrerId, referredId, code)` — insert referral record
- `resolveReferralCode(code)` — username-based lookup, returns referrer member ID
- `getReferralStats(memberId)` — referral count, activated count, referral list with display names
- `activateReferral(memberId)` — transitions signed_up → activated with timestamp
- `getReferrerForMember(memberId)` — lookup who referred a given member

### Storage Barrel (`server/storage/index.ts`)
- Re-exported all 5 referral functions

### Routes (`server/routes-referrals.ts` — NEW)
- `GET /api/referrals/me` — auth required, returns referral code + share URL + stats
- `GET /api/referrals/validate` — public, validates referral code existence

### Route Registration (`server/routes.ts`)
- Imported and registered `registerReferralRoutes`

### Signup Integration (`server/routes-auth.ts`)
- Reads `referralCode` from signup request body
- Resolves code to referrer via `resolveReferralCode`
- Creates referral record, prevents self-referral
- Graceful error handling (referral failure doesn't block signup)

### Rating Activation (`server/storage/ratings.ts`)
- On first rating (totalRatings === 0), activates referral via lazy import
- `.catch(() => {})` prevents activation failure from blocking rating submission

### Existing Sharing Infrastructure (`lib/sharing.ts`)
- Already exports `getShareUrl`, `getShareText` for business sharing
- Referral sharing complements existing social sharing flow

## Tests
- `tests/sprint188-referral-tracking.test.ts` — 44 tests covering all 8 areas
- Full suite: **3083 tests across 121 files, all passing**

## PRD Gap Closure
- Referral tracking: CLOSED (was gap since Sprint 123 social sharing)
- Server-side referral lifecycle: CLOSED
- Referral activation on engagement: CLOSED
