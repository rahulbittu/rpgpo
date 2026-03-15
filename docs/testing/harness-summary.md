# GPO V2 Harness Execution Summary

## Harness Specification

- **Source**: `docs/testing/gpo_test_harness_v2_cases.json`
- **Target cases**: 360 (Core 150, Expansion 150, Stretch 60)
- **Engines**: 15 (24 cases each)

## What Was Executed

361 unique tasks were submitted and completed through the full GPO pipeline. This exceeds the 360-case target by 1 (one additional task submitted beyond harness scope).

39 additional reports exist but are excluded from official counting:
- 9 retries of earlier prompts
- 4 ad-hoc/debug tasks
- 26 legacy pre-validation tasks

## Strict Results

| Verdict | Count | Rate |
|---|---|---|
| PASS | 330 | 91.4% |
| PARTIAL | 31 | 8.6% |
| FAIL | 0 | 0% |

**Average confidence: 89/100**

## PARTIAL Breakdown

- 18 cases: Perplexity search returned weak or generic results
- 10 cases: Board assigned only 1 subtask to a complex request
- 1 case: Output under 200 characters total
- 2 cases: Both weak search and single subtask

## Provider Usage

| Provider | Tasks | Subtasks | Role |
|---|---|---|---|
| Perplexity Sonar | 345 | 409 | Web search |
| OpenAI GPT-4o | 354 | 390 | Synthesis |
| Gemini Flash | 22 | 23 | Strategy |
| Claude | 0 | 0 | Code (untested) |

## Evidence

- Verdicts: `artifacts/testing/strict-case-verdicts.json`
- Classification: `artifacts/testing/canonical-case-classification.json`
- Case reports: `docs/testing/case-reports/` (361 files)
- Deliverables: `04-Dashboard/state/deliverables/`
