# E2E Flow State

## Step Assessment
Each step is checked for: ui_visible, api_connected, state_mutates, result_visible

## Status
- pass: all conditions met
- partial: API works but UI not reflecting
- fail: not connected

## API
- `POST /api/e2e-flow/run/:flowId` — Run check
- `GET /api/e2e-flow` — All runs
