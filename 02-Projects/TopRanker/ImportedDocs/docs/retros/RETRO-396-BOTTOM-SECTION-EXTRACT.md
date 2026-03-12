# Retro 396: Extract BusinessBottomSection from business/[id].tsx

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Clean extraction with a clear boundary. The rate gating logic, claim card, and links are all related to 'what can the user do next' — grouping them makes semantic sense."

**Amir Patel:** "business/[id].tsx went from 92% to 73% — well within comfort zone. This is the 7th major extraction since Sprint 377. The pattern is mature."

**Priya Sharma:** "Only 2 test cascades this time (down from 4 in Sprint 391 and 7 in Sprint 386). The test architecture is getting cleaner as we extract."

## What Could Improve

- **Alert import cleanup** — Caught the unused Alert import but should have a lint rule for this. Unused imports should be auto-detected.
- **BusinessBottomSection at 165 LOC** — Moderate size for an extracted component. If it grows, the rate button and claim card could be further separated.

## Action Items

- [ ] Consider unused import detection in CI — **Owner: Sarah Nakamura (future sprint)**
- [ ] Monitor business/[id].tsx growth — now comfortable at 73% — **Owner: Amir Patel**

## Team Morale
**8/10** — Systematic extraction continues. No file is at risk anymore.
