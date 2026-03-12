# Retrospective — Sprint 716

**Date:** 2026-03-11
**Duration:** 1 session
**Story Points:** 2
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Sarah Nakamura:** "Privacy manifest was a genuine gap. Apple would have rejected the build without it. Good catch."

**Derek Liu:** "Pre-submission script makes the process repeatable. No more guessing whether config is correct."

**Marcus Chen:** "Explicit placeholder in eas.json is better than a silent string that looks real but isn't. Makes the blocker visible."

---

## What Could Improve

- **Still no numeric App ID** — CEO hasn't created the app in App Store Connect yet. Script will show red until this happens.
- **No automated CI submission** — pre-submit script runs locally only. Future improvement: GitHub Actions workflow.

---

## Action Items

| Action | Owner | Due |
|--------|-------|-----|
| Create app in App Store Connect | CEO | 2026-03-14 |
| Get numeric App ID → update eas.json | CEO | 2026-03-14 |
| Sprint 717: Crash analytics integration | Derek | 717 |

---

## Team Morale: 8/10

Good productivity. The team is focused on removing submission friction rather than adding features. The right mindset for launch.
