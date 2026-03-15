# Subtask Output — Research OAuth 2.0 and OpenID Connect
## Model: sonar
## Stage: research
## Date: 2026-03-15

# OAuth 2.0 and OpenID Connect: Current Standards and Security Practices

**OAuth 2.0 is an authorization framework for delegated access, while OpenID Connect (OIDC) is an authentication layer built on top of OAuth 2.0 that enables single sign-on.**[1][2] OAuth 2.0 answers "what can you access?" while OIDC answers "who are you?"[2]

## Core Differences

**OAuth 2.0** provides an *access token* for authorization—granting permissions to third-party applications to access resources without exposing user credentials.[1][4] **OpenID Connect**, introduced in 2014, adds an *ID token* containing verifiable user information like name and email, which confirms identity.[1] OIDC is backed by major companies including Google and Microsoft and is the industry standard for authentication.[1]

The practical difference: an application uses OIDC to log a user in (authentication) and then uses the resulting OAuth 2.0 access token to call APIs on the user's behalf (authorization).[1]

## Authentication Flows

The standard flow for user-facing applications follows these steps:[2]

1. User clicks "Login" on the client application
2. Application redirects to the authorization server's `/authorize` endpoint
3. Authorization server displays login page
4. User enters credentials
5. Authorization server redirects back with an authorization code
6. Application exchanges the code for tokens (access token + ID token)
7. Application calls APIs using the access token
8. Resource server returns protected data

For user-facing apps, the **Authorization Code with PKCE** (Proof Key for Code Exchange) flow is recommended.[2] For service-to-service communication, **Client Credentials** flow is appropriate.[2]

## Token Types

**Access tokens** are issued by OAuth 2.0 and grant permission to access resources.[2] **ID tokens** are JWT (JSON Web Tokens) provided by OpenID Connect and contain cryptographically signed proof of user identity.[2] **Refresh tokens** allow applications to obtain new access tokens without requiring the user to log in again.[2]

## Common Security Mistakes

Based on current guidance, avoid these practices:

- **Sharing passwords with third-party apps:** OAuth 2.0 eliminates this by using access tokens instead.[4]
- **Requesting excessive scopes:** Follow the principle of least privilege when requesting permissions.[2]
- **Failing to validate tokens properly:** Tokens must be cryptographically verified before use.[2]
- **Not implementing PKCE for public clients:** PKCE protects against authorization code interception attacks.[2]

## Current Solutions (2026)

**Ory** (combining Ory Kratos for user management and Ory Hydra for OAuth2/OIDC) is an open-source identity infrastructure designed for cloud-native architectures.[5] It provides OAuth 2.0 and OpenID Connect provider capabilities with native Go SDKs, RESTful APIs, and self-hosted deployment options.[5]

An emerging standard, **OAuth 2.0 for First-Party Applications**, was last updated on February 27, 2026, addressing authentication flows for applications owned by the same organization as the resource server.[8]

Source: [1] https://www.weweb.io/blog/single-sign-on-using-oauth2-developer-guide
Source: [2] https://oneuptime.com/blog/post/2026-02-20-oauth2-oidc-explained/view
Source: [4] https://www.8x8.com/s/oauth-oauth2
Source: [5] https://workos.com/blog/top-authentication-solutions-go-2026
Source: [8] https://datatracker.ietf.org/doc/draft-ietf-oauth-first-party-apps/
