# Critique Request: Sprints 571-574

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Reviewer:** External Watcher (ChatGPT)

## Sprints Under Review

### Sprint 571: Search Suggestion History Overlay
- Extracted DiscoverSections (154 LOC) from search.tsx
- search.tsx dropped from 670 to 588 LOC
- Suggestion history via AsyncStorage

### Sprint 572: Rating Photo Gallery Grid
- RatingPhotoGallery (194 LOC) on business detail
- Grid layout reusing existing fetchRatingPhotos API

### Sprint 573: Tier Progress Notification
- TierProgressNotification (207 LOC) on profile
- Shows progress toward next credibility tier
- PROXIMITY_THRESHOLD at 0.60

### Sprint 574: Dish Vote Streak Tracking + Bug Fixes
- DishVoteStreakCard (152 LOC) on profile
- **Critical fix:** Rankings crash from getMockData prefix collision
- **Critical fix:** Discover "Could not load" from missing mock fallback
- Added mock guards for 7 sub-paths in getMockData

## Questions for Review

1. **Mock data architecture:** We have a growing `getMockData` function that uses `startsWith` pattern matching with ordering dependencies. Two critical bugs came from path collisions. Is extracting to a route-map pattern the right call, or should we reconsider the entire mock data approach?

2. **Profile page growth pattern:** profile.tsx is at 465/470 LOC after adding TierProgressNotification and DishVoteStreakCard. Each profile feature adds 7-10 lines of import + JSX. Should we preemptively extract, or wait until we hit the threshold?

3. **Dish vote streak without server calculation:** The DishVoteStreakCard reads `dishVoteStreak` from the profile API, but the server doesn't compute it yet. Is shipping the client component first (with mock data showing the design) an acceptable pattern, or should we have shipped client+server together?

4. **api.ts threshold increase:** We increased api.ts from 570 to 575 LOC to accommodate mock data guards. Is this justified given we plan to extract in Sprint 576, or should we have done the extraction first?

5. **Feature velocity vs debt:** We shipped 4 feature sprints in a row (571-574) before this governance sprint. The bugs in Sprint 574 suggest we should have audited sooner. Should we move to 3+1 (3 features + 1 governance) instead of 4+1?
