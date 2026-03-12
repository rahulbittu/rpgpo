# Critique Request — Sprints 275-279

**Date:** March 9, 2026
**Requesting Team:** TopRanker Engineering
**Reviewer:** External Watcher (ChatGPT)

## Summary of Changes

### Sprint 276: Score Trend Sparkline
- New `ScoreTrendSparkline` component on business detail page
- Self-fetching SVG sparkline from `/api/businesses/:id/score-trend`
- Trend direction indicator (up/down/stable), returns null for <2 points
- Server endpoint queries `rankHistory` table

### Sprint 277: Dish Leaderboard Enrichment
- New `TopDishes` component on business detail page
- Self-fetching from `/api/businesses/:id/top-dishes`
- Ranked list #1-#5 with photo, name, vote count
- Navigation to dish detail page

### Sprint 278: Rating Submission Validation Hardening
- Integer enforcement on q1/q2/q3 scores via `.int()`
- `visitType` changed from optional to required in schema
- Note: HTML stripping via regex transform, cap bumped 160→2000
- Removed `(data as any).visitType || "dine_in"` cast in submitRating
- Removed duplicate `note` field in schema

### Sprint 279: Admin Eligibility Dashboard + Unranked Labels
- `GET /api/admin/eligibility` endpoint with near-eligible tracking
- `getRankDisplay(0)` returns "Unranked" (was "#0")
- Search cards use actual rank not list index for display
- Muted gray badge for unranked businesses
- Accessibility labels reflect unranked state

## Questions for Review

1. **Score Trend Sparkline:** Is querying `rankHistory` for every business page load a scalable approach? Should we cache or batch these queries?

2. **HTML Stripping Regex:** Sprint 278 uses `/<[^>]*>/g` for note sanitization. The retro flagged this as basic. Is this a real security concern for V1, or is server-side rendering the only vector that matters?

3. **Unranked Label UX:** Showing "Unranked" on search cards could be perceived negatively by restaurant owners. Is there a better framing that maintains honesty without discouraging businesses?

4. **Near-Eligible Thresholds:** The admin eligibility endpoint uses hardcoded 2+ ratings / 0.3 credibility for near-eligible. Should these be configurable via admin experiments?

5. **Anti-Requirement Violations:** Sprint 253 (business-responses) and Sprint 257 (review-helpfulness) route files still exist. 27 sprints since flagged. Should the engineering team remove these proactively or continue waiting for CEO decision?

## Files for Review
- `components/business/ScoreTrendSparkline.tsx`
- `components/business/TopDishes.tsx`
- `shared/schema.ts` (insertRatingSchema changes)
- `server/storage/ratings.ts` (visitType cast removal)
- `server/routes-admin.ts` (eligibility endpoint)
- `constants/brand.ts` (getRankDisplay update)
- `components/search/SubComponents.tsx` (unranked badge)
- `app/(tabs)/search.tsx` (displayRank change)
