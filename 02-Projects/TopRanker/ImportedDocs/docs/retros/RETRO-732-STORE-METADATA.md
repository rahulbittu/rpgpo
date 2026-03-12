# Retrospective — Sprint 732

**Date:** 2026-03-11
**Duration:** 1 session
**Story Points:** 2
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Jasmine Taylor:** "Having all store metadata in one typed file with test validation is great. No more guessing if the subtitle is too long or if we're missing a required field."

**Derek Liu:** "The character limit tests caught that the subtitle was 35 chars — Apple's limit is 30. We trimmed it to 'Best specific thing nearby' (26 chars). Tests prevent submission failures."

**Jordan Blake:** "The AASA config is ready to deploy. When Railway serves it at /.well-known/apple-app-site-association, universal links will work end-to-end."

---

## What Could Improve

- **Screenshots don't exist yet** — we have specs and scene descriptions, but actual screenshots need to be captured from the running app. This is a manual task.
- **Privacy policy page doesn't exist** — topranker.io/privacy and /support need content. Required for App Store review.

---

## Action Items

| Action | Owner | Sprint |
|--------|-------|--------|
| Sprint 733: Rate limiting + abuse prevention | Team | 733 |
| Capture App Store screenshots | Jasmine | Operational |
| Create privacy policy + support pages | Jordan | Operational |
| Deploy AASA file | CEO | Operational |

---

## Team Morale: 9/10

Store submission metadata is complete and validated. The team appreciates having tests that enforce Apple's character limits — this prevents rejected submissions. Remaining work is operational (screenshots, privacy policy, AASA deployment).
