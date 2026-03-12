# Sprint 79 — Server-Side Badge Persistence + Badge API Endpoints

## Mission Alignment
Sprint 79 adds server-side badge persistence so earned badges are stored in the database rather than computed client-side only. This enables badge counts on profiles, badge display on leaderboards, and future share-by-link functionality.

## CEO Directives
> "Badges can't just be client-side math. When someone earns Legendary Judge, that needs to be in the database. It needs to show on their profile for other users to see, on leaderboards, and eventually we'll want server-rendered share links with OG images."

## Backlog Refinement
**Selected**:
- Badge storage module (CRUD for member_badges) (3 pts) — **Sage**
- Badge API endpoints (GET/POST) (5 pts) — **Sage + Priya**
- Badge API client functions (2 pts) — **James Park**
- Badge persistence tests (3 pts) — **Carlos**

**Total**: 13 story points

## Team Discussion — Every Member Speaks

### Rahul Pitta (CEO)
"This is infrastructure work that enables everything else. Server-side badge persistence means we can show badge counts next to usernames, filter leaderboards by users with specific badges, and eventually build server-rendered OG images for badge sharing. The `member_badges` table already exists from Sprint 68 — now it gets its storage layer."

### Marcus Chen (CTO)
"The badge storage module follows our domain-split pattern: `server/storage/badges.ts` with 5 exported functions — `getMemberBadges`, `getMemberBadgeCount`, `awardBadge`, `hasBadge`, `getEarnedBadgeIds`. The `awardBadge` function uses `onConflictDoNothing` to handle duplicate awards idempotently, matching the pattern we used in `seed-categories.ts`."

### James Park (Frontend Architect)
"Two new API client functions: `awardBadgeApi(badgeId, badgeFamily)` for persisting newly earned badges, and `fetchEarnedBadges()` to get the list of earned badge IDs. The rating flow can now fire `awardBadgeApi` when a toast triggers — so the badge is both displayed and persisted."

### Jordan — Chief Value Officer
"Server-side persistence transforms badges from decorative to durable. A badge earned is now a permanent record. This enables 'Badge Leaderboards' — who has the most legendary badges? Which users have Year-Round Rater? These are engagement features that make badges competitive."

### Sage (Backend Engineer #2)
"Five functions in the storage module. `getMemberBadges` returns full records with earnedAt timestamps. `getEarnedBadgeIds` is a lighter query returning just badge ID strings — ideal for the profile badge grid. `awardBadge` returns null for duplicates instead of throwing, so the caller doesn't need try/catch. Three API routes: GET `/api/members/:id/badges`, POST `/api/badges/award` (auth required), GET `/api/badges/earned` (auth required)."

### Carlos Ruiz (QA Lead)
"8 new tests in `badge-persistence.test.ts`: badge ID format validation, badge family enumeration, lookup verification, unique constraint simulation, award payload validation, duplicate handling, and earned response shape. Total: 197 across 16 files."

### Nadia Kaur (VP Security + Legal)
"The POST `/api/badges/award` endpoint requires authentication via `requireAuth`. The member ID comes from `req.user.id`, not from the request body — preventing badge-spoofing where a user awards badges to another user's account."

### Priya Sharma (RBAC Lead)
"Badge award is self-only by design — `req.user.id` is the only member who can receive a badge via POST. The GET `/api/members/:id/badges` endpoint is public (badges are public achievements). The GET `/api/badges/earned` requires auth for the authenticated user's own earned list."

### Suki (Design Lead)
"No visual changes this sprint — pure infrastructure. But this enables the next sprint's badge count display on profile headers and leaderboard rows."

### Mei Lin (Type Safety Lead)
"The `MemberBadge` type is already exported from the schema. The storage module uses it directly — no new types needed. The API client uses a typed response `Promise<{ data: any; awarded: boolean }>` for the award endpoint. No new `as any` casts."

## Changes

### New Files
- `server/storage/badges.ts` — CRUD for member_badges table (5 functions)
- `tests/badge-persistence.test.ts` — 8 tests for badge persistence validation

### Modified Files
- `server/storage/index.ts` — Added badge module exports
- `server/routes.ts` — Added 3 badge API endpoints (GET member badges, POST award, GET earned)
- `lib/api.ts` — Added `awardBadgeApi` and `fetchEarnedBadges` client functions

## Test Results
```
197 tests | 16 test files | 496ms
TypeScript: 0 errors
as any casts: 3 (production)
```

## Employee Performance

| Employee | Role | Tickets Assigned | Tickets Completed | Rating |
|----------|------|-----------------|-------------------|--------|
| Sage | Backend Engineer #2 | Badge storage module + API routes | 2/2 (100%) | A+ |
| James Park | Frontend Architect | Badge API client functions | 1/1 (100%) | A+ |
| Priya Sharma | RBAC Lead | Badge endpoint RBAC design | 1/1 (100%) | A+ |
| Carlos Ruiz | QA Lead | 8 new badge persistence tests | 1/1 (100%) | A+ |
| Jordan (CVO) | Chief Value Officer | Badge persistence strategy | 1/1 (100%) | A |
| Marcus Chen | CTO | Architecture review | 1/1 (100%) | A |
| Nadia Kaur | VP Security/Legal | Security review | 1/1 (100%) | A |
| Suki | Design Lead | Impact assessment | 1/1 (100%) | A |
| Mei Lin | Type Safety Lead | Type review | 1/1 (100%) | A |

## Sprint Velocity
- **Story Points Completed**: 13
- **Files Created**: 2
- **Files Modified**: 3
- **Tests**: 197 (+8 from 189)
- **TypeScript Errors**: 0
