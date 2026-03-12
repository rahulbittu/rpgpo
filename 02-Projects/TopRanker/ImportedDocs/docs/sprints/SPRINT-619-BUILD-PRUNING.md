# Sprint 619: Build Size Audit & Pruning

**Date:** 2026-03-11
**Type:** Infrastructure — Build Optimization
**Story Points:** 3
**Status:** COMPLETE

## Mission

Audit the server build (734.9kb / 750kb ceiling = 97.9%) and recover significant headroom. Target: recover at least 15-20kb.

## Result

**734.9kb → 625.7kb** — recovered **109.2kb (14.9% reduction)** by excluding seed data from the production bundle.

## Team Discussion

**Marcus Chen (CTO):** "This is the single highest-impact infrastructure change we've made in months. 109kb recovered from a 2-line code change and a build flag. We were at 97.9% of ceiling — now we're at 83.4%. That's 125kb of headroom for the next ~50 feature sprints."

**Amir Patel (Architecture):** "The root cause was elegant: seed.ts (58.5kb) and seed-cities.ts (50.5kb) were bundled into every production build despite being dev-only. esbuild's `--define` flag replaces `process.env.NODE_ENV` at build time, enabling dead-code elimination of the `if (NODE_ENV !== 'production')` branches."

**Sarah Nakamura (Lead Eng):** "The fix is remarkably clean. Two `if` guards around seed imports + one esbuild flag. No behavior change in production — seeds were already a no-op in Railway since the DB is pre-seeded. In dev, seed.ts is still imported normally via `tsx`."

**Rachel Wei (CFO):** "Build size directly impacts Railway deployment time and cold start performance. A 15% reduction means faster deploys, lower compute costs, and better user experience on first load."

**Nadia Kaur (Security):** "Excluding seed data from production is also a security improvement. Seed data contains test restaurant addresses, demo user data, and city coordinates that shouldn't be in the production bundle."

**Amir Patel:** "The `--define:process.env.NODE_ENV` flag also makes all existing NODE_ENV checks resolve at build time: logger level, push notification mode, security headers, and CORS configuration. This is a minor performance win — no runtime string comparisons for NODE_ENV."

## Changes

### Build Configuration
- `package.json` — Added `--define:process.env.NODE_ENV=\"production\"` to `server:build` esbuild command
  - Enables dead-code elimination for dev-only code paths
  - All `process.env.NODE_ENV` checks resolve at build time

### Seed Exclusion
- `server/index.ts` — Wrapped `seedDatabase()` import in `if (NODE_ENV !== "production")`
- `server/routes-admin.ts` — Wrapped `seed-cities` admin route in production guard

### Eliminated from Bundle
| Module | Size | % of Build |
|--------|------|------------|
| server/seed.ts | 58.5kb | 8.0% |
| server/seed-cities.ts | 50.5kb | 6.9% |
| **Total** | **109.0kb** | **14.9%** |

### Test Updates
- `__tests__/sprint619-build-pruning.test.ts` — 13 assertions: seed exclusion, build config, integrity, thresholds
- `__tests__/sprint551-schema-compression.test.ts` — Build size range updated (500-750kb)
- `__tests__/sprint559-hours-wire-cache.test.ts` — Build size floor updated (≥600)

### Thresholds
- `shared/thresholds.json` — Build 734.9→625.7kb, tests 11402→11415

## Verification
- 11,415 tests passing across 488 files (6.2s)
- Server build: 625.7kb (< 750kb ceiling, 83.4% utilization)
- 28 tracked files, 0 threshold violations

## Build Size History
| Sprint | Size | Ceiling | Utilization |
|--------|------|---------|-------------|
| 600 | 712.1kb | 720kb | 98.9% |
| 610 | 730.0kb | 750kb | 97.3% |
| 618 | 734.9kb | 750kb | 97.9% |
| **619** | **625.7kb** | **750kb** | **83.4%** |

## PRD Gaps Closed
- Build size at 97.9% with no headroom — now at 83.4% with 125kb headroom
- Seed data in production bundle (security) — now excluded
