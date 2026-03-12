# Retro 413: Business Detail Photo Lightbox

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Priya Sharma:** "The lightbox feels native — dark backdrop, paging scroll, contain-fit photos. The counter updates live as you swipe. Opening at the tapped photo index means zero disorientation."

**Amir Patel:** "PhotoLightbox at 153 LOC is compact and self-contained. The optional `onPhotoPress` callback means HeroCarousel and PhotoGallery are backward-compatible — no breaking changes for any existing usage."

**Sarah Nakamura:** "Zero test cascades. business/[id].tsx grew by only 18 lines to 494 LOC — well within the 650 threshold at 76%. The extraction pattern works: keep wiring in the parent, put logic in the component."

## What Could Improve

- **No pinch-to-zoom** — The lightbox uses a standard ScrollView. react-native-reanimated zoom would be ideal but adds a dependency. Consider in a future sprint if users request it.
- **contentOffset on initial render** — `contentOffset={{ x: initialIndex * SCREEN_W, y: 0 }}` may not work perfectly on all platforms. Could use `scrollTo` in a ref callback as fallback.
- **Swipe hint disappears immediately** — The "Swipe to browse" text is always visible. Could auto-fade after first swipe.

## Action Items

- [ ] Evaluate react-native-reanimated zoom for lightbox if users request pinch-to-zoom — **Owner: Amir (future)**
- [ ] Test contentOffset behavior on Android and web — **Owner: Sarah**

## Team Morale
**8/10** — Clean feature sprint. Photo lightbox is a tangible UX improvement that users will notice immediately.
