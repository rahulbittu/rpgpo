# Runbook: Policy Tuning Approval

## When Tuning Recommendations Appear

The system generates tuning recommendations when drift signals or exception patterns suggest governance policies need adjustment.

## Review Process

1. **Read the recommendation** — title, action (tighten/loosen/add/deprecate/rescope), target
2. **Check the rationale** — what evidence triggered this recommendation
3. **Assess the risk** — low/medium/high impact of making this change
4. **Review expected impact** — what changes if this is applied

## Decision Matrix

| Risk | Evidence Count | Recommended Action |
|------|---------------|-------------------|
| Low | 3+ | Approve and apply |
| Low | 1-2 | Approve, defer application |
| Medium | 5+ | Approve with monitoring plan |
| Medium | 1-4 | Review evidence carefully before deciding |
| High | Any | Review with extra scrutiny, consider simulation first |

## After Approval

- Approved recommendations can be explicitly applied via `POST /api/policy-tuning/decisions/:id/apply`
- Application is auditable — the decision record tracks who approved and when
- Monitor governance health after application for improvement

## Rejection

- Rejected recommendations remain in the record for audit
- If the same recommendation recurs, it may indicate the underlying issue is real
