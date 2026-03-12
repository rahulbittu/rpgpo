# Sprint 168: Dish Leaderboard Seed Data + Rating Flow Dish Context

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Seed 5 Dallas dish boards from existing data + dish context pre-fill in rating flow

---

## Mission Alignment
Empty leaderboards destroy credibility. Seeding from existing dish data means users see populated boards immediately. Dish context in the rating flow closes the loop: see a dish ranking → rate for that dish → ranking updates.

---

## Team Discussion

**Marcus Chen (CTO):** "Five boards seeded: Biryani, Ramen, Taco, Burger, Coffee. All from existing dish vote data in the database. No fake data — every entry traces to real seed businesses."

**Amir Patel (Architecture):** "The seed uses ILIKE matching on dish_normalized names, same pattern as recalculateDishLeaderboard. Entries are populated with descending scores and realistic rating counts. When real users rate, the recalculation job will replace these with actual weighted scores."

**Sarah Nakamura (Lead Eng):** "Rating flow now accepts a `dish` search param via Expo Router. When navigating from a dish leaderboard entry, the dish name pre-fills the dish input field and shows a context banner: 'You're rating [Restaurant] for their [Dish]'."

**Priya Sharma (Design):** "The dish context banner uses amber tint background (8% opacity), consistent with the dish leaderboard hero banner. It's informational, not blocking — users can still change the dish if they want."

**Jasmine Taylor (Marketing):** "The pre-fill reduces friction by 1 tap. Users coming from 'Best Biryani' don't have to re-type 'biryani' in the dish field. Small UX win that matters for conversion."

---

## Changes

### Seed Data (server/seed.ts)
- Added 5 dish leaderboards: Biryani 🍛, Ramen 🍜, Taco 🌮, Burger 🍔, Coffee ☕
- Each board populated with entries from matching seed dishes
- Entries include dish scores, rating counts, rank positions, photos

### Rating Flow Dish Context (app/rate/[id].tsx)
- Accepts `dish` search param: `useLocalSearchParams<{ id: string; dish?: string }>`
- Pre-fills `dishInput` state from context param
- Shows amber context banner: "You're rating [Restaurant] for their [Dish]"
- New styles: `dishContextBanner`, `dishContextText`

---

## Test Results
- **2314 tests** across 102 files — all passing, 1.79s
- 16 new tests covering seed data, dish context param, banner display
