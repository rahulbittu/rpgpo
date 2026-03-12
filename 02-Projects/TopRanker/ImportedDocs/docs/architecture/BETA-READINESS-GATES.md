# Beta Readiness Gates

**Created:** Sprint 816 (2026-03-12)
**Purpose:** Explicit criteria for declaring beta-launch readiness and maintaining reactive mode

---

## Server Hardening Gates (all must be TRUE)

| Gate | Criterion | Status | Evidence |
|------|-----------|--------|----------|
| G1 | Config centralized — 0 direct process.env in non-bootstrap server files | TRUE | Sprint 808 audit, `__tests__/sprint808` |
| G2 | Bootstrap boundaries formalized as permanent architecture | TRUE | Sprint 811, `config.ts` header |
| G3 | Health endpoint: public liveness only, diagnostics admin-gated | TRUE | Sprint 812, `routes-health.ts` |
| G4 | Push token store fully bounded: per-member (10) + total (10K) + LRU eviction | TRUE | Sprints 796, 813, 814 |
| G5 | Build size under warn threshold (720kb) | TRUE | 690.1kb < 720kb |
| G6 | All tests passing | TRUE | 13,598 tests, 0 failures |
| G7 | Arch audit grade A | TRUE | Audit #815 |
| G8 | Zero critical/high findings | TRUE | Audit #815 |

---

## Push Store Limits (complete specification)

| Limit | Value | Enforcement |
|-------|-------|-------------|
| Tokens per member | 10 | LRU eviction by `lastUsed` |
| Total unique members | 10,000 | LRU eviction by most-recent token `lastUsed` |
| Message log | 5,000 | FIFO eviction via `pop()` |
| Token TTL / cleanup | None (in-memory, resets on restart) | Acceptable for beta; Redis migration planned post-beta |
| Persistence | None (in-memory only) | Acceptable for beta; no data survives restart |
| Failure mode | Silent (no push = no notification) | Push is fire-and-forget; no user action blocked |

---

## Reactive Mode Criteria

The team enters reactive mode when ALL hardening gates are TRUE. Reactive mode means:

1. **No proactive feature or hardening work** unless driven by real user feedback
2. **TestFlight feedback is the only input** for sprint planning
3. **Bug fixes only** — no refactoring, no optimization, no new abstractions
4. **Exit reactive mode** when: user feedback reveals systemic issues requiring architectural change

### Staying in Reactive Mode Requires
- All 8 hardening gates remain TRUE
- Build size stays below warn threshold (720kb)
- Test suite continues passing
- No new critical/high audit findings

---

## Operational Alerts

| Condition | Action |
|-----------|--------|
| Build > 720kb | Warn in sprint retro |
| Build > 735kb | Block new features, mandatory optimization sprint |
| Build > 750kb | Emergency optimization, no other work |
| Config > 30 fields | Evaluate grouping |
| Config > 35 fields | Mandatory grouping before adding more |
| Push store > 8K members | Log warning, evaluate Redis migration |
| Test failure rate > 0 | Fix before any other work |
