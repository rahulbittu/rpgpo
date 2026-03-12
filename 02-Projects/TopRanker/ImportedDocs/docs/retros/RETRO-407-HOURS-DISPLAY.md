# Retro 407: Business Hours Display Improvements

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Jasmine Taylor:** "Week dots are immediately scannable. One glance and you know if a restaurant is open on weekends. That's information density without visual clutter."

**Priya Sharma:** "The relative time display ('Opens in 45min') is more useful than the absolute time ('Opens at 11:00 AM'). Users don't have to do mental math. And it only kicks in within 2 hours — further out, the absolute time is clearer."

**Sarah Nakamura:** "Zero cascades. Leaf component enhancement. The new helper functions (isDayOpen, getOpeningTime, getNextOpenInfo, getHoursDuration) are all pure functions operating on the existing hours string array. Clean additions."

## What Could Improve

- **No timezone handling** — All time parsing assumes local timezone. For travelers checking hours in a different city, the relative times would be off.
- **Week dots don't show hours range** — A dot tells you open/closed but not 11AM-3PM vs 8AM-10PM. Long-press tooltip could help.
- **Duration display is today-only** — Could show typical hours range when expanded (e.g., "Mon-Fri: typically 10h").

## Action Items

- [ ] Consider timezone-aware parsing for multi-city users — **Owner: Amir (future sprint)**
- [ ] Evaluate long-press tooltip on week dots — **Owner: Priya (future sprint)**

## Team Morale
**8/10** — Practical UX enhancement with zero architectural risk. The kind of sprint that makes the product feel more polished without introducing complexity.
