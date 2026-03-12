# Sprint Critique Packet

- Sprint: 135
- Generated: Sun Mar  8 16:50:55 CDT 2026
- Branch: main
- Commit: 1c92176

## Latest Sprint Doc
File: /Users/rahulpitta/topranker/docs/sprints/SPRINT-135-AB-TESTING-TOOLTIPS-WEIGHT.md

```md
# Sprint 135: A/B Testing Framework, Confidence Tooltips, Personalized Vote Weight

**Date:** 2026-03-08
**Story Points:** 10
**Sprint Lead:** Sarah Nakamura

---

## Team Discussion

### Marcus Chen (CTO)
"The A/B testing question comes down to where we do assignment. Client-side deterministic hashing gives us zero-latency bucketing and works offline, which matters for our React Native story. The tradeoff is that a savvy user could inspect their assignment before seeing the variant. For trust features that's low-risk — we're not testing pricing or gating. I'd say ship client-side now, build the server-side endpoint in Sprint 137 when we need it for higher-stakes experiments."

### Sarah Nakamura (Lead Eng)
"I implemented DJB2 hashing on the concatenation of userId and experimentId. It's deterministic — same user always lands in the same bucket for a given experiment. The hash output gets modded by 100 to produce a percentile, then we check against the experiment's traffic allocation. We have override support so QA can force any variant. The whole module is pure functions with no side effects, which made testing straightforward — 34 tests covering edge cases like missing userId fallback to anonymous bucketing."

### Elena Rodriguez (Design)
"For the confidence tooltips, I went with a 12px information-circle-outline icon placed 4px to the right of the confidence indicator. Tapping it toggles the tooltip inline — no modal, no popover that could get clipped. The tooltip text comes from RANK_CONFIDENCE_LABELS so it stays in sync with the confidence system. Styling is intentionally subtle: 11px DM Sans, muted background at 8% opacity of the brand navy, 6px padding, 4px border radius. It shouldn't compete with the score itself."

### Priya Sharma (Frontend)
"Integration into SubComponents was clean because we already had the confidence indicator as its own sub-component. I wrapped the existing indicator and the new info icon in a row container, and the tooltip renders conditionally below. The state is local — each card manages its own tooltip visibility. On the leaderboard side it was the same pattern. One thing to watch: on smaller screens the tooltip text can push content down. I added a maxWidth of 200px to keep it contained."

### Amir Patel (Architecture)
"The experiment definition pattern uses a typed registry — each experiment has an id, description, variants array, default variant, traffic percentage, and active flag. All experiments start inactive, which means the framework is inert until we explicitly flip them on. This is important for compliance and for staged rollouts. The registry is extensible — adding a new experiment is one object addition. Down the road we'll want to pull definitions from the server, but the local registry is the right starting point."

### Liam O'Brien (Analytics)
"Every time a user is bucketed into an experiment, we fire an `experiment_exposure` event with the experiment ID, variant, user ID, and timestamp. This is the standard exposure event pattern used by Statsig, LaunchDarkly, and others. It lets us join experiment assignment with downstream conversion events in our analytics pipeline. I also added a deduplication guard — we only fire the exposure event once per session per experiment to avoid inflating counts."

### Jordan Blake (Compliance)
"A/B testing has consent implications under GDPR Article 22 — automated decision-making that significantly affects users requires disclosure. Our trust feature experiments are low-impact UX variations, not pricing or access decisions, so we're in safe territory. That said, I've flagged that we need to add A/B testing to our privacy policy's data processing section before we activate any experiments. I'll have the updated language ready for Sprint 136."

---

## Changes

### 1. A/B Testing Framework — `lib/ab-testing.ts` (NEW)

Client-side deterministic hash-based bucketing framework.

- **DJB2 hash function** — hashes `userId:experimentId` string to produce consistent numeric output
- **Percentile bucketing** — hash output mod 100 maps user to a 0-99 percentile
- **Experiment registry** — typed definitions with id, description, variants, default, trafficPercent, and active flag
- **3 initial experiments:**
  - `confidence_tooltip` — controls visibility of confidence tooltips (control: hidden, variant: visible)
  - `trust_signal_style` — tests compact vs expanded trust signal display
  - `personalized_weight` — tests showing personalized vote weight vs static text
- **All experiments inactive by default** — no user impact until explicitly activated
- **QA override support** — `setExperimentOverride(experimentId, variant)` forces a specific variant
- **Analytics integration** — fires `experiment_exposure` event on first bucketing per session
- **Deduplication** — session-level guard prevents duplicate exposure events
- **Pure functions** — no side effects, fully testable
- **34 new tests** in `tests/sprint135-ab-testing.test.ts`

### 2. Confidence Tooltips — `components/search/SubComponents.tsx`, `components/leaderboard/SubComponents.tsx`

Added info icon and toggleable tooltip next to confidence indicators.

- **Info icon** — `information-circle-outline` from Ionicons, 12px, positioned 4px right of confidence indicator
- **Toggle behavior** — tap to show/hide, local state per card instance
- **Tooltip content** — pulls description from `RANK_CONFIDENCE_LABELS` mapping
- **Styling** — 11px DM Sans, muted background (navy at 8% opacity), 6px padding, 4px border radius, maxWidth 200px
- **Applied to both search cards and leaderboard items** — consistent experience across surfaces

### 3. Personalized Vote Weight — `app/(tabs)/challenger.tsx`

"How Voting Works" section now shows personalized tier influence for logged-in users.

- **Tier influence label** — displays user's current tier name and influence weight percentage
- **Motivational prompt** — for non-max tiers, shows encouragement to level up (e.g., "Rate 5 more to reach Silver")
- **Logged-out fallback** — shows static "All votes count, but consistent raters earn more influence" text
- **Data source** — reads from AuthProvider context for tier info

---

## Files Changed

| File | Status | Description |
|------|--------|-------------|
| `lib/ab-testing.ts` | NEW | A/B testing framework with DJB2 hashing and experiment registry |
| `tests/sprint135-ab-testing.test.ts` | NEW | 34 tests for A/B framework |
| `components/search/SubComponents.tsx` | MODIFIED | Added confidence tooltip to search cards |
| `components/leaderboard/SubComponents.tsx` | MODIFIED | Added confidence tooltip to leaderboard items |
| `app/(tabs)/challenger.tsx` | MODIFIED | Personalized vote weight in How Voting Works |

---

## Test Summary

- **34 new tests** added (A/B testing framework)
- **All existing tests passing** — no regressions
- **Total test count:** 847 tests across 50 files
- **Execution time:** <850ms

---

## PRD Gap Impact

- **A/B Testing** — NEW capability, not in original PRD but essential for measuring trust feature effectiveness
- **Confidence Tooltips** — Closes transparency gap: users can now understand what confidence scores mean
- **Personalized Weight** — Closes motivation gap: users see their tier's impact on rankings
```

## Latest Retro
File: /Users/rahulpitta/topranker/docs/retros/RETRO-135-AB-TESTING-TOOLTIPS-WEIGHT.md

```md
# Sprint 135 Retrospective: A/B Testing Framework, Confidence Tooltips, Personalized Vote Weight

**Date:** 2026-03-08
**Duration:** ~2.5 hours
**Story Points:** 10
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Sarah Nakamura (Lead Eng):**
"The A/B framework came together fast because we kept it pure — no async, no server calls, just deterministic math. Writing 34 tests for it took less time than I budgeted because every function is a pure input-output mapping. This is how we should build more infrastructure."

**Priya Sharma (Frontend):**
"Tooltips slotted into SubComponents with zero refactoring. The fact that we already had confidence indicators as isolated sub-components meant I just wrapped them in a row and added the icon. The pattern we set up in Sprint 130 for modular card parts is paying dividends."

**Liam O'Brien (Analytics):**
"Having the experiment_exposure event schema locked down from day one means we won't have to backfill or migrate when we start analyzing results. The deduplication guard was a quick add that saves us from noisy data. This is a solid foundation for experiment analysis."

**Marcus Chen (CTO):**
"Three parallel streams — framework, tooltips, personalized weight — all landed without conflicts. The team's ability to divide and execute independently keeps improving. Also, closing the A/B testing action item that's been sitting in backlog since Sprint 131 feels overdue but good."

---

## What Could Improve

- **Client-side experiment assignment can leak variants.** A motivated user could inspect the hash logic and determine their bucket before seeing the UI. For trust features this is low risk, but for any revenue or access experiments we'll need server-side assignment. This is planned for Sprint 137 but should be treated as a hard prerequisite before activating high-stakes experiments.

- **Tooltip accessibility on mobile needs testing.** The tap-to-toggle pattern works for sighted touch users, but we haven't verified screen reader behavior. The info icon needs an accessibility label, and the tooltip content needs to be announced. Elena flagged this during the sprint and we deferred it — it needs to land in Sprint 136.

- **Personalized weight section relies on AuthProvider tier data being fresh.** If tier data is stale (e.g., user leveled up but cache hasn't invalidated), the motivational prompt could show incorrect information. We should add a staleness check or tie it to the same refresh cycle as the profile page.

---

## Action Items

| # | Action | Owner | Target Sprint |
|---|--------|-------|---------------|
| 1 | Wire A/B experiments into confidence_tooltip feature — activate experiment, connect variant to tooltip visibility | Priya Sharma | Sprint 136 |
| 2 | Server-side experiment assignment endpoint — `/api/experiments/assign` with same DJB2 logic server-side | Marcus Chen | Sprint 137 |
| 3 | Accessibility audit of tooltip interactions — screen reader labels, focus management, announcement | Elena Rodriguez | Sprint 136 |
| 4 | Add A/B testing disclosure to privacy policy data processing section | Jordan Blake | Sprint 136 |
| 5 | Tier data staleness check for personalized weight display | Sarah Nakamura | Sprint 137 |

---

## Team Morale

**9/10** — Closing the A/B testing backlog item that had been carried since Sprint 131 felt like a real win. The team executed three parallel streams cleanly with no merge conflicts. The confidence tooltips add visible user value, and the personalized weight feature makes the tier system tangible. Energy is high heading into the SLT boundary meeting and the next sprint cycle.
```

## Latest Audit
File: /Users/rahulpitta/topranker/docs/sprints/SPRINT-100-AUDIT.md

```md
# Sprint 100 — Milestone Architectural Audit

**Date**: 2026-03-08
**Theme**: Codebase Health Assessment
**Story Points**: 5
**Tests**: 428 total (no new tests — audit-only sprint)

---

## Mission Alignment

Every 5 sprints we audit the full codebase. Sprint 100 is a milestone — the 10th audit
in our systematic codebase health program. Results confirm production readiness.

---

## Team Discussion

**Marcus Chen (CTO)**: "Zero critical, zero high findings. This is the first audit since
Sprint 55 where we have no urgent action items. The Sprint 70-75 cleanup cycle paid off —
we've maintained A/A+ grades for 30 straight sprints. routes.ts at 683 LOC is the only
file approaching our 700 threshold."

**Amir Patel (Architecture)**: "Only 3 `as any` casts in production — all documented as
platform-edge limitations (Google Maps ref, Animated ref, web iframe styling). That's a
93% reduction from the 43 casts we had at Sprint 70. Type safety is near-complete."

**Nadia Kaur (Cybersecurity)**: "Full security scan: zero SQL injection vectors (Drizzle
ORM handles all queries), zero hardcoded secrets, proper rate limiting with cleanup,
password policy at 8+ chars with numeric requirement, no XSS vectors. The payment cancel
→ expire placement gap (M3) is the only security-adjacent finding."

**Sarah Nakamura (Lead Engineer)**: "428 tests across 32 files, 4200+ LOC of test code.
The gap is E2E — we have comprehensive unit and integration tests but no end-to-end
smoke tests. That's our L1 finding."

**Rachel Wei (CFO)**: "From a business perspective, the codebase supports all four revenue
streams: Challenger ($99), Dashboard Pro ($49/mo), Featured Placement ($199/week), and
Premium API. Payment infrastructure is solid — Stripe webhooks, receipts, cancellation."

**Jasmine Taylor (Marketing)**: "The real-time system from Sprint 97 is a competitive
differentiator. SSE-powered instant updates on rankings changes — users see the impact
of their ratings immediately. That's a story we can tell."

---

## Audit Results

### Grade: A+ (Production Ready)

- **0 Critical** — First clean audit since Sprint 55
- **0 High** — All previous high findings resolved
- **3 Medium** — routes.ts size, email provider, cancel→expire
- **3 Low** — E2E tests, webhook replay, mock data pruning

### Key Metrics
- 886 max source LOC (badges.ts, stable)
- 3 production `as any` casts (platform-edge only)
- 0 TypeScript errors
- 0 SQL injection vectors
- 428 passing tests

---

## What's Next (Sprint 101)

Address M2 (email provider) and M3 (cancel → expire placement), then continue
feature work. Next audit at Sprint 105.
```

## README
```md
# TopRanker

Community-ranked local business leaderboard. Users rate restaurants, cafes, bars, bakeries, street food, and fast food using a credibility-weighted voting system. Higher-credibility members have more influence on rankings. Live challenger events let businesses compete head-to-head.

## Quick Start

```bash
# Install dependencies
npm install

# Set required environment variables
export DATABASE_URL="postgres://..."
export SESSION_SECRET="your-secure-secret"

# Run database migrations
npm run db:push

# Seed initial data
npm run seed
npm run seed:cities  # Seeds Austin, Houston, San Antonio, Fort Worth

# Start development server
npm run dev

# Run tests
npm test
```

## Architecture

| Layer | Technology | Details |
|-------|-----------|---------|
| Mobile App | Expo Router (React Native) | File-based routing, TypeScript |
| Backend API | Express.js | REST API on port 5000 |
| Database | PostgreSQL | 13 tables via Drizzle ORM |
| Auth | Passport.js | Local + Google OAuth strategies |
| State | React Query | Server state management |
| Testing | Vitest | 70 tests, <120ms execution |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design.

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/               # Tab-based navigation
    index.tsx           # Leaderboard
    challenger.tsx      # Live challenges
    search.tsx          # Discover/search
    profile.tsx         # Member profile
  business/[id].tsx     # Business profile
  rate/[id].tsx         # Rating flow (2 screens)
  admin/index.tsx       # Admin dashboard
  auth/                 # Login/signup
server/                 # Express.js backend
  routes.ts             # API endpoints
  storage.ts            # Database operations (Drizzle)
  auth.ts               # Authentication (Passport.js)
  config.ts             # Centralized env config
  schema (shared/)      # Drizzle schema + shared types
shared/                 # Shared between client/server
  schema.ts             # Database schema (Drizzle)
  admin.ts              # Admin email whitelist
constants/              # App constants
  brand.ts              # Brand system (colors, fonts)
  colors.ts             # Color palette
lib/                    # Client-side utilities
  data.ts               # Credibility scoring, tiers
  tier-perks.ts         # Gamification perks engine
  auth-context.tsx      # Auth state provider
tests/                  # Test suite (Vitest)
docs/                   # Sprint docs, retros, audits
  process/              # Process documentation
  retros/               # Sprint retrospectives
  audits/               # Architectural audits
```

## Core Systems

### Credibility Scoring
Members earn credibility through consistent, high-quality ratings. Score determines tier (New Member -> Regular -> Trusted -> Top Judge) which determines vote weight (0.10x to 1.00x). See `lib/data.ts`.

### Rating Flow
2-screen flow: Screen 1 captures 3 scores (food, service, vibe) + would-return. Screen 2 captures optional dish vote, note, and photo. Ratings include temporal decay — recent ratings weight more.

### Challenger Events
Businesses compete head-to-head with vote-based resolution. Countdown timer, VS layout, winner reveal with confetti.

### Rate Gating
Accounts must be 3+ days old to submit ratings. Prevents drive-by manipulation.

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session signing secret (no fallback — server crashes without it) |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | (disabled) |
| `STRIPE_SECRET_KEY` | Stripe payments | (mock mode) |
| `RESEND_API_KEY` | Email sending | (console mode) |
| `GOOGLE_MAPS_API_KEY` | Google Maps/Places | (disabled) |

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/leaderboard` | Rankings by city/category |
| GET | `/api/leaderboard/categories` | Available categories |
| GET | `/api/businesses/search` | Search businesses |
| GET | `/api/businesses/:slug` | Business profile |
| GET | `/api/businesses/:id/ratings` | Business ratings |
| GET | `/api/dishes/search` | Search dishes |
| GET | `/api/challengers/active` | Active challenger events |
| GET | `/api/trending` | Trending businesses |
| GET | `/api/members/:username` | Public member profile |

### Authenticated
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ratings` | Submit a rating |
| GET | `/api/members/me` | Current user profile |
| GET | `/api/members/me/impact` | Rating impact stats |

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new account |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/me` | Current session |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/seed-cities` | Seed multi-city data |

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

70 tests across 5 files:
- `credibility.test.ts` — Credibility scoring, tiers, vote weights, temporal decay (24 tests)
- `tier-perks.test.ts` — Gamification perks engine (15 tests)
- `admin.test.ts` — Admin email whitelist (8 tests)
- `config.test.ts` — Environment config validation (7 tests)
- `auth-validation.test.ts` — Auth input validation, rate gating (16 tests)

## Brand System

| Element | Value |
|---------|-------|
| Primary (Amber) | `#C49A1A` |
| Secondary (Navy) | `#0D1B2A` |
| Background | `#F7F6F3` |
| Heading Font | Playfair Display 900 |
| Body Font | DM Sans |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — System design, data flow, security model
- [API Reference](docs/API.md) — Endpoint specifications
- [Contributing](CONTRIBUTING.md) — Development workflow, coding standards
- [Changelog](CHANGELOG.md) — Version history
- Sprint docs: `docs/SPRINT-N-*.md` (56 sprints)
- Retrospectives: `docs/retros/RETRO-N-*.md`
- Audits: `docs/audits/ARCH-AUDIT-N.md` (every 5 sprints)
- Process: `docs/process/BACKLOG-REFINEMENT.md`

## Cities

Currently seeded: Dallas, Austin, Houston, San Antonio, Fort Worth (Texas)

## License

Proprietary. All rights reserved.
```

## CONTRIBUTING
```md
# Contributing to TopRanker

## Development Workflow

### Branch Strategy
- `main` — Production-ready code
- Feature branches: `feature/SPRINT-N-description`
- Bugfix branches: `fix/description`

### Sprint Cycle
1. **Backlog Refinement** — Prioritize items, assign owners, estimate points
2. **Sprint Execution** — Build, test, document
3. **Sprint Review** — Demo changes, verify acceptance criteria
4. **Retrospective** — What went well, what to improve, action items

### Commit Standards
- One logical change per commit
- Descriptive commit messages: what changed and why
- Reference sprint number when applicable
- All tests must pass before committing

### Pull Request Requirements
- Description of changes with "why" context
- Test results (all 70+ tests passing)
- TypeScript clean (zero new errors)
- At least one reviewer approval

## Coding Standards

### TypeScript
- Strict mode enabled
- No `as any` in new code (audit target: <10 total)
- Use proper types at system boundaries (API requests, database results)
- Prefer `interface` over `type` for object shapes

### React Native
- Functional components only
- React Query for server state, `useState`/`useReducer` for local state
- StyleSheet.create for all styles (no inline objects)
- react-native-reanimated for animations

### Backend
- All env vars through `server/config.ts` — never read `process.env` directly
- Admin checks through `shared/admin.ts` — never hardcode email lists
- Input validation with Zod schemas at API boundaries
- All mutation endpoints behind `requireAuth` middleware

### Brand System (Non-Negotiable)
| Element | Value |
|---------|-------|
| Amber | `#C49A1A` |
| Navy | `#0D1B2A` |
| Background | `#F7F6F3` |
| Headings | Playfair Display, weight 900 |
| Body | DM Sans |

Import from `constants/brand.ts` — never hardcode color values.

## Testing Requirements

### CEO Mandate (March 7, 2026)
> "Testing has to be immaculate. Without testing we can't push."

- Unit tests for all business logic (credibility, ratings, scoring)
- Integration tests for all API endpoints
- Manual verification for UI changes
- TypeScript must be clean (zero new errors)

### Running Tests
```bash
npm test              # Run all tests (currently 70, <120ms)
npm run test:watch    # Watch mode for development
```

### Writing Tests
- Place tests in `tests/` directory
- Name: `{module}.test.ts`
- Use `describe`/`it`/`expect` from Vitest
- Test boundary values and edge cases
- Test error cases, not just happy paths

## Documentation Requirements

### Every Sprint Produces
1. `docs/SPRINT-N-*.md` — Sprint doc with team discussions, changes, performance ratings
2. `docs/retros/RETRO-N-*.md` — Retrospective with actions and morale score

### Every Sprint Item Has
1. **What**: Clear description
2. **Why**: How it serves the trust mission
3. **Test Plan**: How we verify it works
4. **Owner**: Named team member
5. **Story Points**: Complexity estimate (1, 2, 3, 5, 8, 13)

### Architectural Audits (Every 5 Sprints)
- Full codebase scan: security, performance, type safety, duplication, testing
- Output: `docs/audits/ARCH-AUDIT-N.md`
- CRITICAL findings become P0 in the next sprint
- HIGH findings enter backlog as P1

## File Size Guidelines
- Target: <800 LOC per file
- Files >1000 LOC are split candidates (flagged in audits)
- Extract components/modules when a file grows beyond 800 LOC

## Security
- Never commit `.env` files or secrets
- Session secrets must be env vars with no fallbacks
- Admin access through centralized `shared/admin.ts` only
- Rate limiting on all auth endpoints
- Input validation at all API boundaries
```

## CHANGELOG
```md
- 6 new hook logic tests (total: 208 across 18 files)
- Team Performance Dashboard updated through Sprint 81 (662 total story points)

#### Changed
- Refactored profile.tsx — replaced dual badge context construction with `useBadgeContext` hook (~40 LOC reduction)

### Sprint 80 — Architectural Audit #6 + Badge Award Flow + Badge Count (March 8, 2026)
#### Added
- Architectural Audit #6: 5/6 ALL CLEAR, 1 WATCH (file size)
- Badge award persistence in rating flow — `awardBadgeApi` fires on toast trigger
- Badge count in profile stats row (amber colored, computed from evaluated badges)
- 5 new badge award flow tests (total: 202 across 17 files)

### Sprint 79 — Server-Side Badge Persistence + Badge API (March 8, 2026)
#### Added
- `server/storage/badges.ts` — CRUD for member_badges table (5 functions: getMemberBadges, getMemberBadgeCount, awardBadge, hasBadge, getEarnedBadgeIds)
- GET `/api/members/:id/badges` — list earned badges for any member
- POST `/api/badges/award` — persist earned badge for authenticated user
- GET `/api/badges/earned` — get earned badge IDs for authenticated user
- `awardBadgeApi()` and `fetchEarnedBadges()` API client functions
- 8 new badge persistence tests (total: 197 across 16 files)

### Sprint 78 — Badge Detail Modal + Admin Category Review UI (March 8, 2026)
#### Added
- `components/badges/BadgeDetailModal.tsx` — Full badge detail view with progress bar, share button, rarity display
- Admin "Suggestions" tab in admin panel — fetch, display, approve/reject category suggestions
- `reviewCategorySuggestion()` API client function for admin PATCH endpoint
- `CategorySuggestionItem` exported type for reuse
- 7 new tests for admin category review + badge detail (total: 189 across 15 files)

#### Changed
- `BadgeItem` now accepts `onPress` prop — tappable badges in profile grid
- `BadgeGridFull` and `BadgeCategorySection` forward `onBadgePress` handler
- Profile page integrates `BadgeDetailModal` with `selectedBadge` state
- Added "seasonal" to `BadgeGridFull` category list (was missing)

### Sprint 77 — Badge Sharing + Streak Toast Triggers + Maestro E2E (March 8, 2026)
#### Added
- `lib/badge-sharing.ts` — `shareBadgeCard()` utility using react-native-view-shot + expo-sharing
- Streak badge toast triggers in rating flow — 3-day, 7-day, 14-day, 30-day streak milestones
- Maestro E2E setup: `.maestro/config.yaml` + 3 initial flows (launch, search, profile)
- 9 new badge sharing + streak toast tests (total: 182 across 14 files)

#### Changed
- Badge toast now fires on both milestone AND streak thresholds (milestones take priority)

### Sprint 76 — Seasonal Rating API + Badge Toast Integration + Admin Review (March 8, 2026)
#### Added
- Server-side `getSeasonalRatingCounts()` — SQL GROUP BY month mapped to seasons
- Seasonal rating counts in `/api/members/me` response
- Badge toast integration in rating flow — milestone badges trigger on submission
- Admin PATCH `/api/admin/category-suggestions/:id` — approve/reject with RBAC

### Sprint 75 — Architectural Audit #5 + Seasonal Badges + Dashboard (March 8, 2026)
#### Added
- 5 seasonal badges: Spring Explorer, Summer Heat, Fall Harvest, Winter Chill, Year-Round Rater
- Seasonal badge evaluation with progress tracking and meta-badge (Year-Round = all 4 seasons)
- Architectural Audit #5: ALL CLEAR across all 6 dimensions
- 3 new seasonal badge tests (total: 173 across 13 files)

#### Changed
- Total badges: 56 -> 61 (40 user + 21 business)
- Updated team performance dashboard through Sprint 75 (583 story points)
- **Production `as any` casts: 3 (93% reduction — effectively complete)**

### Sprint 74 — Suggest Category Integration + API Wiring (March 8, 2026)
#### Added
- "Suggest" chip on leaderboard category row — opens SuggestCategory modal
- `submitCategorySuggestion()` and `fetchCategorySuggestions()` API client functions
- 11 new category suggestion validation tests (total: 170 across 13 files)

#### Changed
- Eliminated sortBy `as any` cast in search.tsx
- **Production `as any` casts: 4 -> 3 (93% total reduction from 43)**

### Sprint 73 — Category API + Badge Toast + Google Maps Types (March 8, 2026)
#### Added
- `server/storage/categories.ts` — CRUD for categories and suggestions tables
- `server/seed-categories.ts` — Idempotent seed from CategoryRegistry (24 categories)
- POST/GET `/api/category-suggestions` endpoints with Zod validation
- `components/badges/BadgeToast.tsx` — Animated badge notification toast with rarity colors
- `types/google-maps.d.ts` — Platform declarations for Google Maps window types

#### Changed
- Eliminated 3 `window as any` casts in search.tsx via platform declarations
- **Production `as any` casts: 7 -> 4 (91% total reduction from 43 across 4 sprints)**

### Sprint 72 — Category DB Migration + SafeImage Typed Wrapper + E2E Evaluation (March 8, 2026)
#### Added
- `categories` and `category_suggestions` tables in Drizzle schema with proper FK relations, jsonb fields, and insert validation
- `components/categories/SuggestCategory.tsx` — User-facing category suggestion form with vertical selector
- `docs/evaluations/E2E-FRAMEWORK-EVAL.md` — Maestro recommended over Detox for Expo compatibility
- 9 new schema validation tests (total: 159 across 12 files)

#### Changed
- `SafeImage` now accepts `ViewStyle | ImageStyle` — single internal cast replaces 8 external `as any` casts
- **Production `as any` casts: 17 → 7 (84% total reduction from 43 across 3 sprints)**

### Sprint 71 — Business Badge Display + DimensionValue Helper (March 8, 2026)
#### Added
- `lib/style-helpers.ts` — `pct()` DimensionValue helper for type-safe percentage widths/heights
- Business badge section on `app/business/[id].tsx` — displays earned badges via `BadgeRowCompact`

#### Changed
- Applied `pct()` across 6 files, eliminating 10 `as any` casts (27 → 17 total)
- **Total `as any` reduction: 43 → 17 (60%) across Sprints 70-71**

### Sprint 70 — Architectural Audit #4 + TypedIcon Type Safety (March 8, 2026)
#### Changed
- Created `TypedIcon` wrapper component — eliminates `as any` casts for Ionicons icon names
- Applied TypedIcon across 12 files, eliminating 16 `as any` casts (43 → 27 total)
- Architectural Audit #4: N1/N6 ALL CLEAR, 150 tests, 0 TS errors, security GOOD

### Sprint 69 — Index Extraction (Final N1/N6) + Category Registry Architecture (March 8, 2026)
#### Changed
- Extracted `PhotoMosaic`, `StarRating`, `PhotoStrip`, `HeroCard`, `RankedCard` from `index.tsx` into `components/leaderboard/SubComponents.tsx`
- `index.tsx` reduced from 1,031 to 306 LOC (-70%)
- **N1/N6 100% COMPLETE** — all 5 files resolved (total: 5,560 → 3,504 LOC, -37%)

#### Added
- `lib/category-registry.ts` — Extensible category architecture with 24 categories across 4 verticals (food, services, wellness, entertainment)
- Domain-specific at-a-glance fields per category (e.g., barbers: walkIn, specialties; gyms: equipment, classes)
- `CategorySuggestion` interface for user-requested categories with admin approval workflow
- 11 new category registry tests (total: 150 across 11 files)

### Sprint 68 — Profile Extraction + Achievement Badges + Docs Reorganization (March 8, 2026)
#### Added
- **Achievement Badges System** — 56 Apple Fitness-style badges (35 user + 21 business)
  - 4 rarity tiers: Common, Rare, Epic, Legendary with distinct color systems
  - 6 categories: Milestone, Streak, Explorer, Social, Seasonal, Special
  - User badges: First Taste through Legendary Judge (rating milestones), On a Roll through Monthly Devotion (streaks), Curious Palate through Texas Tour (exploration), Connector through Community Leader (social)
  - Business badges: On the Map through Legendary Spot (volume), Top 10 through Number One (ranking), Highly Rated through Perfect Reputation (quality), Trusted Approved, Top Judge's Pick (social proof)
  - Pure evaluation functions with progress tracking (0-100%)
- `components/profile/BadgeGrid.tsx` — Apple Fitness-style badge display with progress rings, rarity-colored borders, category sections, compact mode
- 25 new badge tests (total: 139 across 10 test files)

#### Changed
- Extracted `TierBadge`, `HistoryRow`, `BreakdownRow`, `SavedRow`, `LoggedOutView` from `profile.tsx` into `components/profile/SubComponents.tsx`
- Removed 180+ unused styles from profile.tsx
- `profile.tsx` reduced from 1,056 to 745 LOC (-29%)
- Reorganized `/docs/` — moved 67 sprint docs into `/docs/sprints/` subdirectory
- Updated Team Performance Dashboard through Sprint 68

### Sprint 67 — Rate Page Extraction + API Response Timing + Team Expansion (March 8, 2026)
#### Changed
- Extracted `CircleScorePicker`, `CircleScoreLabels`, `ProgressBar`, `StepIndicator`, `DishPill`, `RatingConfirmation` from `rate/[id].tsx` into `components/rate/SubComponents.tsx`
- `rate/[id].tsx` reduced from 1,104 to 803 LOC (-27%)
- Removed ~100 unused styles from rate/[id].tsx StyleSheet

#### Added
- API response time logging middleware on all `/api/*` routes — logs method, URL, status, duration
- Requests >200ms tagged `[SLOW]` at warn level via structured logger
- Senior Management Meeting process: weekly CEO/CTO/VP meeting for backlog prioritization and hiring
- 5 new hires approved: Senior Frontend Engineer, QA Automation Engineer, Content Moderation Specialist, Legal Counsel, Junior Backend Engineer

### Sprint 66 — Search Extraction + Rich Favicons (March 8, 2026)
#### Changed
- Extracted `DiscoverPhotoStrip`, `BusinessCard`, `MapBusinessCard`, `haversineKm` from `search.tsx` into `components/search/SubComponents.tsx`
- `search.tsx` reduced from 1,159 to 833 LOC (-28%)
- Removed unused imports: `Animated`, `useWindowDimensions`, `Linking`, `usePressAnimation`, `useBookmarks`
- Removed ~75 unused styles from search.tsx StyleSheet
- `app.json` favicon switched from SVG to PNG (Expo compatibility)
- `+html.tsx` now declares multi-size favicons (32, 48, 180, 192px)

#### Added
- Rich SVG favicon source with navy gradient, gold podium, star accent, rank numbers, shadows, glow effects
- `scripts/generate-favicons.js` — sharp-based PNG generation pipeline (6 sizes from SVG master)
- `favicon.png` (48px), `favicon-32.png`, `favicon-192.png`, `favicon-512.png` — all brand-aligned
- `apple-touch-icon.png` (180px) — dedicated iOS home screen icon
- `splash-icon.png` replaced with rich branded version (was crude blocky podium)
- Legal compliance roadmap: ToS, Privacy Policy, content moderation planned for Sprints 67-70

### Sprint 65 — UI Polish + Team Domain Commitments (March 8, 2026)
#### Changed
- Search bar redesign: amber icon circle, 48px height, brand-aligned placeholder "Find the best of what you want..."
- Header subtitle: "Find the best in {city}, with confidence"
- Documented all 8 team members' personal domain commitments for TopRanker perfection

### Sprint 64 — UI/UX Design Sprint (March 8, 2026)
#### Changed
- Animated splash: replaced emoji crown with `LeaderboardMark` SVG, added "TOP"/"Ranker" wordmark hierarchy, navy background
- Custom SVG favicon with brand mark on navy (replaced default Expo chevron)
- Web metadata: updated title, description, OG tags for multi-city, theme-color to navy
- Splash/Android adaptive icon backgrounds changed from cream to navy (#0D1B2A)
- Onboarding slide 1 uses `LeaderboardMark` SVG with gradient circle

### Sprint 63 — Chart Extraction + Type Safety (March 7, 2026)
#### Changed
- Extracted `RatingDistribution` and `RankHistoryChart` from `business/[id].tsx` into SubComponents
- `business/[id].tsx` reduced from 921 to 816 LOC (total -33% from original 1210)
- Typed `FighterPhoto` component prop as `ApiBusiness` instead of `any`
- Removed 3 `as any` casts (36 -> 33 total in frontend)

### Sprint 62 — Integration Tests + supertest (March 7, 2026)
#### Added
- `supertest` + `@types/supertest` dev dependencies for HTTP integration testing
- 20 integration tests covering: health, leaderboard, business CRUD, auth middleware, input validation, member endpoints, response shape consistency
- Total test count: 114 (up from 94, +21%)
- `as any` audit analysis: 36 casts categorized by type (14 RN width, 10 Ionicons, 5 style, 3 window, 2 API, 2 misc)

### Sprint 61 — Component Extraction: business/[id].tsx (March 7, 2026)
#### Changed
- Extracted 7 presentational components from `app/business/[id].tsx` into `components/business/SubComponents.tsx`
  - SubScoreBar, DistributionChart, RatingRow, ActionButton, CollapsibleReviews, AnimatedScore, DishPill
- Reduced `app/business/[id].tsx` from 1,210 LOC to 921 LOC (-24%)
- Removed ~80 lines of unused styles and cleaned up unused imports
- Moved Android LayoutAnimation setup to SubComponents.tsx where it's consumed

### Sprint 60 — Architectural Audit #2 + Search Sanitization (March 7, 2026)
#### Security
- Search input sanitization: strip ILIKE wildcards (`%`, `_`, `\`), truncate to 100 chars
- Applied to both `searchBusinesses` and `searchDishes` storage functions

#### Added
- 9 new tests for search sanitization (total: 94)
- Architectural Audit #2 document (`docs/audits/ARCH-AUDIT-60.md`)

### Sprint 59 — Rate Limiting + CORS (March 7, 2026)
#### Security
- Rate limiter factory pattern: `createRateLimiter(name, maxRequests, windowMs)`
- API rate limit (100 req/min) applied to all 8 public endpoint prefixes
- Production CORS whitelist: topranker.com, www.topranker.com

#### Added
- 7 new tests for rate limiting (total: 85)

### Sprint 58 — Structured Logging (March 7, 2026)
#### Added
- `server/logger.ts` — Structured logger with 4 levels, tagged modules, JSON serialization
- 8 new tests for logger (total: 78)

#### Changed
- Migrated 8 server files from raw `console.log`/`console.error` to structured logger

### Sprint 57 — Storage Domain Split + TypeScript Fix (March 7, 2026)
#### Changed
- Split monolithic `server/storage.ts` (1,010 LOC) into 6 domain modules (max 230 LOC each)
  - `server/storage/members.ts`, `businesses.ts`, `ratings.ts`, `challengers.ts`, `dishes.ts`, `helpers.ts`
- Fixed `NodeJS.Timeout` to `ReturnType<typeof setTimeout>` — zero TypeScript errors achieved

### Sprint 56 — Architectural Audit CRITICAL Fixes (March 7, 2026)
#### Security
- **CRITICAL**: Removed hardcoded session secret fallback — server now crashes on missing `SESSION_SECRET`
- **CRITICAL**: Centralized admin email whitelist in `shared/admin.ts` — removed from 3 duplicated locations
- Removed `alex@demo.com` from admin access (demo accounts should never be admins)

#### Added
- `server/config.ts` — Centralized environment configuration with startup validation
- `shared/admin.ts` — Single source of truth for admin emails with `isAdminEmail()` helper
- 31 new tests: admin whitelist (8), env config (7), auth validation (16)
- Total test count: 70 (up from 39)

#### Changed
- `server/auth.ts` — Uses centralized config instead of direct `process.env` access
- `server/routes.ts` — Uses `isAdminEmail()` instead of hardcoded array
- `app/(tabs)/profile.tsx` — Uses `isAdminEmail()` instead of hardcoded array
- `app/admin/index.tsx` — Uses `isAdminEmail()` instead of local constant

### Sprint 55 — Multi-City Data Seeding (March 7, 2026)
#### Added
- `server/seed-cities.ts` — 32 real businesses across 4 Texas cities
  - Austin (10): Franklin BBQ, Uchi, Torchy's, Salt Lick, Ramen Tatsu-Ya, Odd Duck, Jo's Coffee, Rainey Street, Whataburger, Quack's Bakery
  - Houston (8): Killen's, Pappas Bros, Crawfish & Noodles, Tacos Tierra Caliente, Buc-ee's, Blacksmith, Julep, Common Bond
  - San Antonio (7): 2M Smokehouse, Mi Tierra, Garcia's, Estate Coffee, Whataburger, Esquire Tavern, Bird Bakery
  - Fort Worth (7): Heim BBQ, Joe T. Garcia's, Salsa Limon, Avoca Coffee, Whataburger, The Usual, Swiss Pastry
- POST `/api/admin/seed-cities` endpoint (admin-only)
- `npm run seed:cities` CLI command

### Sprint 54 — Tier Perks Engine + Profile UI (March 7, 2026)
#### Added
- `lib/tier-perks.ts` — 15 perks across 4 credibility tiers
- "Your Rewards" section on profile showing unlocked perks
- "Unlock with [Next Tier]" preview showing 3 locked perks

### Sprint 53 — Testing Foundation (March 7, 2026)
#### Added
- Vitest testing infrastructure with path aliases
- `tests/credibility.test.ts` — 24 tests for credibility scoring system
- `tests/tier-perks.test.ts` — 15 tests for gamification perks
- 39 tests passing in 97ms

### Sprint 52 — Production Bugfixes + Rating Redesign (March 7, 2026)
#### Fixed
- NetworkBanner: switched from non-existent `/api/health` to Google's `generate_204`
- Rate gating: changed from 7 days to correct 3 days
- Tab dot indicator positioning

#### Changed
- Rating flow collapsed from 6 screens to 2 screens
- GET `/api/health` endpoint added (lightest possible — no DB, no auth)
- Backlog refinement process documented

### Sprint 51 — Featured Placement / Promoted Listings (March 7, 2026)
#### Added
- Featured/Promoted business listings in search ($199/week)
- FeaturedSection component with gold border, "Featured" badge
- Mock promoted data with 3 sample businesses

## [Earlier Sprints]
Sprints 1-50 covered initial development from leaderboard MVP through accessibility, offline support, analytics, referral system, and app store metadata. See individual sprint docs in `docs/SPRINT-N-*.md`.
```

## Recently Changed Files
```
scripts/sprint-critic.sh
```

## Recent Commits
```
1c92176 added new cirtic
281f330 Debug Replit preview: add version tag, logging, prevent static index.html
c4a5678 Fix sync-build.sh: stop preserving stale .replit on pull
009523a Merge branch 'main' of github.com:rahulbittu/topranker
8f215b1 Fix Replit preview: TOML ordering, dual bundle URL fallback, self-sufficient HTML
c5a1272 Add new categories to confidence thresholds for business types
caf1e58 Merge remote + fix Replit preview: bootstrap page in dev, Colors.ts casing
1db6785 Fix Replit preview: always serve bootstrap page in dev mode
ff82431 Saved progress at the end of the loop
80e7766 Saved progress at the end of the loop
```

## Required Output
Write the critique to: /Users/rahulpitta/topranker/docs/critique/SPRINT-135-CRITIQUE.md

Use exactly these sections:
- ## Verified wins
- ## Contradictions / drift
- ## Unclosed action items
- ## Core-loop focus score
- ## Top 3 priorities for next sprint
- **Verdict:**
