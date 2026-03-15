# GPO Validation Scoreboard

Grading version: v3-strict | Updated: 2026-03-15

## Counts

| Category | Count | Notes |
|---|---|---|
| Harness target | 360 | V2 harness specification |
| Unique cases executed | 361 | 1 extra beyond harness scope |
| Non-canonical (excluded) | 39 | 9 retries, 4 ad-hoc, 26 legacy |
| Total reports in system | 400 | |

## Strict Verdicts (361 canonical cases)

| Verdict | Count | Rate |
|---|---|---|
| PASS | 330 | 91.4% |
| PARTIAL | 31 | 8.6% |
| FAIL | 0 | 0% |
| MISSING_EVIDENCE | 0 | 0% |

**Average confidence: 89/100**

## Level Assessment

| Level | Pass | Rate | What it means |
|---|---|---|---|
| L1 (Prompt) | 360 | 99.7% | System produces a usable answer |
| L2 (Context) | 360 | 99.7% | Operator context is injected and used |
| L3 (GPO Grade) | 0 | 0% | Structured JSON output + interactive mode |

## Why 31 Cases Are PARTIAL

| Anomaly | Count | Description |
|---|---|---|
| Weak search results | 18 | Perplexity returned generic or "no results" data |
| Single subtask for complex request | 10 | Board assigned only 1 subtask when 2-3 were appropriate |
| Thin output | 1 | Total output under 200 characters |
| Multiple anomalies | 2 | Both weak search and single subtask |

These are real quality gaps, not labeling issues.

## Why L3 Is 0%

L3 requires capabilities not yet built:
1. Contract-aware structured JSON output (schema enforcement per engine)
2. Interactive session mode (multi-turn tutoring, adaptive quizzing)
3. File attachment support (resume upload, document review)
4. Audio/video generation (Music and Filmmaking engines)
5. Calendar API integration (real scheduling, not text plans)

## Fixes Applied During Validation (10)

| # | Problem | Fix |
|---|---|---|
| 1 | No writing engine | Added domain with routing and deliberation context |
| 2 | Text tasks required code-level approval | Board now uses report stage with green risk |
| 3 | No research engine | Added domain |
| 4 | Perplexity missing citations | Mandatory Source: URL format in prompts |
| 5 | No learning engine | Added domain |
| 6 | Stuck tasks after worker restart | Auto-recovery on startup |
| 7 | Keyword collision (news vs research) | Refined routing keywords |
| 8 | Subtask store limit (200) | Increased to 2000 |
| 9 | Intake used wrong routing | Delegates to scored domain-router |
| 10 | Shallow deliberation context | Injects recent completed work per domain |

## Score Progression

| Phase | Cases | PASS Rate | Confidence |
|---|---|---|---|
| First 2 tests | 2 | 0% | 60 |
| 50 cases | 50 | 85% | 75 |
| 150 cases | 150 | 92% | 85 |
| 300 cases | 300 | 93% | 88 |
| Final (361) | 361 | 91.4% | 89 |

Note: Pass rate dipped slightly at scale as stricter grading was applied.
The final rate is more honest than intermediate reports.
