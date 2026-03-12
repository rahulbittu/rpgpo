# Retro 572: Rating Photo Gallery Grid

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "The gallery reuses the PhotoCarouselModal from Sprint 563 — zero new modal code. The 3-column grid with SafeImage tiles is the standard photo grid pattern. Receipt badges add visual trust signals."

**Rachel Wei:** "Rating photos are now the most visible user content on a business page. Before, you had to expand individual reviews. Now they're in a dedicated gallery section above the business photo gallery."

**Amir Patel:** "The Promise.all pattern for fetching rating photos is bounded by hasPhoto filter — typically <10 ratings have photos per business. The 5-minute stale time prevents excessive API calls."

## What Could Improve

- **N+1 photo fetching** — Each rating with photos triggers a separate API call. Could add a batch endpoint `/api/businesses/:id/rating-photos` that returns all rating photos in one query.
- **No lazy loading for photos** — All 9 (maxVisible) photos load at once. Could use IntersectionObserver pattern for progressive loading.
- **business/[id].tsx at 579 LOC** — Growing steadily. May need extraction of the photo-related sections in a future sprint.

## Action Items

- [ ] Sprint 573: Tier progress notification — **Owner: Sarah**
- [ ] Consider batch rating photos endpoint (future) — **Owner: Amir**
- [ ] Monitor business/[id].tsx LOC growth — **Owner: Sarah**

## Team Morale
**9/10** — Second feature sprint after the extraction. Rating photos are a high-visibility improvement that makes the product feel more authentic. The reuse of PhotoCarouselModal is satisfying.
