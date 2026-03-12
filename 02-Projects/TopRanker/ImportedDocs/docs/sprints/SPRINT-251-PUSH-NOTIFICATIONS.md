# Sprint 251 — Push Notification Integration (Expo Push)

**Date**: 2026-03-09
**Theme**: Push Notification Infrastructure
**Story Points**: 5
**Tests Added**: 36

---

## Mission Alignment

Push notifications are the real-time trust signal delivery mechanism. When a business's credibility score changes, when a challenger vote flips a ranking, when a member earns a new tier — they need to know immediately, not when they happen to open the app. This sprint builds the server-side push notification infrastructure using Expo Push, giving TopRanker the ability to reach members on iOS, Android, and web with timely, trust-relevant notifications.

---

## Team Discussion

**Marcus Chen (CTO)**: "Push notifications are the engagement multiplier. Every trust platform lives or dies on reactivation — if members only see ranking changes when they open the app, we lose the 'aha' moment when their vote actually moved a ranking. Expo Push is the right call because we are already Expo-native. The server module handles token registration, message dispatch, and delivery tracking. Sarah, walk us through the architecture."

**Sarah Nakamura (Lead Eng)**: "The implementation is a clean server-side module: `push-notifications.ts` handles token storage, message queuing, and the Expo Push API integration. In development we simulate delivery; in production the module calls the Expo Push endpoint. Routes live in `routes-push.ts` with five endpoints — three member-facing for token management, two admin-facing for stats and broadcast. The admin broadcast endpoint enables city-specific announcements, which Cole will need for Charlotte and Raleigh launch notifications. 36 tests cover static analysis, runtime behavior, route structure, and integration wiring."

**Amir Patel (Architecture)**: "I need to flag the elephant in the room. This is in-memory store number ten. At Audit #32, I committed that no new in-memory stores would be added and that Sprint 258-259 would handle the Redis migration. We are adding one here because the push token store has the same lifecycle characteristics as the existing notification and session stores — it can be reconstructed from client re-registration on restart. But this is the last one. When the Redis migration lands, push tokens are in the first batch. I want that documented in the sprint doc and the retro."

**Nadia Kaur (Security)**: "Push notification security has three attack surfaces: token harvesting, notification spoofing, and broadcast abuse. Token registration requires authentication — no anonymous token storage. The admin broadcast endpoint requires admin role verification, not just authentication. I reviewed the route handlers and the auth gates are correct. The one item I want to add in a follow-up sprint is push token rotation — tokens should expire after 90 days of inactivity and members should be prompted to re-register. That prevents stale token accumulation and reduces the blast radius of a compromised token."

**Cole Anderson (City Growth)**: "The broadcast endpoint is exactly what I need for city launches. When Charlotte goes live, I want to push a notification to every member in the Charlotte metro area: 'TopRanker is now live in Charlotte — rate your favorite restaurants.' That requires a member-by-city query that feeds into the broadcast endpoint. The plumbing is in place now. I will spec the city-targeted broadcast in Sprint 253."

**Jasmine Taylor (Marketing)**: "Push notifications are the highest-engagement channel we will have. Email open rates are 18-24%. Push notification tap rates are 4-8% but the immediacy is what matters — a push that says 'Your vote moved Pecan Lodge to #1 in Dallas BBQ' creates an emotional connection that no email can match. I want to design notification copy templates that tie every push back to the member's personal impact on rankings. The infrastructure Sarah built gives me the delivery mechanism; now I need the content strategy."

---

## Changes

### New Files

| File | LOC | Purpose |
|------|-----|---------|
| `server/push-notifications.ts` | ~120 | Push notification service — token management, message dispatch, stats |
| `server/routes-push.ts` | ~105 | Five REST endpoints for token CRUD, admin stats, and broadcast |
| `tests/sprint251-push-notifications.test.ts` | ~200 | 36 tests across 4 groups |

### Modified Files

| File | Change |
|------|--------|
| `server/routes.ts` | Import and register `registerPushRoutes` |

### Architecture

```
Client (Expo)
  ├── POST /api/push/register    → registerPushToken()
  ├── DELETE /api/push/token     → removePushToken()
  └── GET /api/push/tokens       → getMemberTokens()

Admin Dashboard
  ├── GET /api/admin/push/stats      → getPushStats()
  └── POST /api/admin/push/broadcast → sendBulkPush()

Internal (triggered by events)
  └── sendPushNotification(memberId, title, body, data)
      └── Expo Push API (production) / simulated (dev)
```

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/push/register` | Member | Register device push token |
| DELETE | `/api/push/token` | Member | Remove a push token |
| GET | `/api/push/tokens` | Member | List member's registered tokens |
| GET | `/api/admin/push/stats` | Admin | Push notification statistics |
| POST | `/api/admin/push/broadcast` | Admin | Send bulk push to member list |

---

## Test Summary

| Group | Tests | Description |
|-------|-------|-------------|
| Push notifications static | 10 | File exists, exports, MAX_MESSAGES, logger usage |
| Push notifications runtime | 14 | Token CRUD, send/fail, bulk, stats, clear, dedup |
| Push routes static | 8 | Endpoints, auth middleware, route structure |
| Integration | 4 | Wiring in routes.ts, module importability |
| **Total** | **36** | |

---

## PRD Gap Status

- **Push notifications**: Infrastructure complete. Expo Push API integration ready for production wiring.
- **In-memory store count**: Now 10. Redis migration at Sprint 258-259 will address.
- **Token rotation**: Identified as follow-up — 90-day expiry policy per Nadia's security review.
- **City-targeted broadcast**: API ready, city-member query needed (Sprint 253).
