# Changelog

All notable changes to TopRanker are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

## [Sprint 160] - 2026-03-09
- SLT meeting: backlog prioritization, audit cadence reset, core loop UX review
- Sync package-lock.json after dependency cleanup (Sprint 156)
- CHANGELOG backfill for Sprints 155-159
- 2160 tests across 96 files

## [Sprint 159] - 2026-03-09
- Friendly rate gating error messages (already-rated, new account, suspended)
- Error banner auto-dismiss (8s) + tap-to-dismiss
- 2160 tests across 96 files

## [Sprint 158] - 2026-03-09
- Activate challenger_updated SSE broadcast on rating submission
- Google Maps audit confirms fully working (no fix needed)
- 2152 tests across 95 files

## [Sprint 157] - 2026-03-09
- Fix SSE query key mismatch — real-time updates were silently broken
- Add "Your Rating Moved This" impact banner on business detail (10s dismiss)
- Rating submitted now invalidates challengers via SSE
- 2147 tests across 94 files

## [Sprint 156] - 2026-03-09
- 16 regression tests for production safety (mock data guard, IPv4 binding)
- Wrap 5 unwrapped async handlers with wrapAsync (Stripe webhook P2 risk)
- Railway healthcheck config added
- Remove dead deps: @expo-google-fonts/inter, expo-symbols
- Architectural Audit #13: grade A (up from A-)
- 2133 tests across 93 files

## [Sprint 155] - 2026-03-09
- Documentation truthfulness audit: API.md (27→61 endpoints), CHANGELOG (18 sprints backfilled)
- ARCHITECTURE.md: test count 70→2117, tables 13→20
- README + CONTRIBUTING: test counts updated

## [Sprint 154] - 2026-03-09
### Fixed
- **Railway 502** — server bound IPv6 only on Railway; restored `host: "0.0.0.0"` for IPv4 binding
- **Mock data production leak** — `apiFetch()` served fake data on any network error; gated mock fallback behind `__DEV__` guard
### Added
- Railway build configuration (`nixpacks.toml`, `.node-version`, `railway.toml`)
- Google OAuth native flow with dual ID/access token verification

## [Sprint 153] - 2026-03-08
### Fixed
- **5 UI/backend truthfulness mismatches** — systematic audit of every user-facing claim against actual behavior
- Push notifications sent without checking user preference opt-in; now gated on preference lookup
- GDPR deletion requests stored in volatile in-memory Map; migrated to `deletionRequests` DB table with Drizzle queries
- Business claim UI falsely said "Auto-verified business"; changed to "Reviewed by our team"
- Privacy policy and SECURITY.md falsely claimed AES-256 encryption at rest; removed until implemented
### Changed
- Real-time rating copy updated to "Ratings update shortly after submission" (honest about SSE latency)
- 2117 tests across 92 files

## [Sprint 152] - 2026-03-08
### Fixed
- Email change copy claimed verification when none existed; replaced with "Your email will be updated immediately" plus confirmation dialog
- Avatar upload storage path clarified to use file storage abstraction consistently (`storageClient.upload` / `getPublicUrl`)
### Added
- Dynamic version display from package.json via `app-constants.ts` (replaces hardcoded "1.0.0")
- 2 regression guard tests validating UI copy matches backend behavior

## [Sprint 151] - 2026-03-08
### Added
- **FileStorage abstraction** (`server/file-storage.ts`) — Strategy pattern with LocalFileStorage (dev) and R2FileStorage (production via env var)
- Email change endpoint (`PUT /api/members/me/email`) with duplicate checking and rate limiting
### Changed
- Avatar upload rewritten to stream through FileStorage instead of base64-encoding; response payload reduced from ~300KB to ~200 bytes
- Removed dead notification state from profile.tsx (~40 lines of unused code)
- 2087 tests across 90 files

## [Sprint 150] - 2026-03-08
### Added
- **Avatar upload** — `POST /api/members/me/avatar` with 2MB limit, MIME validation, multer middleware
- Photo picker (web) with FileReader base64 preview and camera overlay badge
- SLT Backlog Meeting (Sprint 150) — Q2 roadmap: revenue readiness, R2 avatar migration, referral program
- Architectural Audit #14: A- grade, 2 P1 findings (base64 storage, notification state cleanup)
### Changed
- Edit profile screen polish: loading/success/error states, disabled save during submission

## [Sprint 149] - 2026-03-08
### Added
- **Edit profile screen** (`app/edit-profile.tsx`) — display name, username editing with avatar placeholder
- `PUT /api/members/me` endpoint with validation for profile field updates
- `updateMemberProfile` storage function via Drizzle ORM
### Changed
- Notification preferences unified: removed inline profile toggles, single source of truth in settings
- 2049 tests across 88 files

## [Sprint 148] - 2026-03-08
### Added
- **Settings notification sync** — 6 notification keys persisted to DB via jsonb column on members table
- `updateNotificationPrefs` storage function with JSON merge update
- Comprehensive backend setup guide (`docs/SETUP.md`)
### Changed
- GET/PUT notification-preferences endpoints expanded from 3 to 6 keys with server-side persistence
- Settings toggles fire-and-forget PUT with optimistic local state
- 2031 tests across 87 files

## [Sprint 147] - 2026-03-08
### Fixed
- Search returned static results regardless of input; now filters by query, city, category, and description
### Added
- Community reviews section on challenger VS cards (reviewer name, stars, timestamp, review text)
- Profile tier progression UI redesign with progress bars, tier badges, and influence score display

## [Sprint 146] - 2026-03-08
### Added
- SLT Backlog Meeting (Sprint 145) — prioritized production observability and deployment for Sprints 146-150
- Architectural Audit #13 — validated experiment framework data flows and SubComponents decomposition
- 20 experiment HTTP pipeline tests (full lifecycle: assignment, exposure, outcome, dashboard)
- 15 freshness boundary audit tests proving zero uncovered tier-emitting paths
### Fixed
- MapView IntersectionObserver crash on tab navigation (try-catch around map initialization)
- Mock business photos replaced with Unsplash food photography URLs
- 2010 tests across 86 files (crossed 2000 milestone)

## [Sprint 145] - 2026-03-08
### Added
- **HTTP-level freshness integration tests** (22 tests) — proves FRESH endpoints return corrected tier at the request-response level
- Real Wilson score confidence intervals replacing approximate implementation; 6 correctness tests against known statistical values
### Changed
- Business SubComponents.tsx decomposed from 1023 LOC monolith into 15 individual component files (all under 300 LOC) with 43 LOC barrel re-export
- 1975 tests across 84 files

## [Sprint 144] - 2026-03-08
### Added
- **3 A/B experiments activated** — `confidence_tooltip`, `trust_signal_style` (text labels vs icon-only), `personalized_weight` (tier-based vote weight display)
- Personalized weight experiment wired into challenger page via `useExperiment` hook
- Trust signal style experiment wired into business detail SubComponents
- 24 E2E experiment pipeline tests (assignment through dashboard recommendation)
### Changed
- MapView extracted from search.tsx (907 to 713 LOC, -21%)
- 1947 tests across 83 files

## [Sprint 143] - 2026-03-08
### Added
- **Experiment dashboard with Wilson score CIs** — `computeExperimentDashboard` with automated recommendations (significant/promising/inconclusive/underperforming)
- 26 behavioral freshness tests and 38 core-loop boundary tests
### Changed
- Challenger.tsx extracted from 944 to 482 LOC via SubComponents pattern
- Business/[id].tsx extracted from 951 to 533 LOC via SubComponents pattern
- 1899 tests across 81 files

## [Sprint 142] - 2026-03-08
### Added
- **Tier semantics documentation** (`docs/TIER-SEMANTICS.md`) — formal FRESH vs SNAPSHOT contract for all 19 tier-touching paths
- `TIER_SEMANTICS` machine-readable constant with structural enforcement tests
- 28 E2E product path tests proving the core loop (rating, tier promotion, vote weight, challenger, account lifecycle)
- Experiment tracker (`server/experiment-tracker.ts`) with enrollment, exposure, outcome tracking, and metrics dashboard endpoint
### Changed
- 1815 tests across 78 files

## [Sprint 141] - 2026-03-08
### Added
- **GitHub Actions CI/CD pipeline** — tests, TypeScript check, file size limits, type cast counts, @types audit (all blocking)
- Automated health check script (`scripts/arch-health-check.sh`) replacing manual audit recurring findings
- Cumulative audit scorecard (`scripts/audit-scorecard.md`) with escalation rules
- Tier path audit covering all 19 code paths; 4 gaps fixed (public profile, GDPR export, admin members, passport.deserializeUser)
### Changed
- `requireAuth` extracted to `server/middleware.ts`, `hashString` to `shared/hash.ts` (dedup)
- @types packages moved from dependencies to devDependencies
- 1722 tests across 75 files

## [Sprint 140] - 2026-03-08
### Added
- SLT Backlog Meeting (Sprint 140) — reviewed Sprints 135-139, set priorities for 141-145
- Architectural Audit #12: A- grade (up from B+), 0 Critical/High, 3 new P2/P3 findings
- Tier staleness integrated into live `recalculateCredibilityScore` — zero drift window on rating submission and profile load
- 21 wrapAsync verification tests proving error propagation, response shape consistency, and no stack trace leaks

## [Sprint 139] - 2026-03-08
### Changed
- **wrapAsync applied to all 5 route files** — 60 handlers wrapped, 60+ catch blocks removed
- Animation components integrated into Rankings (staggered FadeInView), Profile (ScoreCountUp), and Business Detail (RankMovementPulse)
### Added
- Tier staleness detection module (`server/tier-staleness.ts`) — `isTierStale`, `checkAndRefreshTier`, `findStaleTierMembers`, `refreshStaleTiers`
- 1570 tests across 71 files

## [Sprint 138] - 2026-03-08
### Added
- **Shared credibility module** (`shared/credibility.ts`) — single source of truth for `getVoteWeight`, `getCredibilityTier`, `getTierFromScore`; client and server re-export
- `wrapAsync` middleware (`server/wrap-async.ts`) — Express async handler wrapper with headersSent protection
- 6 animation components (ScoreCountUp, RankMovementPulse, EmptyStateAnimation, FadeInView, SlideUpView, LottieWrapper)
- Haptic pattern library (`lib/haptic-patterns.ts`) and audio engine (`lib/audio-engine.ts`)
- Screen fade transitions in `_layout.tsx`
### Changed
- 1554 tests across 70 files

## [Sprint 137] - 2026-03-08
### Added
- 100 storage-layer tests for credibility engine formulas (members.ts) and anomaly detection (ratings.ts)
- Server-side experiment assignment (`server/routes-experiments.ts`) with DJB2 hash bucketing parity
- Payment rate limiting (20 req/min) and admin rate limiting (30 req/min) with independent key prefixes
### Changed
- Profile.tsx extracted from 1073 to 671 LOC (6 components moved to SubComponents)
- Input sanitization applied to 8 unsanitized query/body params across routes
- 1488 tests across 67 files

## [Sprint 136] - 2026-03-08
### Fixed
- **Core-loop: Pioneer rate N+1 query** — replaced O(N) loop (201 queries for 200 ratings) with single correlated subquery in `storage/members.ts`
- **Core-loop: Rank recalculation O(N) loop** — replaced sequential UPDATE per business with single window-function UPDATE in `storage/businesses.ts`
### Added
- Architectural Audit #11 (Sprint 135 boundary): 0 CRITICAL, 2 HIGH (file sizes, test coverage gaps), 4 MEDIUM
- A/B testing disclosure in privacy policy (Section 13) — GDPR Article 22 compliant
- Tooltip accessibility: `accessible={true}` + `accessibilityLabel` on confidence tooltip views
- 1323 tests across 62 files (documentation corrected from stale "70")
### Changed
- README: test count 70 → 1323, sprint doc paths fixed, admin endpoints added
- CONTRIBUTING: test count 70 → 1323, sprint doc paths fixed
- CHANGELOG: backfilled Sprints 127-135

## [Sprint 135] - 2026-03-08
### Added
- A/B testing framework (`lib/ab-testing.ts`) with DJB2 hash bucketing, experiment registry, QA overrides, and exposure event deduplication
- Confidence tooltips on search cards and leaderboard items (tap info icon to see confidence description)
- Personalized vote weight display on challenger page for logged-in users showing tier influence percentage
- 34 new tests for A/B testing framework

## [Sprint 134] - 2026-03-08
### Added
- GET `/api/admin/confidence-thresholds` read-only admin endpoint
- 47 new tests covering trust-critical surfaces and admin thresholds
- TD-013 in TECH-DEBT.md documenting pagination risk for Previous Rating card
### Fixed
- False "No internet connection" banner caused by CORS-failing external ping; now uses native `navigator.onLine`
- Google Maps not loading due to missing CSP entries for `maps.googleapis.com` and `maps.gstatic.com`

## [Sprint 132] - 2026-03-08
### Changed
- Replaced hardcoded `>= 10` verified pill on search BusinessCard with category-aware confidence system
- Green shield icon for established/strong confidence, amber hourglass for early confidence, no indicator for provisional
### Fixed
- Trust signal inconsistency: search results now use same confidence thresholds as leaderboard, challenger, and business detail pages

## [Sprint 131] - 2026-03-08
### Added
- Rank confidence labels on challenger page fighter cards (provisional/early indicators, hidden for established)
- "How Voting Works" explainer section on challenger page explaining credibility-tier voting mechanics

## [Sprint 130] - 2026-03-08
### Added
- Per-category confidence thresholds (`CATEGORY_CONFIDENCE_THRESHOLDS`) with three tiers: high-volume, standard, niche
- Optional `category` parameter on `getRankConfidence()` for category-aware calibration

## [Sprint 129] - 2026-03-08
### Added
- "Your Rating" card on business detail page showing user's previous Q1/Q2/Q3 scores, would-return, tier badge, and relative date
### Changed
- Rate button text changes to "Update Your Rating" when user has an existing rating

## [Sprint 128] - 2026-03-08
### Added
- "Rate Your First Place" CTA card for zero-rating users navigating to Discover
- Collapsible Score Breakdown for users with fewer than 5 ratings
### Changed
- Profile layout adapts by user stage: 0 ratings, 1-4 ratings, 5+ ratings

## [Sprint 127] - 2026-03-08
### Added
- "Your Last Rating" consequence card on profile page showing business name, score, weight, and relative date

## [Sprint 126] - 2026-03-08
### Changed
- Rating confirmation: "Rating Submitted" → "Your Rating is Live", removed raw weight display (x0.10), replaced with influence labels
- Profile credibility card: "Vote Weight 0.10x" → "Starter Influence · New Member"
- Tier journey: raw weights replaced with influence labels (Starter/Growing/Strong/Maximum)
- Offline banner: emergency red → navy (premium, less alarming)
- Challenger vote counts: reduced decimal precision via formatCompact
- Business detail "Would Return": shows "--" instead of "0%" when < 2 ratings
- Trust explainer text adapts for low-data businesses
### Added
- Rank confidence system: provisional/early/established/strong with visual badges
- TIER_INFLUENCE_LABELS for human-friendly influence communication
- formatCompact() and formatReturnRate() utility functions
- Confidence pill on leaderboard cards (replaces VERIFIED for thin data)
- Confidence badge on business detail page

## [Sprint 124] - 2026-03-08
### Added
- Visual regression testing utility (lib/visual-regression.ts) — screenshot comparison abstraction with 8 critical screens, diff threshold, manifest generation
- Database migration runner (server/migrate.ts) — migration tracking with apply/rollback, in-memory Set tracking
- Performance budget utility (lib/performance-budget.ts) — TTFB, FCP, bundle size, API response budgets with checkBudget/getBudgetReport
### Changed
- CHANGELOG updated with Sprints 121-124
- 1147+ tests across 57 files

## [Sprint 123] - 2026-03-08
### Added
- Admin dashboard conversion funnel — 5-stage funnel visualization with FunnelStage interface
- Social sharing deep link enhancements — share card metadata for business pages
- Request metrics aggregation — p50/p95/p99 latency tracking
### Changed
- 1100+ tests across 56 files

## [Sprint 122] - 2026-03-08
### Added
- Sentry integration layer (lib/sentry-config.ts) — breadcrumb capture, scope management, environment tagging
- API response compression middleware — gzip support for JSON responses
- Admin audit log viewer — paginated audit trail with filters
### Changed
- 1050+ tests across 55 files

## [Sprint 121] - 2026-03-08
### Added
- Sentry error boundary integration — automatic crash reporting with component stack traces
- Admin dashboard metrics panel — real-time user count, revenue totals, error rates
- Cache invalidation hooks — tag-based cache busting for React Query
### Changed
- 1000+ tests across 54 files

## [Sprint 120] - 2026-03-08
### Added
- Request logging middleware (server/request-logger.ts) — structured in-memory request log with 500-entry buffer
- Feature flags foundation (lib/feature-flags.ts) — in-memory flag system with 4 pre-registered flags
- SLT + Architecture backlog meeting (Sprint 120) — reviewed Sprints 115-119, prioritized 120-124
### Changed
- CHANGELOG updated with Sprints 117-120
- 949+ tests across 53 files

## [Sprint 119] - 2026-03-08
### Added
- Connection pooling module (server/db-pool.ts) — ConnectionPool class with configurable pool size, drain, health check
- Offline sync foundation (lib/offline-sync.ts) — SyncAction queue with retry logic, MAX_RETRIES = 3
- API versioning documentation (docs/API-VERSIONING.md) — header-based strategy, deprecation policy, sunset headers
### Changed
- Health check enhanced with nodeVersion, memoryUsage fields
- 949 tests across 52 files

## [Sprint 118] - 2026-03-08
### Added
- i18n foundation (lib/i18n.ts) — translation module with locale detection, interpolation, pluralization
- Social sharing module (lib/social-sharing.ts) — share card generation, deep link construction
- X-Response-Time header middleware — measures request duration in milliseconds
### Changed
- 900+ tests across 51 files

## [Sprint 117] - 2026-03-08
### Added
- Accessibility testing utility (lib/accessibility-test.ts) — automated a11y checks for contrast, labels, touch targets
- GDPR deletion grace period enhancement — 30-day soft delete with recovery window
- Revenue analytics enhancements — monthly breakdown, cohort tracking
### Changed
- 850+ tests across 50 files

## [Sprint 116] - 2026-03-08
### Added
- Admin analytics dashboard endpoint (GET /api/admin/analytics/dashboard) with conversion funnel rates
- Centralized error reporting service (lib/error-reporting.ts) — Sentry-ready abstraction
- ErrorBoundary now pipes crashes through reportComponentCrash
- Push notification preference sync logging (structured server-side logging)
### Changed
- Reverted dark mode background overrides on all tabs, skeletons, and CookieConsent (user request)
- ThemeProvider infrastructure retained (settings toggle, context) but component backgrounds use static Colors
- 802 tests across 49 files

## [Sprint 115] - 2026-03-08
### Added
- Revenue analytics client-side tracking (business views, dashboard upgrade taps)
- ErrorBoundary structured logging (error + component stack)
- SLT + Architecture backlog meeting (Sprint 115)
### Changed
- Dark mode migration to components (CookieConsent, Skeleton, Settings)
- 770+ tests across 48 files

## [Sprint 114] - 2026-03-08
### Added
- createThemedStyles + useThemedStyles utilities for dark mode migration
- WebSocket vs SSE evaluation document (decision: keep SSE)
- SLT + Architecture backlog meeting doc for Sprint 115
- Tab screen containers now theme-aware via useThemeColors hook
### Changed
- All 4 tab screens use useThemeColors for dynamic container backgrounds
- CHANGELOG updated through Sprint 113
- 720+ tests across 46+ files

## [Sprint 113] - 2026-03-08
### Added
- ThemeProvider context with system/light/dark detection + AsyncStorage persistence
- darkColors normalized to match Colors shape (key parity verified in tests)
- Settings appearance toggle (System/Light/Dark)
- useTheme and useThemeColors hooks
### Changed
- Dark-colors.ts now exports both DARK_COLORS (backwards compat) and darkColors (normalized)
- Root layout wraps CityProvider in ThemeProvider
- TECH-DEBT.md updated through Sprint 112
- 720 tests across 46 files

## [Sprint 112] - 2026-03-08
### Added
- GDPR data export endpoint (GET /api/account/export) — Art. 20 data portability
- RateLimitStore interface with MemoryStore default and RedisStore stub
- Analytics flush handler (setFlushHandler) for periodic persistence
- analytics_events table schema in shared/schema.ts
### Changed
- Rate limiter refactored to pluggable store pattern (async increment)
- Sprint 105 rate limiter tests updated for async pattern
- TECH-DEBT.md: TD-001 architecturally resolved, 3 new resolved items
- 693 tests across 45 files

## [Sprint 111] - 2026-03-08
### Added
- ErrorBoundary integration: all 4 tab screens wrapped for graceful crash recovery
- Notification preferences backend: GET/PUT /api/members/me/notification-preferences
- Client-side analytics emission: challenger views, search queries, notification settings
- Server-side funnel tracking: signup_completed and first_rating events
### Changed
- Payment routes sanitized: challenger businessName/slug, dashboard-pro slug, featured slug
- Notification preference switches now persist to API and track analytics events
- Search tab tracks query analytics on submit

## [Sprint 110] - 2026-03-08
### Added
- ErrorBoundary component with branded recovery UI and retry
- Analytics conversion funnel module (server/analytics.ts) with 12 event types
- Dark mode color palette (constants/dark-colors.ts)
- Notification preferences UI on profile page (3 toggles)
- Admin analytics endpoint (GET /api/admin/analytics)
- SLT + Architecture backlog meeting doc (Sprint 110)
### Changed
- Input sanitization expanded: signup (displayName, username, email), claims (role, phone), dishes (query), ratings (score clamping)
- Graceful shutdown: SIGTERM/SIGINT handlers with 10s timeout
- 637 tests across 43 files

## [Sprint 109] - 2026-03-08
### Added
- Input sanitization utilities: stripHtml, sanitizeString, sanitizeNumber, sanitizeEmail, sanitizeSlug
- Health check endpoint with version, uptime, memory stats
- GDPR/CCPA account deletion (DELETE /api/account) with 30-day grace period
- Monthly revenue endpoint (GET /api/admin/revenue/monthly)
### Changed
- Search endpoint sanitized via sanitizeString
- Typography migration completed: business detail page (14 styles)
- 595 tests across 42 files

## [Sprint 108] - 2026-03-08
### Added
- E2E test framework: 21 tests covering full API contract (L1 CLOSED)
- PricingBadge reusable component
- API versioning (X-API-Version: 1.0.0) and request tracing (X-Request-Id)
### Changed
- CORS consolidated into security-headers.ts
- Hardcoded colors cleaned up (#FFD700, rgba → brand constants)
- Tech debt registry updated: TD-003, TD-004 resolved
- Accessibility statement linked from profile legal section

## [Sprint 107] - 2026-03-08
### Added
- Security posture document (docs/SECURITY.md)
- Accessibility statement page (app/legal/accessibility.tsx)
- Revenue metrics admin endpoint (GET /api/admin/revenue)
- Challenger tab onboarding tip card
- Profile tab credibility growth prompt
### Changed
- Typography migration complete: search.tsx, challenger.tsx (22 total styles)
- CHANGELOG.md updated with Sprints 97-106
- Body size limits: 1MB JSON, 5MB webhooks
- Accessibility props on SafeImage and SubComponents

## [Sprint 106] - 2026-03-08
### Added
- Performance monitoring middleware with admin endpoint (GET /api/admin/perf)
- Tech Debt Registry (docs/TECH-DEBT.md)
- Shared test utilities module (tests/helpers/test-utils.ts)
- Discover tab onboarding tip card
### Changed
- Typography migration in profile.tsx (10 styles)
- Pricing migration in dashboard.tsx and claim.tsx
- SSE hardened: max 5 connections/IP, 30-minute auto-timeout
- Cookie consent "Learn more" now links to privacy policy

## [Sprint 105] - 2026-03-08
### Added
- Content Security Policy (9 directives) in security headers
- Rate limiter middleware (100 req/min API, 10 req/min auth)
- GDPR cookie consent banner for web
### Changed
- Banner dismissal persisted via AsyncStorage
- Frontend pricing migrated to PRICING constants (3 payment entry screens)
- Typography migration started in leaderboard SubComponents

## [Sprint 104] - 2026-03-08
### Added
- OWASP security headers middleware (X-Content-Type-Options, X-Frame-Options, HSTS)
- Centralized typography system (constants/typography.ts)
- Centralized pricing constants (shared/pricing.ts)
- Rankings tab engagement banner
### Changed
- Terms of Service updated to 14 sections (real-time, webhooks, cancellation)
- Privacy Policy updated (SSE data, Resend provider, webhook logging)
- colors.ts refactored to import from brand.ts (single source of truth)

## [Sprint 103] - 2026-03-08
### Added
- Webhook replay: GET /api/admin/webhooks, POST /api/admin/webhooks/:id/replay
- Extracted processStripeEvent() for reuse from webhook handler and admin replay

## [Sprint 102] - 2026-03-08
### Added
- Email service via Resend API (native fetch, zero dependencies)
- Dev mode console logging fallback when RESEND_API_KEY not set

## [Sprint 101] - 2026-03-08
### Added
- Payment cancellation expires featured placements immediately
- expireFeaturedByPayment() storage function

## [Sprint 100] - 2026-03-08
### Added
- Architecture Audit #9: A+ grade, zero critical/high findings

## [Sprint 99] - 2026-03-08
### Fixed
- Map IntersectionObserver crash on tab navigation
- Press animation quality (timing-in, gentle spring-out)
- Tab bar dot alignment with unified spring config
- Opening hours made collapsible (today + expand all)
### Changed
- Card entry animations with staggered delays

## [Sprint 98] - 2026-03-08
### Added
- Optimistic updates on rating submission with rollback
- googlePlaceId database index

## [Sprint 97] - 2026-03-08
### Added
- Server-Sent Events (SSE) for real-time cache invalidation
- React Query invalidation via SSE event mapping
- Website URLs for 28 seed businesses

## [Unreleased]

### Sprint 90 — Architectural Audit #8 + Payment Route Extraction (March 8, 2026)
#### Changed
- Extracted 3 payment routes to `server/routes-payments.ts` (85 LOC)
- `routes.ts` reduced from 732 to 665 LOC (under 700 threshold)
- Audit #8: 5/6 ALL CLEAR, 1 WATCH resolved same-sprint

### Sprint 89 — Payment Endpoints + Claim Email Notifications (March 8, 2026)
#### Added
- POST `/api/payments/challenger` ($99 entry), `/api/payments/dashboard-pro` ($49/mo), `/api/payments/featured` ($199/week)
- Claim confirmation email (branded HTML to business owner)
- Claim admin notification email (alert to review team)
- 11 new tests for payment contracts and email notifications (total: 294)

#### Changed
- `enter-challenger.tsx` wired to real payment API (was setTimeout stub)

### Sprint 88 — Business Claims API + Real Dashboard + Admin Extraction (March 8, 2026)
#### Added
- POST `/api/businesses/:slug/claim` — real claim submission with duplicate detection
- GET `/api/businesses/:slug/dashboard` — real analytics replacing MOCK_ANALYTICS
- `server/routes-admin.ts` — 14 admin routes extracted with `requireAdmin` middleware
- `submitClaim` and `getClaimByMemberAndBusiness` storage functions
- 18 new tests for claims, dashboard, and timeAgo formatter (total: 283)

#### Changed
- `claim.tsx` wired to real API (was console.log stub)
- `dashboard.tsx` uses React Query + real data, removed MOCK_ANALYTICS
- `routes.ts` reduced by ~260 LOC from admin extraction

### Sprint 87 — Google Places Photo Pipeline + Brand Hardening (March 8, 2026)
#### Added
- `server/google-places.ts` — fetch photo refs from Google Places API (New)
- `insertBusinessPhotos`, `getBusinessesWithoutPhotos`, `deleteBusinessPhotos` storage functions
- POST `/api/admin/fetch-photos` for batch photo fetching
- On-demand photo fetch in business detail route
- `resolvePhotoUrl()` in `lib/api.ts` for Places ref → proxy URL conversion
- `navyDark` (#162940) to `BRAND.colors`
- 34 new tests: push token (13) + Google Places photos (21) (total: 265)

#### Changed
- Replaced 4 hardcoded navy gradient hex values with `BRAND.colors.navyDark`

### Sprint 86 — Teardown & Rebuild (March 8, 2026)
#### Added
- `assets/audio/AUDIO-ASSETS.md` — audio asset specifications for 5 sound files
- `.env.example` — environment variable template
- Onboarding persistence via AsyncStorage
- Push token storage endpoint: POST `/api/members/me/push-token`
- `updatePushToken` storage function

#### Fixed
- Replaced hardcoded gold hex values with brand constants (`Colors.gold`, `Colors.goldFaint`)
- Unified credibility tier system across all files

### Sprint 85 — Architectural Audit #7 + Full Badge Metadata + Admin Users Tab (March 8, 2026)
#### Added
- Architectural Audit #7: 5/6 ALL CLEAR, 1 WATCH (routes.ts file size)
- Admin Users tab with real member listing from database
- `getAdminMemberList` and `getMemberCount` storage functions
- Admin members API endpoints (GET list, GET count)

#### Changed
- Expanded server-side badge metadata from 10 to all 61 badges for share-by-link
- Admin overview uses real user count instead of hardcoded value

### Sprint 84 — Badge Share-by-Link + TypeScript Error Fixes (March 8, 2026)
#### Added
- `server/badge-share.ts` — Server-rendered badge share page with OG meta for social previews
- `/share/badge/:badgeId` endpoint serving HTML with OG tags, inline SVG image, cache-control
- "Copy Link" button in BadgeDetailModal using expo-clipboard
- `getBadgeShareUrl()` utility for constructing share URLs
- 11 new tests for share link validation (total: 231 across 20 files)

#### Fixed
- Fixed `MemberImpact.businessesMovedToFirst` type — made optional to match API interface
- Fixed `business.lat`/`business.lng` type — converted number to string for LocationCard
- All pre-existing TypeScript errors eliminated — **zero `tsc --noEmit` errors**

### Sprint 83 — Admin Claims/Flags API Wiring + Badge Leaderboard (March 8, 2026)
#### Added
- `server/storage/claims.ts` — Admin review storage for business claims and rating flags (6 functions)
- 7 new admin API routes: GET/PATCH claims, GET/PATCH flags, GET counts, GET badge leaderboard
- `app/badge-leaderboard.tsx` — Badge leaderboard screen ranking members by total badges earned
- API client functions for claims, flags, and badge leaderboard in `lib/api.ts`
- 12 new tests for admin claims/flags validation and badge leaderboard contract (total: 220 across 19 files)

#### Changed
- Admin panel claims/flags tabs now use real API endpoints instead of mock data
- Profile badge count is now tappable — navigates to badge leaderboard
- Fixed 4 pre-existing logger call errors in routes.ts (`log()` → `log.error()`)

### Sprint 82 — Google Maps Extraction + Business Detail Cleanup (March 8, 2026)
#### Changed
- Extracted `OpeningHoursCard` and `LocationCard` from business/[id].tsx into SubComponents.tsx
- Removed ~40 LOC and unused `Feather` import from business/[id].tsx
- `as any` iframe cast relocated to SubComponents.tsx (production count: 3, stable)

### Sprint 81 — useBadgeContext Hook + Team Dashboard Update (March 8, 2026)
#### Added
- `lib/hooks/useBadgeContext.ts` — Memoized hook for badge context, evaluation, and counts
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
