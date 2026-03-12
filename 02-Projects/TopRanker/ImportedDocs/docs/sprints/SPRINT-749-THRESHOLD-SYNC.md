# Sprint 749 — Threshold Sync

**Date:** 2026-03-12
**Theme:** Synchronize shared/thresholds.json with Sprint 741-748 metrics
**Story Points:** 1

---

## Mission Alignment

- **One source of truth (Constitution #15):** thresholds.json must reflect the actual state of the codebase after every hardening cycle.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "After 8 sprints of hardening (741-748), the thresholds file was stale — test count was 11,697 but we're at 12,908 now, and the build grew from 655.5kb to 664.3kb. This sprint brings the single source of truth current."

**Amir Patel (Architecture):** "We also added `server/search-result-processor.ts` to tracked files — it gained typed interfaces in Sprint 744 and should be monitored. That brings us to 34 tracked files total."

**Nadia Kaur (Cybersecurity):** "The minCount threshold jumped from 10,800 to 12,800. That's a meaningful floor — any accidental test deletion would be caught immediately."

**Marcus Chen (CTO):** "This is housekeeping, but critical housekeeping. If the thresholds file lies, the governance tests lie, and we lose the early warning system."

**Jordan Blake (Compliance):** "The sprint620 build headroom test needed updating too — the old 660kb ceiling didn't account for the typed interfaces and structured logging we added. Raised to 670kb which still leaves comfortable margin under the 750kb max."

---

## Changes

| File | Change |
|------|--------|
| `shared/thresholds.json` | Updated build 655.5→664.3kb, tests 11,697→12,908, minCount 10,800→12,800, sharing.ts 165→175 LOC, og-image.ts 150→155 LOC, +search-result-processor.ts |
| `__tests__/sprint620-governance.test.ts` | Build headroom assertion: <660 → <670 |
| 15 test files | Tracked file count: 33 → 34 |

---

## Tests

- **New:** 11 tests in `__tests__/sprint749-threshold-sync.test.ts`
- **Updated:** 16 existing test files for new thresholds
- **Total:** 12,920 tests across 556 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 664.3kb / 750kb (88.6%) |
| Tests | 12,920 / 556 files |
| Tracked files | 34 |
