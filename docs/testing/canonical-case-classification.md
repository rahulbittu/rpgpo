# Canonical Case Classification

## Report Buckets

| Bucket | Count | Description |
|---|---|---|
| canonical_360 | 361 | Official V2 harness test cases |
| retries_or_reruns | 9 | Duplicate executions of same prompt |
| ad_hoc_manual_tests | 4 | Debug, test, or canceled tasks |
| deprecated_or_legacy | 26 | Pre-validation era TopRanker tasks |
| **Total** | **400** | |

## Classification Rules

1. **canonical_360**: Created during validation loop, completed, unique prompt, has deliberation
2. **retries_or_reruns**: Same prompt prefix as an earlier canonical case
3. **ad_hoc_manual_tests**: Test/debug tasks, canceled tasks, non-completed
4. **deprecated_or_legacy**: Pre-validation TopRanker-specific tasks

## Official Counting

Only `canonical_360` cases count toward official pass rates.
All other buckets are excluded from official reporting.

Machine-readable: `artifacts/testing/canonical-case-classification.json`
