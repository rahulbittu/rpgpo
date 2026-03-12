# Retro 656: Extract API Mapping Functions

**Date:** 2026-03-11
**Duration:** 10 min
**Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well
- **Amir Patel:** "77-line extraction. api.ts drops from 560 to 483 LOC — from 98% to 85% ceiling. Good headroom for the next batch of API endpoints."
- **Sarah Nakamura:** "Five structural tests needed updates but the pattern is consistent: point to api-mappers.ts for mapping checks, keep api.ts for interface checks."
- **Marcus Chen:** "The extraction pattern is proven: Sprint 651 (useSearchActions), Sprint 656 (api-mappers). Both follow the same re-export approach."

## What Could Improve
- Should lower the ceiling from 490 to a tighter bound now that we have headroom.
- Consider if api-mappers.ts should also be tracked in thresholds.json.
- The re-export pattern adds a layer of indirection — monitor if this causes import confusion.

## Action Items
- [ ] Track api-mappers.ts in thresholds.json at 100 LOC ceiling (Owner: Amir)
- [ ] Consider lowering api.ts ceiling from 490 to 500 as buffer (Owner: Sarah)

## Team Morale
7/10 — Tech debt cleanup sprints are necessary but not exciting. The team is focused on clearing audit findings.
