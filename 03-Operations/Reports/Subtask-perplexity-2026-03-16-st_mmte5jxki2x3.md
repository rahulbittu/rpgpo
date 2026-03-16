# Subtask Output — Research OAuth 2.0 with PKCE Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# OAuth 2.0 with PKCE Best Practices for Single-Page Applications

**Authorization Code Flow with PKCE is the gold standard for SPAs**, replacing older, less secure patterns. This approach combines delegated authorization with cryptographic proof to prevent authorization code interception attacks.[1][3]

## Core Implementation Pattern

The PKCE flow works through seven sequential steps:[1]

1. Client generates a random `code_verifier`
2. Client creates a `code_challenge` by hashing the verifier with SHA-256
3. Client sends the `code_challenge` to the authorization server
4. Authorization server issues an authorization code
5. Client sends the authorization code along with the original `code_verifier`
6. Server validates that `SHA256(code_verifier) == code_challenge`
7. Access token is issued only if validation succeeds

The critical security advantage: the `code_verifier` is never transmitted in the initial authorization request, so attackers cannot reconstruct it even if they intercept the authorization code.[1]

## Why PKCE is Essential for SPAs

SPAs are classified as **public clients** because they cannot securely store a client secret in browser-based code.[3] PKCE solves this by replacing the static secret with a dynamically generated proof that only the original client can provide. This prevents attackers from using a stolen authorization code to obtain an access token.[3]

PKCE protects against four specific attack vectors:[1]

- Authorization code interception
- Man-in-the-middle attacks
- Malicious app impersonation
- Public client secret exposure risks

## Current Standards and Timeline

**OAuth 2.1** (the latest version) makes PKCE mandatory for all clients, not just public ones.[4][5] Key security improvements in OAuth 2.1 include:

- Mandatory PKCE enforcement across all client types[4][5]
- Removal of the Implicit Grant flow (which returned tokens directly in URL fragments)[5]
- Exact redirect URI matching requirements[4]
- Deprecation of the password grant[4]

Organizations should begin migrating to OAuth 2.1-aligned implementations now, according to current security guidance.[5]

## Critical Implementation Mistakes to Avoid

The most common errors that undermine PKCE security:[1]

- Using weak random strings for `code_verifier`
- Not using S256 (SHA-256) hashing method
- Storing verifier insecurely
- Allowing multiple token exchanges with the same authorization code
- Failing to validate redirect URIs

## Complementary Security Parameters

PKCE works alongside two other security mechanisms that serve different purposes:[6]

- **State parameter:** Prevents Cross-Site Request Forgery (CSRF) attacks
- **Nonce parameter:** Protects ID tokens against replay attacks

All three should be implemented together rather than selecting just one.[6]

## Practical Code Example

When building the authorization URL, include PKCE parameters with the S256 method:[2]

```python
auth_params = {
    "response_type": "code",
    "client_id": "my-app-client-id",
    "redirect_uri": "http://localhost:3000/callback",
    "scope": "openid profile email",
    "state": secrets.token_urlsafe(16),
    "code_challenge": code_challenge,
    "code_challenge_method": "S256",
}
```

When exchanging the authorization code for tokens, include the original `code_verifier`:[2]

```python
payload = {
    "grant_type": "authorization_code",
    "code": auth_code,
    "redirect_uri": "http://localhost:3000/callback",
    "client_id": "my-app-client-id",
    "code_verifier": code_verifier,
}
```

## 2026 Security Recommendations

For organizations strengthening their OAuth implementations:[5]

1. Audit all OAuth implementations for PKCE enforcement and refresh token rotation
2. Implement behavioral detection for impossible travel and device fingerprint mismatches
3. Deploy automated response workflows that revoke tokens within 5 minutes of detection
4. Inventory third-party OAuth integrations and assess token storage practices
5. Migrate to OAuth 2.1-aligned implementations that remove insecure grant types

Source: [https://www.c-sharpcorner.com/article/what-is-oauth-2-0-pkce-flow-and-how-does-it-improve-security/][1]
Source: [https://oneuptime.com/blog/post/2026-02-20-oauth2-oidc-explained/view][2]
Source: [https://www.weweb.io/blog/single-sign-on-using-oauth2-developer-guide][3]
Source: [https://workos.com/blog/api-security-best-practices-for-ai-agents][4]
Source: [https://www.obsidiansecurity.com/blog/token-replay-attacks-detection-prevention][5]
Source: [https://dev.to/auth0/demystifying-oauth-security-state-vs-nonce-vs-pkce-2eo2][6]
