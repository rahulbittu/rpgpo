# Runbook: Integration Governance Operations

## Viewing Integrations
`GET /api/integrations` — shows all connectors with trust, permissions, status

## Evaluating Access
`POST /api/integrations/:id/evaluate` — checks trust + tenant + enabled state

## Toggling
`POST /api/integrations/:id/toggle` — enable/disable

## Adding New Integration
`POST /api/integrations` with name, category, trust_level, permissions, secret_scope

## Usage Tracking
Each successful access increments usage_count on the connector.
