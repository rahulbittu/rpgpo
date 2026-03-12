# Sprint 363: Challenger Card Visual Refresh

**Date:** March 10, 2026
**Story Points:** 3
**Focus:** Visual polish for challenger cards — status badge, VS circle, taller fighters, accent border

## Mission
The challenger cards were functionally complete but visually flat. This sprint adds status indicators (LIVE/ENDED), replaces the VS text divider with a navy circle badge, increases fighter photo height for more impact, thickens the vote bar, and adds a left amber accent border matching the search suggestion chips.

## Team Discussion

**Marcus Chen (CTO):** "The challenger screen is where head-to-head competition comes alive. Visual polish here directly impacts engagement — users need to feel the competition. The LIVE badge with green dot creates urgency, the ENDED badge signals completion."

**Amir Patel (Architecture):** "The VS circle badge is a classic fight card pattern — circular badges between fighters. Navy background matches our brand's secondary color. The 32px circle scales well on both mobile and web."

**Sarah Nakamura (Lead Eng):** "Fighter photos at 150px give 15% more visual real estate for the restaurant photos. The thicker vote bar (6→8px) makes the split more visible at a glance. Left amber border ties the cards visually to other accent patterns in the app."

**Priya Sharma (QA):** "24 new tests covering status badge states, VS circle, fighter height, vote bar thickness, and core functionality preservation. 274 test files, 6,671 tests, all passing."

**Jasmine Taylor (Marketing):** "The LIVE badge is perfect for social sharing. When someone screenshots a challenge, 'LIVE' in green creates FOMO. This is WhatsApp bait."

## Changes

### `app/(tabs)/challenger.tsx` (485→527 LOC, +42 lines)
- Added LIVE/ENDED status badge with green dot indicator
- Card header restructured with `cardHeaderRight` container
- VS text divider replaced with `vsCircle` (32px navy circle)
- Card left amber accent border (3px)
- New styles: cardHeaderRight, statusBadge, statusBadgeLive, statusBadgeEnded, statusDot, statusText, statusTextLive, statusTextEnded, vsCircle

### `components/challenger/SubComponents.tsx` (553→553 LOC, unchanged count)
- Fighter photo height increased 130→150px (all occurrences)
- Vote bar height increased 6→8px, border radius 3→4px

### Tests
- `tests/sprint363-challenger-refresh.test.ts` (NEW — 24 tests)

## Test Results
- **274 test files, 6,671 tests, all passing** (~3.7s)
- **Server build:** 596.3kb (unchanged)
