# Subtask Output — Research Feature Flag Systems
## Model: sonar
## Stage: research
## Date: 2026-03-16

## LaunchDarkly: Real-Time Targeting and A/B Testing

LaunchDarkly provides percentage-based rollouts (e.g., 10% of users), user targeting rules (e.g., US Pro plan users with >30 days account age), A/B testing integration via built-in experimentation, kill switches for instant toggles, and full audit trails of flag changes.[1]  
**Example in SaaS**: Netflix deploys hundreds of times daily using LaunchDarkly flags for safer rollbacks in seconds vs. 15-60 minutes without flags.[1]  
Source: https://www.buildmvpfast.com/glossary/feature-flag

## Statsig, Flagsmith, Unleash: Edge Evaluation Platforms

These platforms support gradual rollouts (e.g., 50/50 or 90/10 splits), A/B testing, kill switches, complex targeting (user attributes like plan tier, geo, account ID), and audit logging with millisecond flag updates at the edge.[1]  
**SaaS Use**: Permission flags gate features by pricing tiers (Pro gets advanced analytics, Starter does not); evolve into entitlement systems.[1]  
Source: https://www.buildmvpfast.com/glossary/feature-flag

## Harness Feature Management & Experimentation (FME): Pipeline Integration

Supports percentage rollouts via "Set Default Allocations" (e.g., 50/50, 90/10), targeting rules/segments, kill switches ("Disable a feature flag" step), A/B testing with metrics, and audit via full lifecycle management (Create/Update/Delete flags in pipelines).[3] Flag states: Active/Archived/Deleted. OpenFeature providers (added 2025-10-28) enable vendor-agnostic SDKs across languages.[3]  
**Actionable Step**: Integrate into CI/CD for coordinated deployments; e.g., set explicit target lists during rollout.[3]  
Source: https://developer.harness.io/release-notes/feature-management-experimentation/

## OneUptime: Monitoring with Progressive Rollouts

Implements gradual rollouts (10% users), A/B testing (e.g., button color variants), kill switches (Ops flags, permanent), targeting via user_id checks, and audit/monitoring (track evaluations, error rates, latency per variant).[4] Types: Release (days-weeks, new dashboard), Experiment (weeks-months), Ops (kill switches), Permission (premium features).[4]  
**Code Example** (FastAPI):  
```python
if flags.is_enabled("new_recommendations_widget", user_id):
    response["widgets"].append("recommendations")
```  
Correlates flag changes with metrics spikes.[4]  
Source: https://oneuptime.com/blog/post/2026-02-20-feature-flags-guide/view

## Istio Traffic Routing: Infrastructure-Level Flags

Uses VirtualService for percentage/gradual rollouts by routing to new/old deployments (e.g., new checkout flow via header match "x-feature-new-checkout: enabled"). Supports multiple flags (checkout + search) without code changes; acts as kill switch by shifting 100% traffic.[5] Best for service-level features, not fine-grained UI toggles.[5]  
**Kubernetes YAML Example**:  
```yaml
- match:
    - headers:
        x-feature-new-checkout:
          exact: "enabled"
      route:
      - destination:
          subset: new-flow
```  
Source: https://oneuptime.com/blog/post/2026-02-24-how-to-implement-feature-flags-with-istio-traffic-routing/view

**Next Steps for SaaS Build**: Start with LaunchDarkly free tier (up to 50 flags/month, per their site); test 10% rollout on a non-critical feature like dashboard widget; monitor via integrated analytics for <1% error rate increase before 100% rollout.[1] GitHub/Netflix scale to 5-10 flags for frequent deploys.[1]
