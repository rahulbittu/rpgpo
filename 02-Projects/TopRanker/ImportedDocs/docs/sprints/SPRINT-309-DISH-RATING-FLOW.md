# Sprint 309: Dish Rating Flow

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Add "Rate [dish]" button on leaderboard entries to drive ratings from dish pages

## Mission
The dish leaderboard page shows ranked entries but doesn't invite the user to rate. A user browsing "Best Biryani in Dallas" might think "I know a better spot" — give them a direct path to rate. Each entry card gets a "Rate Biryani" button that opens the rate page with the dish pre-filled. The bottom CTA is enhanced with subtext and a search icon.

## Team Discussion

**Marcus Chen (CTO):** "This closes the dish engagement loop. Browse leaderboard → disagree with ranking → rate your spot → leaderboard updates. The `dish` query parameter already existed on the rate page — we're just connecting the UI."

**Amir Patel (Architecture):** "Zero API changes. The rate page's `useLocalSearchParams` already reads `dish` as a context parameter. The dish leaderboard page just needs to pass it via router.push. Clean integration."

**Sarah Nakamura (Lead Eng):** "The 'Rate Biryani' button is deliberately small and below the entry info — it shouldn't compete with the card tap (which goes to the business page). It's a secondary action for engaged users."

**Jasmine Taylor (Marketing):** "The enhanced CTA — 'Know a great biryani spot? Rate it to help build this leaderboard' — is perfect for the landing page. It tells users their rating has impact, not just a score in a database."

**Priya Sharma (QA):** "16 tests covering: entry Rate button navigation, dish param passing, accessibility, rate page dish context support, enhanced CTA, and styles."

## Changes
- `app/dish/[slug].tsx` — Added "Rate {dish}" button on each entry card navigating to `/rate/[id]?dish={dishName}`; enhanced bottom CTA with subtext and search icon; 3 new styles

## Test Results
- **230 test files, 5,938 tests, all passing** (~3.2s)
