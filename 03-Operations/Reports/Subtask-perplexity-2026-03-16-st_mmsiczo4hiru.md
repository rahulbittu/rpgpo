# Subtask Output — Research OAuth 2.0 Implementation in Node.js Express
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Recommended Library: oauth4webapi

The `oauth4webapi` npm package implements OAuth 2.0/2.1 authorization code flow with PKCE, refresh tokens, and security best practices like DPoP, PAR, and JWT validation for Node.js environments.[6]

- Install: `npm install oauth4webapi`
- Supports Express integration via async middleware patterns.
- Key features: Authorization Code Flow + PKCE (required for public clients), refresh token grants, token introspection/revocation, AS metadata discovery.[6]

**Source:** https://www.npmjs.com/package/oauth4webapi[6]

## Authorization Code Flow + PKCE Implementation

Use `oauth4webapi` for a secure public client flow in Express. Generate PKCE challenge, redirect to AS, handle callback, exchange code for tokens.

```javascript
import * as oauth from 'oauth4webapi';
import express from 'express';

const app = express();
const as = 'https://auth.example.com'; // AS issuer
const clientId = 'your-client-id';
const redirectUri = 'http://localhost:3000/callback';

const issuer = await oauth.discoveryRequest(as);
const provider = new oauth.Provider(issuer, clientId, undefined, redirectUri); // No secret for public client

// Step 1: Generate PKCE and authorization URL
app.get('/login', async (req, res) => {
  const state = oauth.generateRandomCodeVerifier(32); // Or use session
  const codeVerifier = oauth.generateRandomCodeVerifier(43);
  const codeChallenge = await oauth.calculatePKCEChallenge(codeVerifier);
  
  const authUrl = await oauth.authorizationCodeAuthorizeUrl(provider, {
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    scope: 'openid profile'
  });
  
  // Store state/codeVerifier in session/DB
  req.session = { state, codeVerifier };
  res.redirect(authUrl);
});

// Step 2: Callback - exchange code for tokens
app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const { state: storedState, codeVerifier } = req.session;
  
  if (state !== storedState) return res.status(400).send('State mismatch');
  
  const response = await oauth.authorizationCodeGrant(provider, {
    code,
    code_verifier: codeVerifier
  });
  
  const accessToken = response.access_token;
  const refreshToken = response.refresh_token; // Store securely
  const expiresIn = response.expires_in; // Handle expiry
  
  // Store tokens in DB (encrypted)
  res.redirect('/dashboard');
});
```
This follows OAuth 2.1 profiling with PKCE to prevent code interception.[6]

**Source:** https://www.npmjs.com/package/oauth4webapi (ESM examples, Authorization Code Flow source)[6]

## Refresh Token Handling

Exchange expired access tokens using stored refresh token without user re-auth.

```javascript
// Refresh endpoint or middleware
app.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body; // From secure storage
  
  const response = await oauth.refreshTokenGrant(provider, {
    refresh_token: refreshToken
  });
  
  // Update stored tokens
  res.json({ access_token: response.access_token, refresh_token: response.refresh_token });
});
```
Implement expiry checks: If `expires_in` provided, refresh proactively (e.g., at 80% expiry).[3][6]

**Sources:** 
- https://support.zendesk.com/hc/en-us/articles/4408845965210-Using-OAuth-authentication-with-your-application (refresh flow)[3]
- https://www.npmjs.com/package/oauth4webapi (Refresh Token grant)[6]

## Security Best Practices

- **PKCE mandatory** for SPAs/public clients: Uses `code_challenge` (S256) and `code_verifier` to bind code to client.[5][6]
- **State parameter**: Opaque value to prevent CSRF; validate on callback.[1][2]
- **HTTPS only**: Redirect URIs must be secure (https:// except localhost).[3]
- **Token storage**: Encrypt refresh tokens in DB; never log/store access tokens long-term; use short expiry (e.g., `expires_in`).[2][3]
- **Exact redirect_uri match**: AS validates against registered URIs.[1][3]
- **Scopes**: Request minimal (e.g., `openid profile`); display consent.[2]
- **DPoP/JWT**: Enable proof-of-possession for token binding.[6]
- **Avoid client_secret in browser**: Use public clients with PKCE.[6]

Bruno example shows PKCE `code_challenge` in system browser flow with Node callback server (`@usebruno/oauth2-callback-server` on port 3000).[5]

**Sources:**
- https://clerk.com/docs/guides/configure/auth-strategies/oauth/overview (security rationale)[2]
- https://blog.usebruno.com/oauth2-callback-url-and-system-browser-support-in-bruno?hs_amp=true (PKCE example)[5]
- https://www.npmjs.com/package/oauth4webapi (FAPI 2.0 best practices)[6]

## Next Steps
1. Register app at your OAuth provider (e.g., get `client_id`, set redirect `http://localhost:3000/callback`).
2. Test flow: `npm init -y && npm i express oauth4webapi session`, run above code.
3. Add session store (e.g., `express-session` with Redis) for production.
4. Audit with OWASP OAuth cheatsheet for latest (search "OWASP OAuth 2.0"). 

No direct Node.js Express tutorials in recent results (last 30 days); above synthesizes authoritative 2025-2026 sources.[1][2][3][5][6]
