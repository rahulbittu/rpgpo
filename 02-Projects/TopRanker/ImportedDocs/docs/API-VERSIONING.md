# API Versioning Strategy

> TopRanker API Versioning — Sprint 119

## Current Version

**1.0.0** — delivered via `X-API-Version` response header on all `/api/*` endpoints.

## Versioning Strategy

TopRanker uses **header-based versioning** with the `X-API-Version` header.

| Mechanism | Header | Example |
|-----------|--------|---------|
| Response header | `X-API-Version` | `1.0.0` |
| Request override | `X-API-Version` | `1.0.0` (optional, for pinning) |

### Why header-based?

- URL paths stay clean (`/api/businesses`, not `/api/v1/businesses`)
- Clients opt-in to version pinning; default is latest stable
- CDN-friendly — version in header, not path

## Deprecation Policy

All deprecations follow a **6-month notice** period:

1. **Announcement**: Deprecated endpoints return a `Sunset` header with the retirement date
2. **Sunset header**: `Sunset: Sat, 08 Sep 2026 00:00:00 GMT` (RFC 7231 format)
3. **Deprecation header**: `Deprecation: true` added to responses
4. **Migration guide**: Published in CHANGELOG.md with migration steps
5. **Retirement**: Endpoint returns `410 Gone` after sunset date

### Sunset Header Example

```
HTTP/1.1 200 OK
X-API-Version: 1.0.0
Deprecation: true
Sunset: Sat, 08 Sep 2026 00:00:00 GMT
```

## Breaking Change Process

A **breaking change** is any modification that could cause existing clients to fail:

- Removing or renaming a field
- Changing a field's type
- Removing an endpoint
- Changing authentication requirements

### Process

1. **Increment major version** (e.g., 1.0.0 → 2.0.0)
2. **Maintain old version** for the full deprecation period (6 months)
3. **Both versions run simultaneously** — old version receives security patches only
4. **Sunset header** added to old version responses immediately
5. **Migration guide** published before new version goes live

## Non-Breaking Changes

The following do **not** require a version bump:

- Adding new fields to response objects
- Adding new endpoints
- Adding optional query parameters
- Adding new enum values (when clients handle unknown values)
- Performance improvements
- Bug fixes that align behavior with documentation

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2026-02-15 | Initial stable API release |

## Implementation Details

The `X-API-Version` header is set by middleware in `server/routes.ts`:

```typescript
res.setHeader("X-API-Version", "1.0.0");
```

All `/api/*` responses include this header automatically.

---

*Last updated: Sprint 119 (2026-03-08)*
