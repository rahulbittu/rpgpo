# Retrospective — Sprint 721

**Date:** 2026-03-11
**Duration:** 1 session
**Story Points:** 2
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Nadia Kaur:** "External critique caught the privacy manifest gap before Apple did. That's exactly why we have the critique process — automated self-review misses compliance details that a second pair of eyes catches."

**Sarah Nakamura:** "The ErrorUtils mount guard is a 4-line fix that prevents a class of bugs that would have been nearly impossible to debug in production. StrictMode double-mount + hot reload would have eventually triggered handler chain corruption."

**Derek Liu:** "Device model was a 2-line addition with outsized value. When the first beta user reports a bug, we'll have their exact hardware model in the report."

---

## What Could Improve

- **Privacy manifest reasons could be more thoroughly audited** — we used the most common reason codes, but some Expo packages might use APIs for different reasons. Worth a deeper audit if Apple requests additional justification.
- **expo-device adds a small runtime dependency** — acceptable for beta, but should verify it doesn't increase the iOS binary size significantly.

---

## Action Items

| Action | Owner | Sprint |
|--------|-------|--------|
| Sprint 722: Reduced motion + app lifecycle analytics | Team | 722 |
| Verify expo-device doesn't significantly increase iOS binary | Derek | Pre-submit |
| Deep audit privacy manifest reason codes if Apple rejects | Nadia | If needed |

---

## Team Morale: 9/10

Critique-driven development feels productive and targeted. Every change in this sprint had a clear "because external review said so" justification. Zero speculative work.
