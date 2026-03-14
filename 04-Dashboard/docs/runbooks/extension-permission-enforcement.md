# Runbook: Extension Permission Enforcement

## Check Permissions
`POST /api/extension-permissions/:extensionId/evaluate` with permission and action

## Trust Levels
- untrusted → all denied
- community → modify_governance denied
- verified → most granted
- official → all granted

## Cross-Project
cross_project permission checks tenant isolation before granting.
