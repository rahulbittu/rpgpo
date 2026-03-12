# Sprint 496: Wire Claim V2 to Admin Routes

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Wire the claim-verification-v2 module (Sprint 494) into admin routes, completing the full claim V2 pipeline: document upload → evidence scoring → admin dashboard access. This closes the gap identified in SLT-495 roadmap.

## Team Discussion

**Marcus Chen (CTO):** "This is the final wiring step for claim V2. The module was built in Sprint 494, the admin routes existed from Sprint 238 — now they're connected. Clean integration pattern: import functions, add endpoints, validate inputs."

**Rachel Wei (CFO):** "Automated claim scoring reduces admin review burden. At scale, the difference between manual review for every claim vs auto-approve at 70+ is significant labor savings. This has direct cost implications."

**Amir Patel (Architect):** "Good input sanitization on the document endpoint — String().slice() for text fields, Number() for fileSize. The routes file stays under 150 LOC even with 9 total endpoints. No extraction needed."

**Sarah Nakamura (Lead Eng):** "Four new endpoints, all following existing patterns. The document upload validates required fields, the scoring endpoint requires businessName and claimantName while making address/phone optional. Evidence retrieval handles 404 for missing claims."

**Nadia Kaur (Cybersecurity):** "Input length limits on fileName (200 chars) and fileType (50 chars) prevent oversized metadata. The Number() cast on fileSize prevents string injection. These are appropriate for an admin-only surface."

**Jordan Blake (Compliance):** "Auto-approve logging is critical for audit trail. The score endpoint logs both the numeric score and auto-approve decision. If we ever need to review why a claim was auto-approved, the logs capture it."

## Changes

### Modified: `server/routes-admin-claims-verification.ts` (55 → 105 LOC)
- Added imports from `claim-verification-v2.ts`: addDocumentToEvidence, scoreClaimEvidence, getClaimEvidence, getAllEvidence
- `POST /api/admin/claims/:id/document` — upload document metadata with validation and sanitization
- `POST /api/admin/claims/:id/score` — score claim evidence against business data with required/optional fields
- `GET /api/admin/claims/:id/evidence` — retrieve evidence for specific claim (404 if missing)
- `GET /api/admin/claims/evidence/all` — retrieve all evidence records for admin dashboard

### New: `__tests__/sprint496-claim-v2-wiring.test.ts` (22 tests)
- V2 endpoint registration (document, score, evidence, evidence/all)
- Input validation and sanitization checks
- V1 endpoint retention verification
- Module export verification
- File health thresholds

## API Surface

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/admin/claims/:id/document` | Upload document metadata |
| POST | `/api/admin/claims/:id/score` | Score claim evidence |
| GET | `/api/admin/claims/:id/evidence` | Get evidence for claim |
| GET | `/api/admin/claims/evidence/all` | Get all evidence records |

## Test Coverage
- 22 new tests, all passing
- Full suite: 9,162 tests across 385 files, all passing in ~5.0s
- Server build: 664.0kb
