# Runbook: Override Operations

## Daily Override Review
1. Check `GET /api/override-ops` for pending and stale counts
2. Review pending overrides — approve or reject
3. Check stale overrides — consume if used, expire if no longer needed
4. Review hotspots — repeated override types indicate governance miscalibration

## Override Consumption
When a soft block is cleared by an override:
1. The override is automatically marked as `consumed`
2. A consumption record links override → decision → graph
3. A block resolution record marks the block as `override_cleared`

## Stale Override Handling
Overrides approved but not consumed within 7 days are flagged as stale.
Options: consume manually, expire, or investigate why they weren't used.
