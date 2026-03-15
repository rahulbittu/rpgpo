# Subtask Output — Research Feature Flag Management
## Model: sonar
## Stage: report
## Date: 2026-03-15

## Rollout Strategies
Gradual rollouts use percentage-based targeting to release features to a growing share of users, such as starting at 10% and scaling to 100%[1][3][4]. AWS AppConfig supports built-in rollout strategies like linear ramp-ups for managed delivery in production[1]. Harness enables rollout plans with targeting rules across environments, using approvals for production changes to ensure oversight before publishing[2]. GitOps with ArgoCD promotes flags via PRs from dev to staging to production, with environment-specific overrides like `rollout_percentage: 10` for `new-checkout-flow` in production ConfigMaps[4].

**Next steps:** Deploy AWS AppConfig via Terraform for percentage rollouts (code example in [1]); test with 10% traffic on a non-critical flag.

## Kill Switches
Feature flags act as kill switches by instantly disabling problematic features without rollbacks, propagating changes in real-time via DynamoDB Streams, EventBridge, or Redis caching for sub-10ms evaluation[1]. Platforms like LaunchDarkly and Flagsmith enable millisecond flag toggles at the edge without redeploys, serving as emergency off-switches in production[3]. Open-source tools like Flagsmith support remote configuration for immediate kill switch activation across self-hosted instances[5].

**Next steps:** Integrate Redis caching with DynamoDB for <10ms kill switch latency; toggle a test flag in production to verify propagation time.

## A/B Testing Integration
Feature flags integrate with A/B testing via multivariate flags and user segmentation, such as targeting "beta-group-a" for variants while measuring impact[3][4][5]. PostHog and Statsig combine flags with built-in experimentation, statistical analysis, and product analytics to track behavior changes from flag variations[5]. Harness supports A/B via treatments in rollout plans with user bucketing; Flagsmith offers multivariate flags with SDKs for real-time testing[2][5]. OpenFeature CRDs in ArgoCD manage A/B targeting rules like `include_users: ["internal-testers"]` for `ai-recommendations`[4].

**Next steps:** Use Flagsmith self-hosted (free tier) for A/B on one feature; integrate with PostHog analytics to measure conversion lift on 5% traffic split.

## Real Examples
- **OneUptime Terraform Setup (Feb 2026):** AWS AppConfig + DynamoDB + Redis for production flags; example kills `new-checkout-flow` instantly via API Gateway[1]. Source: https://oneuptime.com/blog/post/2026-02-23-how-to-build-a-feature-flag-infrastructure-with-terraform/view
- **ArgoCD GitOps (Feb 2026):** Production ConfigMap with `rollout_percentage: 10` for `new-checkout-flow`, A/B targeting `beta-group-a`; PR-based promotion[4]. Source: https://oneuptime.com/blog/post/2026-02-26-argocd-feature-flag-gitops-configuration/view
- **Flagsmith Open-Source:** Multivariate flags with percentage rollouts and A/B; self-hosted for production kill switches, no per-seat fees[3][5]. Source: https://posthog.com/blog/best-open-source-feature-flag-tools
- **FeatBit .NET Platform:** Real-time updates for production testing, sampling rollouts across environments without redeploys[6]. Source: https://blog.nimblepros.com/blogs/feature-flags-in-dotnet/

**Next steps:** Fork Flagsmith repo (GitHub stars: 4k+ as of 2026), deploy to Kubernetes; run A/B test on `dark-mode` flag with 50/50 split targeting Pro users.
