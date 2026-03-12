# External Critique Request — Sprints 230-234

Date: 2026-03-09
Requesting: External review of 5-sprint block (230-234)

## Sprint Summaries

### Sprint 230: SLT Mid-Year Review + Audit #28
- Points: 3
- SLT backlog meeting covering Sprints 226-229
- Architecture Audit #28: Grade A, 0 Critical, 0 High, 2 Medium, 2 Low
- Backlog prioritization for Sprints 231-235
- 4,222 tests across 159 files

### Sprint 231: City Engagement Dashboard + DB Outreach History
- Points: 8
- Per-city engagement metrics: signup count, rating count, active users
- Migrated outreach history from in-memory Map to PostgreSQL table via Drizzle
- Outreach history API endpoint with pagination
- 42 new tests

### Sprint 232: Email ID Mapping + Admin Experiment UI
- Points: 5
- Map Resend email_id to internal tracking IDs for end-to-end correlation
- Admin A/B experiment management UI: create, monitor, declare winners
- Experiment results dashboard with confidence intervals
- 30 new tests

### Sprint 233: City Promotion Auto-Gate + Password Fix
- Points: 5
- Automated beta-to-active promotion based on engagement thresholds (configurable per city)
- Password validation fix: minimum 8 characters (up from 6)
- Promotion criteria: minimum signups, minimum ratings, minimum active days
- 28 new tests

### Sprint 234: Memphis + Nashville Expansion
- Points: 13 (largest in block)
- 10 Memphis businesses seeded (BBQ, blues, Beale Street, Cooper-Young)
- 10 Nashville businesses seeded (hot chicken, Broadway, East Nashville, 12South)
- City config entries for Memphis (planned) and Nashville (planned)
- Expansion pipeline module: seed → planned → beta → active lifecycle tracking
- 40+ new tests

## Test Count Progression

| Sprint | Total Tests | Test Files | Delta |
|--------|------------|------------|-------|
| 230 | 4,222 | 159 | +0 (process sprint) |
| 231 | 4,264 | 160 | +42 |
| 232 | 4,294 | 161 | +30 |
| 233 | 4,322 | 162 | +28 |
| 234 | 4,394 | 164 | +72 |
| **Total** | **4,394** | **164** | **+172** |

## City Expansion Timeline

| Sprint | Event |
|--------|-------|
| Sprint 218 | OKC seeded + beta |
| Sprint 229 | NOLA seeded + beta |
| Sprint 233 | Auto-gate promotion criteria built |
| Sprint 234 | Memphis + Nashville seeded (planned status) |
| Sprint 237 (planned) | Memphis beta promotion |

Total: 9 cities across 4 states (TX, OK, LA, TN)

## Key Modules Added (Sprints 230-234)

- `server/city-engagement.ts` — Per-city engagement metrics
- `server/outreach-history.ts` — DB-backed outreach history (replaced in-memory)
- `server/email-id-mapping.ts` — Resend email_id to internal tracking correlation
- `server/admin-experiments.ts` — Admin A/B experiment management
- `server/city-promotion-gate.ts` — Automated beta-to-active promotion
- `server/expansion-pipeline.ts` — City lifecycle stage tracking
- `server/seed-cities.ts` — Memphis + Nashville seed data

## Retro Summaries

- Sprint 230: Morale 8/10. SLT meeting productive. Audit grade A confirmed.
- Sprint 231: Morale 8/10. DB migration of outreach history resolved persistent audit finding.
- Sprint 232: Morale 8/10. Admin experiment UI gives marketing self-serve capability.
- Sprint 233: Morale 8/10. Auto-gate removes subjective promotion decisions.
- Sprint 234: Morale 8/10. Tennessee expansion validated repeatable city launch pattern.

## Audit #29 Summary (Sprint 235)

- Grade: A (6th consecutive A-range)
- 0 Critical, 0 High, 0 Medium, 4 Low
- Key Low findings: `as any` casts (accepted), no DB backup cron (blocked on Railway), no CDN (blocked on deployment), in-memory stores for email tracking/A/B (acceptable at scale)
- Outreach history in-memory store: RESOLVED (migrated to DB in Sprint 231)

## Open Action Items from Retros

1. Create city seed scaffolding script (Cole Anderson, Sprint 236)
2. Design Drizzle schema for expansion pipeline persistence (Amir Patel, Sprint 238)
3. Extract city count to shared constant (Sarah Nakamura, Sprint 235 — may carry forward)
4. Draft Nashville market entry messaging (Jasmine Taylor, Sprint 236)
5. Define lightweight monthly async SLT check-in format (Marcus Chen, Sprint 236)
6. Tennessee competitive landscape analysis (Jasmine Taylor, Sprint 237)
7. Rate limit dashboard design spec (Sarah Nakamura, Sprint 236)

## Changed Files (Sprints 230-234)

- server/city-engagement.ts (new)
- server/outreach-history.ts (modified — migrated to DB)
- server/email-id-mapping.ts (new)
- server/admin-experiments.ts (new)
- server/city-promotion-gate.ts (new)
- server/expansion-pipeline.ts (new)
- server/seed-cities.ts (modified — Memphis + Nashville)
- server/routes.ts (modified — new endpoints)
- shared/city-config.ts (modified — Memphis + Nashville entries)
- components/AdminExperiments.tsx (new)
- components/CityEngagement.tsx (new)
- tests/sprint231-city-engagement-db-outreach.test.ts (new)
- tests/sprint232-email-id-mapping-admin-experiments.test.ts (new)
- tests/sprint233-city-promotion-password-fix.test.ts (new)
- tests/sprint234-memphis-nashville-expansion.test.ts (new)

## Known Contradictions / Risks

1. **In-memory stores still active** — Email tracking and A/B testing stores reset on server restart. Outreach history was fixed, but 2 stores remain. Acceptable at current scale but accumulating tech debt.
2. **Expansion pipeline is in-memory** — The new lifecycle tracking module uses an in-memory store. Drizzle migration planned for Sprint 238 but not yet built.
3. **No competitive analysis for Tennessee** — Memphis and Nashville seeded without market research. We don't know who else ranks restaurants in these cities.
4. **Auto-gate thresholds are configurable but untested in production** — Promotion criteria exist but no city has actually been auto-promoted yet. First real test will be OKC or NOLA.
5. **Admin experiment UI has no access control** — Any authenticated user can theoretically access admin endpoints. Role-based access control is not yet implemented.
6. **CDN and DB backup findings carried forward for 3+ audits** — Both blocked on Railway migration. No escalation trigger defined.
7. **Email module proliferation** — 7+ email files in server/ root. Consolidation to server/email/ is P3 and keeps getting deferred.

## Proposed Next Sprint (236)

- Rate limit dashboard: admin visibility into per-endpoint rate limiting
- Abuse detection alerts: automated pattern recognition for suspicious activity
- Memphis outreach campaign launch
- Points: 8
- Rationale: As city count grows, abuse detection becomes critical. Rate limiting infrastructure exists but has no admin visibility.

## Questions for External Reviewer

1. The auto-gate promotion criteria (Sprint 233) are untested in production. Should we add integration tests that simulate the full promotion flow, or is unit testing sufficient?
2. In-memory stores keep appearing as audit findings. We resolved one (outreach history → DB) but added another (expansion pipeline). Is this pattern of "build in-memory first, migrate later" sound, or are we accumulating risk?
3. The expansion pipeline module tracks city lifecycle but the promotion auto-gate is a separate module. Should these be unified into a single city lifecycle service?
4. With 9 cities, the seed data approach (10 curated businesses per city) is manageable. At 25+ cities, is this sustainable, or do we need an automated discovery pipeline?
5. The admin experiment UI has no role-based access control. How urgent is this given our current user base? Should it block the business claim verification workflow in Sprint 238?
