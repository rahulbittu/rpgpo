# Retro 461: RatingExport Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "The extraction pattern is now battle-tested: Sprint 456 (DiscoverFilters → FilterChipsExtended), Sprint 461 (RatingExport → rating-export-utils). Both follow the same playbook: extract pure logic, keep UI component, add re-exports. This is our standard operating procedure for threshold management."

**Sarah Nakamura:** "RatingExport dropped from 98% to 53% of threshold. That's massive headroom for future features — JSON pretty-print options, additional export formats, whatever comes next. The extraction was invisible to consumers thanks to re-exports."

**Marcus Chen:** "The fact that rating-export-utils.ts has zero React dependencies means it's reusable anywhere — server-side export, CLI tools, API responses. Good separation of concerns pays dividends we haven't even discovered yet."

## What Could Improve

- **Test redirects are manual labor** — Every extraction requires updating test readFile paths. We should consider a convention that makes this easier, like a test helper that resolves to the canonical location of a function.
- **Re-export pattern adds indirection** — Consumers import from RatingExport but the code lives in rating-export-utils. New developers might be confused. Consider removing re-exports after all consumers are updated.
- **No automated threshold alerting** — We rely on audit cycles to catch threshold proximity. A CI check that warns at 90% would catch these earlier.

## Action Items

- [ ] Begin Sprint 462 (Visit-type-aware receipt prompts) — **Owner: Sarah**
- [ ] Consider automated LOC threshold CI check — **Owner: Amir**
- [ ] Evaluate re-export cleanup after 2 sprint cycles — **Owner: Sarah**

## Team Morale
**8/10** — Satisfying P0 debt payoff. The team feels good about the extraction pattern being repeatable and proven. File health is back in the green across the board.
