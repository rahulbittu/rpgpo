# Sprint 337: Copy-Link Share Option

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Add copy-to-clipboard sharing alongside native share across the app

## Mission
The native Share API opens the OS share sheet, which is great for WhatsApp/iMessage. But power users and desktop web users often just want to copy a URL. This sprint adds a `copyShareLink` utility and surfaces it across three key surfaces: the business detail action bar, ranked card share button (long-press), and dish leaderboard header.

## Team Discussion

**Jasmine Taylor (Marketing):** "WhatsApp is our primary sharing channel. But people also paste links in group chats manually, in Slack, in notes. Copy-link is the missing companion to native share. Both should be available everywhere we have a share button."

**Marcus Chen (CTO):** "Constitution #3: Fast structured input. Copy-link is the fastest share action — one tap, link in clipboard. No sheet, no app selection. For power users this is the preferred flow."

**Sarah Nakamura (Lead Eng):** "The `copyShareLink` utility uses dynamic imports for `expo-clipboard` and `Alert` to keep the module lightweight. It returns a boolean so callers can conditionally fire analytics. On ranked cards, long-press is the right UX — the primary tap is still native share, but long-press offers copy without adding visual clutter."

**Amir Patel (Architecture):** "The utility lives in `lib/sharing.ts` alongside the existing `getShareUrl` and `getShareText` helpers. Single source of truth for all sharing logic. No new files needed."

**Priya Sharma (QA):** "20 new tests across 4 test groups: sharing utility, business detail, ranked card, and dish leaderboard. Verifies imports, handlers, icons, analytics, and accessibility hints."

**Nadia Kaur (Cybersecurity):** "The clipboard API only writes URLs we generate ourselves via `getShareUrl`. No user input reaches the clipboard. Low risk."

## Changes
- `lib/sharing.ts` — Added `copyShareLink(url, label?)` utility with expo-clipboard + Alert feedback
- `app/business/[id].tsx` — Added `handleCopyLink` handler + "Copy Link" ActionButton in action bar
- `components/leaderboard/SubComponents.tsx` — Added `onLongPress` on share button for copy-link + accessibility hint
- `app/dish/[slug].tsx` — Added copy-link button alongside share button in header

## Test Results
- **254 test files, 6,237 tests, all passing** (~3.5s)
- **Server build:** 588.7kb (unchanged)
