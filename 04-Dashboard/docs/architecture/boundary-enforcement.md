# Boundary Enforcement

## Purpose
Block or redact real API responses when data boundary policies are violated.

## Outcomes
- allowed: response served normally
- blocked: response denied with reason
- redacted: response served with sensitive fields removed

## Telemetry
Blocks auto-emit telemetry for observability.
