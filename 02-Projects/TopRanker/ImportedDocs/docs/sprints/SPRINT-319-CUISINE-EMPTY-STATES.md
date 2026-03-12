# Sprint 319: Cuisine-Aware Empty States on Rankings

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Show cuisine-specific empty state with dish suggestions when no businesses match

## Mission
When a user selects "Korean" cuisine on Rankings but no Korean restaurants exist for the active category, they see a generic "No businesses found" message. This sprint makes the empty state cuisine-aware: it names the cuisine, suggests dish leaderboards, and offers a "Show all cuisines" clear button.

## Team Discussion

**Marcus Chen (CTO):** "Empty states are product opportunities, not dead ends. 'No Korean restaurants ranked yet' tells the user their cuisine is recognized. Suggesting dish leaderboards keeps them engaged instead of bouncing."

**Sarah Nakamura (Lead Eng):** "Three layers: 1) cuisine-aware message ('No Korean restaurants ranked yet'), 2) dish shortcuts if available ('Explore Korean dish rankings: Korean BBQ, Bibimbap, Fried Chicken'), 3) clear filter button. All conditional on selectedCuisine being set."

**Amir Patel (Architecture):** "The dishShortcuts array from useDishShortcuts is already available in the component. We're just rendering it in a different location (empty state vs. shortcuts row). No new data fetching."

**Jasmine Taylor (Marketing):** "A user who picked Korean and sees dish suggestions is one tap from a leaderboard page with a share button. That's search → cuisine → empty state → dish leaderboard → share. Still a viable conversion path."

**Priya Sharma (QA):** "11 tests covering: cuisine-aware message, dish suggestions display, navigation, entry counts, clear filter button, and styles."

## Changes
- `app/(tabs)/index.tsx` — Enhanced ListEmptyComponent with cuisine-aware message, dish shortcut suggestions, and "Show all cuisines" clear filter button; 8 new styles

## Test Results
- **240 test files, 6,098 tests, all passing** (~3.2s)
