# Sprint 197-200 Critique Request — Beta Hardening to Public Launch Planning

**Date:** 2026-03-09
**Sprints:** 197, 198, 199, 200

## Sprint Summaries

**Sprint 197 (Beta Hardening):** Fixed password validation mismatch (client 6→8 chars + digit), hid demo credentials behind __DEV__, consolidated updateMemberStats (4→3 parallel queries), added beta_invites tracking table with admin stats endpoint. 38 new tests.

**Sprint 198 (Mobile Native):** Created eas.json with 3 build profiles (dev/preview/production), updated app.json for production (origin fix, permissions, notification/location/image-picker plugins, deep links for /join), added app-env module for environment detection, added build/submit npm scripts. 48 new tests.

**Sprint 199 (Analytics Dashboard):** Added 5 beta conversion event types, time-series analytics (hourly/daily bucketing), active user tracking in requireAuth middleware, beta conversion funnel endpoint, 4 new admin analytics endpoints. 35 new tests.

**Sprint 200 (SLT + Audit):** Governance sprint. SLT meeting with Sprint 196-199 review, architecture audit #22 (grade A maintained), public launch timeline targeting Sprint 210, Sprint 201-205 roadmap.

## Audit Summary (Sprint 200)

Grade: A (maintained from #21). 0 CRITICAL, 0 HIGH, 0 MEDIUM, 3 LOW.
- L1: In-memory analytics don't survive restarts (new)
- L2: No automated DB backup schedule (carried)
- L3: No CDN deployed (carried)
- `as any` reduced: 108 → 46

## Test Results

3,417 tests across 130 files, all passing in ~2s. 161 new tests in 4 sprints.

## Changed Files

**Sprint 197:** app/auth/signup.tsx, app/auth/login.tsx, server/storage/members.ts, server/storage/beta-invites.ts (NEW), server/storage/index.ts, server/routes-admin.ts, server/routes-auth.ts, shared/schema.ts

**Sprint 198:** eas.json (NEW), app.json, package.json, lib/app-env.ts (NEW), .gitignore

**Sprint 199:** server/analytics.ts, server/routes-admin.ts, server/middleware.ts

**Sprint 200:** docs/meetings/SLT-BACKLOG-200.md, docs/audits/ARCH-AUDIT-200.md, sprint docs + retros

## Known Concerns

1. In-memory analytics is the biggest operational gap — server restart = data loss
2. No staging environment still — testing against production
3. EAS Build configured but never actually run
4. Active user map grows unbounded (no TTL cleanup)
5. Beta funnel events not yet tracked client-side (only server-side)

## Proposed Next Sprint (201)

Send wave 1 invites (25 users), connect analytics to PostgreSQL, monitor first 48 hours, schedule DB backup cron.

## Questions for Critique

1. Is the transition from GO decision (Sprint 195) to actual invite sending (Sprint 201) too slow? We built infrastructure for 6 sprints before sending invites.
2. The analytics in-memory pattern — is it acceptable for a 25-user beta or should we prioritize DB persistence before invites?
3. Are we over-engineering the native build pipeline (Sprint 198) before validating web-first beta?
4. The `as any` drop from 108→46 — is this real improvement or did we just delete code?
5. What's the biggest risk to the public launch timeline at Sprint 210?
