# Sprint 17 — Pride Mechanism + Rank History Chart

## Mission Alignment
Trust platforms die when contributors feel invisible. Sprint 17 makes every rater's impact visible — your votes MOVED businesses up in the rankings. This is the pride mechanism that turns passive raters into active community members. Rank history charts reveal the temporal dimension: is this business trending up or coasting?

## Team Discussion

### Rahul Pitta (CEO)
"The pride mechanism is what turns TopRanker from a tool into a community. When a user sees 'Your ratings contributed to 7 businesses moving up,' they feel ownership. That's the emotional hook that drives retention. Yelp never tells you your review mattered. We do."

### David Okonkwo (VP Product)
"The PRD explicitly calls for 'Businesses you have helped move up in ranking — a pride mechanism.' This is not optional. It's core to the flywheel: rate more, see more impact, rate more. The rank history chart on the business profile gives depth to what was previously just a static number."

### Marcus Chen (CTO)
"Both features are backend-derived but lightweight. The impact query joins ratings to rank changes — no new tables needed. Rank history leverages the existing rank_history table that the daily cron populates. Zero infrastructure cost."

### James Park (Frontend Architect)
"The rank history chart uses a simple dot-and-line visualization built with View components — no charting library dependency. 30-day window, dots for each day, connecting lines. Responsive to screen width. The pride card on Profile uses the same green delta arrows we use on the leaderboard for visual consistency."

### Priya Sharma (Backend Architect)
"Added two new endpoints: `/api/businesses/:id/rank-history` queries the rank_history table for the last N days, and `/api/members/me/impact` computes which businesses moved up based on the member's rating timestamps overlapping with rank changes. Both are read-only, cacheable."

### Carlos Ruiz (QA Lead)
"TypeScript clean. Impact card renders correctly with 0 contributions, 1 contribution, and many. Rank history chart gracefully handles missing days in the data."

## Changes
- `app/(tabs)/profile.tsx`: Added "Your Impact" pride card showing businesses moved up + contribution list
- `app/business/[id].tsx`: Added rank history chart with dot visualization, 30-day window
- `lib/api.ts`: Added `fetchRankHistory()` and `fetchMemberImpact()` functions
- `server/routes.ts`: Added `/api/businesses/:id/rank-history` and `/api/members/me/impact` endpoints
- `server/storage.ts`: Added `getRankHistory()` and `getMemberImpact()` queries

## PRD Gaps Closed
- "Businesses you have helped move up in ranking — a pride mechanism" on Member Profile
- Rank history visualization on Business Profile
