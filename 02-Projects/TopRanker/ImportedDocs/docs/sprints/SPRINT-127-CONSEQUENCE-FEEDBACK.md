# Sprint 127: Consequence Feedback
**Date:** March 8, 2026
**Sprint Goal:** Make ratings feel consequential by showing users immediate feedback on their last rating

## Team Discussion

**Marcus Chen (CTO):** The API shape here is intentionally minimal. We return `lastRating` as an optional field on the existing `getMemberImpact()` response rather than introducing a new endpoint. That keeps the profile load to a single round-trip. One thing I want us watching is data freshness — right now this is fetched on every profile mount, which is fine, but if we ever cache the impact response we need to make sure the lastRating portion has a short TTL or gets invalidated on new ratings.

**Sarah Nakamura (Lead Engineer):** I led the integration on this one. The key layout decision was where to place the consequence card on the profile. We landed on positioning it between the member-since text and the pride mechanism section. That way the user sees "you've been here since X" immediately followed by "and here's what your last rating did" — it creates a natural narrative flow before they hit the tier progress visuals. If we'd put it below the pride section it would get buried.

**Liam O'Brien (Backend Engineer):** The `lastRating` query is a single SELECT with a JOIN to the businesses table, ordered by `ratedAt DESC` with `LIMIT 1`. I want to be explicit that there's no N+1 risk here — it's one additional query per profile load, not one per rating. The JOIN gives us the business name and slug without a second round-trip. I indexed `(memberId, ratedAt DESC)` on the ratings table during Sprint 118 so this query plan is already covered.

**Priya Sharma (Mobile Engineer):** The card itself uses an amber border and light amber background to stay on-brand without competing with the tier badge colors. I kept the tap target generous — the entire card navigates to `business/[slug]` so users can immediately revisit what they rated. The score display uses Playfair Display to match the score typography we use everywhere else. On smaller screens the card stacks cleanly since it's a single flex column.

**Jasmine Taylor (Marketing):** This is a retention play, plain and simple. The biggest drop-off we see is after a user's first rating — they rate something, nothing visible happens, and they bounce. Now they come back to their profile and see tangible proof: "You rated Sakura Ramen 8.2, and your Tier 3 credibility gave it a weighted influence of 1.4x." That closes the feedback loop. I expect this to measurably improve second-rating conversion within a few weeks.

**Jordan Blake (Compliance):** I reviewed the `lastRating` payload. It contains the business name, slug, the user's own raw score, their weight multiplier, and the timestamp. All of this is the user's own data reflected back to them — no other user's PII is exposed, no aggregated scores that could be reverse-engineered to identify other raters. This is clean from a GDPR perspective. If we ever expand this to show "your rating moved the overall score by X," we'll need to revisit since that could leak information about vote volume.

## Changes

- **server/storage/members.ts** — Added `lastRating` query to `getMemberImpact()`: fetches the user's most recent rating (business name, slug, rawScore, weight, ratedAt) via a JOIN to the businesses table with `LIMIT 1`
- **lib/api.ts** — Updated `ApiMemberImpact` interface to include optional `lastRating` field with `businessName`, `businessSlug`, `rawScore`, `weight`, `ratedAt`
- **app/(tabs)/profile.tsx** — Added "Your Last Rating" consequence card between member-since text and pride mechanism section; styled with amber border/background; taps navigate to the business page

## Technical Decisions

1. **Single response, not a new endpoint.** We augmented the existing `getMemberImpact()` response rather than creating `/api/members/:id/last-rating`. This avoids an extra network round-trip on profile load and keeps the data model cohesive.
2. **Optional field.** `lastRating` is optional on the interface because new users who haven't rated anything yet will not have this data. The profile card conditionally renders only when the field is present.
3. **LIMIT 1 query with existing index.** The query leverages the `(memberId, ratedAt DESC)` index added in Sprint 118, so the lookup is effectively free.
4. **Card placement above pride section.** Positioned the consequence card to create a narrative arc: identity (member since) -> consequence (your last rating) -> progress (tier/pride).

## Testing

- 1225 tests passing
- 0 new TypeScript errors from Sprint 127 changes

## PRD Gaps Closed

- Consequence feedback loop (partial — last rating card on profile)
