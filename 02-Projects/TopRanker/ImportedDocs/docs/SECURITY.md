# Security Posture — TopRanker

**Owner**: Nadia Kaur, Cybersecurity Lead
**Last Updated**: 2026-03-08 (Sprint 107)

---

## Security Headers

All responses include OWASP-recommended security headers (Sprint 104-105):

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME-type sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | Legacy XSS protection |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer leakage |
| Permissions-Policy | camera=(), microphone=(), geolocation=(self), payment=(self) | Disable unused browser APIs |
| Content-Security-Policy | [9 directives] | XSS mitigation, resource control |
| Strict-Transport-Security | max-age=31536000 (production only) | Enforce HTTPS |

## Rate Limiting

- **API endpoints**: 100 requests per minute per IP
- **Auth endpoints**: 10 requests per minute per IP (signup, login, Google auth)
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- 429 response with retryAfter on exceed

## Authentication & Authorization

- Session-based auth with secure HTTP-only cookies
- Admin routes double-gated: requireAuth + requireAdmin middleware
- Admin email whitelist check via isAdminEmail()
- Password hashing: bcrypt

## SSE (Server-Sent Events) Security

- Max 5 concurrent connections per IP
- 30-minute auto-timeout for resource protection
- Proper cleanup on disconnect (counter decrement)
- Same-origin policy + TLS

## Webhook Security

- Stripe signature verification (STRIPE_WEBHOOK_SECRET)
- Webhook event logging for audit trail
- Admin-only replay with double-gated authentication
- Error tracking on failed processing

## Data Protection

- Encryption in transit: TLS 1.3
- Encryption at rest: managed by database provider
- Password storage: bcrypt (never plaintext)
- GDPR cookie consent (web)
- Privacy policy with CCPA, DPDPA 2023, GDPR rights
- 72-hour breach notification commitment

## Payment Security

- Stripe handles all card data (PCI DSS compliance via Stripe)
- Server-side payment intent creation only
- Webhook signature verification for status updates
- Centralized pricing constants (no magic numbers)

## Known Gaps & Remediation Plan

| Gap | Risk | Target Sprint |
|-----|------|---------------|
| Rate limiter is in-memory | DoS risk at scale | 110+ (Redis) |
| No CORS configuration | Low (same-origin) | 108 |
| No request body size limits | DoS via large payloads | 108 |
| CSP may need expansion | Integration breaks | As needed |

---

## Audit History

| Sprint | Type | Result |
|--------|------|--------|
| 100 | Architecture Audit #9 | A+ grade, zero critical/high |
| 104 | Security Headers Added | OWASP compliance |
| 105 | CSP + Rate Limiting | Production hardening |
| 106 | SSE Hardening | Connection limits + timeout |
