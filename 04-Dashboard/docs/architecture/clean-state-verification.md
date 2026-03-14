# Clean State Verification Architecture

## Purpose
Ensure final ship-readiness validation evidence is not contaminated by stale historical data from previous runs.

## Checked Files (9)
enforcement-evidence.json, protected-path-runs.json, http-middleware-validation-runs.json, network-http-validation-runs.json, redaction-behavior.json, ship-blockers.json, boundary-enforcement-results.json, entitlement-decisions.json, extension-permission-decisions.json

## Checks
- **Staleness**: Files modified >30 minutes ago flagged as stale
- **Size**: Files >100KB flagged as potentially accumulated
- **Missing**: Absent files are fine (no stale data)

## Clear Operation
`POST /api/clean-state-verification/clear` removes all 9 validation state files for a clean re-validation.

## Integration
Clean state is a gate in the Final Go Verification. Not required for GO but flagged as advisory — operator can choose to clear and re-run for highest confidence.
