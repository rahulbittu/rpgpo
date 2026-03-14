# Go Authorization Architecture

## 8 Required Gates
1. Live server proof (must be live_network for GO)
2. Blocker reconciliation (7/7 closed)
3. Workflow closure (13/13 usable)
4. Middleware truth (>= 95%)
5. Reliability closure (0 proxy-only)
6. Clean state (no stale files)
7. Operator acceptance (>= 95%)
8. Security posture (strong/moderate)

## Decision Logic
- **GO**: All required gates pass AND live proof is live_network AND score >= 90%
- **CONDITIONAL_GO**: All required gates pass AND score >= 75% (function_only proof caps here)
- **NO_GO**: Any required gate fails

## Confidence Levels
- `fully_proven`: Live network proof with all cases passing
- `partially_proven`: Function-only proof (all cases pass but non-final)
- `not_proven`: No proof run or cases failing

## Proof Gaps
Explicitly tracked: `no_live_proof`, `fallback_only`, `failed_case`, `stale_evidence`
