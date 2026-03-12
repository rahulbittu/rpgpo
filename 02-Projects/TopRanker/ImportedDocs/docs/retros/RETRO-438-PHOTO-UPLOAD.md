# Retro 438: Business Page Photo Upload Flow

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Leveraged existing infrastructure perfectly — file storage, photo moderation, admin endpoints were all already built. The new code is just the client sheet (349 LOC) and one server endpoint (51 LOC). Three states (picker → preview → success) with clean transitions."

**Nadia Kaur:** "Security was straightforward because we followed the exact pattern from rating photo upload. Auth required, MIME allowlist, size bounds, moderation gate. No new attack surface beyond what was already present."

**Marcus Chen:** "Third user-facing feature in a row (search relevance → activity timeline → photo upload). The 436-440 roadmap is delivering on Rachel's request for acquisition-driving features. Community photos create a content flywheel."

## What Could Improve

- **No multi-photo upload** — Users can only submit one photo at a time. Should consider batch upload in a future sprint.
- **No progress indicator during upload** — Just an ActivityIndicator, no percentage. For large photos on slow connections, users may think it's stuck.
- **Moderation queue is in-memory** — photo-moderation.ts uses a Map, not database. Server restart loses pending submissions. Should migrate to DB in a future sprint.
- **No caption input** — The endpoint supports captions but the UI sends empty string. Should add optional caption field.

## Action Items

- [ ] Begin Sprint 439 (Rate flow UX polish) — **Owner: Sarah**
- [ ] Plan photo-moderation DB migration for future sprint — **Owner: Amir**
- [ ] Consider multi-photo upload UX — **Owner: Priya**

## Team Morale
**9/10** — Three consecutive user-facing features. Team morale high with the balanced roadmap and visible product progress.
