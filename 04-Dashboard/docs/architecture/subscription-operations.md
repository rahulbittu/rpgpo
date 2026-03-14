# Subscription Operations

## Plan Entitlements
| Feature | Personal | Pro | Team | Enterprise |
|---------|----------|-----|------|------------|
| governance | Yes | Yes | Yes | Yes |
| audit | No | Yes | Yes | Yes |
| compliance | No | No | Yes | Yes |
| collaboration | No | Yes | Yes | Yes |
| release | No | Yes | Yes | Yes |
| provider_governance | No | Yes | Yes | Yes |
| tenant_admin | No | No | Yes | Yes |

## API
- `POST /api/subscription-operations/:id/entitlements/evaluate` — Check entitlements
- `POST /api/subscription-operations/:id/usage` — Record usage
- `GET /api/billing-events/:id` — Billing history
