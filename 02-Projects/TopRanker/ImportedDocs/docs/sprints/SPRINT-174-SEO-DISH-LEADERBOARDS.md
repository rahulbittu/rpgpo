# Sprint 174: SEO for Dish Leaderboard Pages

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Search engine optimization for dish leaderboard pages — dedicated URLs, structured data, sitemap

---

## Mission Alignment
Dish leaderboards answer the exact query users type into Google: "best pizza in Dallas," "best tacos in Fort Worth." Without dedicated, SEO-optimized pages, this high-intent traffic goes to Yelp and Google Maps instead. This sprint creates crawlable, shareable dish leaderboard pages with rich metadata.

---

## Team Discussion

**Marcus Chen (CTO):** "Dish leaderboards were embedded inside the Discovery screen — invisible to search engines. Now each dish has its own URL (`/dish/best-pizza-dallas`) with unique meta tags, JSON-LD structured data, and a sitemap entry. This is our first organic search acquisition channel."

**Sarah Nakamura (Lead Eng):** "Six deliverables: (1) `app/dish/[slug].tsx` — dedicated page with Expo Router's Head component for dynamic meta, (2) `server/routes-seo.ts` — sitemap.xml and robots.txt endpoints, (3) JSON-LD ItemList schema for each dish, (4) Twitter Card and Open Graph tags, (5) canonical URLs, (6) navigation from DishLeaderboardSection to the new page."

**Amir Patel (Architecture):** "The sitemap dynamically queries all active dish leaderboards across 5 cities. It's generated on each request — no caching needed yet since we have low traffic. When traffic grows, we add `Cache-Control` headers. The JSON-LD endpoint at `/api/seo/dish/:slug` can be consumed by SSR prerendering later."

**Priya Sharma (Design):** "The dedicated dish page has a taller entry card photo (150px vs 130px in the inline section) since it's the primary content. The 'Full ranking →' link on the DishLeaderboardSection hero banner creates a natural discovery path from Discovery to the dedicated page."

**Nadia Kaur (Security):** "robots.txt blocks `/admin/` and `/api/` from crawlers. Sitemap only exposes public-facing pages. No user data in structured data — only business names, slugs, and rank positions."

**Jasmine Taylor (Marketing):** "This is huge for organic growth. 'Best [dish] in [city]' queries have high commercial intent and low competition in DFW. Each dish leaderboard page is essentially a landing page that can rank in Google. The Open Graph tags mean shared links on Twitter and Facebook show rich previews."

**Jordan Blake (Compliance):** "Structured data uses schema.org ItemList — the correct type for ranked lists. No false claims in the description. 'Community-ranked' is accurate attribution."

---

## Changes

### New Files
| File | Lines | Purpose |
|------|-------|---------|
| `app/dish/[slug].tsx` | 274 | Dedicated dish leaderboard page with dynamic SEO meta |
| `server/routes-seo.ts` | 103 | robots.txt, sitemap.xml, JSON-LD API endpoint |

### Modified Files
| File | Change |
|------|--------|
| `server/routes.ts` | Register SEO routes |
| `app/+html.tsx` | Add og:site_name, og:url, Twitter Cards, canonical URL |
| `components/DishLeaderboardSection.tsx` | Add "Full ranking →" link to dedicated dish page |

### SEO Features
- **Dynamic meta tags**: Unique title, description, OG, Twitter Cards per dish
- **Canonical URLs**: `https://topranker.com/dish/{slug}`
- **JSON-LD**: schema.org ItemList with ranked businesses
- **Sitemap**: Auto-generated from active dish leaderboards across 5 cities
- **robots.txt**: Allow public pages, block admin/API routes

---

## Test Results
- **36 new tests** for SEO features
- Full suite: **2,482 tests** across 107 files — all passing, <1.8s
