# Retrospective: Sprint 148 — Settings Notification Sync + Backend Setup Guide

**Date:** 2026-03-08
**Duration:** 1 day
**Story Points:** 13
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Sarah Nakamura:** "The jsonb approach kept the migration trivial — one column addition, no new tables, no new joins. We went from identified problem to shipped fix in a single sprint. The fire-and-forget PUT pattern on the client was a good pragmatic call — it keeps the UX snappy while ensuring eventual consistency."

**Derek Olawale:** "Having the full 6-key object sent on every toggle simplified both the client and server logic. No diff tracking, no partial merge edge cases. The test suite caught a bug early where the default values weren't being spread correctly on first mount for new accounts. That would have been a production issue."

**Jasmine Taylor:** "The SETUP.md is already paying off. I walked a new contractor through it this afternoon and they had the full stack running with real Places data in under 30 minutes. Previously that was a half-day Slack thread with at least three people involved."

**Jordan Blake:** "From a compliance perspective, this was a high-value sprint. Notification consent is one of those things auditors specifically ask about, and we went from 'preferences stored in client cache' to 'preferences durably persisted with an audit-ready schema.' Clean win."

---

## What Could Improve

- **No confirmation feedback on save.** The fire-and-forget approach means the user has no visual indication that their preference actually persisted. If the network call silently fails, the user believes they've opted out but the server still has the old value. We need at minimum a retry mechanism, ideally a subtle success indicator.

- **Community reviews deferred again.** This is the third sprint where community reviews functional improvements have been pushed. While the current implementation works with real API data, the critique keeps flagging it. We need to either close it definitively or schedule a dedicated sprint for it.

- **Test file naming convention drift.** We now have test files named by sprint number (sprint148-settings-sync.test.ts) which makes it hard to find tests by feature. Should consider reorganizing tests by domain (notifications/, settings/, admin/) rather than sprint number.

- **Setup guide coverage.** The SETUP.md covers the happy path well, but doesn't address Windows-specific issues or Docker-based development. Two team members flagged this as a gap for their local environments.

---

## Action Items

| Action | Owner | Target Sprint |
|--------|-------|---------------|
| Add retry mechanism for failed preference PUTs with exponential backoff | Derek Olawale | 149 |
| Add subtle toast/checkmark feedback on successful preference save | Priya Sharma | 149 |
| Definitively close or schedule community reviews functional work | Sarah Nakamura | 149 |
| Propose test directory reorganization by domain | Sarah Nakamura | 150 |
| Add Docker and Windows sections to SETUP.md | Jasmine Taylor | 150 |
| Verify notification preference audit trail meets GDPR Art. 7 requirements | Jordan Blake | 149 |

---

## Team Morale

**8/10** — Strong sprint. The team feels good about closing two top critique priorities in a single day. The notification sync fix in particular was satisfying because it addressed a real trust gap — users expect preferences to persist, and now they do. Minor frustration around community reviews being deferred again, but consensus is that it's lower priority than what we shipped. Energy is high heading into Sprint 149.
