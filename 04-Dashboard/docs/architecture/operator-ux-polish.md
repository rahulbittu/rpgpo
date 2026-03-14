# Operator UX Polish

## gpoAction Helper
Global action handler: `gpoAction(btn, url, method, refreshTab)` with idle → loading → success/error → targeted refresh.

## Button States
- idle: normal appearance
- loading: opacity 0.6, cursor wait, text "..."
- success: green background, text "✓", then refresh
- error: red background, text "✗", tooltip shows error, auto-recovers in 3s

## Drilldowns
10 drilldown definitions across releases, approvals, escalation, governance, providers, admin, productization.
