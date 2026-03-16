# Subtask Output — Research Feature Toggle Implementation
## Model: sonar
## Stage: report
## Date: 2026-03-16

## LaunchDarkly Implementation

LaunchDarkly is a SaaS platform for managing feature flags, enabling progressive rollouts, A/B testing, and production testing without full deployments. It supports **progressive rollouts** via percentage-based targeting and flag targeting rules, with operational status confirmed for these features as of recent checks[4]. **A/B testing integration** is handled through experimentation features, including statistical analysis and flag variations[4][5].

### Progressive Rollouts
- Deploy code behind a disabled flag, then enable via dashboard for specific user groups or percentages; changes propagate in milliseconds without redeploys[1][3].
- Example Java SDK integration: Import `com.launchdarkly.sdk.server.*`, create `LDClient` with SDK key, evaluate `boolVariation("flag-key", context, false)` to toggle code paths[1].
- In Kubernetes/ArgoCD: Use post-sync hooks to validate relay proxy health (HTTP 200 on `/status`) before rollout; deploy relay proxy first, then app[2].

### A/B Testing Integration
- Built-in experimentation evaluates multivariate flags with user targeting (e.g., US Pro plan users >30 days tenure) and analytics[3][4].
- Coordinate with analytics tools for impact measurement; supports real-time evaluation on client/edge[3][5].

### Cleanup Strategies
- No direct cleanup details in results; general best practice from platforms: Audit logs track changes, delete unused flags via dashboard after validation[1][3].
- Scheduled API retirement (Dec 31, 2026) requires updating to version 20240415; review changelog for flag migration[4].

**Next Steps**: Create project in LaunchDarkly dashboard (Projects tab > Create project > Name/Key), generate SDK key, integrate Java SDK as shown, test rollout to 1% traffic[1][4].

**Sources**:
- https://www.devstringx.com/launch-darkly[1]
- https://oneuptime.com/blog/post/2026-02-26-argocd-launchdarkly-config/view[2]
- https://www.buildmvpfast.com/glossary/feature-flag[3]
- https://status.launchdarkly.com[4]

## Unleash Implementation

Unleash, an open-source alternative, supports self-hosting with SDKs for progressive rollouts and A/B testing, but specific 2026 details are sparse in results; it's grouped with tools like Flagsmith for similar capabilities[5].

### Progressive Rollouts
- Percentage rollouts and user targeting via strategies; remote config changes without deploys[5].
- Supports scheduling and local evaluation for low-latency.

### A/B Testing Integration
- Multivariate flags with segmentation; integrate with product analytics for experiments[5].

### Cleanup Strategies
- Audit logs and permissions for flag management; no specific examples found.

**Limitations**: Search yielded no recent (post-2026-02) Unleash-specific tutorials or examples; relied on general open-source comparisons[5]. For full docs, check official Unleash site (not in results).

**Next Steps**: Deploy self-hosted Unleash (Docker/K8s), configure percentage strategy in UI, integrate SDK (e.g., JS/Python), start with 10% rollout to internal users[5].

**Sources**:
- https://posthog.com/blog/best-open-source-feature-flag-tools[5]

## Comparison: LaunchDarkly vs. Unleash

| Aspect              | LaunchDarkly                          | Unleash                              |
|---------------------|---------------------------------------|--------------------------------------|
| **Deployment**     | SaaS, relay proxy for K8s[2]         | Self-hosted, open-source[5]         |
| **Rollouts**       | Percentage, targeting operational[4] | Percentage, scheduling[5]           |
| **A/B Testing**    | Experimentation core[4]              | Via flags + analytics integration[5]|
| **Cost/Scale**     | Usage-based (users/flags)[6]         | Free core, paid Edge[5]             |
| **Examples**       | Java SDK, ArgoCD hooks[1][2]         | General SDKs, no code snippets      |

**Actionable Choice**: Use LaunchDarkly for enterprise SaaS (e.g., ArgoCD integration saves 2-3 deployment cycles/week)[2]; Unleash for data control in side projects (zero vendor lock-in)[5]. Test both free tiers: LaunchDarkly trial (create project now), Unleash Docker quickstart.
