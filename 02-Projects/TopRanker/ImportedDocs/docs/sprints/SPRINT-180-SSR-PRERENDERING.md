# Sprint 180: SSR Prerendering + SLT Meeting + Audit #18

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Server-side prerendering for search engine crawlers, SLT backlog meeting for Sprints 181-185, Architecture Audit #18

---

## Mission Alignment
SEO pages without prerendering are invisible to crawlers that don't execute JavaScript. This sprint adds bot-aware middleware that serves pre-rendered HTML with meta tags, JSON-LD, and Open Graph data — making dish leaderboards and business pages indexable. Core Values #4 (every rating has consequence) is strengthened: rating submission now invalidates prerender cache, ensuring crawlers always see fresh rankings. This directly feeds **rate -> consequence -> ranking** into Google's index.

---

## Team Discussion

**Marcus Chen (CTO):** "Tenth consecutive clean sprint (171-180). SSR prerendering completes our SEO stack: sitemap.xml tells Google where to look, JSON-LD tells it what the data means, and prerendered HTML makes it readable without JavaScript execution. The SLT meeting sets direction for the next 5 sprints — profile decomposition, push deep links, moderation, search improvements, and real user onboarding."

**Sarah Nakamura (Lead Eng):** "The prerender middleware is clean — 230 lines, bot-only, in-memory LRU cache. It sits before route registration so it intercepts requests before the Expo app shell. Non-bot requests pass through untouched. Cache invalidation hooks into rating submission so crawlers never see stale rankings."

**Amir Patel (Architecture):** "The LRU cache (200 entries, 5min TTL) is the right first step. No Redis dependency, no external infra. The cache evicts oldest entries at capacity and expires after TTL. For our single-instance deployment, this is sufficient. Redis comes when we scale horizontally. Audit #18 grade: A-, stable. Profile SubComponents (863 LOC) is the only HIGH finding — scheduled for Sprint 181."

**Rachel Wei (CFO):** "Revenue infrastructure is 100% complete as of Sprint 180. Three live streams: Challenger ($99), Business Pro ($49/mo), Featured Placement. SLT 181-185 shifts focus from building infrastructure to getting real paying customers. Sprint 185 is the real user onboarding sprint."

**Priya Sharma (Design):** "The prerendered HTML includes noscript fallback — users without JavaScript still see the page title and description. OG images use business photos when available, falling back to our default. The schema.org Restaurant type includes aggregate ratings when data exists."

**Nadia Kaur (Security):** "All dynamic content in prerendered HTML goes through escapeHtml — no XSS vector. The HTML shell doesn't include user-specific data. Bot detection is user-agent based (standard approach). Cache stats are admin-only."

**Jordan Blake (Compliance):** "Schema.org structured data follows Google's guidelines. AggregateRating only appears when totalRatings > 0 — we don't show fake precision for unrated businesses. This aligns with Core Values #8 (don't confuse confidence with precision)."

**Jasmine Taylor (Marketing):** "Crawlable pages mean organic search traffic. When someone Googles 'best tacos in Dallas', our dish leaderboard page can now rank. The OG tags also mean our links look good when shared on social platforms — proper previews with titles, descriptions, and images."

---

## Changes

### New Files
| File | Lines | Purpose |
|------|-------|---------|
| `server/prerender.ts` | 230 | SSR prerender middleware — bot detection, HTML shell, LRU cache |
| `docs/meetings/SLT-BACKLOG-180.md` | — | SLT meeting: Sprint 176-180 retro, 181-185 backlog |
| `docs/audits/ARCH-AUDIT-180.md` | — | Architecture Audit #18: A-, consequence chain audit |

### Modified Files
| File | Change |
|------|--------|
| `server/index.ts` | Register prerender middleware before routes |
| `server/routes.ts` | Cache invalidation after rating submission |
| `server/routes-admin.ts` | Prerender cache stats in health endpoint |
| `package-lock.json` | Fix yaml@2.8.2 missing from lock file (CI fix) |

### Prerender Features
| Feature | Description |
|---------|-------------|
| Bot detection | 15 crawler user-agents (Google, Facebook, Twitter, etc.) |
| Dish pages | `/dish/:slug` — ItemList JSON-LD, top business names |
| Business pages | `/business/:slug` — Restaurant JSON-LD, AggregateRating |
| LRU cache | 200 entries, 5min TTL, automatic eviction |
| Cache invalidation | After rating submission, affected business cache cleared |
| HTML shell | DOCTYPE, OG tags, Twitter Cards, canonical URL, noscript fallback |
| XSS prevention | All dynamic content escaped via escapeHtml |

---

## Test Results
- **51 new tests** for SSR prerendering + SLT + audit
- Full suite: **2,730 tests** across 113 files — all passing, <1.9s
