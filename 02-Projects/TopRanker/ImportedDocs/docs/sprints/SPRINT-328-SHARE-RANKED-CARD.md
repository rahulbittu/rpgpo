# Sprint 328: Share Button on Ranked Cards

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** One-tap sharing from ranking cards for WhatsApp marketing

## Mission
The business detail page already had a share button (Sprint 115). But sharing from the Rankings leaderboard required opening the detail page first — an extra tap. For WhatsApp-first marketing (Marketing Strategy §3), one-tap sharing from the leaderboard is critical. Users scrolling rankings should be able to share any business instantly. This sprint adds a share button directly on RankedCard.

## Design Reference
**Before:** Bookmark icon only on photo strip overlay (top-right)
**After:** Share icon (left) + Bookmark icon (right) on photo strip overlay

The share button uses the native Share API with the same `getShareText` and `getShareUrl` utilities as the business detail page. Analytics tracks the source as "ranked_card" to distinguish from detail page shares.

## Team Discussion

**Marcus Chen (CTO):** "WhatsApp sharing is our highest-priority marketing channel. Every extra tap between 'see a ranking' and 'share it' is friction we lose users on. The share button should be right there on the card."

**Jasmine Taylor (Marketing):** "This is exactly what we need for WhatsApp demo videos. User opens app → sees #1 restaurant → shares it. One tap, not three. The 'ranked_card' analytics source will help us track how many shares come from the leaderboard vs detail page."

**Sarah Nakamura (Lead Eng):** "Reused the existing `getShareUrl` and `getShareText` utilities from `@/lib/sharing`. No new business logic. The share button positioned at `right: 44` gives 6px gap from the bookmark button at `right: 8` (30px width + 6px gap)."

**Amir Patel (Architecture):** "SubComponents.tsx at 558 LOC, well within the 600 threshold. Added Share import from react-native, plus `getShareUrl`, `getShareText`, and `Analytics` imports. Clean addition."

**Priya Sharma (QA):** "12 tests verifying: Share import, sharing utilities, Analytics tracking with 'ranked_card' source, haptics, stopPropagation, style positioning, existing bookmark and dish badges preserved."

**Rahul Pitta (CEO):** "Constitution #39: Do things that don't scale when they create proof. One-tap sharing from rankings creates proof that people want to share restaurant rankings in their WhatsApp groups."

## Changes
- `components/leaderboard/SubComponents.tsx` — Added Share import from react-native, `getShareUrl`/`getShareText` from sharing utils, `Analytics` import. Share button on RankedCard photo strip (left of bookmark). `cardShareBtn` style. +27 LOC (531→558).

## Test Results
- **249 test files, 6,220 tests, all passing** (~3.4s)
- **Server build:** 606.6kb (under 700kb threshold)
