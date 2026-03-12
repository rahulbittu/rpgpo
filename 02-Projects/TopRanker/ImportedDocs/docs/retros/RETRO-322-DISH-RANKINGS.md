# Retrospective — Sprint 322

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "The business profile now connects to the dish pipeline. Seeing '#1 for Biryani' on a business page is more compelling than a 4.7 star rating. It's specific, comparable, and tappable."

**Amir Patel:** "Full-stack sprint: storage function → API route → client component → page integration. The pattern is clean and follows existing conventions (TopDishes, ScoreBreakdown, etc.)."

**Rachel Wei:** "This creates a natural Business Pro upsell path. Businesses can see their dish rankings and want to highlight them. That's $49/mo per business."

## What Could Improve

- **N+1 query** — getBusinessDishRankings does a count query per entry. Should use a subquery or window function for entry counts.
- **No loading state** — Component returns null during loading, which causes layout shift. Should show skeleton or placeholder.
- **No rank change indicator** — Shows current rank but not trend (up/down/stable). Would require historical tracking.

## Action Items
- [ ] Sprint 323: Share button on business detail page (per SLT-320)
- [ ] Future: Optimize N+1 query in getBusinessDishRankings
- [ ] Future: Add loading skeleton to DishRankings component
- [ ] Future: Rank trend indicator (requires historical tracking)

## Team Morale: 9/10
Full-stack sprint connecting business profiles to dish leaderboards. The product feels more integrated.
