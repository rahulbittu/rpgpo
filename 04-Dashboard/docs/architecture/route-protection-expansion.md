# Route Protection Expansion Architecture

## Expanded Routes (Part 56)
| Route | Method | Guard | Category |
|-------|--------|-------|----------|
| /api/skill-packs | GET | entitlement | sensitive |
| /api/skill-packs | POST | entitlement+isolation | sensitive |
| /api/skill-packs/:id/bind | POST | entitlement+isolation | sensitive |
| /api/engine-templates | GET | entitlement | sensitive |
| /api/engine-templates | POST | entitlement+isolation | sensitive |
| /api/engine-templates/:id/instantiate | POST | entitlement+isolation | sensitive |
| /api/extensions | GET | extension | sensitive |
| /api/extensions | POST | extension+isolation | sensitive |
| /api/extensions/:id/install | POST | extension+isolation | sensitive |
| /api/extensions/:id/uninstall | POST | extension+isolation | sensitive |
| /api/integrations | GET | entitlement | sensitive |
| /api/integrations | POST | entitlement+isolation | sensitive |
| /api/security-hardening | GET | entitlement | sensitive |
| /api/observability | GET | entitlement | sensitive |
