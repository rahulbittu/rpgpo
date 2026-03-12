# Sprint 636: Dynamic OG Image Generation for Social Sharing

**Date:** 2026-03-11
**Points:** 5
**Focus:** Server-side SVG OG image endpoints for business and dish pages

## Mission

When users share TopRanker links on WhatsApp, iMessage, or social media, the preview should show a branded card with rank, score, and category — not a generic image or business photo. This sprint adds server-side OG image generation endpoints.

## Team Discussion

**Marcus Chen (CTO):** "SVG is the right choice here — no image processing dependencies, server stays lean. 1200×630 is the standard OG image size. The branded cards with navy background and amber accents will be instantly recognizable."

**Jasmine Taylor (Marketing):** "This is huge for WhatsApp virality. When someone shares 'Best Biryani in Irving' and the preview shows #1 rank with score, it sparks conversation. The controversy-driven engagement model depends on shareable previews."

**Rachel Wei (CFO):** "Business Pro pitch gets stronger: 'Your restaurant's share card was viewed 500 times this week.' We can track OG image requests as a proxy for social impressions."

**Amir Patel (Architecture):** "Clean separation: `og-image.ts` generates SVG, `prerender.ts` references the URLs in OG meta tags. Caching is 1 hour — long enough to reduce DB load, short enough that rank changes propagate."

**Sarah Nakamura (Lead Eng):** "Build grew from 630.5kb to 636.9kb — the og-image module is well-contained at 150 LOC. Updated prerender.ts to use dynamic OG image URLs instead of business photos for business pages, and added OG images for dish leaderboard pages (previously had none)."

## Changes

### `server/og-image.ts` (NEW — 150 LOC)
- `handleBusinessOgImage`: Generates 1200×630 SVG with rank badge, business name, category, city, score, rating count, TopRanker branding
- `handleDishOgImage`: Generates 1200×630 SVG with "BEST IN [CITY]" header, dish name, entry count, top 3 restaurants with medals
- Both endpoints: `Content-Type: image/svg+xml`, `Cache-Control: public, max-age=3600`
- Rank emoji: 🥇🥈🥉 for top 3, `#N` for others

### `server/routes.ts`
- `GET /api/og-image/business/:slug` — dynamic business OG image
- `GET /api/og-image/dish/:slug?city=` — dynamic dish OG image

### `server/prerender.ts`
- Business pages: OG image now uses `/api/og-image/business/:slug` instead of `biz.photoUrl`
- Dish pages: OG image now uses `/api/og-image/dish/:slug?city=` (previously had no OG image)

### `shared/thresholds.json`
- Added `server/og-image.ts` (31 tracked files)
- Build: 636.9kb, Tests: 11,695

### Test Updates
- 14 test files: tracked file count 30 → 31
- `sprint180`: Updated OG image assertion from `biz.photoUrl` to `/api/og-image/business/`

## Health
- **Tests:** 11,695 pass (501 files)
- **Build:** 636.9kb (85% of 750kb ceiling)
- **New file:** og-image.ts at 150/160 LOC
