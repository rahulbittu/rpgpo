# Runbook: Navigation and Refresh Review

## Validating Navigation
1. Check `GET /api/navigation-map` — all 18 tabs should be reachable
2. Check `GET /api/navigation-gaps` — address gaps in priority order
3. Verify each tab loads data without error

## Validating Refresh
1. Check `GET /api/targeted-refresh` — 8 plans defined
2. Test: perform an action, verify panel refreshes without full page reload
3. Verify `gpoAction()` shows loading → success → refresh sequence

## Validating Journeys
1. Run `GET /api/operator-journeys` — 7 journeys defined
2. For each partial journey, follow the steps manually
3. Identify which step breaks (usually missing drilldown or action button)
