# Subtask Output — Research Feature Flag Systems for Node.js
## Model: sonar
## Stage: report
## Date: 2026-03-15

## Finding 1: Harness Feature Management Pipeline Steps for Node.js Feature Flags
Harness provides specific pipeline steps for managing feature flags in CI/CD workflows, including Node.js environments via SDK integration. Steps include **Create Feature Flag**, **Update Feature Flag**, **Delete Feature Flag**, **Set Default Allocations** (e.g., 50/50 or 90/10 rollouts), **Set Individual Targets**, **Kill Feature Flag**, **Set Treatments**, and **Set Targeting Rules**. Validation policies prevent misconfigurations like missing descriptions or invalid naming, with options for **Warn and Continue** or **Error and Exit**. Flag states: Active, Archived, Deleted.  
Source: https://developer.harness.io/release-notes/feature-management-experimentation/

## Finding 2: PostHog Open-Source Feature Flag Tool with Node.js SDK
PostHog offers a free open-source feature flag service supporting **Node.js server-side SDK**, plus client-side JS, React, Next.js. Core features: boolean/multivariate flags, user targeting/segmentation, percentage rollouts, remote configuration, A/B testing, audit logs. Flipt (self-hosted, 100% open-source) supports Node.js via API, Git storage, segments (e.g., by email/country), multiple variations, percentage thresholds—no database needed.  
Source: https://posthog.com/blog/best-open-source-feature-flag-tools

## Finding 3: DevCycle Best Practices for Cleaning Unused Feature Flags
DevCycle recommends **human-understandable flag names** (avoid "flag123_dont_delete"), **monthly/quarterly flag reviews** divided by team, and tools to detect unused flags/variables to reduce tech debt and fallback risks (e.g., old UI reactivation). Integrate flag cleanup into sprints; use SDK references to check safety before removal. Applicable to Node.js via their SDK.  
Source: https://docs.devcycle.com/best-practices/tech-debt

## Finding 4: No Direct Node.js-Specific Feature Flag Tools in Recent Results
Searches yielded general tools (PostHog/Flipt with Node.js support) and practices, but no 2026-specific Node.js tutorials, benchmarks, or new tools like "Unleash" or "LaunchDarkly Node.js integrations" in top results. Cloudflare Workers mention `nodejs_compat` flag for Node.js modules (crypto/buffer/stream), not feature flags.[5] Logging/symbol best practices unrelated.[3]  
Source: https://developers.cloudflare.com/workers/best-practices/workers-best-practices/

**Next Steps:**  
- Install PostHog Node.js SDK: `npm i posthog`, initialize with API key, use `posthog.isFeatureEnabled('flag-key', userId)`. Test percentage rollout (e.g., 10% users).[2]  
- Set up Flipt: Clone Git repo, run locally, integrate via HTTP API in Node.js for segments/rollouts.[2]  
- Implement Harness validation in pipelines for Node.js deploys; archive flags post-rollout.[1]  
- Schedule flag review: Query codebase for flag strings, remove unused per DevCycle method.[3]
