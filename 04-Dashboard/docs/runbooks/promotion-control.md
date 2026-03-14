# Runbook: Promotion Control

## Promotion Flow

### Dev → Beta
1. Generate promotion dossier
2. Run release readiness scoring
3. Evaluate promotion: `POST /api/promotion-control/:dossierId/evaluate/beta`
4. If `allowed` → execute promotion
5. If `blocked` → check blockers, request overrides if `allow_override: true`
6. If `allowed_with_override` → proceed (overrides are logged)

### Beta → Prod
1. All reviews must pass (no waive for prod)
2. Documentation must be complete
3. No open escalations
4. Readiness >= 75%
5. Overrides NOT allowed for prod promotion
6. If any check fails → `blocked` with hard_block

## Verification Steps Before Promotion

- [ ] Dossier recommendation is `promote` or `hold` (not `rework`)
- [ ] Release readiness score computed and meets threshold
- [ ] All enforcement rules evaluated
- [ ] No unresolved hard blocks
- [ ] Documentation artifacts registered
- [ ] Review contracts completed

## Emergency Override (Beta Only)

If beta promotion is blocked by a soft issue:
1. Request override via API or UI
2. Document the reason and remediation plan
3. Approve the override
4. Re-evaluate — enforcement clears the soft block
5. Execute promotion
