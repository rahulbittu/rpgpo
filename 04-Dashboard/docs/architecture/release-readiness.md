# Release Readiness Scoring

## Purpose

Comprehensive multi-category readiness assessment for graphs, dossiers, and releases.

## Categories (7)

| Category | Weight | What It Checks |
|----------|--------|----------------|
| policy_compliance | 15 | Governance simulation passes |
| review_health | 20 | All reviews pass/waive, none fail |
| documentation | 15 | Required docs present |
| escalation_stability | 10 | No unresolved escalation events |
| provider_confidence | 10 | Average provider fit confidence |
| mission_alignment | 15 | Work aligns with mission statements |
| risk_resolution | 15 | All dossier risks resolved |

## Scoring

- Each category scored 0 to weight
- Overall = sum / total * 100
- Recommendation: `ready` (75+, no blockers), `conditional` (40-75 or warnings), `not_ready` (<40 or blockers)

## API

- `POST /api/release-readiness/score/:relatedType/:relatedId` — Compute score
- `GET /api/release-readiness/:relatedType/:relatedId` — Get stored scores
- `GET /api/release-readiness/rules` — Get scoring rules
