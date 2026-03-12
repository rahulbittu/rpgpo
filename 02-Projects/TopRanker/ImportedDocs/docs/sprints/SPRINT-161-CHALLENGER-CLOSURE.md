# Sprint 161: Challenger Closure Batch Job

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Server-authoritative challenger winner determination

---

## Mission Alignment
Challengers are trust battles. When one ends, the winner must be determined by the server — not the client. This closes the architectural gap where winner determination was client-side only.

---

## Team Discussion

**Amir Patel (Architecture):** "Client-side winner determination was a trust violation. A modified client could claim victory. Now the server closes challenges hourly and persists the winner authoritatively."

**Marcus Chen (CTO):** "The batch job pattern is right — no need for real-time closure. Challenges run for days; an hour of latency is fine."

**Sarah Nakamura (Lead Eng):** "Initial sweep on startup catches any challenges that expired while the server was down. Hourly interval handles ongoing operations. Cleanup on shutdown prevents leaked intervals."

**Rachel Wei (CFO):** "Challenger ($99) is our first revenue product. Authoritative winner determination is mandatory for paid challenges."

---

## Changes

### Challenger Closure Batch Job
- **File:** `server/storage/challengers.ts:84-130`
- New `closeExpiredChallenges()` function:
  - Queries active challenges past endDate
  - Compares challenger vs defender weighted votes
  - Higher votes = winner; tie = draw (winnerId = null)
  - Sets status to "completed", persists winnerId
  - Logs each closure with vote counts

### Server Integration
- **File:** `server/index.ts:367-371`
- Runs immediately on startup (initial sweep)
- Runs every hour via setInterval
- Cleared on graceful shutdown (SIGTERM/SIGINT)

---

## Test Results
- **2171 tests** across 97 files — all passing, 1.60s
- +11 new tests for challenger closure

---

## Architecture Note
Winner determination is now server-authoritative. The client's `<WinnerReveal>` component can trust the `winnerId` field from the API without computing it locally.
