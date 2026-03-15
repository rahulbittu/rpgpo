# Subtask Output — Research REST Endpoint Details
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## NetSuite REST Web Services Authentication Errors
NetSuite uses Bearer token authentication for RESTlets and REST web services, returning specific WWW-Authenticate headers on failure.[1]
- **Endpoints**: Not explicitly listed; errors apply to all authenticated REST endpoints.
- **Error Examples**:
  | HTTP Code | Error Value | Error Description | Header Example |
  |-----------|-------------|-------------------|---------------|
  | 400 Bad Request | invalid_request | Malformed syntax, missing/repeated parameters | `HTTP/1.1 400 Bad Request WWW-Authenticate: Bearer realm="123456", error="invalid_request", error_description="The request could not be understood by the server due to malformed syntax."`[1] |
  | 401 Unauthorized | invalid_token | Expired, revoked, malformed, or invalid token | `HTTP/1.1 401 Unauthorized WWW-Authenticate: Bearer realm="123456", error="invalid_token", error_description="Invalid login attempt."`[1] |
- **Security Notes**: Use valid tokens; malformed requests trigger 400 before auth check.[1]

## UP42 API Authentication Errors
UP42 REST API requires access tokens for authentication, with explicit rate limiting.[3]
- **Endpoints**: All API endpoints (e.g., data processing pipelines).
- **Error Codes**:
  | Code | Reason | Solution |
  |------|--------|----------|
  | 400 | Invalid request | Update per API reference[3] |
  | 401 | Authentication failed | Generate valid access token[3] |
  | 403 | Not authorized | Check user role permissions[3] |
  | 429 | Rate limit exceeded | Stay within limits (specific limits not detailed)[3] |
- **Security Notes**: Token must be valid; role-based access control enforces 403.[3]

## Airtable API Authentication Errors
Airtable uses API tokens or keys for base access, with per-base rate limits of 5 requests/second.[7]
- **Endpoints**: `/v0/{baseId}/{tableId}` for CRUD operations.
- **Error Examples**:
  | Code | Error Type | JSON Response Example | Fix |
  |------|------------|-----------------------|-----|
  | 401 | Unauthorized | Invalid token | Verify token matches setup[7] |
  | 403 | INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND | `{"error": {"type": "INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND", "message": "Invalid permissions..."}}`[7] | Check user/token permissions and model IDs[7] |
  | 429 | TOO_MANY_REQUESTS | Rate limit hit | Wait 30 seconds; add timeouts (5 req/sec per base)[7] |
- **Security Notes**: Tokens lack base permissions cause 403; monthly call limits reset on 1st.[7]

## DealCloud API Authentication Errors
DealCloud requires API key, client ID, and authorization token (OAuth-style).[6]
- **Endpoints**: All API endpoints.
- **Error Codes**:
  | Code | Meaning | JSON Example | Resolution Steps |
  |------|---------|--------------|------------------|
  | 401 | Unauthorized (expired/invalid token, wrong key/ID) | `{"error": "invalid_client"}`[6] | Correct API key/client ID; refresh token[6] |
  | 403 | Forbidden (missing permissions/scopes) | N/A | Adjust user group permissions; add required scope; verify URL[6] |
- **Security Notes**: Token expiration common; scopes must match endpoint requirements.[6]

## Common Patterns Across APIs (BMC, Acronis)
No full endpoint examples with auth flows, but consistent HTTP codes for auth:
- **401 Unauthorized**: Unauthenticated user or invalid token (BMC[4], Acronis[5]).
- **403 Forbidden**: Authenticated but insufficient permissions (BMC[4], Acronis[5]).
- **Rate Limits**: 429 explicit in UP42/Airtable; retry 50x errors with 1-2s delay in Acronis[5].
- **Security Notes**: JSON error bodies provide details (e.g., BMC: `[{"messageType":"ERROR","messageText":"Form does not exist...","messageNumber":303}]`[4]); always validate tokens before requests.[4][5]

No recent (post-2026-02-13) sources found for new public REST auth endpoints with full specs; results from API docs emphasize token validation and standard HTTP codes. For custom implementations, use OAuth 2.0 Bearer tokens with HTTPS.
