# Sprint 646: Native Share Sheet

**Date:** 2026-03-11
**Points:** 3
**Focus:** Replace clipboard-only sharing with native Share API across search and profile

## Mission

Sprint 644 added a search share button that copied to clipboard. Upgrade to native Share sheet (iOS/Android share dialog) and add profile sharing. Every tab now has a share path: Rankings (business cards), Discover (search results), Challenger (challenge cards), Profile (stats).

## Team Discussion

**Sarah Nakamura (Lead Eng):** "React Native's `Share.share()` is battle-tested — we already use it in 9 places. Adding it to search and profile is trivial but high-impact."

**Jasmine Taylor (Marketing):** "Profile sharing is a user acquisition tool. 'I'm a Trusted Judge on TopRanker with 47 ratings!' in a WhatsApp group creates social proof and curiosity."

**Marcus Chen (CTO):** "Every tab now has share capability. That's complete sharing coverage: Rankings → business, Discover → search results, Challenger → match, Profile → stats."

**Rachel Wei (CFO):** "The profile share text mentions tier — 'Trusted Judge', 'Top Judge'. This creates aspiration. Users who see their friends' tier want to level up."

**Amir Patel (Architecture):** "Clean fallback pattern: `try { Share.share() } catch { copyShareLink() }`. If native share fails (e.g., web without Share API), clipboard takes over."

## Changes

### `app/(tabs)/search.tsx`
- Upgraded `handleShareSearch` from clipboard-only to native `Share.share()`
- Clipboard copy as fallback on failure
- Added `Share` import from react-native

### `app/(tabs)/profile.tsx`
- Added share button in header (share-outline icon, next to settings)
- Uses `Share.share()` with `getProfileShareText()`
- Added `Share` import from react-native

### `lib/sharing.ts`
- Added `getProfileShareText(displayName, ratingCount, tier)` — tier-aware share text
- Format: `🏆 [Name] is a [Tier] Judge on TopRanker with N ratings!`

### `shared/thresholds.json`
- sharing.ts ceiling: 165 → 180 (current: 165)
- search.tsx current updated: 568 → 583

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 637.9kb
- **profile.tsx:** 366 LOC (ceiling 370)
- **search.tsx:** 583 LOC (ceiling 610)
- **sharing.ts:** 165 LOC (ceiling 180)
