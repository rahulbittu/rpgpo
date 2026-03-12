# Retrospective — Sprint 278
**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Nadia Kaur:** "Clean security hardening. Integer enforcement, required fields, HTML stripping — these are the basics that prevent whole categories of bugs. The Zod transform for HTML stripping is particularly elegant."

**Sarah Nakamura:** "Removing the `as any` cast felt good. Every time we remove a cast, we're saying 'the types are now correct.' visitType flowing through the schema properly is how it should have been from Sprint 261."

**Amir Patel:** "The note limit bump from 160 to 2000 was overdue. 160 chars is a tweet — our rating system should allow substantive feedback while still having a reasonable cap."

## What Could Improve

- **HTML stripping regex is basic**: A proper library like DOMPurify or sanitize-html would be more thorough. The regex `/<[^>]*>/g` misses edge cases like malformed tags.
- **No rate limiting on note content**: A user could submit 2000 chars of unicode or emoji spam. Content quality checks are not in scope for V1 but should be considered.
- **visitType breaking change not communicated**: If there are any API consumers (future mobile app, third-party), making visitType required would break them. Should document the API change.

## Action Items
- [ ] Sprint 279: Admin eligibility dashboard — Marcus
- [ ] DOMPurify or sanitize-html for note content — backlog
- [ ] API changelog / versioning strategy — backlog

## Team Morale: 9/10
Security hardening sprints are unglamorous but essential. The rating submission pipeline now rejects a wider range of invalid inputs at the schema level. Combined with the integrity checks (owner block, velocity detection, anomaly detection), the submission flow is well-defended.
