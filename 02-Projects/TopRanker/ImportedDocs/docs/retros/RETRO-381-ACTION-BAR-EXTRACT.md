# Retro 381: Extract BusinessActionBar

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "The extraction was surgical — 82 lines out, clean props interface, no behavioral changes. Test cascade was predictable: sprint337 needed redirect, sprint144 needed export list update."

**Amir Patel:** "BusinessActionBar is genuinely self-contained. Unlike some extractions that still need parent callbacks, this one owns all its handlers. The simplest kind of extraction."

**Priya Sharma:** "The barrel export pattern in SubComponents.tsx is mature now — 17 component exports. Adding one more was trivial."

## What Could Improve

- **Test cascade awareness:** Two test files broke (sprint337, sprint144) because they checked file contents by path. We should document which tests are path-sensitive when doing extractions.
- **LOC tracking could be automated:** Currently we manually check line counts in audits. A CI check would catch threshold approaches earlier.

## Action Items

- [ ] Document path-sensitive tests in a tracking file — **Owner: Sarah Nakamura**
- [ ] Investigate automated LOC threshold checks — **Owner: Amir Patel**

## Team Morale
**8/10** — Clean extraction, predictable test fixes, healthy code health trajectory. The proactive extraction pattern from Sprint 377 continues to pay off.
