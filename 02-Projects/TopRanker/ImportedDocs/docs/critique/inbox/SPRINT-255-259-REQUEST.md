# External Critique Request — Sprints 255-259

Date: 2026-03-09
Requesting: External review of 5-sprint block (255-259)

## Sprint Summaries

### Sprint 255: SLT Q1 Review + Arch Audit #33
- Points: 3
- SLT-255 meeting: Quarterly review, confirmed sustained A+ audit grade
- Arch Audit #33: A+ (sustained from Audit #32)
- Roadmap 256-260 established
- 5,047 tests across 181 files

### Sprint 256: Raleigh Beta + Search Suggestions
- Points: 8
- Raleigh promoted from planned to beta via auto-gate pipeline
- Search autocomplete suggestions for new-market user activation
- isAdminEmail consolidated sweep (P1 security fix)
- Content-type byte sniffing for photo uploads
- 36 new tests

### Sprint 257: Review Helpfulness Voting
- Points: 7
- Upvote/downvote system for review helpfulness (NOTE: potential anti-requirement violation)
- Helpfulness score influences review display order
- Anti-abuse: one vote per user per review, no self-voting
- 30 new tests

### Sprint 258: Core Truth Fixes + Schema Integrity
- Points: 5
- Schema completeness enforcement: all pgTable names must appear in ARCHITECTURE.md
- Table count validation tests
- Documentation sync fixes
- 25 new tests

### Sprint 259: Redis Migration Phase 1
- Points: 8
- Redis client configuration and connection management
- Migration of velocity detection store from in-memory to Redis
- Migration of SSE connection tracking
- Fallback to in-memory on Redis unavailability
- 32 new tests

## Test Count Progression

| Sprint | Total Tests | Test Files | Delta |
|--------|------------|------------|-------|
| 255 | 5,047 | 181 | +36 |
| 256 | 5,083 | 182 | +36 |
| 257 | 5,113 | 183 | +30 |
| 258 | 5,138 | 184 | +25 |
| 259 | 5,170 | 185 | +32 |
| **Total** | **5,170** | **185** | **+159** |

## Known Contradictions / Risks

1. **Anti-requirement violation (Sprint 257):** Review helpfulness voting contradicts Part 10 of the Rating Integrity doc: "NO helpful/not-helpful upvotes — Yelp mechanic." This was flagged in SLT-265 but CEO decision is still pending.

2. **Anti-requirement violation (Sprint 253, carried):** Business responses also violate Part 10. Two active violations now in codebase.

3. **Redis migration partial:** Only velocity detection and SSE migrated. Push tokens, photo moderation queue, and other in-memory stores remain. Full migration not yet scheduled.

## Questions for External Reviewer

1. **Anti-requirement violations:** Two features (business responses, review helpfulness) directly contradict the Rating Integrity doc Part 10. The code exists but is not exposed in production UI. Should the code be removed entirely, gated behind a feature flag, or should Part 10 be formally amended? What process should govern exceptions to architectural principles?

2. **Redis migration completeness:** Only 2 of 11+ in-memory stores were migrated. Is partial migration worse than no migration (split-brain risk, inconsistent persistence guarantees)? Should the remaining stores be migrated atomically or incrementally?

3. **Schema integrity enforcement:** Sprint 258 added tests that verify all pgTable names appear in ARCHITECTURE.md. Is documentation-as-code (enforced by tests) a sustainable pattern, or does it create brittle coupling between docs and implementation?
