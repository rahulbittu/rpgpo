# Sprint 129: Your Previous Rating
**Date:** March 8, 2026
**Sprint Goal:** Show users their own past rating on business pages to provide context and encourage updates

## Team Discussion

**Marcus Chen (CTO):** "Re-rating is one of those patterns that keeps our data fresh. If someone rated a restaurant six months ago and the kitchen changed hands, we want them to update. Showing the old rating is the nudge — it says 'hey, things may have changed, does this still hold?' From a data freshness standpoint this is a net win for ranking accuracy."

**Sarah Nakamura (Lead Engineer):** "The key decision here was whether to hit a dedicated endpoint like `GET /api/ratings/mine?businessId=X` or just scan the existing ratings array that's already loaded on the business page. We went with the existing array — the ratings are already fetched, we just filter by `memberId` matching the current user. Zero extra network cost. If the ratings list is paginated in the future we may need to revisit, but right now it's the right call."

**Liam O'Brien (Backend Engineer):** "This was a one-liner on the backend side. `memberId` was already present in the raw `ApiRating` shape coming from the database — we just weren't passing it through `mapApiRating()`. Added it to the mapper output and the TypeScript interface, done. No schema changes, no migration, no new endpoint. Clean."

**Priya Sharma (Mobile Engineer):** "The 'Your Rating' card sits right above the Rate button, so it's contextually linked — you see what you said before, and the action to update is right below. The Q1/Q2/Q3 scores render in a three-column grid using Playfair Display for the numbers, DM Sans for the labels. The would-return indicator is a simple checkmark or X icon. I also added the relative date logic — Today, Yesterday, or Xd ago — so it feels personal, not like a database timestamp."

**Elena Rodriguez (Design Lead):** "We went with the amber-tinted card style that we established in Sprint 127 for the lastRatingCard component. Amber border, light amber background — it's visually distinct from other users' ratings but still feels like part of the brand system. The influence label uses the tier color from TIER_COLORS so Diamond users see that purple badge, Bronze users see theirs. It reinforces the credibility system without being preachy about it."

**Jasmine Taylor (Marketing):** "From a retention angle, showing past ratings is powerful. It creates a sense of ownership — 'I rated this place, I'm part of why it's ranked where it is.' That emotional hook drives re-visits. And when the button says 'Update Your Rating' instead of 'Rate This Place,' it lowers the friction because they know they've done it before. We should track re-rating conversion rates once the analytics pipeline catches up."

## Changes

### Backend — `lib/api.ts`
- Added `memberId` to the return object of `mapApiRating()` so the client can identify which rating belongs to the current user
- No new endpoint required — data was already available in the raw API response

### Types — `components/business/SubComponents.tsx`
- Added `memberId: string` to the `MappedRating` interface to match the updated mapper output

### Business Detail Page — `app/business/[id].tsx`
- Added imports: `TIER_INFLUENCE_LABELS`, `TIER_COLORS`, `CredibilityTier` from `lib/data`
- **"Your Rating" card:** Displays the current user's previous rating when one exists
  - Q1/Q2/Q3 scores in a three-column grid (Playfair Display font for values)
  - Would-return indicator (checkmark/X)
  - User's influence tier label with tier-colored badge
  - Relative date display (Today / Yesterday / Xd ago)
  - Positioned directly above the Rate button for contextual flow
- **Rate button text:** Changes from "Rate This Place" to "Update Your Rating" when the user has an existing rating
- **New styles added:**
  - `yourRatingCard` — amber border (#C49A1A) with light amber background
  - `yourRatingHeader` — flex row with title and date
  - `yourRatingTitle` — bold section heading
  - `yourRatingDate` — muted relative timestamp
  - `yourRatingScores` — three-column grid container
  - `yourRatingScoreItem` — centered column for each score
  - `yourRatingScoreValue` — large Playfair Display number
  - `yourRatingScoreLabel` — small DM Sans label (Q1/Q2/Q3)
  - `yourRatingInfluence` — tier-colored influence badge

## Technical Decisions

- **Used existing ratings array rather than new API endpoint** — The business detail page already fetches all ratings. Filtering client-side by `memberId === currentUser.id` avoids an extra round trip. If ratings become paginated and the user's rating falls outside the first page, we will need a dedicated endpoint, but that is a future concern.
- **`memberId` was already available in raw API data, just not passed through mapper** — The `ApiRating` type from the database already included `memberId`. The `mapApiRating()` function simply was not including it in its return object. One-line fix, no schema or migration changes needed.
- **Amber card design reuses Sprint 127 pattern** — Consistent with the `lastRatingCard` styling established two sprints ago. No new design tokens needed.

## Testing

- **1225 tests passing** across the full suite
- **0 new TypeScript errors** introduced
- Verified card renders correctly when user has a prior rating and hides when they do not
- Confirmed "Update Your Rating" button text swap works based on existing rating presence
