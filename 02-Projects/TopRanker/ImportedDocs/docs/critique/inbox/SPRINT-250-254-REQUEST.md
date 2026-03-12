# External Critique Request — Sprints 250-254

Date: 2026-03-09
Requesting: External review of 5-sprint block (250-254)

## Sprint Summaries

### Sprint 250: SLT Year-End Review + Audit #32
- Points: 3
- SLT Year-End review covering Sprints 246-249
- Architecture Audit #32: A+ (10th consecutive A-range, upgraded for milestone)
- 4,863 tests across 176 files
- Sprint 250 milestone celebration and reflections

### Sprint 251: Push Notification Integration (Expo Push)
- Points: 8
- Expo Push token registration with lifecycle management (register/refresh/expire)
- Notification preferences UI with granular category controls
- Delivery tracking with success/failure/bounce metrics
- CAN-SPAM/TCPA compliance review co-authored by Security and Compliance
- 48 new tests

### Sprint 252: Charlotte Beta Promotion + City Health Monitor
- Points: 5
- Charlotte promoted from planned to beta via auto-gate pipeline
- City health monitoring module with scheduled engagement checks
- Per-city engagement metrics: activity score, review velocity, claim rate
- Alert thresholds at 80% (promotion-ready) and 50% (intervention-needed)
- 33 new tests

### Sprint 253: Business Response System
- Points: 8
- Owner reply-to-review threaded conversation model
- Abuse rate limiting: 3 responses per review per day per owner
- Notification triggers for reviewers when owner responds
- Response state machine: pending → published (with moderation hook)
- 35 new tests

### Sprint 254: Photo Moderation Pipeline
- Points: 8
- MIME allowlist: JPEG, PNG, WebP only (SVG/GIF/BMP blocked)
- Pending/approved/rejected state machine with typed rejection reasons
- Admin review queue with optional moderator notes
- 3,000-entry cap with oldest-first eviction
- 10MB file size limit, 500-char caption limit
- 40 new tests (12 static, 16 runtime, 8 route, 4 integration)

## Test Count Progression

| Sprint | Total Tests | Test Files | Delta |
|--------|------------|------------|-------|
| 250 | 4,863 | 176 | +0 (process sprint) |
| 251 | 4,911 | 177 | +48 |
| 252 | 4,944 | 178 | +33 |
| 253 | 4,979 | 179 | +35 |
| 254 | 5,011 | 180 | +40 (crossed 5,000) |
| **Total** | **5,011** | **180** | **+148** |

## Key Modules Added (Sprints 250-254)

- `server/push-notifications.ts` — Expo Push token lifecycle, registration/refresh/expiry, delivery tracking
- `server/routes-push.ts` — Push notification endpoints (register, unregister, send, preferences)
- `server/city-health-monitor.ts` — Scheduled city health checks, engagement metrics aggregation, alert thresholds
- `server/routes-admin-health.ts` — Admin health dashboard endpoints, city drill-down
- `server/business-responses.ts` — Owner reply threading, abuse rate limiting, state machine
- `server/routes-owner-responses.ts` — Auth-gated owner response CRUD, notification triggers
- `server/photo-moderation.ts` — MIME allowlist, moderation queue, typed rejection reasons, stats
- `server/routes-admin-photos.ts` — Admin photo review endpoints, public approved photos

## Audit #33 Summary (Sprint 255)

- Grade: A+ (sustained from Audit #32)
- 5,011 tests across 180 files, <2.6s execution
- 0 Critical, 0 High, 0 Medium, 5 Low
- Low findings: `as any` casts (stable/accepted), DB backup cron (deferred to Railway), no CDN proxy (deferred to Railway), 11 in-memory stores (ESCALATED — Redis committed Sprint 258-259), routes.ts ~490 LOC (monitoring for 500 threshold)
- All 8 new modules rated GOOD — 100% pattern compliance
- In-memory stores escalated after growing from 9 to 11

## Retro Summaries

- Sprint 250: Morale 9/10. Milestone celebration. A+ audit. Growth phase begins.
- Sprint 251: Morale 8/10. Push notifications required careful TCPA compliance work. Clean delivery.
- Sprint 252: Morale 8/10. Charlotte beta validated NC market. City health monitor transformative for Growth team.
- Sprint 253: Morale 8/10. Business responses needed abuse prevention design. Threaded model works well.
- Sprint 254: Morale 8/10. Photo moderation followed established patterns. isAdminEmail sweep still pending.
- Sprint 255: Morale 9/10. SLT review data-driven. Redis commitment firm. 5,000 test milestone.

## Open Action Items from Retros

1. Consolidated isAdminEmail sweep across all admin routes (Nadia, P1 Sprint 256)
2. Content-type byte sniffing for photo uploads (Cole, Sprint 256)
3. Raleigh beta promotion + NC analytics (Cole, Sprint 256)
4. Search autocomplete suggestions (Amir RFC, Sprint 256)
5. Review helpfulness voting system design (Sarah, Sprint 257)
6. Redis migration Phase 1 architecture plan (Amir, Sprint 257)
7. Redis migration Phase 1 execution (Sarah + Amir, Sprint 258)
8. Event sourcing design document (Amir + Jordan, Sprint 258)
9. Event sourcing execution (Sprint 259)
10. Proactive routes.ts split into routes-auth.ts + routes-core.ts (Sarah, Sprint 256)
11. Security action item 1-sprint SLA policy (Nadia + Marcus, Sprint 256)
12. Add in-memory store count to arch-health-check.sh (Sarah, Sprint 256)

## Changed Files (Sprints 250-254)

- server/push-notifications.ts (new)
- server/routes-push.ts (new)
- server/city-health-monitor.ts (new)
- server/routes-admin-health.ts (new)
- server/business-responses.ts (new)
- server/routes-owner-responses.ts (new)
- server/photo-moderation.ts (new)
- server/routes-admin-photos.ts (new)
- server/routes.ts (modified — push, health, response, photo route registrations)
- shared/city-config.ts (modified — Charlotte promoted to beta)
- components/NotificationPreferences.tsx (new)
- components/CityHealthDashboard.tsx (new)
- components/BusinessResponseThread.tsx (new)
- tests/sprint251-push-notifications.test.ts (new)
- tests/sprint252-charlotte-health-monitor.test.ts (new)
- tests/sprint253-business-responses.test.ts (new)
- tests/sprint254-photo-moderation.test.ts (new)
- docs/meetings/SLT-BACKLOG-255.md (new)
- docs/audits/ARCH-AUDIT-255.md (new)

## Known Contradictions / Risks

1. **In-memory stores grew from 9 to 11.** Push tokens and photo submissions are both stored in-memory. Redis migration has been recommended since Audit #29 (Sprint 225) and deferred four times. The SLT committed Sprint 258-259 as non-negotiable. The pattern of commitment-then-deferral is itself a process risk. If Sprint 258 slips, the credibility of SLT commitments is damaged.

2. **Photo moderation scaling limits.** The 3,000-entry cap with oldest-first eviction means that in a high-volume scenario, unreviewed photos are silently evicted. There is no notification to the submitter and no persistent record of the eviction. At scale (50+ cities with active photo uploads), this cap could be hit within hours. The migration to persistent storage is not yet scheduled.

3. **Business response abuse surface.** The 3-per-day rate limit prevents volume abuse, but does not address content abuse — an owner could post 3 harassing responses per day within the rate limit. Content moderation for owner responses is not yet integrated with the existing content policy engine. The moderation hook in the state machine (pending → published) exists but is not yet wired to policy checks.

4. **Push notification opt-out completeness.** Token unregistration is immediate, but there is no mechanism to verify that Expo Push has actually stopped delivering to the token. Expo's documentation notes that token invalidation can take up to 24 hours. During that window, a user who opted out could still receive notifications. The TCPA compliance review flagged this as an acceptable risk for V1 but noted it should be monitored.

5. **City health monitoring completeness.** The health monitor tracks activity score, review velocity, and claim rate. It does not track: user retention (returning users vs. one-time), review quality (average length, helpfulness), business engagement (response rate, analytics views), or churn indicators (declining activity trends). These additional signals would make promotion decisions more robust.

6. **isAdminEmail sweep carried across 3 sprints.** Admin routes for business responses and photo moderation were shipped without isAdminEmail verification on admin endpoints. The routes use requireAuth middleware but do not verify admin role. This is a privilege escalation risk — any authenticated user could access admin moderation queues. Escalated to P1 for Sprint 256.

## Proposed Next Sprint (256)

- Raleigh beta promotion via auto-gate pipeline
- Search autocomplete suggestions for new-market user activation
- isAdminEmail consolidated sweep (P1 security fix)
- Content-type byte sniffing for photo uploads
- Proactive routes.ts split
- Points: 8
- Rationale: Raleigh is the last planned city waiting for beta promotion. Search suggestions address the cold-start problem for new users in new markets. The security fixes are P1 escalations that cannot be deferred further.

## Questions for External Reviewer

1. **Photo moderation scaling:** The 3,000-entry in-memory cap with oldest-first eviction silently drops unreviewed submissions at high volume. What is the industry-standard approach for handling moderation queue overflow? Should we implement a persistent overflow queue, a priority-based eviction policy (e.g., keep submissions from high-credibility users), or simply migrate to persistent storage before scaling photo uploads? At what city count does the in-memory cap become a production risk?

2. **Business response abuse potential:** Owner responses are rate-limited to 3 per review per day but are not content-moderated. The moderation hook exists but is not wired to the content policy engine. How do platforms like Yelp and Google Maps handle owner response moderation? Is pre-publication review necessary, or is post-publication flagging with takedown sufficient? What percentage of owner responses on review platforms require moderation action?

3. **Push notification opt-out gaps:** Expo Push token invalidation can take up to 24 hours after unregistration. During that window, opted-out users may still receive notifications. Is this an acceptable V1 trade-off, or should we implement a server-side suppression list that blocks sends to recently-unregistered tokens regardless of Expo's token state? What is the regulatory risk (TCPA) of delivering notifications during the invalidation window?

4. **City health monitoring completeness:** The health monitor tracks activity score, review velocity, and claim rate. It does not track user retention, review quality, business engagement, or churn indicators. Which additional signals would most improve city promotion decisions? Is there published research on which engagement metrics best predict platform-market fit for local review/ranking products?

5. **Process maturity — SLT commitment credibility:** Redis migration has been committed and deferred four times. The SLT declared Sprint 258 as non-negotiable. From an external perspective, what organizational mechanisms prevent repeated deferral of infrastructure commitments? How do mature engineering organizations (Stripe, Linear, Figma) handle the tension between feature velocity and infrastructure debt when both have compelling business cases?
