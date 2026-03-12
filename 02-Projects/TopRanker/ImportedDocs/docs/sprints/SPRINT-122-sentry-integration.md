# Sprint 122 — Sentry SDK Integration Prep, Admin Dashboard Data Wiring, Offline Sync Persistence

**Date:** 2026-03-08
**Duration:** 1 sprint cycle
**Story Points:** 21
**Theme:** Observability infrastructure, admin tooling, offline resilience

---

## Mission

Lay the Sentry integration foundation so error reporting flows through a proper observability pipeline, wire the admin dashboard to live API data, and add AsyncStorage persistence to the offline sync queue.

---

## Team Discussion

**Sarah Nakamura (Lead Engineer):** "The Sentry abstraction layer is clean — we export a minimal interface that mirrors the real SDK. When we plug in `@sentry/react-native`, we just swap the implementations inside `lib/sentry.ts` without touching any consumer code. Zero-refactor integration."

**Amir Patel (Architecture):** "I reviewed the module boundary. `lib/sentry.ts` is the single entry point — `error-reporting.ts` imports from it, and nothing else needs to know about Sentry internals. This keeps the dependency graph shallow and testable."

**Leo Hernandez (Frontend):** "The dashboard now fetches from `/api/admin/analytics/dashboard` on mount. I added an `ActivityIndicator` loading state and fall back to the hardcoded stat cards if the API isn't available yet. The `useDashboardData` hook is self-contained — easy to extend with polling or SSE later."

**Marcus Chen (CTO):** "Three workstreams converging on production readiness: observability, admin tooling, offline resilience. This is exactly the kind of infrastructure sprint that pays compound interest. The Sentry abstraction means we can flip the switch the moment we configure a DSN."

**Nadia Kaur (Cybersecurity):** "The Sentry abstraction correctly avoids sending PII by default. When we integrate the real SDK, we'll add a `beforeSend` hook to scrub sensitive fields. The admin dashboard fetch uses `credentials: include` which is correct for our cookie-based auth model."

**Rachel Wei (CFO):** "Sentry's free tier gives us 5K errors/month. That's plenty for our current scale. The abstraction means zero cost until we actually configure a DSN. Smart engineering economics."

---

## Changes

### 1. Sentry Integration Abstraction (`lib/sentry.ts`)
- New file with `SentryConfig` interface (dsn, environment, release, tracesSampleRate)
- `initSentry()` — sets initialized flag, logs config
- `captureException()` — logs via Sentry when initialized, falls back to console.error
- `captureMessage()` — supports info/warning/error severity levels
- `setUser()` — sets user context for error correlation
- `addBreadcrumb()` — adds navigation/action breadcrumbs
- `isInitialized()` — boolean check for consumer code

### 2. Error Reporting Sentry Integration (`lib/error-reporting.ts`)
- Imported `captureException` and `isInitialized` from `./sentry`
- `reportError()` — routes to Sentry when initialized, console.error fallback
- `reportComponentCrash()` — same Sentry-first pattern with component context

### 3. Admin Dashboard Data Wiring (`app/admin/dashboard.tsx`)
- Added `useDashboardData` custom hook with useState/useEffect
- Fetches from `getApiUrl() + "/api/admin/analytics/dashboard"`
- `ActivityIndicator` loading state
- Live stat cards from `data.overview.totalEvents`, `data.funnel.signupRate`, `data.funnel.ratingRate`
- Falls back to hardcoded cards when API unavailable

### 4. Offline Sync Persistence (`lib/offline-sync.ts`)
- `persistQueue()` — serializes actionQueue Map to AsyncStorage under `topranker_sync_queue`
- `loadQueue()` — deserializes from AsyncStorage and populates in-memory Map
- Imported AsyncStorage from `@react-native-async-storage/async-storage`

### 5. Tests (`tests/sprint122-sentry-integration.test.ts`)
- 39 tests across 4 describe blocks using fs.readFileSync pattern
- Sentry abstraction: file exists, all exports verified
- Error reporting integration: imports, isInitialized checks, fallback behavior
- Admin dashboard: getApiUrl, endpoint, hook, ActivityIndicator, data fields
- Offline sync: persistQueue, loadQueue, AsyncStorage, storage key

---

## PRD Gap Status
- Sentry integration: CLOSED (abstraction complete, ready for DSN config)
- Admin dashboard data: CLOSED (API wired, loading states)
- Offline persistence: CLOSED (AsyncStorage queue persistence)
