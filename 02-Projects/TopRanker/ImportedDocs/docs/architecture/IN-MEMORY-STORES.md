# In-Memory Stores — Architecture Reference

**Created:** Sprint 607 (2026-03-11)
**Owner:** Amir Patel (Architecture)
**Status:** Living document — update when stores change

---

## Overview

TopRanker uses native JavaScript `Map<>` for all in-memory caching. No external cache library (Redis, LRU) is used. All stores live in the Node.js server process and reset on restart. Three stores are critical to rating integrity; the rest support infrastructure.

---

## Primary Stores (Rating Integrity)

### 1. Photo Content Hash Index
**File:** `server/photo-hash.ts`
**Type:** `Map<string, HashEntry>`
**Purpose:** Detect exact duplicate photos across ratings (anti-gaming layer)

| Property | Value |
|----------|-------|
| Hash algorithm | SHA-256 |
| DB column | `ratingPhotos.contentHash` |
| Preload | Yes — `preloadHashIndex()` on startup (Sprint 587) |
| Capacity | Unbounded (grows with photo count) |
| Eviction | None — entries persist for server lifetime |

**Entry shape:** `{ ratingId, memberId, businessId, photoId, uploadedAt }`
**Key functions:** `computePhotoHash()`, `checkDuplicate()`, `registerPhotoHash()`, `detectDuplicate()`
**Scaling note:** At scale, move to Redis or DB-only lookup.

### 2. Perceptual Hash (pHash) Index
**File:** `server/phash.ts`
**Type:** `PHashEntry[]` (array, not Map)
**Purpose:** Detect near-duplicate photos (cropped, filtered, resized) using Hamming distance

| Property | Value |
|----------|-------|
| Hash algorithm | Average hash (aHash) — 64-bit fingerprint, 16-char hex |
| Similarity threshold | Hamming distance ≤ 10 bits |
| DB column | `ratingPhotos.perceptualHash` |
| Preload | Yes — `preloadPHashIndex()` on startup (Sprint 592) |
| Capacity | Unbounded (grows with photo count) |
| Eviction | None |

**Key functions:** `computePerceptualHash()`, `hammingDistance()`, `findNearDuplicates()`, `registerPHash()`
**Owner:** Nadia Kaur (anti-gaming layer #8)

### 3. City Dimension Averages Cache
**File:** `server/city-dimension-averages.ts`
**Type:** `Map<string, { data: CityDimensionAverages; expiresAt: number }>`
**Purpose:** Cache per-city average dimension scores (food, service, vibe, packaging, wait time, value)

| Property | Value |
|----------|-------|
| TTL | 5 minutes (300,000ms) |
| Max entries | 50 cities |
| Eviction | Stale entries purged on capacity check |
| DB persistence | None — computed on demand via SQL `AVG()` |
| Endpoint | `/api/cities/:city/dimension-averages` (Sprint 578) |

**Key functions:** `computeCityDimensionAverages()`, `getCacheSize()`, `clearDimensionCache()`

---

## Secondary Stores (Infrastructure)

| Store | File | Type | Capacity | TTL | Purpose |
|-------|------|------|----------|-----|---------|
| Reputation cache | `reputation-v2.ts` | `Map<string, MemberReputation>` | 5,000 | None | Member reputation scoring (5-tier) |
| Search query tracker | `search-query-tracker.ts` | `Map<string, Map<string, QueryEntry>>` | 500/city | Hourly 0.9x decay | Popular search queries per city |
| WebSocket connections | `websocket-manager.ts` | `Map<string, WSConnection>` | Unbounded | Connection lifetime | Real-time messaging |
| Push tokens | `push-notifications.ts` | `Map<string, PushToken[]>` | Unbounded | None | Push notification tokens |
| Notifications | `notifications.ts` | `Map<string, Notification[]>` | 100/member | None | In-memory notification queue |
| Prerender cache | `prerender.ts` | `Map<string, CacheEntry>` | 200 | 5 min | Pre-rendered HTML (SSR) |
| Claim evidence | `claim-verification-v2.ts` | `Map<string, ClaimEvidence>` | Unbounded | None | Business claim verification |
| Claimed businesses | `rating-integrity.ts` | `Map<string, BusinessClaim>` | Unbounded | None | Owner block registry |
| Rate limiter | `tiered-rate-limiter.ts` | `Map<string, UsageRecord>` | 10,000 | None | Per-member/IP rate limiting |
| City health | `city-health-monitor.ts` | `Map<string, CityHealthMetrics>` | Unbounded | None | City engagement metrics |
| SSE connections | `routes.ts` | `Map<string, number>` | 5/IP | 30 min | SSE connection limits |
| Search suggestions | `search-suggestions.ts` | `Map<string, SearchSuggestion[]>` | Unbounded | None | Pre-built on startup |
| Notification frequency | `notification-frequency.ts` | `Map<string, QueuedNotification[]>` | Unbounded | None | Rate-limiting + bundling |
| Email mappings | `email-id-mapping.ts` | Bidirectional `Map<string, string>` | Bounded | None | Resend ↔ TopRanker ID mapping |
| Email A/B tests | `email-ab-testing.ts` | `Map<string, string>` | 50 experiments | None | Variant assignments |
| Push A/B tests | `push-ab-testing.ts` | `Map<string, PushNotificationExperiment>` | Bounded | None | Hash bucketing assignment |
| Outreach history | `outreach-history.ts` | `Map<string, Set<string>>` | Unbounded | None | Email outreach per template |
| System alerts | `alerting.ts` | `Alert[]` + `Map<string, number>` | 200 | None | Alerts + firing history |

---

## Patterns

### Preload on Startup
Photo hash and pHash indexes are preloaded from DB in `server/index.ts` (lines ~423-429). This means the first request after startup doesn't pay the DB query cost, but server restart requires full reload.

### No External Cache
All stores use native `Map<>`. This is intentional for the current scale (single-server, single-process). When horizontal scaling is needed, photo hash and pHash should migrate to Redis or DB-only lookups.

### Capacity Management
- **Hard limits:** Most Maps have MAX constants (e.g., reputation: 5,000, rate limiter: 10,000)
- **TTL-based:** Only city-dimension-averages and prerender use time-based expiry
- **Decay-based:** Search query tracker uses hourly 0.9x multiplicative decay
- **Unbounded:** Photo hash, pHash, WebSocket, notifications — grow with usage

### Restart Behavior
All in-memory stores reset on server restart. Photo hash and pHash are rebuilt from DB. Other stores (notifications, rate limiter, SSE) start empty — this is acceptable because:
- Notifications are non-critical (push/email are separate systems)
- Rate limiter resets are self-correcting (users get a fresh window)
- SSE connections are re-established by clients

---

## Scaling Triggers

| Trigger | Action |
|---------|--------|
| Photo count > 100K | Migrate hash/pHash to Redis |
| Concurrent users > 10K | Add Redis for session/rate-limit stores |
| Multi-server deployment | All Maps must move to shared store (Redis/DB) |
| Memory usage > 500MB | Profile and bound unbounded Maps |
