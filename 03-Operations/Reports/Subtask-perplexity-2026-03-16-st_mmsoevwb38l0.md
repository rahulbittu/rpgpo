# Subtask Output — Research Content Security Policies
## Model: sonar
## Stage: report
## Date: 2026-03-16

# Content Security Policy Implementation for Web Applications

**Content Security Policy (CSP)** is a browser security mechanism that prevents unauthorized resource loading and protects against XSS attacks and data injection threats[2]. Here's what you need to know about implementing CSP in production:

## CSP Header Delivery Methods

CSP can be deployed via two primary mechanisms[2]:

1. **HTTP Response Header (Recommended)** — Set `Content-Security-Policy` on all responses to all requests, not just the main document[2]
2. **Meta Tag** — Use `<meta http-equiv="Content-Security-Policy">` for static single-page applications without server infrastructure, though this method doesn't support all CSP features[2]

Example HTTP header implementation:
```
Content-Security-Policy: script-src https://cdn.example.com/scripts/; object-src 'none'
```

## Nonce-Based Script Implementation

For strict CSP policies, **all inline scripts must include a nonce (number used once)** to bypass restrictions[4]. Here's the implementation approach:

- **Automatic nonce generation** — The application generates a unique nonce for each request[4]
- **Nonce injection** — Pass the nonce value as an attribute to script tags; frameworks like Next.js automatically inject nonces into scripts loaded through their routing system[4]
- **Strict-dynamic directive** — When using `strict-dynamic`, only scripts with valid nonces or from trusted sources execute[4]

Example CSP with nonce:
```
Content-Security-Policy: script-src 'nonce-{unique-value}' 'strict-dynamic'
```

## Report-Only Mode and Violation Reporting

CSP supports a **non-enforcing test mode** before full deployment[2]:

- **Content-Security-Policy-Report-Only header** — Violations are reported to a specified endpoint without blocking resources[2]
- **Reporting endpoint** — Use the `report-uri` directive or the newer **Reporting API** with `Reporting-Endpoints` and `report-to` directives[2]
- **Violation sample capture** — CSP can include the first 40 characters of violating inline code in reports when `'report-sample'` is specified[1]

Example report-only configuration:
```
Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; report-uri /api/csp-report
```

## Production Deployment Example

A real-world Nginx Ingress configuration (from February 2026) shows CSP headers in ArgoCD[3]:

```
nginx.ingress.kubernetes.io/configuration-snippet: |
  more_set_headers "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' wss:; frame-ancestors 'none'";
```

This policy[3]:
- Restricts all resources to same-origin (`'self'`)
- Allows WebSocket connections (`wss:`)
- Blocks framing (`frame-ancestors 'none'`)
- Includes complementary headers like `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff`

## Implementation Strategy

The recommended deployment approach[1][2]:

1. **Start with report-only mode** — Deploy a policy based on your site's behavior estimate
2. **Monitor violation reports** — Watch for CSP violations in your reporting endpoint
3. **Iterate and refine** — Adjust directives based on actual violation data
4. **Move to enforcement** — Switch to `Content-Security-Policy` header once confident

For frameworks like Next.js with Clerk authentication, **automatic CSP configuration is available**, which handles nonce generation and header injection through middleware[4], eliminating manual setup complexity.

Source: [https://www.w3.org/TR/CSP3/][1]
Source: [https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP][2]
Source: [https://oneuptime.com/blog/post/2026-02-26-argocd-content-security-policy-headers/view][3]
Source: [https://clerk.com/docs/guides/secure/best-practices/csp-headers][4]
