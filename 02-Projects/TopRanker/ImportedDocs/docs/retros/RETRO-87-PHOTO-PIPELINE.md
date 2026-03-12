# Sprint 87 Retrospective — Google Places Photo Pipeline

**Date:** 2026-03-08
**Duration:** 1 session
**Story Points:** 13
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Marcus Chen:** "The pipeline architecture is elegant — fetch refs → store in DB → serve via proxy. No new infrastructure. The proxy endpoint from Sprint 83 just works with the new data flow."

**Priya Sharma:** "On-demand fetching in the business detail route is the smart move. We don't need a batch job or cron. First visitor triggers the fetch, everyone after gets cached DB rows. Self-healing data."

**Kai Nakamura:** "The `resolvePhotoUrl` function is a one-liner that bridges server-stored Places references to client-renderable URLs. Every component — SafeImage, PhotoMosaic, PhotoStrip — benefits without any changes to them."

**Sarah Nakamura:** "Test coverage jumped from 244 to 265 tests. The photo pipeline tests cover URL resolution, reference validation, and all endpoint contracts. Still under 500ms total."

---

## What Could Improve

- **No live verification yet** — we need to trigger the admin fetch-photos endpoint against real Google Places data to confirm the API response shape matches our parser
- **Photo staleness** — no mechanism to refresh photos after initial fetch (business remodels, seasonal changes)
- **Rate limiting on Places API** — if 50 businesses need photos at once, we make 50 sequential API calls; could batch or throttle
- **Missing photo upload UI** — business owners who claim their listing can't upload custom photos yet

---

## Action Items

| # | Action | Owner | Target |
|---|--------|-------|--------|
| 1 | Test admin fetch-photos against live Places API in staging | Marcus Chen | Sprint 88 |
| 2 | Add photo TTL — re-fetch if photos older than 90 days | Priya Sharma | Sprint 89 |
| 3 | Add rate limiting/throttling to batch photo fetch | Liam O'Brien | Sprint 88 |
| 4 | Design business photo upload UI for claimed businesses | Kai Nakamura | Sprint 89 |

---

## Team Morale: 8.5/10

High confidence. The photo pipeline was the last major UX gap — now every screen can show real restaurant photos. The architecture is clean, security is solid (API key server-side, SSRF validation), and the test suite keeps growing. Team is energized to see real photos flowing through the app.
