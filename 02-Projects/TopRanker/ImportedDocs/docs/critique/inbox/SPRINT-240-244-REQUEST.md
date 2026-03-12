# External Critique Request — Sprints 240-244

Date: 2026-03-09
Requesting: External review of 5-sprint block (240-244)

## Sprint Summaries

### Sprint 240: SLT Mid-Year Review + Audit #30
- Points: 3
- SLT backlog meeting covering Sprints 236-239
- Architectural Audit #30: Grade A (8th consecutive A-range)
- Q4 roadmap defined: Nashville, moderation, analytics, ranking v2
- 4,555 tests across 168 files

### Sprint 241: Nashville Beta + Real-Time Notifications
- Points: 8
- Nashville promoted from planned to beta via auto-gate criteria
- WebSocket notification system: in-memory event store, push on claims/reviews/reputation
- Nashville seed data validated through auto-gate pipeline
- 42 new tests

### Sprint 242: Moderation Queue + Content Policy Engine
- Points: 8
- Flagged review queue with CRUD operations and decision audit trail
- Regex-based content policy engine with extensible rule set
- Admin moderation dashboard for manual review
- Privacy policy update for platform-to-business data sharing
- 44 new tests

### Sprint 243: Business Analytics Dashboard
- Points: 8
- View tracking with source attribution (search, direct, referral)
- Trend computation for claimed business owners
- Analytics API endpoints for Pro subscribers
- Aggregation functions for time-series data
- 44 new tests

### Sprint 244: Search Ranking v2 (Reputation-Weighted)
- Points: 13
- Reputation-weighted Bayesian scoring algorithm
- Confidence levels (low/medium/high) based on rating count and authority
- Boost factors: high_volume, authority_rated, recent_activity
- Admin weight tuning endpoints (3 routes)
- 38 new tests

## Test Count Progression

| Sprint | Total Tests | Test Files | Delta |
|--------|------------|------------|-------|
| 240 | 4,555 | 168 | +0 (process sprint) |
| 241 | 4,597 | 169 | +42 |
| 242 | 4,641 | 170 | +44 |
| 243 | 4,685 | 171 | +44 |
| 244 | 4,723 | 172 | +38 |
| **Total** | **4,723** | **172** | **+168** |

## Key Modules Added (Sprints 240-244)

- `server/notifications.ts` — In-memory notification system with WebSocket event push
- `server/content-policy.ts` — Regex-based content policy engine with extensible rules
- `server/moderation-queue.ts` — Flagged review CRUD queue with decision audit trail
- `server/business-analytics.ts` — View tracking, source attribution, trend aggregation
- `server/search-ranking-v2.ts` — Reputation-weighted Bayesian scoring (core differentiator)
- `server/routes-admin-ranking.ts` — Admin endpoints for ranking weight management

## Trust Pipeline Completeness

The full credibility pipeline is now operational end-to-end:

1. **Rate** — User submits rating for a business
2. **Moderate** — Content policy engine checks for violations, moderation queue flags edge cases
3. **Weight by Reputation** — Reputation v2 scores the rater's credibility (Wilson score, time-decay, cross-city transfer)
4. **Rank** — Search ranking v2 applies reputation-weighted Bayesian scoring with recency and authority boosts
5. **Display** — Search results show weighted scores with confidence levels and boost factor badges

Each link in this chain has dedicated server modules, typed interfaces, and comprehensive tests.

## Retro Summaries

- Sprint 240: Morale 8/10. SLT review productive. Roadmap clear.
- Sprint 241: Morale 8/10. Nashville promotion smooth. Notification architecture clean.
- Sprint 242: Morale 8/10. Moderation queue and content policy shipped together. Admin auth gap flagged.
- Sprint 243: Morale 8/10. Analytics dashboard enables Pro retention story. Privacy policy updated.
- Sprint 244: Morale 8/10. Ranking v2 is the algorithmic core of the product. Pure computation, clean architecture.

## Audit #31 Summary (Sprint 245)

- Grade: A (9th consecutive A-range)
- 0 Critical, 0 High, 0 Medium, 5 Low
- Low findings: `as any` casts (stable), DB backup cron (blocked), no CDN (Sprint 247), 7 in-memory stores (Redis planned), routes.ts approaching 500 LOC threshold
- All Sprint 241-244 additions reviewed: all rated GOOD
- search-ranking-v2.ts highlighted as architecturally cleanest module
- Test execution: <2.6s across 172 files

## Open Action Items from Retros

1. Admin auth sweep for all admin endpoints (Sarah + Nadia, Sprint 246)
2. CDN infrastructure configuration (Sarah, Sprint 247)
3. Redis migration hard deadline decision (Marcus + Amir, Sprint 248)
4. Ranking algorithm instrumentation for production tuning (Sarah, Sprint 247)
5. Content policy regex input length limits (Nadia, Sprint 246)
6. Email template builder design spec (Jasmine, Sprint 246)
7. Charlotte/Raleigh market research brief (Cole, Sprint 247)
8. Tiered API terms of service draft (Jordan, Sprint 247)

## Changed Files (Sprints 240-244)

- server/notifications.ts (new)
- server/content-policy.ts (new)
- server/moderation-queue.ts (new)
- server/business-analytics.ts (new)
- server/search-ranking-v2.ts (new)
- server/routes-admin-ranking.ts (new)
- server/routes.ts (modified — new endpoint registrations)
- shared/city-config.ts (modified — Nashville status updated to beta)
- components/NotificationBell.tsx (new)
- components/ModerationDashboard.tsx (new)
- components/BusinessAnalytics.tsx (new)
- components/ConfidenceBadge.tsx (new)
- tests/sprint241-nashville-notifications.test.ts (new)
- tests/sprint242-moderation-content-policy.test.ts (new)
- tests/sprint243-business-analytics.test.ts (new)
- tests/sprint244-search-ranking-v2.test.ts (new)

## Known Contradictions / Risks

1. **In-memory stores grew to 7.** Added moderation queue and business analytics as in-memory stores
   this quarter. Redis migration has been recommended since Audit #29 (Sprint 225) and deferred three
   times. The "build in-memory, migrate later" pattern is accumulating debt. SLT deferred to Sprint
   251+ unless production incident triggers escalation.

2. **Admin endpoints lack authentication.** 5+ admin endpoints (analytics, ranking weights, moderation,
   rate limit dashboard, abuse detection) have no requireAuth or admin role gates. Identified in Sprint
   242, carried forward 3 sprints. Targeted for systematic sweep in Sprint 246.

3. **Bayesian scoring parameters are theoretical.** The ranking v2 defaults (reputationWeight: 0.6,
   recencyBoost: 0.15, bayesianPrior: 3.5, bayesianStrength: 5, ratingCountFloor: 10) are based on
   literature and test data, not empirical production data. Admin tuning endpoints exist but there is
   no instrumentation to measure ranking quality against user engagement.

4. **Content policy regex engine lacks input length limits.** Extensible regex rules without input
   size caps could be vulnerable to ReDoS attacks. Low risk at current scale but should be addressed
   proactively.

5. **CDN finding carried across 4 audits.** Response headers ready since Sprint 230. Infrastructure
   not configured. Targeted for Sprint 247 (again). Needs hard commitment.

6. **Cross-city reputation transfer still uncapped.** A Houston power user with 95 reputation gets
   full weight in Nashville beta where there are only 10 businesses. This could distort early rankings
   in new cities. No transfer cap or discount factor implemented.

7. **Moderation queue is manual-only.** Content policy engine flags violations automatically, but the
   moderation queue requires manual admin review for final disposition. As city count grows, manual
   moderation will not scale. Auto-moderation with human appeal is the standard pattern.

## Proposed Next Sprint (246)

- Email template builder with live preview system
- Admin auth sweep across all unprotected admin endpoints
- Content policy regex input length limits
- Points: 8
- Rationale: Email templates enable Marketing to scale outreach without engineering. Admin auth sweep
  closes a 3-sprint security gap. Regex limits are proactive security hardening.

## Questions for External Reviewer

1. **Trust pipeline completeness:** The full pipeline — Rate, Moderate, Weight by Reputation, Rank,
   Display — is now operational. Is this architecture sound for a trust-first ranking platform? Are
   there missing links that competitors (Yelp, Google) have that we should consider (e.g., photo
   verification, business response integration, dispute resolution)?

2. **Bayesian scoring parameters:** The defaults (reputationWeight: 0.6, recencyBoost: 0.15,
   bayesianPrior: 3.5, bayesianStrength: 5) are literature-based. What is the recommended approach
   for tuning these against real user behavior? Should we implement ranking quality metrics (e.g.,
   click-through rate on top-ranked results, dwell time, bounce rate) before expanding?

3. **In-memory store sustainability:** 7 modules using in-memory stores. Redis migration has been
   recommended for 20+ sprints and deferred three times. At what point does this become a blocking
   risk rather than a theoretical concern? Is there a specific metric (concurrent users, request
   rate, data volume) that should trigger mandatory migration?

4. **Moderation automation vs manual:** The content policy engine flags violations automatically but
   moderation decisions are manual. What is the industry-standard ratio of auto-moderation to human
   review for platforms at our scale (9 cities, ~200 businesses)? Should we invest in auto-moderation
   ML models or is rules-based sufficient for the next 50 cities?

5. **Business analytics privacy considerations:** We share aggregated view data, trend data, and
   source attribution with claimed business owners. The privacy policy has been updated. Are there
   additional privacy concerns with showing business owners where their views come from (search vs
   direct vs referral)? Could source attribution data be used to identify individual users in
   low-traffic scenarios?
