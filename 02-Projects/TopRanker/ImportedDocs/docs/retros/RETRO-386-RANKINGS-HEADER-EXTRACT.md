# Retro 386: Rankings ListHeader Extraction

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "The biggest extraction we've done — 153 lines out of index.tsx. It went from 95% to 70% of threshold. That's the power of proactive extraction before it becomes an emergency."

**Sarah Nakamura:** "7 test files needed updates, but the pattern is well-established. Each fix was the same: add a readFile for the new component, redirect the assertion. Took about 5 minutes total."

**Marcus Chen:** "SLT-385 identified this as P0 and we delivered it first. Good prioritization discipline."

## What Could Improve

- **14 props on RankingsListHeader** — while all simple types, this is the most props we've put on an extracted component. Consider grouping related props into a config object in a future refactor.
- **Test cascade of 7 files** is our highest. The dependency map idea from Retro 383 is even more needed now.

## Action Items

- [ ] Create test dependency map for index.tsx, search.tsx, profile.tsx — **Owner: Sarah Nakamura**
- [ ] Consider props grouping for RankingsListHeader in future sprint — **Owner: Amir Patel**

## Team Morale
**9/10** — Major code health win. index.tsx was the biggest risk in the codebase and now has the most headroom. Team confidence in the extraction pattern is high.
