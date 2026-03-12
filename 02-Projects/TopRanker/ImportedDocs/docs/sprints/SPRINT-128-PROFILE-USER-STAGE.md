# Sprint 128: Profile Section Prioritization by User Stage
**Date:** March 8, 2026
**Sprint Goal:** Make the profile responsive to user journey stage — new users get encouragement, veterans get data

## Team Discussion

**Marcus Chen (CTO):** "This is one of those changes that looks small but has outsized impact. New users landing on an empty profile with score breakdowns and tier progress they can't contextualize — that's cognitive overload at the worst possible moment. We need to meet them where they are: zero ratings means zero complexity. Show them exactly one thing to do next. That's how you convert a curious visitor into an active rater."

**Sarah Nakamura (Lead Engineer):** "I led the implementation here and the key decision was the collapsible Score Breakdown pattern. We debated between hiding it entirely for new users versus collapsing it behind a tap. I went with collapsible because hiding it completely means users don't even know it exists — they lose the aspirational pull. With the collapsed state and the hint text saying 'Rate N more places to see meaningful score details,' we're giving them a preview of what they'll unlock. It's progressive disclosure done right. The threshold of 5 ratings came from looking at when score breakdowns actually become statistically meaningful."

**Priya Sharma (Mobile Engineer):** "I built the 'Rate Your First Place' CTA card and the actionable empty rating history. For the CTA card, touch target sizing was important — the entire card is tappable, not just the chevron. We're navigating to Discover on tap because that's the lowest-friction path to finding something to rate. The restaurant icon anchors it visually so users immediately understand what action we're asking for. On the empty history state, swapping gray for amber was Elena's call and it was the right one — gray reads as 'disabled' or 'broken,' amber reads as 'opportunity.'"

**Elena Rodriguez (Design Lead):** "Progressive disclosure is the thread through all of these changes. The profile used to dump everything on every user regardless of context. Now we have three distinct visual states: zero ratings gets the CTA card and simplified layout, one-to-four ratings gets the growth prompt and collapsed breakdown, five-plus gets the full experience. The amber consistency matters — every actionable element uses our brand amber so users learn that amber means 'do something.' The 'Find a place to rate' CTA with the arrow in the empty history section mirrors the pattern we use on Discover suggestion chips, so it feels familiar even though it's in a new context."

**Jasmine Taylor (Marketing):** "From a growth perspective, this directly targets our activation bottleneck. Our analytics show that users who rate at least one place within their first session have 3x higher D1 retention. But the old profile gave zero-rating users no reason to go rate anything — it just showed them emptiness. The new CTA card with copy about 'influence growth' ties into our credibility messaging. We're not saying 'rate stuff because we need data,' we're saying 'rate stuff because it makes you matter.' That's the TopRanker value prop in a single interaction."

**Amir Patel (Architecture):** "I want to call out something that didn't happen here, which is just as important. We considered adding a new API endpoint to fetch user-stage metadata — onboarding completion percentage, suggested first actions, etc. We decided against it. The `totalRatings` field is already in the profile response. Branching UI logic on a field we already have means zero additional API calls, zero additional latency, zero new endpoints to maintain. The best architecture decision is often the one where you don't add anything."

## Changes

- **"Rate Your First Place" CTA card** — when `totalRatings === 0`, a prominent amber card appears encouraging the user to find a restaurant to rate. Tapping navigates to Discover. Includes restaurant icon, title, description emphasizing influence growth, and chevron indicator.
- **Growth prompt hidden for 0-rating users** — the "Keep rating to unlock your next tier" prompt only renders when `totalRatings > 0`. No point showing growth messaging to someone who hasn't started.
- **Collapsible Score Breakdown for new users** — when `totalRatings < 5`, the Score Breakdown section collapses behind a tap-to-expand with hint text "Rate N more places to see meaningful score details." Users with 5+ ratings see it expanded by default.
- **Actionable empty rating history** — the empty state now uses an amber icon instead of gray, has improved copy ("Your first rating builds your credibility and shapes the rankings"), and includes a "Find a place to rate" CTA with arrow navigating to Discover.
- **New styles added:** `gettingStartedCard`, `gettingStartedIcon`, `gettingStartedTitle`, `gettingStartedDesc`, `breakdownTitleRow`, `breakdownHint`, `emptyCtaRow`, `emptyCtaText`

## Technical Decisions

- **Threshold of 5 ratings for Score Breakdown expansion** — below 5 data points, the breakdown percentages are noisy and potentially misleading. Collapsing behind a tap avoids presenting low-confidence data as authoritative.
- **Reuse `totalRatings` from existing profile response** — no new API calls or endpoints needed. All branching logic derives from a field already present in the profile payload.
- **Amber for all actionable empty states** — gray communicates "disabled," amber communicates "opportunity." Aligns with brand system where amber (#C49A1A) signals interactive elements.
- **Full-card tap target on CTA** — the entire card is pressable, not just the chevron. Improves accessibility and reduces mis-taps on mobile.
- **Navigate to Discover (not Search)** — Discover surfaces curated suggestions and nearby places, making it the lowest-friction path for a user who doesn't yet know what to rate.

## Testing

- 1225 tests passing across all test suites
- 0 new TypeScript errors
- Manual verification of all three user states: 0 ratings, 1-4 ratings, 5+ ratings

## PRD Gaps Closed

- User-stage-aware profile (new) — profile page now adapts layout, messaging, and data density based on where the user is in their rating journey
