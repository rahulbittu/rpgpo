# External Critique Request — Sprints 235-239

Date: 2026-03-09
Requesting: External review of 5-sprint block (235-239)

## Sprint Summaries

### Sprint 235: SLT Q3 Review
- Points: 3
- SLT backlog meeting covering Sprints 226-234
- Backlog prioritization for Sprints 236-240
- 4,394 tests across 164 files
- Q3 review: email pipeline, city expansion, engagement dashboard

### Sprint 236: Rate Limit Dashboard + Abuse Detection
- Points: 8
- Admin rate limit dashboard: per-endpoint visibility, real-time monitoring
- Abuse detection module: pattern recognition for suspicious voting, review bombing, claim squatting
- Automated alerting for suspicious activity with configurable thresholds
- Suspicious IP flagging with hash-based anonymization
- 38 new tests

### Sprint 237: Memphis Beta Promotion + Seed Validation
- Points: 5
- Memphis promoted from planned to beta via auto-gate criteria
- Seed data completeness validator: checks coordinates, category, name, address
- Validator caught 2 incomplete Memphis entries before promotion
- City badge component updated for beta status
- 32 new tests

### Sprint 238: Business Claim Verification Workflow
- Points: 8
- Multi-step claim verification: unclaimed -> pending -> verified/rejected state machine
- HMAC-signed crypto codes (6-digit, 24-hour expiry, single-use)
- Admin approval queue for manual review of edge cases
- Claim status tracking with audit trail
- 48 new tests

### Sprint 239: Member Reputation Scoring v2
- Points: 8
- Enhanced credibility algorithm with Wilson score confidence intervals
- Time-decay weighting: older activity contributes less to reputation
- Cross-city credibility transfer: reputation earned in Houston carries weight in Dallas
- Reputation API endpoint for per-user scoring
- 43 new tests

## Test Count Progression

| Sprint | Total Tests | Test Files | Delta |
|--------|------------|------------|-------|
| 235 | 4,394 | 164 | +0 (process sprint) |
| 236 | 4,432 | 165 | +38 |
| 237 | 4,464 | 166 | +32 |
| 238 | 4,512 | 167 | +48 |
| 239 | 4,555 | 168 | +43 |
| **Total** | **4,555** | **168** | **+161** |

## Key Modules Added (Sprints 235-239)

- `server/rate-limit-dashboard.ts` — Admin rate limit visibility and monitoring
- `server/abuse-detection.ts` — Automated pattern recognition for suspicious activity
- `server/seed-validator.ts` — Completeness checks for city seed data before promotion
- `server/claim-verification.ts` — Multi-step business claim workflow with crypto codes
- `server/reputation-v2.ts` — Enhanced credibility scoring with decay and cross-city transfer

## City Expansion Timeline

| Sprint | Event |
|--------|-------|
| Sprint 218 | OKC seeded + beta |
| Sprint 229 | NOLA seeded + beta |
| Sprint 233 | Auto-gate promotion criteria built |
| Sprint 234 | Memphis + Nashville seeded (planned status) |
| Sprint 237 | Memphis promoted to beta (first auto-gated promotion) |

Total: 9 cities across 4 states (TX, OK, LA, TN)
Active: 5 (Houston, Dallas, Austin, San Antonio, Fort Worth)
Beta: 3 (OKC, New Orleans, Memphis)
Planned: 1 (Nashville)

## Retro Summaries

- Sprint 235: Morale 8/10. SLT review productive. Q3 reflection positive.
- Sprint 236: Morale 8/10. Abuse detection and rate limiting provide security confidence.
- Sprint 237: Morale 8/10. Memphis beta promotion validated the full auto-gate pipeline.
- Sprint 238: Morale 9/10. Claim verification is the most revenue-critical feature shipped.
- Sprint 239: Morale 9/10. Reputation v2 is algorithmically the most complex module built.

## Audit #30 Summary (Sprint 240)

- Grade: A (8th consecutive A-range)
- 0 Critical, 0 High, 0 Medium, 4 Low
- Low findings: `as any` casts (accepted RN), DB backup cron (blocked Railway), no CDN (headers ready), in-memory stores (5 modules, Redis planned)
- All Sprint 236-239 additions reviewed: all rated GOOD
- Test execution: <2.5s across 168 files

## Open Action Items from Retros

1. Nashville seed validation + beta promotion (Cole Anderson, Sprint 241)
2. CDN configuration setup (Sarah Nakamura, Sprint 241)
3. WebSocket notification system design (Sarah Nakamura, Sprint 241)
4. Content policy rules RFC (Jordan Blake, Sprint 241)
5. Privacy policy update for business data sharing (Jordan Blake, Sprint 242)
6. Review moderation queue spec (Amir Patel, Sprint 242)
7. Redis migration feasibility assessment (Amir Patel, Sprint 244)

## Changed Files (Sprints 235-239)

- server/rate-limit-dashboard.ts (new)
- server/abuse-detection.ts (new)
- server/seed-validator.ts (new)
- server/claim-verification.ts (new)
- server/reputation-v2.ts (new)
- server/routes.ts (modified — new endpoints for each module)
- shared/city-config.ts (modified — Memphis status updated to beta)
- components/RateLimitDashboard.tsx (new)
- components/ClaimVerification.tsx (new)
- components/ReputationBadge.tsx (new)
- tests/sprint236-rate-limit-abuse-detection.test.ts (new)
- tests/sprint237-memphis-beta-seed-validation.test.ts (new)
- tests/sprint238-claim-verification.test.ts (new)
- tests/sprint239-reputation-v2.test.ts (new)

## Known Contradictions / Risks

1. **In-memory stores grew to 5** — Added rate-limit-dashboard and reputation-v2 as in-memory stores this quarter. The "build in-memory, migrate later" pattern is accumulating. Redis migration feasibility is planned for Sprint 244 but has been deferred before.
2. **Abuse detection thresholds are default values** — Configurable but not tuned against real traffic. False positive/negative rates are unknown. Need production data to calibrate.
3. **Claim verification UX is backend-only** — The verification state machine and crypto codes work, but the full end-to-end UX flow (business owner receives code, enters it, sees confirmation) has not been user-tested.
4. **Reputation v2 decay factors are theoretical** — Time-decay curves based on literature, not empirical data from TopRanker usage patterns. May need recalibration once production data is available.
5. **Cross-city reputation transfer has no cap** — A user with high reputation in Houston gets full credit in Memphis beta. This could skew early-city ratings.
6. **CDN finding carried forward 3 audits** — Escalation threshold hit. Headers ready, infrastructure not configured. Targeted for Sprint 241.
7. **Privacy policy gap** — Business analytics dashboard (Sprint 243) requires platform-to-business data sharing language not in current policy.

## Proposed Next Sprint (241)

- Nashville beta promotion: validate seed data, promote through auto-gate
- Real-time WebSocket notification system: push notifications for claims, reviews, reputation changes
- CDN configuration: infrastructure setup (headers already in place)
- Points: 8
- Rationale: Nashville launch continues city expansion momentum. Notifications enable real-time engagement for claimed business owners. CDN resolves a 3-audit-old finding.

## Questions for External Reviewer

1. **Reputation signal weights:** Reputation v2 uses time-decay and cross-city transfer. Are the decay curves (30-day half-life for ratings, 90-day for reviews) appropriate for a restaurant/business ranking platform? Should there be category-specific decay rates?
2. **Abuse detection thresholds:** The module uses configurable thresholds (e.g., 10 votes in 5 minutes = suspicious). Without production data, these are educated guesses. What is a reasonable validation approach before going live — synthetic load testing, shadow mode, or gradual rollout?
3. **Claim verification UX completeness:** The backend state machine is solid (unclaimed -> pending -> verified/rejected), but the full owner experience (receive code via SMS, enter in web form, see dashboard) has not been end-to-end tested. Is the backend-first approach sound, or should UX testing block further development?
4. **In-memory store sustainability:** We now have 5 modules using in-memory stores. One was migrated to DB (outreach history). The pattern works at current scale but Redis migration keeps getting deferred. At what city count / traffic level does this become a real risk rather than a theoretical one?
5. **Cross-city reputation transfer:** A Houston power user gets full reputation credit in a brand-new Memphis beta city. Could this create an early-mover credibility bias that distorts rankings in new cities? Should there be a transfer cap or discount factor?
