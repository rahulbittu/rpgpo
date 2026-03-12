# Sprint 156 External Critique

## Verified wins
- Added targeted regression coverage for two named production failures: mock data leak and IPv4 binding. Packet claims 16 tests in `tests/sprint156-production-safety.test.ts`, which is directly aligned to prior critique.
- Wrapped 5 async handlers with `wrapAsync`, including the Stripe webhook called out as highest risk. This is concrete risk reduction on server error handling.
- Added Railway healthcheck config via `railway.toml` with `[checks.web] HTTP GET /_health`, matching a previously requested operational fix.
- Removed 2 dead dependencies from `package.json`, which is low-impact but verifiable hygiene work.
- Architectural audit was actually produced this sprint in `docs/audits/ARCH-AUDIT-156.md` instead of being deferred again.

## Contradictions / drift
- “Architectural Audit #13: Grade A” is being presented as a major win, but the packet provides no evidence that the product’s core loop improved. This is process success, not user-path success.
- Retro says “4/7 audit items closed, 1 WON'T FIX, 2 P3 tracked,” while open action items still include type cleanup and `pct()` adoption. That is progress, but also confirms the audit left real residue; the A grade should be treated cautiously.
- Test count and pass count (`2133 tests across 93 files, all passing`) is not strong evidence by itself. Given the sprint was framed around production safety, raw test volume is mostly noise.
- “DNS propagation: user action, not code” is fine as classification, but it also means one prior critique item was not actually solved by the team. It should not be counted as incorporated work beyond triage.
- “Native OAuth e2e: requires physical device, deferred” is understandable operationally, but it is still unresolved coverage on a real auth path. This remains drift from complete production-path validation.
- Morale rebound and audit cadence restoration are included in the packet, but both are peripheral to the actual ship path. That suggests some narrative padding.

## Unclosed action items
- Native Google OAuth e2e test remains open. Hardware dependency explains delay; it does not close the risk.
- P3 TypeScript cleanup for `as any` casts remains open.
- P3 `pct()` helper adoption remains open.
- The “WON'T FIX” around redundant try/catch is not fully closed from a design standpoint. If inner catches preserve intended 4xx semantics and `wrapAsync` only standardizes unexpected 5xx handling, that is justified. If both are catching the same failure modes, it is dead complexity. The packet does not provide enough evidence to prove the current split is clean.
- Audit cadence question is still open. Based on this packet alone, extending from 5 to 10 sprints would be premature; one A after prior slippage is not enough evidence of sustained stability.

## Core-loop focus score
**7/10**
- Work was tied to real production failures, which is better than generic cleanup.
- Regression tests and async error handling directly protect the live request path.
- Railway healthcheck is operationally relevant, but still infrastructure support rather than end-user flow improvement.
- Too much packet emphasis is on audit grade, morale, and aggregate test counts instead of core user journey outcomes.
- Native OAuth e2e is still missing, which leaves a meaningful auth-path blind spot.
- Remaining P3 cleanup suggests some architectural loose ends are being carried forward again.

## Top 3 priorities for next sprint
1. Close native Google OAuth e2e with actual device access or a concrete external test arrangement. Stop carrying this as an indefinite “hardware required” deferment.
2. Audit all remaining async route handlers for consistent error semantics: preserve intentional 4xx responses locally, push only unexpected failures through `wrapAsync`, and document the rule.
3. Burn down at least one of the lingering audit leftovers (`as any` reduction or `pct()` adoption) instead of letting “tracked P3” become permanent backlog wallpaper.

**Verdict:** This was a useful corrective sprint, but it is being oversold. The strongest work was the direct production-failure regression coverage and async handler hardening. The weakest part is the packaging: too much emphasis on audit grade, morale, and test totals, not enough evidence of end-to-end user-path confidence. The biggest unresolved issue is still native OAuth coverage, and extending audit cadence now would look complacent rather than earned.
