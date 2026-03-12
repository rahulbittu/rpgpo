# Retrospective — Sprint 349

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Clean progressive enhancement. The remove button is optional — existing SavedRow callers don't break. The /saved page can opt in when ready."

**Marcus Chen:** "Cuisine emoji consistency continues. SafeImage, PhotoStrip, DiscoverPhotoStrip, and now SavedRow all use the same cuisine-first pattern."

**Priya Sharma:** "264 test files, 6,443 tests. The test count keeps growing at a healthy rate without bloating the suite."

## What Could Improve

- **Cuisine field not yet passed at bookmark creation** — The field exists on BookmarkEntry but the bookmark creation sites in business/[id].tsx haven't been updated to pass cuisine. Need a follow-up.
- **savedTimeAgo could use Intl.RelativeTimeFormat** — The custom helper works but the Intl API would give localized output for free.
- **No animation on remove** — The remove button works but doesn't animate the row out. Consider a slide-away animation.

## Action Items
- [ ] Sprint 350: SLT Review + Arch Audit #52 (governance)
- [ ] Future: Wire cuisine into bookmark creation sites
- [ ] Future: Animate row removal with LayoutAnimation

## Team Morale: 8/10
Good polish sprint. Saved places now feel like a feature, not an afterthought.
