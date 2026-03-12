# Retrospective — Sprint 772

**Date:** 2026-03-12
**Duration:** 1 session
**Story Points:** 1
**Facilitator:** Sarah Nakamura

---

## What Went Well

**Sarah Nakamura:** "Quick diagnosis — knowing og-image.png served fine from public/ but AASA didn't narrowed it to the sendFile path resolution."

**Amir Patel:** "Inline JSON is more robust than file serving for small config responses. Good pattern for other well-known endpoints."

**Derek Okonkwo:** "Unblocks universal link testing on real devices once Apple re-crawls."

---

## What Could Improve

- We should add a production smoke test that checks `/.well-known/apple-app-site-association` returns 200 with valid JSON.
- Similar pattern risk: any `sendFile()` with `process.cwd()` could break on Railway.

---

## Action Items

- [ ] Derek: Verify universal links work on device after Apple re-crawl (24-48h)
- [ ] Sarah: Audit other `sendFile()` calls for the same cwd issue

---

## Team Morale: 9/10
