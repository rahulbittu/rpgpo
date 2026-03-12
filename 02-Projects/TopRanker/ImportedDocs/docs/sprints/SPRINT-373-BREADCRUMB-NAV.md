# Sprint 373: Business Detail Breadcrumb Navigation

**Date:** March 10, 2026
**Story Points:** 2
**Focus:** Add breadcrumb navigation to business detail screen for wayfinding

## Mission
Business detail pages lacked navigation context. Users couldn't easily navigate back to the category listing or Rankings. This sprint adds a breadcrumb trail (Rankings > Category > Business Name) between the hero carousel and business name card, with tap-to-navigate on interactive segments.

## Team Discussion

**Amir Patel (Architecture):** "24 lines of JSX, 12 lines of styles. The breadcrumb uses getCategoryDisplay for consistent category labels. The category link passes the category param to the search screen for pre-filtered results."

**Sarah Nakamura (Lead Eng):** "The breadcrumb sits right below the hero carousel — natural eye flow. Rankings links to home, category links to search with filter, business name is non-interactive (you're already there). flexShrink on the name handles long restaurant names gracefully."

**Priya Sharma (QA):** "16 tests covering structure, accessibility (link roles, labels), styles, and placement ordering. 282 test files, 6,855 tests, all passing."

**Marcus Chen (CTO):** "Breadcrumbs are table stakes for SEO and usability. When we add web indexing, the breadcrumb structure maps directly to structured data markup. Good foundation."

**Jordan Blake (Compliance):** "The breadcrumb improves WCAG navigation. Each interactive segment has accessibilityRole='link' and descriptive labels. This contributes to our accessibility compliance story."

## Changes

### `app/business/[id].tsx` (565→589 LOC, +24 lines)
- Added breadcrumb row between HeroCarousel and BusinessNameCard
- Rankings (→ home), Category (→ search with category filter), Business Name (current, non-interactive)
- Uses chevron-forward separators, amber link color, tertiary text for current
- 3 new styles: `breadcrumb`, `breadcrumbLink`, `breadcrumbCurrent`
- Imported `getCategoryDisplay` from brand constants

### Test updates
- `tests/sprint373-breadcrumb-nav.test.ts` (NEW — 16 tests)

## Test Results
- **282 test files, 6,855 tests, all passing** (~3.7s)
- **Server build:** 599.3kb (unchanged)
