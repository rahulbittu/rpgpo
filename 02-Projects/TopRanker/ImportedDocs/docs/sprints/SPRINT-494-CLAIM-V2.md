# Sprint 494: Business Claim Flow V2

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Build claim verification V2 with document metadata tracking, automated scoring, and auto-approve for high-confidence matches. Extends Sprint 238's claim-verification.ts without modifying the existing flow.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "New pure module claim-verification-v2.ts. Handles document metadata tracking, cross-reference scoring against business data, and auto-approve at 70+ score. The existing claim-verification.ts is unchanged — V2 operates alongside it."

**Amir Patel (Architect):** "The scoring model is weighted: document upload (25), business name match (30), address match (20), phone match (15), multiple documents (10). Max 100. Auto-approve at 70 means name match + document alone (55) isn't enough — you need at least one more signal."

**Jordan Blake (Compliance):** "Good that auto-approve requires multiple signals. A single document isn't enough for ownership verification. The address or phone cross-reference adds a second factor. Review notes create an audit trail."

**Marcus Chen (CTO):** "This is the foundation for reducing manual claim review. High-confidence claims (70+) auto-approve, saving admin time. Low-confidence claims still go to manual review via the existing admin claims route."

**Nadia Kaur (Cybersecurity):** "The fuzzy business name match (Levenshtein distance <= 3) is appropriately lenient — handles 'Paradise Indian Restaurant' vs 'Paradise Indian'. Address and phone normalization strip formatting before comparison. No PII stored in the evidence — just match flags."

**Victoria Ashworth (Legal):** "Document types are well-scoped: business_license, utility_bill, tax_document, lease_agreement, other. We should eventually require at least one government-issued document for full verification, but this is acceptable for MVP."

## Changes

### New: `server/claim-verification-v2.ts` (~195 LOC)
- `DocumentMetadata` interface: fileName, fileType, fileSize, uploadedAt, documentType (5 variants)
- `ClaimEvidence` interface: documents, match flags, verificationScore, autoApproved, reviewNotes
- `computeVerificationScore(...)` — weighted score from 5 signals
- `shouldAutoApprove(score)` — threshold at 70
- `addDocumentToEvidence(claimId, document)` — track upload metadata
- `scoreClaimEvidence(claimId, businessName, ...)` — cross-reference and score
- `getClaimEvidence(claimId)` / `getAllEvidence()` — retrieval
- Utilities: normalizeAddress, normalizePhone, levenshteinSimilar

### New: `__tests__/sprint494-claim-v2.test.ts` (21 tests)
- Module structure: interfaces, exports, types
- Scoring: weights, cap, threshold, auto-approve logic
- Document tracking: add, create, push
- Cross-reference: name match, address, phone, review notes

## Test Coverage
- 21 new tests, all passing
- Full suite: 9,122 tests across 383 files, all passing in ~5.0s
- Server build: 658.1kb (module tree-shaken — not yet imported from routes)
