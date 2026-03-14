# Override Operations Center

## Purpose
Dedicated operational console for all overrides. Surfaces pending, stale, consumed overrides with hotspot detection.

## Views
| View | Content |
|------|---------|
| Pending | Overrides awaiting approval |
| Approved | Approved but not yet consumed |
| Stale | Approved but older than 7 days without consumption |
| Consumed | Used to clear an enforcement block |
| Expired | Past their expiry date |
| Rejected | Denied by operator |

## Override Consumption
When an override is used to clear a soft block, a consumption record is created linking override → decision → graph.

## API
- `GET /api/override-ops` — Operations view
- `GET /api/override-ops/stale` — Stale overrides
- `POST /api/overrides/:id/consume` — Consume override
