# Critique Request: Sprints 391-394

**Date:** 2026-03-09
**Requesting Team:** TopRanker Engineering
**Sprints Covered:** 391-394
**Test Count:** 299 files, 7,203 tests

---

## Sprint 391: ChallengeCard Extraction

Extracted ChallengeCard from `app/(tabs)/challenger.tsx` into `components/challenger/ChallengeCard.tsx`. 544 → 142 LOC (74% reduction). Largest single extraction in project history. 4 test cascade files updated.

**Questions for review:**
1. ChallengeCard.tsx is 320 LOC — is that too large for an extracted component?
2. Should we establish a max size guideline for extracted components?

## Sprint 392: Search Relevance Scoring

Wired Sprint 347's textRelevance + profileCompleteness functions into the search endpoint. Results re-sorted by relevance when a query is present. Added "Relevant" sort chip (visible only with active query).

**Questions for review:**
1. The relevance formula (text 0.6 + completeness 0.2 + score 0.2) — are these weights right?
2. Server re-sorts after DB fetch (up to 20 results). Should we move relevance into the SQL query?
3. Is it a UX improvement to auto-switch to "Relevant" sort when a query is entered?

## Sprint 393: Profile Achievements

Added AchievementsSection component with 13 milestones across 4 categories: rating volume, exploration, tier progression, engagement. Computed from existing profile data.

**Questions for review:**
1. 13 milestones — too many? Should we cap the visible count?
2. Milestones are hardcoded — should they be server-driven for tunability?
3. No celebration animation on unlock — is this a missed opportunity?

## Sprint 394: Claim Verification Improvements

Enhanced claim form: business email, website URL, preferred verification method (email/phone/document). Server packs new fields into pipe-separated verificationMethod string.

**Questions for review:**
1. We're stuffing multiple fields into one text column. Should we add dedicated columns?
2. The verification method selector promises things we don't deliver yet (email codes, document uploads). Is this misleading?
3. Should we validate that business email domain matches website domain as an anti-fraud signal?
