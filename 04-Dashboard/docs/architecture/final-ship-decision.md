# Final Ship Decision Architecture

## Decision Logic
7 evidence dimensions, weighted:
- Blocker reconciliation: 20%
- Workflow closure: 15%
- Middleware truth: 15%
- HTTP middleware validation: 15%
- Operator acceptance: 15%
- Security posture: 10%
- Measured reliability: 10%

## Decision Thresholds
- **GO**: 0 fail dimensions AND 0 conditional dimensions AND score >= 90%
- **CONDITIONAL_GO**: 0 fail dimensions AND score >= 75%
- **NO_GO**: any fail dimension OR score < 75%

## No False Claims
- Each dimension queries real live modules
- Evidence status (pass/conditional/fail) derived from actual scores
- Remaining gaps explicitly listed
- Stale modules cannot inflate or drag the result
