# Sprint 359: Business Hours Status Enhancements

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Add open/closed status dot, closing soon warning, and time-contextual status text to OpeningHoursCard

## Mission
The opening hours card showed raw hour text but gave no at-a-glance indication of whether a business was currently open, closed, or about to close. This sprint adds a status dot, closing-soon badge, and contextual status text like "Open until 9:00 PM" or "Closes in 23min".

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Two utility functions: parseTime converts '9:00 PM' to minutes since midnight, getTodayStatus determines open/closed/closing-soon from the hours string. Clean separation of parsing from display."

**Amir Patel (Architecture):** "The component accepts an optional isOpenNow prop from the API as a fallback. If the API provides it, we use it. If not, we parse from the hours text. Defense in depth."

**Marcus Chen (CTO):** "Closing soon is the most valuable addition. If a user is browsing at 8:37 PM and a restaurant closes at 9:00 PM, 'Closes in 23min' drives urgency. Real-time context that a static directory can't provide."

**Priya Sharma (QA):** "30 new tests covering time parsing (5), status detection (8), status dot (4), closing soon badge (4), isOpenNow integration (3), status text (3), and existing functionality (3). 6,619 total."

**Jordan Blake (Compliance):** "Hours data comes from Google Maps API. No user data involved. Parsing is purely client-side."

## Changes

### `components/business/OpeningHoursCard.tsx` (63→131 LOC)
- **parseTime()**: Converts "H:MM AM/PM" to minutes since midnight, handles 12 AM/PM edge cases
- **getTodayStatus()**: Returns isOpen, closingSoon, and statusText from today's hours line
- **Status dot**: Green (open) / red (closed) indicator next to "Hours" title
- **Closing soon badge**: Amber pill with clock icon when within 60 minutes of closing
- **Status text**: "Open until 9:00 PM", "Closes in 23min", "Opens at 9:00 AM", "Closed now"
- **isOpenNow prop**: Optional API override for open/closed status
- **New styles**: headerLeft, statusDot, statusDotOpen/Closed, closingSoonBadge/Text, statusText, statusTextOpen/Closed

### `app/business/[id].tsx`
- Pass `isOpenNow={business.isOpenNow}` to OpeningHoursCard

### `tests/sprint359-hours-status.test.ts` (NEW — 30 tests)
- Time parsing (5 tests)
- Status detection (8 tests)
- Status dot display (4 tests)
- Closing soon badge (4 tests)
- isOpenNow integration (3 tests)
- Status text display (3 tests)
- Existing functionality (3 tests)

## Test Results
- **272 test files, 6,619 tests, all passing** (~3.6s)
- **Server build:** 596.3kb (unchanged — client-only change)
