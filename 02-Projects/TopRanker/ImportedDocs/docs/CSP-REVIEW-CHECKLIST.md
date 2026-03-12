# CSP Review Checklist

**Owner:** Nadia Kaur (Cybersecurity)
**Origin:** RETRO-134 Action Item
**File:** `server/security-headers.ts`

---

## When to Review CSP

Review and update CSP any time a PR introduces:

- A new external service (maps, analytics, auth provider, payment processor)
- A new CDN or asset host
- A new iframe embed or third-party widget
- A new WebSocket or Server-Sent Events endpoint on an external domain
- A new font, stylesheet, or script loaded from an external origin

---

## Current CSP Directives

| Directive | Allowed Origins |
|---|---|
| `default-src` | `'self'` |
| `script-src` | `'self'` `'unsafe-inline'` `'unsafe-eval'` `https://accounts.google.com` `https://maps.googleapis.com` `https://maps.gstatic.com` |
| `style-src` | `'self'` `'unsafe-inline'` `https://fonts.googleapis.com` |
| `font-src` | `'self'` `https://fonts.gstatic.com` `https://fonts.googleapis.com` |
| `img-src` | `'self'` `data:` `https:` `blob:` |
| `connect-src` | `'self'` `https://api.stripe.com` `https://api.resend.com` `https://maps.googleapis.com` `https://maps.gstatic.com` `https://accounts.google.com` `https://oauth2.googleapis.com` |
| `frame-src` | `'self'` `https://accounts.google.com` |
| `frame-ancestors` | `'none'` |
| `base-uri` | `'self'` |
| `form-action` | `'self'` |

**Note:** `img-src` currently allows all HTTPS origins (`https:`). This is broad but acceptable for user-uploaded content and business photos.

---

## Review Steps

For every PR that adds an external service:

1. **Identify all external domains** the new feature will contact (check network tab, SDK docs, README of the library).
2. **Classify each domain** into the correct CSP directive:
   - JavaScript files -> `script-src`
   - Fetch/XHR/WebSocket calls -> `connect-src`
   - Images -> `img-src`
   - Stylesheets -> `style-src`
   - Fonts -> `font-src`
   - Iframes -> `frame-src`
3. **Check the table above** — if the domain is already allowed, no change needed.
4. **Update `server/security-headers.ts`** with the minimal additions. Add only the specific domains required — never use wildcards like `*.example.com`.
5. **Test in browser DevTools** — open the Console tab and look for CSP violation messages (see Testing section below).
6. **Run the test suite** to verify security header assertions still pass.
7. **Document the CSP change** in your PR description, noting which directive was modified and why.

---

## Common Pitfalls

### Google Maps
Requires three directives:
- `script-src` — `https://maps.googleapis.com` `https://maps.gstatic.com`
- `connect-src` — `https://maps.googleapis.com` `https://maps.gstatic.com`
- `img-src` — `https://maps.googleapis.com` `https://maps.gstatic.com` (already covered by `https:`)

### Google Fonts
Requires two directives:
- `style-src` — `https://fonts.googleapis.com`
- `font-src` — `https://fonts.gstatic.com`

### Stripe
Requires three directives:
- `script-src` — `https://js.stripe.com`
- `frame-src` — `https://js.stripe.com`
- `connect-src` — `https://api.stripe.com`

**Current gap:** `script-src` and `frame-src` do not include `https://js.stripe.com`. If we add Stripe Elements or Checkout, these must be added.

### CDN Images
- `img-src` only — already covered by the broad `https:` rule.

### WebSocket Connections
- `connect-src` — must use the `wss://` scheme (e.g., `wss://realtime.example.com`). The `https:` entries do not cover WebSocket traffic.

### Analytics (Sentry, Segment, Mixpanel, etc.)
- `script-src` — for the SDK loader
- `connect-src` — for event ingestion endpoints (e.g., `https://*.ingest.sentry.io`)

---

## Testing CSP Changes

1. **Open browser DevTools -> Console tab.**
2. **Exercise the new feature** — trigger the network calls, load the page, interact with the widget.
3. **Look for errors** matching these patterns:
   - `Refused to load the script ...`
   - `Refused to connect to ...`
   - `Refused to load the image ...`
   - `Blocked ...`
4. **Use Report-Only mode for safe testing.** Temporarily change the header in `security-headers.ts`:
   ```ts
   // For testing — logs violations without blocking
   res.setHeader("Content-Security-Policy-Report-Only", csp);
   ```
   This lets the page function normally while logging what *would* be blocked. Switch back to `Content-Security-Policy` before merging.
5. **Verify no regressions** — check that existing features (Google Maps, Google OAuth, fonts) still load without console errors.

---

## Quarterly Review

Every quarter, audit the CSP for:
- Domains that are no longer needed (removed integrations)
- Opportunities to remove `'unsafe-inline'` or `'unsafe-eval'` from `script-src`
- New services that were added without updating this checklist

Next scheduled review owner: Nadia Kaur
