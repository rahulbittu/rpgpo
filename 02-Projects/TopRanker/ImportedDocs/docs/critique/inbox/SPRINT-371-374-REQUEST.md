# Critique Request: Sprints 371-374

**Date:** March 10, 2026
**Submitted by:** Marcus Chen (CTO)

## Summary
4 sprints of client-side polish and extraction: ChallengerTip component extraction, search card enhancements (Google rating, NEW badge, claimed indicator), business detail breadcrumb navigation, and admin dashboard quick links.

## Key Decisions for Review

### 1. Google Rating Comparison Display (Sprint 372)
We added a "G 4.2" indicator next to TopRanker scores on search result cards. The display is concise and guarded by null/zero checks.

**Concern:** Does showing Google ratings alongside TopRanker ratings help or hurt? Could it undermine confidence in TopRanker's scoring if users see divergence?

### 2. NEW Badge for Low-Rating Businesses (Sprint 372)
Businesses with 1-4 ratings get a "NEW" badge. It disappears naturally as ratings accumulate.

**Concern:** Is the <5 threshold appropriate? Is the badge needed at all, or does the rating count already communicate newness?

### 3. MappedBusiness Type Extensions (Sprint 372)
Added `googleRating?: number` and `isClaimed?: boolean` to MappedBusiness type but the server doesn't populate them yet.

**Concern:** Adding type fields before the backend wires them up creates zombie types. Is this premature?

### 4. Breadcrumb Category Navigation (Sprint 373)
Breadcrumb category link navigates to search with `{ category: business.category }` param. But the search screen may not read this param for pre-filtering.

**Concern:** Is this a dead link? Does the search screen handle the category param?

### 5. Admin Quick Links as Static Cards (Sprint 374)
Quick links show Moderation Queue and Admin Home as static cards without live counts.

**Concern:** Should the moderation link show pending item count? Or is that over-engineering for 2 links?

## Files Changed
- `components/search/SubComponents.tsx` — Google rating, NEW badge, claimed badge
- `types/business.ts` — googleRating, isClaimed fields
- `app/business/[id].tsx` — Breadcrumb navigation
- `app/admin/dashboard.tsx` — Quick links section
- `components/challenger/ChallengerTip.tsx` — Extracted tip component (Sprint 371)
- `app/(tabs)/challenger.tsx` — Uses extracted ChallengerTip

## Metrics
- 283 test files, 6,874 tests (all passing)
- Server build: 599.3kb (unchanged)
- Arch Audit #57: Grade A (33rd consecutive)
