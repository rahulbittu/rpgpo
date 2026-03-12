# Retrospective — Sprint 277
**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "The storage layer already had `getBusinessDishes`. The endpoint was a thin wrapper. The component is self-contained. Clean sprint with minimal new server code."

**Sarah Nakamura:** "Three new self-fetching components on the business page now: ScoreBreakdown, ScoreTrendSparkline, TopDishes. Each owns its data and handles its own loading/empty state. No prop drilling, no parent orchestration."

**Jasmine Taylor:** "The dish ranking creates 'reason to visit' content. 'Their #1 dish is biryani with 12 votes' is a specific recommendation. That's what users want and what we can share on WhatsApp."

## What Could Improve

- **No dish score**: Dishes have vote counts but not average scores. Adding a per-dish score (from ratings where that dish was mentioned) would enrich the display.
- **business/[id].tsx growing**: Adding TopDishes import and render is another 2 lines, but the page now imports 4 separate data-fetching components. Consider a wrapper or layout component.
- **Vote count may not reflect quality**: Popular dishes aren't necessarily the best. A dish could have 12 votes but a 5.0 average. Combining votes with scores would be more honest.

## Action Items
- [ ] Sprint 278: Rating validation hardening — Sarah
- [ ] Per-dish average score computation — backlog
- [ ] Business page layout wrapper — backlog

## Team Morale: 9/10
The business detail page is now the richest restaurant information page in any ranking app: hero photos, score with breakdown by visit type, confidence badge, score trend sparkline, top dishes, rank history, opening hours, and location. Every component self-fetches and handles its own state. The architecture is clean and extensible.
