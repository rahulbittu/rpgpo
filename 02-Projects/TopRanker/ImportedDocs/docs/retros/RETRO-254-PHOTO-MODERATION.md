# Retrospective — Sprint 254: Photo Moderation Pipeline

**Date:** 2026-03-09
**Duration:** 1 sprint
**Story Points:** 13
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Sarah Nakamura (Lead Engineer):** "The module came together cleanly because we followed the exact same pattern as business-responses -- tagged logger, in-memory Map, clearX() for test isolation, thin route layer. 40 tests with zero flakiness. The typed rejection reasons were a good call from Jordan -- structured data from day one instead of free-text we would have to parse later."

**Nadia Kaur (Cybersecurity):** "The MIME allowlist approach is the right security posture -- deny by default, allow only known-safe types. No SVG means no XSS vector through photo uploads. The 10MB cap is reasonable for mobile uploads. I flagged the content-type byte sniffing gap, but the allowlist alone blocks the most common attack vectors."

**Amir Patel (Architecture):** "The pending-to-approved/rejected state machine has no backward transitions, which makes reasoning about the data straightforward. The route file is 66 lines with zero business logic -- exactly how HTTP layers should look. When we migrate to persistent storage, the interface stays identical."

**Jasmine Taylor (Marketing):** "Having rejection reasons like low_quality and irrelevant gives us data to build submission guidelines. We can tell users exactly what gets rejected and why, which improves submission quality over time. This is the infrastructure Marketing needs for user-generated content campaigns."

---

## What Could Improve

- Admin photo endpoints still lack isAdminEmail verification -- this is now a recurring action item across three sprints (252, 253, 254). Needs a consolidated sweep.
- No content-type byte sniffing yet. The MIME type in the submission is declared by the client, not verified server-side. A malicious user could declare image/jpeg but upload a different file type.
- The 3000-entry eviction cap is low for a photo moderation queue. In production with active users, we could hit this quickly. Persistent storage migration should be prioritized.
- No user notification when their photo is approved or rejected. Users submit into a void with no feedback loop.

---

## Action Items

| Action | Owner | Target Sprint |
|--------|-------|---------------|
| Consolidated isAdminEmail sweep across all admin routes | Nadia Kaur | 255 |
| Add content-type byte sniffing for upload validation | Cole Anderson | 256 |
| Build frontend photo upload UI for business pages | Sarah Nakamura | 257 |
| Add user notification on photo approval/rejection | Cole Anderson | 257 |
| Evaluate persistent storage for photo submissions | Amir Patel | 258 |
| Build admin photo review dashboard UI | Sarah Nakamura | 259 |

---

## Team Morale: 8/10

Clean sprint with well-defined scope. The team appreciates that the photo moderation infrastructure was built with moderation-first rather than bolted on after launch. The recurring isAdminEmail gap is a minor frustration -- three sprints in a row with it as an action item. The consolidated sweep in Sprint 255 should close it for good. Overall energy is high heading into the frontend upload work.
