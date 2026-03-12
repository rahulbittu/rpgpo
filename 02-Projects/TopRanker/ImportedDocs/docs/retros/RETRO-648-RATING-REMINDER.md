# Retro 648: Rating Reminder Push Notification

**Date:** 2026-03-11
**Duration:** 10 min
**Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well
- **Jasmine Taylor:** "Copy is warm and creates FOMO without being aggressive. 'Your neighborhood misses you' is perfect."
- **Sarah Nakamura:** "Followed existing scheduler patterns exactly. Zero new infrastructure — just a new trigger + scheduler."
- **Rachel Wei:** "Cheapest growth mechanic we have. Push notifications to existing users cost nothing and drive real ratings."
- **Nadia Kaur:** "Clean from a security perspective. No PII in push payload, server-side preference check."

## What Could Improve
- The N+1 query (checking each user's recent ratings individually) won't scale past ~5K users. Should batch into a single query.
- Could A/B test the reminder copy — the dripReminder template in client lib has slightly different text.
- Should cap reminders to max 1 per 7 days per user (currently the scheduler runs daily — a user could get reminded daily if they don't rate).

## Action Items
- [ ] Add deduplication: track last reminder sent per user, skip if within 7 days (Owner: Sarah)
- [ ] Batch-optimize the recent ratings query when scale requires it (Owner: Amir)
- [ ] A/B test reminder copy variants (Owner: Jasmine)

## Team Morale
8/10 — Growth-aligned sprint. Server-side feature, no UI changes. Clean execution.
