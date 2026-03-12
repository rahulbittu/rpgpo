# Retrospective — Sprint 198: Mobile Native Expo Build

**Date:** 2026-03-09
**Duration:** 1 session
**Story Points:** 8
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "EAS Build pipeline is ready. Three profiles, auto-increment, OTA updates. When beta validates, we can ship native in a day."

**Amir Patel:** "The app-env module is clean — one place to check environment, one place to get API URLs. No more scattered process.env checks."

**Sarah Nakamura:** "Fixing the expo-router origin from replit.com to topranker.com is a production blocker we would have missed. Deep linking would have failed for every native user."

**Nadia Kaur:** "Permission strings are review-ready. Apple rejects apps with generic permission descriptions. Ours are specific and user-friendly."

## What Could Improve

- **No actual native build run** — config is ready but hasn't been tested with `eas build`
- **No TestFlight or Play Console** account setup yet
- **Notification icon asset** referenced but may not exist at the specified path
- **No staging API** — preview builds point to staging.topranker.com which doesn't exist yet

## Action Items

| Item | Owner | Sprint |
|------|-------|--------|
| Run test build with eas build --profile development | Amir Patel | 199 |
| Verify notification icon asset exists | Sarah Nakamura | 199 |
| Set up TestFlight account | Marcus Chen | 199 |
| Analytics dashboard + conversion tracking | Rachel Wei | 199 |
| SLT Meeting + Audit #22 preparation | All | 200 |

## Team Morale

**8/10** — Solid infrastructure sprint. The team knows native builds aren't sexy, but having the pipeline ready means we can move fast when beta feedback is positive. "Infrastructure sprints are investments — you don't feel the return until you need to ship fast." — Amir Patel
