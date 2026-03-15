# Subtask Output — Research Microservices and Monolith Architecture
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Companies Using Monolith Architecture
- **Basecamp**: Continues using a Ruby on Rails monolith for its project management tool, citing simplicity and speed for a team under 50 developers; avoids microservices complexity as it scales to millions of users.[1][3]
- **Shopify (early stages)**: Started as a monolith before partial migration; still leverages modular monoliths for core e-commerce functions to maintain dev speed.[3] (Note: No 2026-specific examples found in results; Shopify's approach referenced in comparisons.)
No additional recent company examples (post-Feb 2026) in search results.

## Companies Using Microservices Architecture
- **Netflix**: Deploys over 1,000 microservices on Kubernetes for streaming, enabling independent scaling of recommendation, encoding, and playback services; handles 200M+ subscribers.[1][5] (Implied in scalability discussions.)
- **Amazon**: Powers e-commerce with microservices for checkout, inventory, and personalization; supports horizontal scaling across global regions.[2][5]
- **Uber**: Migrated from monolith to 1,000+ microservices using Domain-Driven Design (DDD), isolating ride-matching and payments for resilience.[5]
No new 2026 adopters specified; trends emphasize enterprises >100 developers.[3]

## Decision Criteria for Choosing Between Monolith and Microservices
Use this table for direct comparison based on key factors from 2026 analyses:

| Factor              | Monolith Advantage                          | Microservices Advantage                     | Choose Monolith If...                  | Choose Microservices If...             |
|---------------------|---------------------------------------------|---------------------------------------------|----------------------------------------|----------------------------------------|
| **Team Size**      | Simpler for <50 developers[3]              | Parallel dev for >100 developers[3]        | Small/mid teams, low velocity needs[1] | Large orgs, high-velocity delivery[1] |
| **Scalability**    | Vertical only, limited[1][2]               | Horizontal per service[1][2]               | Predictable loads[4]                   | High-traffic, selective scaling[1]    |
| **Deployment**     | Single unit, fast early[1][2]              | Independent, faster releases[1]            | Simple CI/CD[1]                        | Mature DevOps, Kubernetes[3][5]       |
| **Complexity**     | Low initial, easy debug[1][2]              | High ops (needs Jaeger/Datadog)[1]         | Early stage, no AI integration[3]      | Cloud-native, AI/API-first[3]         |
| **Fault Isolation**| System-wide failure[1][2]                  | Service-level[1][2]                         | Stable requirements[4]                 | Resilience critical[1]                |
| **Dev Speed**      | Faster startup[1]                          | Slower initial, modular long-term[1]       | MVP/ship fast[4]                       | Innovation pressure[4]                |

**Actionable Next Steps**:
- Assess team size and traffic: Run profiling tools on current app to identify coupling (e.g., Strangler Pattern for migration).[5]
- For monolith: Adopt modular monolith with DDD bounded contexts; test scalability to 10x load.
- For microservices: Implement OTel for tracing, Kubernetes for orchestration; pilot 1-2 services with Saga Pattern for data consistency.[3]
- Benchmark: If deployment cycles >1 week or debug time >20% of dev time, evaluate microservices POC.

## Relevant Trends (2026 Focus)
- **Modular Monoliths Rising**: Preferred for teams <50 devs; bridges to microservices without full rewrite; easier than "distributed monolith" pitfalls.[1][3]
- **MACH Architecture**: Microservices + API-first + Cloud-native + Headless for e-commerce/startups; enables 2x faster iterations vs monoliths.[4]
- **AI Integration**: Microservices expose API libraries for AI; monoliths become "black boxes."[3]
- **Migration Patterns**: Strangler (incremental replace), DDD for boundaries; 70% enterprises modernizing monoliths via Kubernetes/CI-CD.[5]
No results from last 30 days (post-Feb 15, 2026); trends from early 2026 sources. Refine search: "microservices adoption 2026 case studies" for updates.
