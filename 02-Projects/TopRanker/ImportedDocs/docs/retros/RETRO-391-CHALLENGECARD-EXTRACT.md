# Retro 391: Extract ChallengeCard from challenger.tsx

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "Largest extraction to date: -402 lines (74% reduction). The extraction pattern is so well-established now that the code change itself is routine — the cascade fixes are the bulk of the work."

**Amir Patel:** "challenger.tsx at 142 LOC is now our slimmest tab screen. It's a pure shell: fetch data, render list. All card complexity lives in ChallengeCard.tsx. This is the architecture we want for all screens."

**Marcus Chen:** "SLT-390 flagged this as P0, Audit #60 confirmed it, Sprint 391 fixed it. The governance cycle works — identify, prioritize, execute. No file stays at 95% for more than one sprint."

## What Could Improve

- **4-file test cascade** — Still manageable but cascade surface area keeps growing. We should consider grouping card-level tests by component rather than by sprint.
- **ChallengeCard.tsx at 320 LOC** — It's a large extracted component. If it grows beyond 400, it may need its own sub-extraction.

## Action Items

- [ ] Monitor ChallengeCard.tsx growth — **Owner: Amir Patel**
- [ ] Consider test organization by component vs by sprint — **Owner: Sarah Nakamura (future governance)**

## Team Morale
**9/10** — Record-breaking extraction. The codebase feels lighter. Clean execution of a P0 priority.
