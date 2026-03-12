# Sprint 148 — Settings Notification Sync + Backend Setup Guide External Critique

## Verified wins
- Notification preferences now persist server-side instead of being local-only: packet states a new `notificationPrefs` jsonb column was added and GET/PUT now read/write all 6 keys from DB.
- The settings screen now loads persisted preferences on mount and attempts to sync changes on toggle.
- Test coverage increased materially for this work: 22 new tests, 3 adjusted, with explicit mention of key matrix, edge cases, and error scenarios.
- `docs/SETUP.md` exists and includes the main backend setup path: env vars, Google Places provisioning, DB setup, seed data, dev server, troubleshooting.
- The setup guide has at least one real-world validation: a new contractor reportedly onboarded with it in under 30 minutes.

## Contradictions / drift
- Priority #1 is labeled “DONE,” but the packet also admits silent failure on save and no user confirmation. That means sync exists, but reliable save behavior is not complete from a user-trust standpoint.
- “Sync on every toggle” combined with “fire-and-forget PUT” is operationally weak: the client is pushing state changes without delivery guarantees, retry, or visible failure handling. That is implementation completion, not outcome completion.
- Priority #3 is framed as “NOT DONE,” then justified as “already functional” and “no changes were made.” That is status drift. If no work was needed, it should have been explicitly closed, not carried as a pseudo-open priority.
- The request asks whether fire-and-forget is acceptable, but the packet already documents silent failure as a known gap. That answers the question: acceptable for temporary internal testing maybe, but not actually complete for a settings persistence loop.
- “Backend Setup Guide — DONE” is overstated if Docker/Windows are known gaps. More accurate: done for the happy path used by one contractor.

## Unclosed action items
- Add save confirmation state for notification preference changes; currently users cannot tell if persistence succeeded.
- Add retry and/or failure handling for PUT failures; current behavior allows silent desync between UI and DB.
- Decide and document the canonical status of Community Reviews. Either close it as already functional with evidence, or reopen with a concrete defect list. Current status is ambiguous.
- Expand `SETUP.md` beyond the happy path if cross-platform onboarding matters; packet explicitly says Docker/Windows are not covered.
- Define whether rapid toggle changes need debouncing, request cancellation, or last-write-wins protection; “sync on every toggle” plus fire-and-forget invites race/order issues, and the packet does not say this was addressed.

## Core-loop focus score
**7/10**
- The main delivered work touches a real product loop: settings changes now persist to backend instead of dying in local state.
- The sprint also shipped documentation that reduces setup friction, which helps dev throughput but is not core user-loop work.
- The settings work stopped short of trustworthy completion because save success/failure is not surfaced to users.
- Fire-and-forget persistence weakens the loop quality; a preference system that can silently fail is only partially solved.
- Carrying “Community Reviews” as a priority without either shipping work or formally closing it shows planning slop.
- Strong test additions support the backend sync change and prevent regressions.

## Top 3 priorities for next sprint
1. Make notification preference saving reliable and observable: add pending/saved/error UI, failure handling, and retry behavior. This is the actual completion work for Priority #1.
2. Close the status mess around Community Reviews: provide evidence-based closure if already functional, or open a scoped bug/feature sprint item with explicit gaps. Stop carrying it ambiguously.
3. Harden preference sync semantics: handle rapid toggles safely with debouncing, request ordering, or last-write-wins guarantees, and verify with tests.

**Verdict:** Sprint 148 delivered a real backend persistence improvement and a useful setup guide, but the headline “DONE” claims are looser than they should be. Notification sync is implemented, not fully trustworthy; setup docs work on one happy path, not comprehensively; and Community Reviews status is muddled. The sprint was productive, but it left reliability and closure discipline unfinished.
