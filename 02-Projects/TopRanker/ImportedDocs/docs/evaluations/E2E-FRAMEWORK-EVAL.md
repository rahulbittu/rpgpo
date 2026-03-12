# E2E Test Framework Evaluation — Detox vs Maestro
**Evaluator:** Carlos Ruiz (QA Lead)
**Date:** March 8, 2026
**Sprint:** 72

## Context
TopRanker is an Expo Router React Native app. We need E2E testing for critical flows:
- User signup/login
- Rating submission
- Business detail page navigation
- Challenger voting
- Badge display verification

## Detox (Wix)

### Pros
- Deep React Native integration with native-level interactions
- Synchronization engine — waits for animations, network, bridge idle
- Strong CI support (GitHub Actions, CircleCI)
- Jest-based — team already knows the API
- Gray-box testing — can query component tree

### Cons
- Complex setup with native build requirements
- Expo support requires custom dev client (no Expo Go)
- iOS simulator only on macOS CI runners
- Slow build times for initial setup
- Android support is less mature

## Maestro (mobile.dev)

### Pros
- YAML-based flows — zero code, very fast to author
- Works with Expo Go and dev clients equally
- Platform-agnostic (iOS + Android from same flow files)
- Visual screenshot comparison built-in
- Cloud CI integration (Maestro Cloud)
- Extremely fast onboarding — 5 minutes to first test

### Cons
- Black-box only — can't inspect component state
- YAML DSL limits complex assertions
- Less community adoption than Detox
- No direct Jest/Vitest integration
- Paid cloud tier for parallel runs

## Recommendation: **Maestro**

### Rationale
1. **Expo compatibility** — Maestro works with Expo Go, no native builds needed
2. **Speed of authoring** — YAML flows match our sprint velocity expectations
3. **Team leverage** — QA can write tests without deep JS knowledge
4. **Coverage strategy** — Unit/integration (Vitest, 150+ tests) covers logic; E2E covers user flows
5. **Cost** — Free CLI, cloud tier only if needed for CI parallelism

### Proposed First Flows
1. `flow-signup.yaml` — Email signup → profile creation
2. `flow-rate.yaml` — Navigate to business → submit rating
3. `flow-leaderboard.yaml` — Scroll leaderboard → tap business → verify detail page
4. `flow-badges.yaml` — Profile page → badge grid visible

### Implementation Plan
- Sprint 73: Install Maestro CLI, write first 2 flows
- Sprint 74: Add remaining flows, integrate with CI
- Sprint 75: Screenshot comparison baseline
