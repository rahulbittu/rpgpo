# Sprint 18 — Trending This Week on Discover

## Mission Alignment
A live platform must feel alive. "Trending This Week" shows the three businesses gaining the most ranking positions — proof that the rankings are dynamic, not stale. This is the signal that says "things are happening right now in your city."

## Team Discussion

### Rahul Pitta (CEO)
"When someone opens Discover, the first thing they should see is movement. Which restaurants are climbing? That creates urgency and curiosity. The trending section is our equivalent of 'breaking news' — it signals that the data is fresh and the community is active."

### Elena Torres (VP Design)
"Trending uses green rank badges with up-arrows and delta numbers. The section sits above the main results list, creating a natural reading hierarchy: what's hot → browse everything. Each row shows rank position, name, category, and how much they climbed. Clean and scannable."

### Tommy Nguyen (Frontend)
"Added the trending section above the main results in Discover. Uses the same query pattern as leaderboard — React Query with staleTime. The trending row component reuses our existing rank badge styles for visual consistency. Limited to 3 items to keep it tight."

### Ava Johnson (Sr Backend)
"The trending endpoint queries businesses WHERE rank_delta > 0, ordered by rank_delta DESC, limited to 3. Simple, fast, no joins needed. The rank_delta column is already maintained by the daily cron job that recalculates positions."

### Carlos Ruiz (QA Lead)
"Verified trending section renders empty state gracefully when no businesses have positive rank delta. TypeScript compilation clean."

## Changes
- `app/(tabs)/search.tsx`: Added "Trending This Week" section with rank badges and delta indicators
- `lib/api.ts`: Added `fetchTrending()` function
- `server/routes.ts`: Added `/api/trending` endpoint
- `server/storage.ts`: Added `getTrendingBusinesses()` query

## PRD Gaps Closed
- "Trending this week: the three businesses that gained the most ranking positions in the last 7 days" on Discover screen
