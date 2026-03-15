# Subtask Output — Research API Versioning Best Practices
## Model: sonar
## Stage: research
## Date: 2026-03-15

## URL Path Versioning
Includes version in the URL path, e.g., `/api/v1/users` or `/api/v2/users`.[3]

**Real Examples**
- Flask implementation: `url_prefix="/api/v1"` for v1 blueprint, `/api/v2` for v2 with updated response shapes like added pagination.[3]
- Common in REST APIs from day one for visibility.[3]

**Pros**
- Simplest and most visible approach, easy for debugging and manual testing.[3]
- Straightforward client integration without extra headers.[2]

**Cons**
- Pollutes URLs, requires separate endpoints per version, increasing maintenance.[2]

## Header-Based Versioning
Uses custom HTTP headers to specify version, e.g., `Accept: application/vnd.company.v2+json` or `X-GitHub-Api-Version: 2026-03-10`.[2][6]

**Real Examples**
- GitHub REST API: Defaults to `2022-11-28` without header; update to `2026-03-10` for breaking changes like new endpoints.[6]
- LinkedIn Marketing API: `Linkedin-Version: 202601` (YYYYMM format) for January 2026 release, monthly cycle with 1-year minimum support.[5]
- Enterprise: `Accept: application/vnd.company.v2+json` for clean URLs.[2]

**Pros**
- Clean URLs unchanged across versions; flexible for mature platforms and controlled ecosystems.[2][6]
- Supports calendar-based (e.g., GitHub 2026-03-10) or media-type versioning; non-breaking changes available across versions.[6]

**Cons**
- Harder for manual testing and debugging visibility.[2]
- Requires header management in clients.[5]

## Query Parameter Versioning
Appends version as query param, e.g., `/api/users?version=1` or `/articles?include=author_v2`.[3][2]

**Real Examples**
- Basic: `/api/users?version=1` as one of three common strategies.[3]
- Capability-level: `/articles?include=author_v2` to version specific features without full API versioning.[2]

**Pros**
- No URL pollution or header changes; reduces blast radius for feature-specific evolution.[2]

**Cons**
- Less standardized than path/header; can complicate caching and routing; not as visible.[3] (Inferred from comparisons favoring path/header.)

## Comparison Table

| Approach          | Visibility | URL Cleanliness | Testing Ease | Best For                  | Example Companies |
|-------------------|------------|-----------------|--------------|---------------------------|-------------------|
| **URL Path**     | High      | Low            | High        | Simple REST APIs         | Generic Flask apps[3] |
| **Header**       | Low       | High           | Low         | Enterprise/SaaS (GitHub, LinkedIn, Stripe date-based)[2][5][6] | GitHub, LinkedIn[5][6] |
| **Query Param**  | Medium    | Medium         | Medium      | Feature-level changes    | N/A specific[2][3] |

## Key Statistics and Studies
- Qualys: 12-month migration window standard; >30 days testing; dual access during transition; rollout by mid-Oct 2025 for VMDR, Policy Audit.[4]
- GitHub: 24-month support for prior version (2022-11-28); calendar versioning since 2022 with breaking changes in 2026-03-10.[6]
- LinkedIn: Monthly releases, 1-year minimum support per version.[5]
- General: Deprecate with 3-12 month notice, migration guides; additive changes preferred over breaking (e.g., add fields vs. rename).[2]

## Actionable Next Steps
- Audit your API: Identify breaking changes like field renames (e.g., string to object).[2]
- Implement: Start with URL path for prototypes (Flask blueprint code above); switch to headers for production scale.[3][2]
- Deprecate: Announce 3-12 months early, track migrations like GitHub.[2][6]
- Test: Run parallel v1/v2 like Qualys dual access.[4]
