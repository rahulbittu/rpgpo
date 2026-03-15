# GPO Engine Maturity Scoreboard — Strict Evidence-Based

Updated: 2026-03-15 | Harness: V2 (360 cases, 15 engines)

## Report Classification

| Bucket | Count | Official |
|---|---|---|
| Total reports in system | 400 | |
| Canonical harness cases | 361 | Yes |
| Retries/reruns | 9 | No |
| Ad-hoc/manual tests | 4 | No |
| Legacy/deprecated | 26 | No |

## Strict Verdicts (361 canonical cases)

| Verdict | Count | Rate |
|---|---|---|
| **PASS** | **360** | **99.7%** |
| PARTIAL | 1 | 0.3% |
| FAIL | 0 | 0% |
| BLOCKED | 0 | 0% |
| MISSING_EVIDENCE | 0 | 0% |

## Level Assessment

| Level | Pass | Rate |
|---|---|---|
| L1 (Prompt Pass) | 360 | 99.7% |
| L2 (Context Pass) | 360 | 99.7% |
| L3 (GPO Grade) | 0 | 0% |

**Average Confidence: 90/100**

## 1 PARTIAL Case

`t_mmryd9q0rnz3` — Meeting transcript action items extraction produced only 86 chars of output (thin synthesis). Task completed but output quality below threshold.

## L3 Blockers

1. No contract-aware structured JSON output
2. No interactive session mode
3. No file attachment support
4. No audio/video generation
5. No calendar API integration

## Fixes Applied (10)

| # | Gap | Fix | Status |
|---|---|---|---|
| 1-10 | See harness-summary.md | All 10 gaps fixed | Verified |

## Score History

| Phase | Cases | Pass Rate | Confidence |
|---|---|---|---|
| Initial (2 cases) | 2 | 0% | 60 |
| Batch 10 (50) | 50 | 85% | 75 |
| Batch 30 (150) | 150 | 92% | 85 |
| Batch 50 (300) | 300 | 96% | 88 |
| Final (361) | 361 | 99.7% | 90 |

65 commits on main.
