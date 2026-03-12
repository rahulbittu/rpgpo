# Retro 389: Challenger Round Timer UI

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Priya Sharma:** "Clean enhancement — the timer logic was straightforward. One useEffect, one new state variable, a color ternary. The segmented display gives it a sports-broadcast feel."

**Marcus Chen:** "Urgency colors are an underrated UX pattern. Green/amber/red maps to 'no rush' / 'better hurry' / 'last chance' without any text explanation needed."

**Jasmine Taylor:** "The ticking timer is much more shareable than static text. Screenshots of red timers drive FOMO engagement."

## What Could Improve

- **Performance consideration** — 1-second intervals on multiple visible cards could be optimized to a single shared timer. Not a problem now with typical 2-3 active challenges, but worth watching.
- **LOC threshold bumped again** — challenger.tsx at 545/575. May need extraction in the next governance cycle.

## Action Items

- [ ] Consider shared timer hook if challenge count exceeds 5 — **Owner: Amir Patel (future sprint)**
- [ ] Monitor challenger.tsx LOC trend — **Owner: Sarah Nakamura (Audit #60)**

## Team Morale
**8/10** — Quick, focused sprint with high visual impact. The ticking timer feels polished.
