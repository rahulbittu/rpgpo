# Sprint 513: Claim Evidence PostgreSQL Persistence

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Persist claim verification evidence to PostgreSQL, replacing the in-memory-only Map from Sprint 494. Evidence now survives server restarts and deploys. Uses dual-write pattern: in-memory cache for speed, PostgreSQL for durability.

## Team Discussion

**Marcus Chen (CTO):** "This was the #1 medium-priority finding from Audit #60. Claim evidence in a Map meant every deploy wiped admin review data. Now it's in PostgreSQL with a proper schema — claimId foreign key, jsonb documents, boolean match fields, integer score."

**Rachel Wei (CFO):** "For production claim volume, we need evidence persistence. An admin reviewing a claim today should see evidence uploaded yesterday, even if the server restarted. This is a production readiness requirement."

**Amir Patel (Architect):** "Dual-write pattern: claim-verification-v2.ts writes to both in-memory Map and PostgreSQL (fire-and-forget). Admin routes read in-memory first, fall back to DB. When we're ready, we can drop the Map entirely and go DB-only."

**Sarah Nakamura (Lead Eng):** "New claimEvidence table with unique constraint on claimId + upsert pattern via onConflictDoUpdate. The storage module follows the badges.ts pattern — clean CRUD with drizzle-orm."

**Jordan Blake (Compliance):** "Persisted evidence is a compliance requirement. We need to show auditors what verification checks were run for each claim. In-memory data that vanishes isn't an audit trail."

**Nadia Kaur (Security):** "The jsonb documents field stores metadata only (fileName, fileType, fileSize) — not file contents. Actual documents live in S3/Cloudinary. No PII stored in the evidence table beyond what's already in businessClaims."

## Changes

### Modified: `shared/schema.ts`
- Added `claimEvidence` pgTable with: id, claimId (FK → businessClaims), documents (jsonb), businessNameMatch, addressMatch, phoneMatch, verificationScore, autoApproved, reviewNotes (jsonb), scoredAt
- Unique constraint on claimId, index on claimId
- Table count: 32 → 33 (ARCHITECTURE.md updated)

### New: `server/storage/claim-evidences.ts` (108 LOC)
- getClaimEvidenceByClaimId() — single evidence lookup
- getAllClaimEvidence() — admin dashboard listing
- upsertClaimEvidence() — create or update with onConflictDoUpdate
- addDocumentToClaimEvidence() — append document to jsonb array
- getClaimEvidenceCount() — health check

### Modified: `server/claim-verification-v2.ts` (211→221 LOC)
- Added import: upsertClaimEvidence, dbAddDocument from storage
- addDocumentToEvidence: dual-write to Map + PostgreSQL (fire-and-forget)
- scoreClaimEvidence: dual-write scored evidence to Map + PostgreSQL

### Modified: `server/routes-admin-claims-verification.ts` (106→118 LOC)
- Added import: dbGetEvidence, dbGetAllEvidence from storage
- GET /evidence/:id — in-memory first, DB fallback
- GET /evidence/all — merge in-memory + DB (in-memory takes precedence)

### Modified: `docs/ARCHITECTURE.md`
- Updated table count: 32 → 33 Tables
- Added claim_evidence to schema listing

### Modified: existing tests
- sprint336: updated "32 Tables" → "33 Tables"
- sprint266: updated "32 Tables" → "33 Tables"

### New: `__tests__/sprint513-claim-evidence-persistence.test.ts` (23 tests)

## Test Coverage
- 23 new tests, all passing
- Full suite: 9,464 tests across 402 files, all passing in ~5.0s
- Server build: 676.3kb
