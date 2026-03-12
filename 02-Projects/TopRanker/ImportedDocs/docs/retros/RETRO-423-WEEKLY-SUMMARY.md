# Retro 423: Rankings Weekly Summary Card

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "Zero API changes — everything derived from existing rankDelta data. computeWeeklySummary is a pure function that's trivially testable. The card self-hides when there's no movement, so it's never empty."

**Sarah Nakamura:** "Hit the `as any` threshold boundary initially, caught it in tests, fixed with IoniconsName type. The automated threshold check saved us from shipping a regression."

**Jasmine Taylor:** "The 'top climber' highlight is exactly the kind of content that drives WhatsApp shares. Weekly movement data creates natural conversation starters."

## What Could Improve

- **No weekly comparison baseline** — Currently uses whatever rankDelta the API provides. Could be more explicit about "this week vs last week" with a date range.
- **No animation on card appearance** — Could use FadeInView or SlideUpView for polish.
- **biggest drop not displayed** — Computed but not rendered. Could add "biggest drop" highlight for transparency.

## Action Items

- [ ] Evaluate showing biggestDrop alongside topClimber for full transparency — **Owner: Priya (future)**
- [ ] Consider adding SlideUpView animation to the summary card — **Owner: Amir (future)**

## Team Morale
**8/10** — Clean feature that makes rankings feel dynamic. Good catch on the `as any` threshold boundary.
