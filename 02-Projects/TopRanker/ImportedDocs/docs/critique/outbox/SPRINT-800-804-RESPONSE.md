# SPRINT-800-804-REQUEST External Critique

## Verified wins
- Config consolidation happened in at least two concrete places:
  - `email.ts` moved `RESEND_API_KEY` to `config.resendApiKey`
  - `routes-webhooks.ts` moved `RESEND_WEBHOOK_SECRET` to `config.resendWebhookSecret`
- Observability was expanded with two explicit health additions:
  - `/api/health` now includes `sseClients` via `getClientCount()`
  - rate limiter stats now include `activeWindows + storeType`
- Health route extraction is real, not just planned:
  - `server/routes-health.ts` created
  - `routes.ts` reduced from `414` to `374` LOC
  - `9 test files` were updated, which at least proves the extraction propagated through test coverage
- Baseline quality signals remain intact after these changes:
  - `13,463` tests passing
  - build at `669.6kb` under `750kb`
  - security score `98/100`
  - audit grade `A`

## Contradictions / drift
- The stated theme includes “config consolidation,” but by your own note about `15 direct accesses remain across server/`, this is still partial and materially unfinished.
- You are centralizing env access while simultaneously asking whether to do the remaining work opportunistically. That is governance language without governance discipline. Opportunistic cleanup is how this kind of standard stays half-done.
- Observability was increased on a **public** health endpoint before the packet answers whether exposing `memory, push stats, log error counts, SSE clients, rate limiter windows, environment` is acceptable. That is implementation outrunning policy.
- `MemoryStore.windows` was changed from `private` to `readonly` for observability. That is convenience over encapsulation. `readonly` does not remove coupling to internals; it just prevents reassignment.
- The extraction improved routing structure, but your test strategy is still coupled to file layout and source strings. The fact that `9 tests broke during extraction` is evidence that the tests are validating code shape, not behavior.
- You cite a `420 LOC threshold`, but the extraction happened at `414/420 LOC`. That suggests the threshold is not actually acting as a clear rule; it is being used loosely after the file was already near the limit.

## Unclosed action items
- Finish the remaining `~15` direct `process.env` accesses under `server/`; this standard is not complete.
- Replace `MemoryStore.windows readonly` exposure with a getter/snapshot API if stats need to be public internally.
- Decide whether `/api/health` is public by design, and if so, reduce or gate fields that reveal internals.
- Replace brittle source-reading route tests with behavioral HTTP-level tests for health endpoints.
- Clarify and enforce the routing-file extraction threshold; current use is ambiguous.
- Reassess whether `environment` should be emitted on a public health surface at all.

## Core-loop focus score
**6/10**

- The sprint work is mostly platform hygiene and observability, not direct core-loop improvement.
- Some of it supports safer operation of the product loop indirectly: config centralization, route extraction, health stats.
- The work appears coherent as maintenance, but not tightly tied to user value or the primary request/response loop.
- Test breakage from file extraction shows effort is still being spent on structural coupling rather than behavior protection.
- Public health detail expansion adds operational data, but without clear access policy it risks becoming noise or liability rather than leverage.

## Top 3 priorities for next sprint
1. **Finish env/config consolidation in one bounded pass**
   - Do not spread `~15` remaining direct env accesses across “2-3 sprints” opportunistically.
   - Make one explicit cleanup sprint item and close the standard.

2. **Lock down `/api/health` exposure**
   - Split public liveness from internal diagnostics, or gate sensitive fields.
   - Review and likely remove/minimize `memory`, `log error counts`, `rate limiter windows`, and `environment` from the public surface.

3. **Stop testing source shape; test endpoint behavior**
   - Add HTTP integration tests for health routes.
   - Delete or sharply reduce string-based source-reading tests that break on harmless refactors.

**Verdict:** This packet shows real cleanup, but too much of it is half-governed: config centralization is incomplete, observability expanded before endpoint exposure policy was settled, and internals were exposed via `readonly` instead of proper APIs. The extraction was valid, but the fact that 9 tests broke proves your test suite is still policing file structure more than runtime behavior. Overall: competent maintenance work, weak closure discipline.
