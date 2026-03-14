# Runbook: Extension Install and Review

## Before Installing
1. Check trust level (untrusted packages blocked)
2. Review requested permissions
3. Check for deprecated state
4. Verify tenant compatibility

## Installing
`POST /api/extensions/:id/install` — installs for tenant with scope

## Uninstalling
`POST /api/extensions/:id/uninstall` — marks install as uninstalled

## Marketplace Review
1. View `GET /api/marketplace` for listings
2. Review: `POST /api/marketplace/:id/review` with approved=true/false
3. Deprecated listings cannot be installed
