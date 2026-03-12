# Sprint 811 — Config Guardrails & Bootstrap Boundaries

**Date:** 2026-03-12
**Theme:** Address external critique 805-809 — formalize architecture, add guardrails, reduce test fragility
**Story Points:** 1 (architecture)

---

## Mission Alignment

- **Architecture clarity:** Bootstrap boundaries formalized as permanent, not exceptions
- **Guardrails:** Explicit escalation triggers for build size and config growth
- **Test resilience:** Shared helpers reduce fragility of config-related assertions

---

## External Critique Response

The external critique (805-809) identified 3 priorities:

### 1. Close the bootstrap exception decision
**Action:** Formalized db.ts, logger.ts, index.ts as **permanent pre-config boundaries** with explicit documentation in config.ts header and thresholds.json. These are not exceptions — they represent the initialization order: logger → db → config → everything else.

### 2. Reduce test fragility from source-reading
**Action:** Created `__tests__/helpers/config-assertions.ts` with reusable helpers:
- `assertUsesConfig(filePath, options)` — verifies a file imports config and has no direct process.env
- `assertBootstrapExempt(filePath)` — verifies bootstrap files retain direct process.env access
- `assertConfigGuardrails()` — verifies field count is within max

Future config refactors update the helper, not 17+ individual test files.

### 3. Set explicit config and build guardrails
**Action:** Added to thresholds.json:
- `config.maxFields: 35` — grouping required at 35+ fields
- `config.currentFields: 27`
- `config.bootstrapExempt: [db.ts, logger.ts, index.ts]`
- `build.warnAtKb: 720`
- `build.escalation: "720kb=warn, 735kb=block-new-features, 750kb=mandatory-optimization"`

---

## Team Discussion

**Amir Patel (Architecture):** "The external critique was right — 'full consolidation' was overstated. Calling them permanent pre-config boundaries instead of exceptions is more honest and more useful architecturally."

**Sarah Nakamura (Lead Eng):** "The shared assertion helpers are the right move. Next time we refactor config, we update one file instead of 17. The critique's 'test cascade' concern is addressed."

**Nadia Kaur (Cybersecurity):** "Build escalation triggers are smart — 720kb warn, 735kb feature-block, 750kb mandatory optimization. No more ad hoc judgment about when to act."

**Marcus Chen (CTO):** "This is what external critique is for — catching the gap between what we claim and what's actually true. The architecture is stronger for it."

---

## Changes

| File | Change |
|------|--------|
| `server/config.ts` | Added ARCHITECTURE BOUNDARY and GUARDRAILS documentation |
| `shared/thresholds.json` | Added config section (maxFields, bootstrapExempt) + build escalation |
| `__tests__/helpers/config-assertions.ts` | New shared assertion helpers |
| `__tests__/sprint811-config-guardrails.test.ts` | 13 new tests |

---

## Tests

- **New:** 13 tests in `__tests__/sprint811-config-guardrails.test.ts`
- **Total:** 13,560 tests across 610 files — all passing
- **Build:** 688.9kb (max 750kb) — 61.1kb headroom
