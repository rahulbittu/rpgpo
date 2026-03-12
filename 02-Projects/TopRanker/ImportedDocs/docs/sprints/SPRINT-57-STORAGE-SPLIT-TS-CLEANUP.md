# Sprint 57 — Storage Module Split + TypeScript Cleanup

## Mission Alignment
Monolithic files are trust killers for engineering teams. A 1010-line god object (`storage.ts`) with every database operation makes testing, reviewing, and maintaining code exponentially harder. This sprint splits it into domain modules and eliminates the last TypeScript error, continuing the audit remediation pipeline.

## Backlog Refinement (Pre-Sprint)
**Attendees**: Rahul (CEO), Marcus (CTO), James (Frontend Architect), Mei Lin (Type Safety), Carlos (QA)

**Selected from Audit HIGH Findings**:
- H1: Split storage.ts into domain modules (8 pts)
- H2: Remove `as any` in server routes (partial — 1 pt)
- L4: Fix pre-existing TypeScript error (1 pt)

**Total**: 10 story points

## Team Discussion

### Rahul Pitta (CEO)
"1010 lines in one file. That's not engineering, that's a wall of spaghetti. When James or Priya need to add a new business query, they shouldn't have to scroll past 500 lines of rating logic. Domain separation is basic engineering hygiene — it should have been done 20 sprints ago. Get it done."

### Marcus Chen (CTO)
"The barrel export pattern is key here. We create `server/storage/index.ts` that re-exports everything from the domain modules. Every file that currently imports from `./storage` continues to work without any import changes. Zero breaking changes, maximum structural improvement."

### James Park (Frontend Architect)
"I split it into 6 files: `helpers.ts` for pure functions (50 LOC), `members.ts` for member operations (195 LOC), `businesses.ts` for business queries and scoring (230 LOC), `ratings.ts` for rating submission and anomaly detection (210 LOC), `challengers.ts` for challenger events (80 LOC), `dishes.ts` for dish search (65 LOC), plus the barrel `index.ts` (45 LOC). The largest file is now 230 LOC — well under our 800-line threshold."

### Mei Lin (Type Safety Lead)
"We eliminated the `as any` cast in routes.ts for the admin email check. The `Express.User` interface already declares `email: string`, so `req.user?.email` works directly. That's one fewer type hole. We also fixed the pre-existing `NodeJS.Timeout` error in rate/[id].tsx by using `ReturnType<typeof setTimeout>` — zero TypeScript errors for the first time."

### Carlos Ruiz (QA Lead)
"All 70 tests pass after the refactor. TypeScript compiles with zero errors. The barrel export pattern means no import changes were needed in routes.ts or auth.ts — they still import from `./storage` and it resolves to the directory's index.ts. Clean refactor."

### Priya Sharma (Backend Architect)
"The cross-module dependency in `submitRating` is the most interesting part. It calls `getMemberById` (members), `getBusinessById` (businesses), `recalculateBusinessScore` (businesses), `recalculateCredibilityScore` (members), and `updateChallengerVotes` (challengers). The ratings module imports from sibling modules. This is a natural dependency graph — ratings depend on members and businesses, not the other way around."

### Sage (Backend Engineer #2)
"Next sprint I'll write integration tests for each domain module independently. With the split, I can mock individual modules instead of the entire storage layer. Testing just the anomaly detection logic is now a clean import from `storage/ratings.ts`."

## Changes

### New Files (7)
- `server/storage/index.ts` (45 LOC) — Barrel re-export
- `server/storage/helpers.ts` (60 LOC) — Pure functions: getVoteWeight, getCredibilityTier, getTierFromScore, getTemporalMultiplier
- `server/storage/members.ts` (195 LOC) — Member CRUD, stats, credibility, ratings history, impact
- `server/storage/businesses.ts` (230 LOC) — Leaderboard, search, scoring, ranking, photos, rank history, ratings
- `server/storage/ratings.ts` (210 LOC) — Rating submission, anomaly detection
- `server/storage/challengers.ts` (80 LOC) — Challenger queries, vote updates
- `server/storage/dishes.ts` (65 LOC) — Dish queries, search with fallback

### Deleted Files
- `server/storage.ts` (1,010 LOC) — Replaced by domain modules

### Modified Files
- `server/routes.ts` — Removed `as any` cast, `req.user?.email` used directly
- `app/rate/[id].tsx` — Fixed `NodeJS.Timeout` -> `ReturnType<typeof setTimeout>`

## File Size Before/After
| File | Before | After |
|------|--------|-------|
| `server/storage.ts` | 1,010 LOC | DELETED |
| `server/storage/businesses.ts` | — | 230 LOC |
| `server/storage/ratings.ts` | — | 210 LOC |
| `server/storage/members.ts` | — | 195 LOC |
| `server/storage/challengers.ts` | — | 80 LOC |
| `server/storage/dishes.ts` | — | 65 LOC |
| `server/storage/helpers.ts` | — | 60 LOC |
| `server/storage/index.ts` | — | 45 LOC |
| **Total** | **1,010** | **885** (across 7 files, max 230) |

## Audit Findings Resolved
| Finding | Severity | Status |
|---------|----------|--------|
| H1: Split storage.ts (>1000 LOC) | HIGH | RESOLVED |
| H2: `as any` in routes.ts | HIGH | PARTIAL (1 removed, 41 remain in frontend) |
| L4: Pre-existing TypeScript error | LOW | RESOLVED |

## Test Results
```
70 tests | 5 test files | 118ms
TypeScript: 0 errors (first time!)
```

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| James Park | Frontend Architect | Storage module architecture, domain boundaries | A+ |
| Mei Lin | Type Safety Lead | `as any` elimination, TS error fix | A |
| Priya Sharma | Backend Architect | Cross-module dependency review | A |
| Carlos Ruiz | QA Lead | Regression verification, import resolution check | A |
| Sage | Backend Engineer #2 | Test planning for domain modules | A- |
| Marcus Chen | CTO | Barrel export pattern guidance | A |

## Sprint Velocity
- **Story Points Completed**: 10
- **Files Created**: 7 (6 domain modules + 1 barrel)
- **Files Deleted**: 1 (monolithic storage.ts)
- **Files Modified**: 2
- **TypeScript Errors**: 0 (down from 1)
- **`as any` Count**: 41 (down from 42)
- **Tests**: 70/70 passing
