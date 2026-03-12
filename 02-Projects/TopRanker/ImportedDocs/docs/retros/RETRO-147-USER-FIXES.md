# Sprint 147 Retrospective — User-Reported Bug Fixes

**Date:** 2026-03-08
**Duration:** 1 sprint
**Story Points:** 8
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Derek Okafor (Frontend Engineering):**
> "We knocked out three user-visible bugs in a single sprint — search suggestions, challenger community reviews, and the profile tier UI. These were all items real users flagged, and fixing them in one pass shows the team is listening. The turnaround from report to fix was tight."

**Priya Sharma (QA / Testing):**
> "Every fix shipped with regression coverage. We validated each change against the original bug reports and confirmed no side effects on adjacent screens. The test suite stayed green throughout, which tells me our testing discipline from earlier sprints is paying off."

**Marcus Chen (CTO):**
> "Sprint 146's critique gave us an 8/10 and told us to prioritize user-visible improvements — that is exactly what we did. Choosing to dedicate an entire sprint to bug fixes instead of new features was the right call. Users notice when things break, and they notice when things get fixed. This builds trust."

---

## What Could Improve

- **Settings screens still unaddressed.** Multiple team members have flagged that the settings flow (notification preferences, account management, theme toggles) needs a design and functionality pass. It keeps getting deferred in favor of higher-priority items, but the gap is growing.
- **Real Google data not yet configured.** We are still running on mock/seed data for maps and place details. Until we wire up live Google Places API keys and handle quota/billing, the Discover tab will feel like a demo rather than a product. This blocks any meaningful external beta testing.
- **Bug triage process is informal.** User-reported bugs came in through ad-hoc channels this sprint. We need a structured intake — a shared board or form — so nothing slips through and priority is transparent to the whole team.

---

## Action Items

| Action | Owner | Target Sprint |
|--------|-------|---------------|
| Design audit of settings screens (notifications, account, theme) | Derek Okafor | Sprint 148 |
| Configure Google Places API keys and quota monitoring for staging | Amir Patel | Sprint 148 |
| Set up structured bug intake board with severity labels | Sarah Nakamura | Sprint 148 |
| Validate all three fixes with original bug reporters for sign-off | Priya Sharma | Sprint 148 |
| Evaluate remaining user-reported issues and rank for Sprint 149 | Marcus Chen | Sprint 148 |

---

## Team Morale

**8/10** — The team feels good about this sprint. Dedicating a full cycle to user-reported bugs was energizing because the impact is immediate and visible. The 8/10 score from the Sprint 146 critique validated that we are on the right track. The slight dip from a perfect score comes from the lingering settings and Google data gaps — the team knows those need attention soon to maintain momentum heading into external testing.
