# Retro 513: Claim Evidence PostgreSQL Persistence

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Closes the #1 medium-priority finding from Audit #60. Evidence now survives deploys. The dual-write pattern is pragmatic — keep the fast in-memory path while adding durability."

**Amir Patel:** "The storage module follows the established badges.ts pattern: clean drizzle-orm CRUD with upsert via onConflictDoUpdate. Consistent patterns across the codebase reduce cognitive load."

**Jordan Blake:** "From a compliance perspective, this moves claim evidence from volatile to durable storage. The ARCHITECTURE.md update (32 → 33 tables) and schema tests caught the documentation gap immediately."

## What Could Improve

- **No migration generated** — we defined the table in schema.ts but haven't run `drizzle-kit generate` to create the SQL migration file. This needs to happen before deploy.
- **Fire-and-forget DB writes** — if PostgreSQL is down, evidence only exists in memory. Should add a retry mechanism or at least log failures prominently.
- **No DB-to-memory hydration on startup** — if server restarts, in-memory cache is empty. Evidence reads from admin routes fall back to DB correctly, but functions like getClaimEvidence() in claim-verification-v2.ts only check the Map.

## Action Items

- [ ] Sprint 514: Notification preference granularity — **Owner: Sarah**
- [ ] Sprint 515: Governance (SLT-515 + Audit #61 + Critique) — **Owner: Sarah**
- [ ] Future: Run `drizzle-kit generate` for claim_evidence migration
- [ ] Future: Hydrate in-memory cache from DB on server startup
- [ ] Future: Add retry for failed DB writes

## Team Morale
**9/10** — Critical production readiness item completed. The automated table count test caught the ARCHITECTURE.md gap, validating the value of our test guardrails.
