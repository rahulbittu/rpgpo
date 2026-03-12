# Retro 453: Business Detail Hours Display

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Minimal change, maximum impact. The server already had computeOpenStatus — we just weren't calling it on the single-business endpoint. Three lines of server code + three new props on the card = consistent hours display across search and detail views."

**Amir Patel:** "Good fallback pattern in OpeningHoursCard. The effectiveStatusText prefers server data but gracefully degrades to client-side parsing when the server doesn't return hours data. No breaking changes for businesses without openingHours."

**Priya Sharma:** "The OpeningHoursCard LOC stayed reasonable at 280. The new logic is all in a single useMemo hook — clean and testable. The existing WeekOverviewDots, duration display, and expanding hours list are untouched."

## What Could Improve

- **No timezone display** — The card doesn't indicate that hours are in Central Time. Could confuse users in other time zones browsing Dallas businesses.
- **No real-time refresh** — Hours status is computed at API call time. If a user keeps the page open past closing time, the status won't update without a refresh.
- **OpeningHoursCard at 280 LOC** — Growing but still under any threshold. Monitor.

## Action Items

- [ ] Begin Sprint 454 (Rating history export improvements) — **Owner: Sarah**
- [ ] Consider timezone display for multi-city users in Sprint 456 — **Owner: Priya**
- [ ] Evaluate periodic refresh for hours status in Sprint 457 — **Owner: Amir**

## Team Morale
**8/10** — Clean consistency fix. The search→detail hours gap was a subtle bug that would have eroded trust. Fixed with minimal code changes and good reuse of existing infrastructure.
