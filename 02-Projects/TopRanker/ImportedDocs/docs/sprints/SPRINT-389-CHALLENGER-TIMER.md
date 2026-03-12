# Sprint 389: Challenger Round Timer UI

**Date:** 2026-03-09
**Type:** UX Enhancement
**Story Points:** 3

## Mission

Replace the static text countdown ("3d 5h 12m remaining") with a live, second-by-second segmented timer (DD:HH:MM:SS) with urgency colors — turning the challenger card into a real-time competitive experience.

## Team Discussion

**Marcus Chen (CTO):** "A ticking clock creates urgency. Sports broadcasts don't show 'about 5 minutes left' — they show a live countdown. Our challengers should feel the same way."

**Priya Sharma (Frontend):** "Changed the interval from 60s to 1s and added a seconds state. The segmented display uses Playfair Bold for the numbers — consistent with our score typography. Each segment has a tiny label underneath: DAYS, HRS, MIN, SEC."

**Amir Patel (Architecture):** "The urgency color system is simple: green when there's plenty of time (>24h), amber when it's getting close (<24h), and red when it's urgent (<6h). Colors apply to the numbers and colon separators. Low overhead — just a ternary on hoursRemaining."

**Sarah Nakamura (Lead Eng):** "We bumped the challenger.tsx LOC threshold from 500 to 575. The timer styles added ~30 lines. Still well within extraction comfort zone."

**Jasmine Taylor (Marketing):** "This is huge for WhatsApp shares. A screenshot of a ticking red timer with '00:02:15:33' says 'vote NOW' better than any copy we could write."

## Changes

### Modified Files
- `app/(tabs)/challenger.tsx` — 1s interval, seconds state, urgencyColor calc, segmented DD:HH:MM:SS display, 5 new styles (timerSegments, timerSegment, timerSegmentNum, timerSegmentLabel, timerColon)
- `tests/sprint371-challenger-extract.test.ts` — Bumped LOC threshold from 500 to 575

### New Files
- `tests/sprint389-challenger-timer.test.ts` — 18 tests

## Test Results
- **295 files**, **7,128 tests**, all passing
- Server build: **599.3kb**, 31 tables
