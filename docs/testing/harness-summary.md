# GPO V2 Harness Summary

## Harness Specification
- **Version**: V2
- **Total cases**: 360 (Core 150 + Expansion 150 + Stretch 60)
- **Engines**: 15
- **Source**: docs/testing/gpo_test_harness_v2_cases.json

## Execution Results

| Metric | Count |
|---|---|
| Total reports in system | 400 |
| Canonical harness cases | 361 |
| Retries/reruns (excluded) | 9 |
| Ad-hoc tests (excluded) | 4 |
| Legacy tasks (excluded) | 26 |

## Official Strict Results (canonical only)

| Verdict | Count | Rate |
|---|---|---|
| PASS | 354 | 98.1% |
| PARTIAL | 7 | 1.9% |
| FAIL | 0 | 0% |
| BLOCKED | 0 | 0% |
| MISSING_EVIDENCE | 0 | 0% |

## Level Assessment

| Level | Pass | Rate |
|---|---|---|
| L1 (Prompt) | 360 | 99.7% |
| L2 (Context) | 360 | 99.7% |
| L3 (GPO Grade) | 0 | 0% |

**Avg Confidence**: 90/100

## L3 Blockers
1. No structured JSON output schema enforcement
2. No interactive session mode
3. No file attachment support
4. No audio/video generation
5. No calendar API integration

## Evidence Locations
- Machine-readable verdicts: `artifacts/testing/strict-case-verdicts.json`
- Case classification: `artifacts/testing/canonical-case-classification.json`
- Individual case reports: `docs/testing/case-reports/`
- Score improvement log: `artifacts/testing/score-improvement-log.json`
- Verdict rubric: `docs/testing/strict-verdict-rubric.md`
