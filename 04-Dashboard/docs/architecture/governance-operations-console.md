# Governance Operations Console

## Purpose

Unified operational view across all governance modules. Surfaces what needs attention, what's trending, and what's on the watchlist.

## Summary Cards

| Card | Source |
|------|--------|
| Pending Resolutions | Scoped drift resolutions in open/approved state |
| Pending Tuning | Tuning recommendations in pending state |
| Pending Overrides | Override requests in pending state |
| Open Escalations | Unresolved escalation events |

## Hotspots

Top exception concentrations by category, with severity and trend direction.

## Watchlist

Operator-defined items to monitor. Toggle active/inactive.

## API

- `GET /api/governance-ops` — Full ops view
- `POST /api/governance-ops/filter` — Filtered ops view
- `GET /api/governance-ops/hotspots` — Hotspots only
- `GET /api/governance-ops/watchlist` — Watchlist
- `POST /api/governance-ops/watchlist` — Add to watchlist
