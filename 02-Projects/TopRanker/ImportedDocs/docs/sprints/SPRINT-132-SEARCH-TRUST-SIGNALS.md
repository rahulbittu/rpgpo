# Sprint 132 — Search Results Trust Signals

**Date**: 2026-03-08
**Theme**: Search Results Trust Signals
**Story Points**: 5
**Tests Added**: 0 (1230 total, 0 new TS errors)

---

## Mission Alignment

The Discover page is the primary surface where new users encounter TopRanker businesses for
the first time. If the BusinessCard component displays the same "verified" badge regardless
of whether a business has 3 ratings or 300, we undermine the trust promise at first contact.
This sprint replaces the hardcoded threshold pill with Sprint 130's category-aware confidence
system, ensuring that what users see on the search results page is consistent with the
leaderboard, challenger, and business detail pages. A single source of truth for rank
confidence across every surface.

---

## Team Discussion

**Marcus Chen (CTO)**: "This closes the loop on confidence indicator consistency across all
surfaces. We now have the same `getRankConfidence` call powering the leaderboard cards,
business detail hero, challenger VS cards, and now search results. Four surfaces, one
function, one set of thresholds. That's the kind of architectural discipline that prevents
trust signals from drifting apart as we add features. Before this sprint, a fine dining
restaurant with 12 ratings would show a green 'verified' pill on search but 'Early Ranking'
on the leaderboard — that contradiction was a credibility risk. Now both surfaces tell the
same story."

**Sarah Nakamura (Lead Engineer)**: "This was the last surface in the app still using
hardcoded thresholds. The old code in `SubComponents.tsx` had a simple `>= 10` check —
any business with 10+ ratings got the verified pill regardless of category. That was fine
as a v1 heuristic, but Sprint 130 gave us per-category thresholds for a reason: a fast food
place with 8 verified ratings is statistically meaningful, while a fine dining spot needs
15+ to reach the same confidence level. Priya's change was clean — swap the conditional,
import the shared functions, and the UI adapts automatically."

**Priya Sharma (Mobile Engineer)**: "The implementation was straightforward because the
confidence system API is well-designed. I replaced the single `verifiedCount >= 10` check
with a `getRankConfidence(biz.totalRatings, biz.category)` call and branched on the result.
For 'established' or 'strong' confidence, we show the green shield icon — that's your
equivalent of the old verified pill but now it's earned through category-appropriate data
depth. For 'early' confidence, we show an amber hourglass icon with the label text, signaling
that the ranking is directional but not yet definitive. For 'provisional', we show nothing —
same absence-as-signal pattern we use on the challenger page. The hourglass icon was Elena's
suggestion and it matches what we already use on leaderboard cards."

**Amir Patel (Architecture)**: "From an architecture standpoint, this is the payoff of
Sprint 130's investment. The confidence system is now fully unified: `getRankConfidence` and
`RANK_CONFIDENCE_LABELS` in `lib/data.ts` are the single source of truth consumed by four
different surfaces. No surface defines its own thresholds, no surface interprets confidence
levels differently. If we need to adjust the threshold for a new category — say we add
'coffee_shops' with a threshold of 10 — we update one object in `lib/data.ts` and every
surface reflects it immediately. That's the kind of centralization that scales. The old
hardcoded `>= 10` in SubComponents was technical debt from before the confidence system
existed; clearing it was overdue."

**Elena Rodriguez (Design Lead)**: "The hourglass icon for early confidence on search cards
was important for visual consistency. On the leaderboard, we already use the hourglass to
mean 'we're collecting data, this ranking will solidify.' Users who see the hourglass on a
leaderboard card and then search for the same business should see the same icon on the
search result. The green shield for established/strong confidence replaces the old generic
verified pill but carries the same visual weight — it's a positive trust signal without
requiring the user to learn new iconography. We deliberately kept the provisional state
invisible on search cards because showing a warning-like indicator on a search result
could discourage engagement with new businesses."

---

## Changes

### Category-Aware Confidence Indicators on BusinessCard
- Imported `getRankConfidence` and `RANK_CONFIDENCE_LABELS` from `lib/data`
- Removed hardcoded `>= 10` verified pill logic
- Replaced with category-aware confidence system using `getRankConfidence(biz.totalRatings, biz.category)`
- Green shield icon for established/strong confidence — replaces old verified pill
- Amber hourglass icon for early confidence — signals ranking is directional but growing
- No indicator for provisional confidence — absence-as-signal pattern
- Leverages Sprint 130's per-category thresholds (fine_dining: 15+, fast_food: 8+, etc.)

### File Changed
- `components/search/SubComponents.tsx`

---

## PRD Gap Closure

- **Consistent trust signals**: All four primary surfaces (leaderboard, business detail,
  challenger, search results) now use the same confidence system with identical thresholds
- **Category-aware search results**: Search results no longer treat all categories equally —
  a fine dining restaurant with 12 ratings correctly shows "Early Ranking" while a fast food
  spot with the same count shows the green shield

---

## What's Next (Sprint 133)

A/B testing framework evaluation to measure the impact of trust signals on user engagement.
Personalized vote weight preview for logged-in users. Expanded credibility tier explanation
in the profile tab.
