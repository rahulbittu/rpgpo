# Runbook: Project Isolation Operations

## Default Behavior
Cross-project access is denied by default. Same-project access is always allowed.

## When Violations Occur
1. Check `GET /api/isolation-violations` for recent violations
2. Determine if the access was legitimate or accidental
3. If legitimate: add target to `allowed_targets` in the source project's isolation policy
4. If accidental: investigate the code path that triggered the cross-project read

## Configuring Isolation
1. Create isolation policy via state file or future API
2. Set `default_access` (deny recommended for most projects)
3. Add specific `allowed_targets` for trusted partner projects
4. Configure `redact_fields` for sensitive data removal
