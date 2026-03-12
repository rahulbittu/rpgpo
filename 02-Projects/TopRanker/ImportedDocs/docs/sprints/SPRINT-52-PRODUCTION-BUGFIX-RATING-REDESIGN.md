# Sprint 52 — Production Bugfix Blitz & Rating Flow Redesign

## Mission Alignment
Trust requires working software. A broken offline banner, wrong rate gating, and a painful 6-screen rating flow are trust-destroying. This sprint fixes what's broken and redesigns the core rating experience from 6 screens down to 2 — making it possible to rate in under 10 seconds.

## CEO Feedback Session — March 7, 2026
Rahul conducted a comprehensive production review and identified critical issues:
1. "You're offline" banner always showing (no health endpoint)
2. Rate gating says 7 days, should be 3 days
3. Rating flow is 6 painful screens — should be 5-10 seconds
4. Tab dot indicator animation is off/ugly
5. Photos broken (separate pipeline issue — tracked for Pixel)
6. Google login restricted (OAuth config issue — tracked for Alex)
7. Map unavailable (tracked for Atlas)
8. Non-Dallas cities empty (tracked for data team)

## Team Discussion

### Rahul Pitta (CEO)
"Testing has to be immaculate. Without testing we can't push. The rating flow is the single most important interaction in the entire app — if a user at a restaurant can't rate in 10 seconds, we've lost them. 6 screens is insane. Fix it. And the offline banner showing when we're clearly online? That destroys confidence in our platform."

### Marcus Chen (CTO)
"The NetworkBanner was pinging topranker.com/api/health which doesn't exist. Two fixes: (1) Switch to Google's generate_204 endpoint for reliable connectivity detection. (2) Add /api/health to our own server for future use. The rate gating mismatch — server said 7 days, UI said 3 days — is exactly the kind of bug that automated testing would catch. Sage, this is your territory."

### James Park (Frontend Architect)
"Collapsed the rating from 6 steps to 2 screens. Screen 1: all three scores (Quality, Value, Service) plus Would Return — all visible at once in a scrollable view. Screen 2: optional extras (dish, note, photo) with Skip & Submit. A user can complete a rating in 4 taps + Next + Submit — under 10 seconds."

### Jordan — Chief Value Officer (NEW HIRE)
"The rating flow IS the value exchange. Every tap that doesn't serve the user is a tap that kills engagement. 6 screens meant 6 moments where the user could abandon. 2 screens means 2. But we need to go further — the confirmation screen needs to show what credibility points they earned, what tier perk they're unlocking next. That's the dopamine loop. I'm designing the full Top Judge rewards system next sprint."

### Sage — Backend Engineer #2 (NEW HIRE)
"The 7-day vs 3-day mismatch is exactly why we need tests. My first task: unit tests for rating submission, credibility calculation, and rate gating. If server/storage.ts says 3 days, the test should verify it. No more silent inconsistencies."

### Alex Volkov (Infra Architect)
"Added GET /api/health — returns {status: 'ok', ts: timestamp} with zero DB queries, zero auth. This serves three purposes: connectivity check, uptime monitoring for our status page, and load balancer health checks in production. The Google OAuth restriction is a separate config issue — we need to add the production domain to the Google Cloud Console authorized origins."

### Carlos Ruiz (QA Lead)
"Verified: NetworkBanner no longer shows false offline. Rate gating correctly blocks at 3 days. Rating flow is 2 screens — tested complete path: select 3 scores, tap Would Return, Next, Skip & Submit. Tab dot indicator is now properly centered below the icon with position: absolute. TypeScript clean."

### Nadia Kaur (Cybersecurity Lead — REACTIVATED)
"The /api/health endpoint is intentionally information-minimal. No server version, no uptime, no internal state. Just {status, timestamp}. This is correct — health endpoints that leak server metadata are a recon target. I'll be auditing all public endpoints next sprint."

## Changes
- `components/NetworkBanner.tsx` (MODIFIED): Switch from hardcoded topranker.com/api/health to Google's generate_204 endpoint for reliable connectivity detection
- `server/routes.ts` (MODIFIED):
  - Added GET /api/health endpoint (lightest possible — no DB, no auth)
  - Fixed rate gating error message from "7+ days" to "3+ days"
- `server/storage.ts` (MODIFIED): Fixed rate gating from 7 days to 3 days (matching UI promise)
- `app/rate/[id].tsx` (MODIFIED — MAJOR): Collapsed 6-step rating flow to 2 screens
  - Screen 1: All 3 scores + Would Return visible at once (scrollable)
  - Screen 2: Optional extras (dish, note, photo) + summary + Submit
  - "Skip & Submit" button on Screen 2 for fastest path
  - Compact yes/no buttons (row layout, smaller padding)
  - ScrollView for content overflow
- `app/(tabs)/_layout.tsx` (MODIFIED): Fixed tab indicator dot positioning
  - Removed shadow effects causing visual offset
  - Used position: absolute with bottom: -4 for precise centering
  - Reduced dot size from 5px to 4px for subtlety

## Employee Performance

| Employee | Role | Contribution | Rating |
|----------|------|-------------|--------|
| James Park | Frontend Architect | Rating flow collapse 6→2, ScrollView migration | A+ |
| Marcus Chen | CTO | NetworkBanner fix architecture, health endpoint spec | A |
| Alex Volkov | Infra Architect | /api/health endpoint, OAuth diagnosis | A |
| Jordan (CVO) | Chief Value Officer | Rating UX philosophy, value exchange analysis | A |
| Sage | Backend Engineer #2 | Rate gating fix, testing strategy | A |
| Nadia Kaur | Cybersecurity Lead | Health endpoint security review | A |
| Carlos Ruiz | QA Lead | Full regression testing across all fixes | A+ |

## Sprint Velocity
- **Story Points Completed**: 13
- **Files Modified**: 5
- **Lines Changed**: ~350
- **Time to Complete**: 0.5 days
- **Blockers**: Google OAuth needs production domain in Cloud Console; photos need CDN pipeline; non-Dallas cities need data seeding
