# HTTP Response Guard Architecture

## Purpose
Reusable guard layer that applies actual payload redaction and returns appropriate HTTP semantics.

## Guard Function
`guard(route, tenantId, projectId)` → `{ allowed, status, outcome, payload, reason }`

## Outcomes
- `allow` → 200, pass to handler
- `deny` → 403, return error payload
- `redact` → 200, data wrapped with `_redacted: true`

## Redaction
`redactPayload(data, reason)` → adds `_redacted: true` and `_redaction_reason` to response

## Evidence
Every deny/redact records enforcement evidence and route execution log.
