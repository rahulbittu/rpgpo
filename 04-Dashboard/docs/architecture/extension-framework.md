# Extension Framework

## Trust Levels
untrusted, community, verified, official

## Permissions
read_context, write_state, call_provider, modify_governance, access_secrets, cross_project

## Sandbox Policies
strict, standard, permissive

## Lifecycle
draft → published → installed → disabled → deprecated

## API
- `GET/POST /api/extensions` — CRUD
- `POST /api/extensions/:id/install` — Install
- `POST /api/extensions/:id/uninstall` — Uninstall
