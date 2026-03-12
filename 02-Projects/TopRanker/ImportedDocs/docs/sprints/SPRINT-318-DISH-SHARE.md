# Sprint 318: Dish Leaderboard Share Cards

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Add share button to dish leaderboard pages for WhatsApp/social sharing

## Mission
Dish leaderboard pages have OG tags for web previews (Sprint 174) but no way to share from within the app. This sprint adds a share button in the header that uses the platform Share API to create rich share cards with emoji, dish name, entry count, and canonical URL.

## Team Discussion

**Jasmine Taylor (Marketing):** "This is the missing piece for WhatsApp campaigns. Users see 'Best Biryani in Dallas — 5 spots ranked' and tap to share. The share text includes the TopRanker URL which drives installs. We've been waiting for this since the marketing strategy doc."

**Marcus Chen (CTO):** "The share button is in the header where users expect it. The share text is crafted for WhatsApp: emoji + 'Best {dish} in {city}' + count + URL. It reads like a natural message, not a marketing link."

**Amir Patel (Architecture):** "Uses React Native's built-in Share API — no new dependencies. Works on iOS (share sheet), Android (share intent), and web (Web Share API with fallback). Analytics tracks dish_leaderboard_share for measuring viral coefficient."

**Sarah Nakamura (Lead Eng):** "The share includes three fields: `message` (for platforms that use text), `url` (for platforms that detect URLs), and `title` (for iOS share sheet). Canonical URL ensures consistent links regardless of environment."

**Priya Sharma (QA):** "15 tests covering: Share import, button UI, Share.share call, message content (emoji, name, city, count, URL), analytics event, accessibility, error handling."

## Changes
- `app/dish/[slug].tsx` — Added Share import, share button in header with headerShare style, Share.share() call with rich text
- `lib/analytics.ts` — Added `dish_leaderboard_share` event type

## Test Results
- **239 test files, 6,088 tests, all passing** (~3.2s)
