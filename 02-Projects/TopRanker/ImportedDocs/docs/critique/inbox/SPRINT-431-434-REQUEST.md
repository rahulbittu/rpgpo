# Critique Request: Sprints 431–434

**From:** Sarah Nakamura (Lead Engineer)
**Date:** 2026-03-10
**Scope:** 4 sprints, 10 story points

---

## Summary

Sprints 431–434 delivered: vote animation integration into ChallengeCard, photo gallery metadata bar with thumbnail navigation, client-side CSV export of rating history, and leaderboard SubComponents extraction (RankedCard standalone module).

Key metrics: 329 test files, 7,799 tests, 601.1kb server build, all SubComponents at OK status.

---

## Questions for External Review

### 1. Vote animation integration completeness

Sprint 428 built AnimatedVoteBar, VoteCountTicker, and VoteCelebration as standalone components. Sprint 431 wired them into ChallengeCard. The previous critique flagged 428 as dead code risk — is the integration in 431 sufficient? Specifically: VoteCelebration is imported but only triggers on vote submission. Should it also trigger on page load for recently-decided challengers?

### 2. CSV export — client-side vs server-side trade-off

Sprint 433 generates CSV entirely client-side from existing `ratingHistory` data. This avoids a new API endpoint but means:
- Export is limited to whatever data the profile endpoint returns
- Large rating histories could cause browser memory pressure
- No server-side audit trail of exports

Is client-side generation the right long-term choice, or should we plan migration to a server endpoint that streams CSV?

### 3. PhotoMetadataBar complexity vs value

Sprint 432 added a 148-LOC component for photo metadata display in the lightbox. It shows source labels (business/community/rating), uploader name, relative date, and verification badge. Is this premature polish for a feature (photo lightbox) that may not get heavy usage yet? Should the metadata bar have been simpler?

### 4. RankedCard extraction — re-export debt accumulation

Sprint 434 extracted RankedCard from leaderboard/SubComponents using the same re-export pattern as MapView in Sprint 426. We now have 2 re-exports across SubComponents files. The previous critique noted re-export indirection should have a migration plan. At what count should we force-migrate to direct imports? Is 3 the right threshold (as proposed in Audit #45)?

### 5. Profile.tsx growth trajectory

Profile.tsx went from 684→690 LOC (86.3% of 800 threshold) with the CSV export button. Over the last 10 sprints, profile has grown from ~650 to 690. At this rate (~4 LOC/sprint), it hits 720 in ~7 sprints. Should we proactively extract now, or is the current WATCH status and threshold monitoring sufficient?

---

## Deliverables for Review

- `components/challenger/ChallengeCard.tsx` (416 LOC) — animation integration
- `components/business/PhotoMetadataBar.tsx` (148 LOC) — new
- `components/profile/RatingExport.tsx` (165 LOC) — new
- `components/leaderboard/RankedCard.tsx` (321 LOC) — extracted
- `components/leaderboard/SubComponents.tsx` (313 LOC) — reduced from 609
