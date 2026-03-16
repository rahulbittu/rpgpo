# Subtask Output — Research API Versioning Strategies
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# API Versioning Strategies: Current Best Practices

**Three primary API versioning methods are URL path versioning, header versioning, and query parameter versioning**, each with distinct advantages for managing API evolution while maintaining backward compatibility[2].

## URL Path Versioning

**URL path versioning is the simplest and most visible approach**, embedding the version directly in the endpoint URL[2]. This method uses the format `/api/v1/users` or `/api/v2/users`, making the version immediately apparent to API consumers[2]. The OneUptime documentation (published February 20, 2026) provides a practical Flask implementation showing how to register multiple version blueprints simultaneously, allowing both v1 and v2 endpoints to coexist and serve different response structures[2].

## Header Versioning

Header-based versioning uses HTTP headers to specify the API version, such as `Accept: application/vnd.api.v1+json`[2]. This approach keeps URLs clean but requires clients to explicitly set headers when making requests[2].

## Query Parameter Versioning

Query parameter versioning appends version information to the request URL as a parameter, for example `/api/users?version=1`[2]. This method provides flexibility but is less discoverable than URL path versioning[2].

## Industry Implementation Standards

**GitHub released calendar-based versioning on March 12, 2026**, introducing version `2026-03-10` as their first calendar version with breaking changes[4]. GitHub provides **24 months of support** for the previous version (`2022-11-28`), with requests defaulting to that version if no `X-GitHub-Api-Version` header is specified[4].

**Qualys implemented a 12-month migration window** for customers to shift to latest API versions, with an extended testing period of more than 30 days and simultaneous access to old and new versions during transition[3]. Their versioning standards rollout was scheduled for mid-October 2025[3].

## Key Best Practices

**Version your API from day one** to prevent disruption when introducing breaking changes[2]. Maintain **backward compatibility** by properly managing versions so old API versions continue functioning when new versions release[1]. Integrate API testing into CI/CD pipelines to catch version-related issues early, and regularly update test suites to accommodate new API versions or functionality changes[1].
