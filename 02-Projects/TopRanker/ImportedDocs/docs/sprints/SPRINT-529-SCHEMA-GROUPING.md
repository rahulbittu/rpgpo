# Sprint 529: Schema Table Grouping

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 16 new (9,802 total across 418 files)

## Mission

Organize `shared/schema.ts` (903 LOC) with domain section markers, table of contents, and documented constraints on file splitting. Improve navigability without changing any table definitions.

## Team Discussion

**Amir Patel (Architecture):** "schema.ts grew to 903 LOC across 30+ table definitions. We investigated file splitting but Drizzle foreign key references create circular dependencies — every table references members or businesses. Domain section markers and a TOC are the pragmatic solution."

**Marcus Chen (CTO):** "The TOC lists 8 domain groups: Core, Dishes, Competition, Claims & Moderation, Categories, Commerce, Community & Engagement, Photos. Any developer can now jump to the right section without scrolling."

**Sarah Nakamura (Lead Eng):** "One test needed fixing: sprint166 used a regex that matched the TOC comment instead of the actual code. Narrowed the pattern to `export const insertDishSuggestionSchema` for specificity."

**Rachel Wei (CFO):** "No functional changes, no new features. But the schema is the foundation of everything — making it navigable is an investment in developer velocity."

## Changes

### Modified Files

| File | Before | After | Delta | Change |
|------|--------|-------|-------|--------|
| `shared/schema.ts` | 903 | 960 | +57 | Added TOC comment + 8 domain section markers |
| `tests/sprint166-dish-leaderboards.test.ts` | — | — | 0 | Narrowed regex to avoid TOC match |

### New Files

| File | Purpose |
|------|---------|
| `__tests__/sprint529-schema-grouping.test.ts` | 16 tests covering TOC, markers, and exports |

### Domain Groups Added

| Domain | Tables | Section Marker |
|--------|--------|---------------|
| CORE | members, businesses, ratings | `// ── CORE` |
| DISHES | dishes, dishVotes | `// ── DISHES` |
| COMPETITION | challengers, rankHistory | `// ── COMPETITION` |
| CLAIMS & MODERATION | businessClaims, claimEvidence, businessPhotos, qrScans, ratingFlags, memberBadges, credibilityPenalties | `// ── CLAIMS & MODERATION` |
| CATEGORIES | categories, categorySuggestions | `// ── CATEGORIES` |
| COMMERCE | payments, webhookEvents, featuredPlacements, analyticsEvents | `// ── COMMERCE` |
| COMMUNITY & ENGAGEMENT | notifications, referrals, betaInvites, userActivity, betaFeedback | Pre-existing marker |
| PHOTOS | ratingPhotos, photoSubmissions | `// ── PHOTOS` |

## Test Summary

- `__tests__/sprint529-schema-grouping.test.ts` — 16 tests
  - TOC: 3 tests (presence, domain groups, constraint docs)
  - Section markers: 7 tests (one per domain)
  - Export preservation: 6 tests (key tables still exported)
