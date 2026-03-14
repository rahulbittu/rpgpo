# End-to-End Workflow Activation

## What Makes a Workflow "Activated"
1. Entry point visible in UI
2. Backend API connected
3. State mutation works
4. Result visible in UI after action
5. Error/loading/empty states handled

## Assessment
Each workflow is classified: activated / partially_activated / blocked / broken

## API
- `GET /api/workflow-activation` — Full report
- `POST /api/e2e-flow/run/:flowId` — Run specific flow check
