# GPO Engine Maturity Scoreboard — Strict Evidence-Based

Updated: 2026-03-15 | Harness: V2 (360 cases, 15 engines)

## Official Numbers (Canonical Cases Only)

| Metric | Value |
|---|---|
| **Total reports in system** | 400 |
| **Canonical harness cases** | 361 |
| **Retries/reruns** | 9 |
| **Ad-hoc/manual tests** | 4 |
| **Legacy/deprecated** | 26 |
| **Safe to count** | 361 |

## Strict Verdicts (361 canonical cases)

| Verdict | Count | % |
|---|---|---|
| PASS | 354 | 98.1% |
| PARTIAL | 7 | 1.9% |
| FAIL | 0 | 0% |
| BLOCKED | 0 | 0% |
| MISSING_EVIDENCE | 0 | 0% |

## Level Assessment (canonical only)

| Level | Pass | Rate | Description |
|---|---|---|---|
| L1 (Prompt Pass) | 360 | 99.7% | Produces a reasonable answer |
| L2 (Context Pass) | 360 | 99.7% | Uses operator context correctly |
| L3 (GPO Grade) | 0 | 0% | Structured, interactive, downloadable |

**Average Confidence Score: 90/100**

## Why L3 is 0%

L3 requires capabilities not yet implemented:
1. Contract-aware structured JSON output
2. Interactive session mode (tutoring, quizzing)
3. File attachment support (resume review)
4. Audio/video generation (Music, Filmmaking)
5. Calendar API integration (Scheduling)

These are real capability gaps, not test failures.

## PARTIAL Cases (7)

These 7 cases had anomalies:
- Manual intervention required (approval gates triggered for non-code tasks)
- Template placeholders in output ([Investor's Name])
- Routing to unexpected domain (keyword collision)

## Fixes Applied (10 gaps)

| # | Gap | Fix | Verified |
|---|-----|-----|---------|
| 1 | No writing domain | Added engine | Yes |
| 2 | Approval gates on text tasks | Board uses green/report | Yes |
| 3 | No research domain | Added engine | Yes |
| 4 | Perplexity citations | Mandatory URL format | Yes |
| 5 | No learning domain | Added engine | Yes |
| 6 | Stuck task recovery | Worker restart recovery | Yes |
| 7 | Keyword collision | Refined routing | Yes |
| 8 | Subtask store limit | 200→2000 | Yes |
| 9 | Intake routing | Scored domain-router | Yes |
| 10 | Context deepening | Recent work injection | Yes |

## 62 commits pushed to main
