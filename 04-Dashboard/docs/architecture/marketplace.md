# Marketplace

## Asset Types
extension, skill_pack, engine_template, shared_asset

## Listing Lifecycle
draft → review → approved / rejected → deprecated

## Plan Availability
Each listing declares which subscription plans can install it.

## API
- `GET /api/marketplace` — All listings
- `POST /api/marketplace/publish` — Publish listing
- `POST /api/marketplace/:id/review` — Approve/reject
