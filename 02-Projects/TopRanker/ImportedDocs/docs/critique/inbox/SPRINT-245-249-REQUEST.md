# External Critique Request — Sprints 245-249

Date: 2026-03-09
Requesting: External review of 5-sprint block (245-249)

## Sprint Summaries

### Sprint 245: SLT Q4 Planning
- Points: 3
- SLT backlog meeting covering Sprints 241-244
- Q4 roadmap defined: email templates, tiered rate limits, Carolinas, WebSocket v2
- 4,723 tests across 172 files

### Sprint 246: Email Template Builder + Admin Auth Sweep
- Points: 8
- Composable email template builder with live preview and versioning
- Systematic admin auth sweep: 8 endpoints gated with requireAuth + admin role
- Content policy regex input length limits (10K chars) for ReDoS prevention
- 38 new tests

### Sprint 247: API Rate Limiting Per Tier (Free/Pro/Enterprise)
- Points: 8
- Tiered rate limiter with sliding window counters, per-key tracking
- Free (100 req/hr), Pro (1,000 req/hr), Enterprise (10,000 req/hr)
- Usage tracking, quota management, overage alerts
- CDN response headers configured
- 36 new tests

### Sprint 248: Charlotte/Raleigh NC Expansion + Seed Data
- Points: 5
- Seed 10 businesses per city through auto-gate pipeline
- NC market research validated: strong independent business cultures, no dominant local platform
- Both cities in planned status, Charlotte prioritized for beta promotion
- 30 new tests

### Sprint 249: Real-Time WebSocket Notifications v2
- Points: 8
- Enhanced WebSocket event routing with presence indicators
- JWT token authentication (upgraded from session cookies)
- Push notifications for claims, reviews, reputation changes
- Delivery tracking and notification preferences
- 36 new tests

## Test Count Progression

| Sprint | Total Tests | Test Files | Delta |
|--------|------------|------------|-------|
| 245 | 4,723 | 172 | +0 (process sprint) |
| 246 | 4,761 | 173 | +38 |
| 247 | 4,797 | 174 | +36 |
| 248 | 4,827 | 175 | +30 |
| 249 | 4,863 | 176 | +36 |
| **Total** | **4,863** | **176** | **+140** |

## Key Modules Added (Sprints 245-249)

- `server/email-templates.ts` — Composable email template builder with live preview, versioning
- `server/tiered-rate-limiter.ts` — Sliding window rate limiting with free/pro/enterprise tiers, per-key tracking
- `server/websocket-manager.ts` — Enhanced WebSocket event routing, presence indicators, JWT auth
- `server/content-policy.ts` (updated) — Input length limits added for ReDoS prevention
- `server/moderation-queue.ts` (updated) — Admin auth gates added
- `server/business-analytics.ts` (updated) — Admin auth gates added

## Audit #32 Summary (Sprint 250)

- Grade: A+ (10th consecutive A-range, upgraded for Sprint 250 milestone)
- 0 Critical, 0 High, 0 Medium, 5 Low
- Low findings: `as any` casts (stable), DB backup cron (pending Railway), CDN partial (headers done, proxy pending), 9 in-memory stores (Redis committed Sprint 258-259), routes.ts ~470 LOC (500 threshold)
- All Sprint 246-249 additions reviewed: all rated GOOD
- tiered-rate-limiter.ts highlighted as particularly well-architected
- email-templates.ts praised for pure function architecture

## Retro Summaries

- Sprint 245: Morale 8/10. SLT review productive. Q4 roadmap approved.
- Sprint 246: Morale 8/10. Admin auth sweep was most impactful security work. Template builder enables Marketing independence.
- Sprint 247: Morale 8/10. Tiered rate limiter enables API monetization. CDN headers finally shipped.
- Sprint 248: Morale 8/10. Two cities seeded in one sprint. Auto-gate pipeline fully validated.
- Sprint 249: Morale 8/10. WebSocket v2 with JWT auth is a significant security upgrade.
- Sprint 250: Morale 9/10. Milestone celebration. A+ audit. Growth phase begins.

## Open Action Items from Retros

1. Expo Push notification integration (Sarah, Sprint 251)
2. Charlotte beta promotion readiness (Cole, Sprint 252)
3. Business response system RFC (Amir, Sprint 252)
4. Photo moderation architecture (Nadia + Amir, Sprint 253)
5. Ranking quality instrumentation — CTR, dwell time (Sarah, Sprint 253)
6. Redis migration Phase 1 — 3 stores (Sarah + Amir, Sprint 258)
7. Redis migration Phase 2 — 3 stores (Sarah + Amir, Sprint 259)
8. routes.ts proactive extraction (Sarah, next endpoint addition)
9. Push notification CAN-SPAM/TCPA review (Jordan, Sprint 251)

## Changed Files (Sprints 245-249)

- server/email-templates.ts (new)
- server/tiered-rate-limiter.ts (new)
- server/websocket-manager.ts (new)
- server/content-policy.ts (modified — input length limits)
- server/moderation-queue.ts (modified — admin auth gates)
- server/business-analytics.ts (modified — admin auth gates)
- server/search-ranking-v2.ts (modified — admin auth gates)
- server/routes.ts (modified — new endpoint registrations, CDN headers)
- shared/city-config.ts (modified — Charlotte/Raleigh added as planned)
- components/EmailTemplatePreview.tsx (new)
- components/RateLimitDashboard.tsx (new)
- components/NotificationPreferences.tsx (new)
- tests/sprint246-email-templates-auth-sweep.test.ts (new)
- tests/sprint247-tiered-rate-limiter.test.ts (new)
- tests/sprint248-charlotte-raleigh-expansion.test.ts (new)
- tests/sprint249-websocket-v2.test.ts (new)

## Known Contradictions / Risks

1. **In-memory stores grew to 9.** Added tiered-rate-limiter and websocket-manager as in-memory stores. Redis migration has been recommended since Audit #29 (Sprint 225) and deferred four times. Committed for Sprint 258-259 but the pattern of deferral is a process concern. The SLT has declared no more deferrals.

2. **Email template XSS risk.** The template builder allows composable HTML generation with variable interpolation. If business names, review content, or user data are injected without sanitization, the resulting emails could contain XSS vectors. Templates are rendered server-side and sent as email HTML — email clients have limited JS execution, but some vectors (CSS injection, link manipulation) remain viable.

3. **Tiered rate limit enforcement gaps.** The rate limiter uses sliding window counters with per-key tracking. Edge cases to consider: (a) key rotation — if a user creates multiple API keys, can they multiply their quota? (b) burst handling — the configurable burst allowance could be exploited if set too generously. (c) tier upgrade mid-window — does the higher limit apply immediately or at the next window boundary?

4. **WebSocket scaling limitations.** The websocket-manager uses in-memory connection tracking. In a multi-instance deployment (which Redis migration would enable), WebSocket connections are pinned to specific instances. A pub/sub layer (Redis Pub/Sub or dedicated message broker) would be needed for cross-instance event delivery. This is not addressed in the current architecture.

5. **NC expansion prioritization.** Charlotte is prioritized over Raleigh for beta promotion based on metro size. However, Raleigh's Research Triangle tech community may have higher per-capita engagement with a trust-first platform. Should we instrument engagement metrics from the planned phase to validate the prioritization order before committing?

6. **Bayesian scoring still unvalidated empirically.** The ranking v2 parameters (reputationWeight: 0.6, recencyBoost: 0.15, bayesianPrior: 3.5, bayesianStrength: 5) are literature-based defaults. Six sprints post-launch with no production instrumentation to measure ranking quality. Click-through and dwell-time metrics are planned for Sprint 253 but this gap is growing.

7. **CDN deployment still incomplete.** Response headers shipped in Sprint 247 but no CDN proxy layer in front of Express. This finding has been carried across 6 audits. The Railway migration is the planned resolution but it continues to slip.

## Proposed Next Sprint (251)

- Push notification integration using Expo Push
- Expo push tokens, notification preferences, delivery tracking
- CAN-SPAM/TCPA compliance review for push channel
- Points: 8
- Rationale: Mobile engagement beyond in-app notifications is critical for user retention as the platform scales to 11+ cities. Push is the standard engagement channel for mobile-first platforms.

## Questions for External Reviewer

1. **Email template XSS vectors:** The template builder uses server-side HTML generation with variable interpolation for business names, review content, and user data. What sanitization approach is recommended for email HTML templates? Should we implement a strict allowlist of HTML elements and attributes, or is context-aware output encoding sufficient? Are there email-client-specific attack vectors (CSS injection, link manipulation) that differ from web XSS prevention?

2. **Tiered rate limit enforcement gaps:** The sliding window rate limiter tracks usage per API key. Three edge cases concern us: (a) multiple API keys per user as a quota multiplier, (b) burst allowance exploitation, (c) mid-window tier upgrade behavior. What is the industry-standard approach for preventing quota multiplication through key rotation? Should we track limits per user rather than per key?

3. **WebSocket scaling beyond single instance:** The websocket-manager uses in-memory connection tracking. Redis migration is planned for Sprint 258-259 but does not include a pub/sub layer for cross-instance WebSocket event delivery. Should Redis Pub/Sub be sufficient, or should we plan for a dedicated message broker (RabbitMQ, NATS)? At what connection count does in-memory WebSocket management become a production risk?

4. **NC expansion prioritization methodology:** Charlotte is prioritized over Raleigh based on metro population. Is there a more data-driven approach to city prioritization? Should we instrument engagement metrics during the planned phase (before beta promotion) to validate prioritization order? Are there market characteristics beyond population that predict platform-market fit for a trust-first ranking product?

5. **Sprint 250 process maturity:** 250 sprints with consistent documentation (sprint docs, retros, audits, SLT meetings, external critique). 10 consecutive A-range architecture audits. 4,863 tests. From an external perspective, what process improvements would differentiate a mature startup engineering organization from where we are now? What are we missing that companies like Stripe, Linear, or Figma do at this stage?
