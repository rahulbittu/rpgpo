# Sprint 509: Admin Claim V2 Dashboard Integration

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Expose Claim V2 evidence data (Sprint 494) in the admin dashboard's claims tab. Admins can now see verification scores, match indicators, documents, and review notes inline with each pending claim.

## Team Discussion

**Marcus Chen (CTO):** "The claim V2 scoring system has been running server-side since Sprint 494 but admins had no visibility. Now when reviewing a claim, you see the verification score bar, which checks passed, and what documents were uploaded — all in context."

**Rachel Wei (CFO):** "This is critical for our claim review SLA. Instead of admins manually checking each verification point, the V2 score surfaces the key signals. Auto-approved claims at 70+ score can be confirmed with a glance."

**Amir Patel (Architect):** "Clean separation: ClaimEvidenceCard is a presentation component that receives evidence data. The admin dashboard fetches all evidence via useQuery and matches by claimId. Zero coupling between the V2 scoring engine and the UI."

**Sarah Nakamura (Lead Eng):** "Three integration points: ClaimEvidence types in lib/api.ts, the ClaimEvidenceCard component, and wiring in admin/index.tsx. The evidence card renders inline below each claim's QueueItem when evidence exists."

**Jordan Blake (Compliance):** "The review notes audit trail is important for our claim verification records. When we have compliance questions about why a claim was approved, the notes show exactly which cross-reference checks passed."

## Changes

### Modified: `lib/api.ts`
- Added ClaimDocumentMetadata interface (fileName, fileType, fileSize, uploadedAt, documentType)
- Added ClaimEvidence interface (claimId, documents, matches, score, autoApproved, reviewNotes)
- Added fetchClaimEvidence(claimId) function
- Added fetchAllClaimEvidence() function

### New: `components/admin/ClaimEvidenceCard.tsx` (210 LOC)
- ScoreBar: 0-100 bar with green/amber/red color thresholds
- MatchIndicator: green/red dots for business name, address, phone matches
- Document list with file names and document types
- Review notes section
- AUTO-APPROVED badge when score >= 70

### Modified: `app/admin/index.tsx`
- Added import: ClaimEvidenceCard, fetchAllClaimEvidence
- Added useQuery for admin-claim-evidence (staleTime 60s)
- Claims tab: renders ClaimEvidenceCard inline below each QueueItem when evidence exists
- Evidence matched to claims by claimId

### New: `__tests__/sprint509-claim-v2-dashboard.test.ts` (22 tests)

## Test Coverage
- 22 new tests, all passing
- Full suite: 9,383 tests across 398 files, all passing in ~5.0s
- Server build: 670.1kb
