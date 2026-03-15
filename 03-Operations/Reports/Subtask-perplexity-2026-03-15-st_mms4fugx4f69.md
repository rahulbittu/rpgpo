# Subtask Output — Research Observability Pillars
## Model: sonar
## Stage: research
## Date: 2026-03-15

## Finding 1: Three Pillars Defined in Distributed Systems
The three pillars of observability—**logs**, **metrics**, and **traces**—provide complementary insights for understanding distributed systems: metrics quantify system health (e.g., CPU usage, request rates, error counts), logs record time-stamped events for debugging, and traces track request flows across microservices to identify bottlenecks.[2][5]  
In practice, metrics enable performance monitoring and alerting on deviations (e.g., spotting slowdowns or resource trends), logs offer detailed event records, and traces visualize request propagation for root cause analysis.[1][7]  
**Source:** https://dev.to/godofgeeks/the-three-pillars-of-observability-644 [1]; https://amquesteducation.com/blog/software-observability/ [2]; https://www.ir.com/guides/what-is-enterprise-observability [5]; https://oneuptime.com/blog/post/2026-02-24-the-observability-stack-is-dying/view [7]

## Finding 2: Use Cases and Benefits with Real-World Data
Netflix collects metrics, logs, and traces across thousands of microservices for automated anomaly detection via machine learning, real-time dependency mapping, and developer dashboards to ensure streaming performance (case study from 2025 update).[2]  
IR Transact manages 600 million transactions daily using observability for financial compliance, achieving 50% faster incident resolution, 49% decrease in outages, and 43% operational cost savings via unified logs, metrics, and traces.[5]  
Traces preserve causality in multi-step AI workflows, helping pinpoint slowdowns from retrieval, tool calls, or model changes (InsightFinder 2025 retrospective).[6]  
**Source:** https://amquesteducation.com/blog/software-observability/ [2]; https://www.ir.com/guides/what-is-enterprise-observability [5]; https://insightfinder.com/blog/observability-insights-to-operational-actions/ [6]

## Finding 3: Key Capabilities and Best Practices (2025-2026)
Essential features include unified correlation of logs/metrics/traces, powerful querying, dashboards, anomaly detection, and scalability for high-volume data in cloud-native systems.[1][2]  
Best practices: Implement comprehensive instrumentation, distributed tracing pipelines, and data correlation to reduce mean time to resolution (MTTR); correlate telemetry for capacity planning and dependency mapping.[2]  
In multi-agent systems, pillars extend to distributed tracing for cross-agent calls, real-time logs, and evaluation frameworks (Fast.io 2026 guide).[3]  
**Source:** https://dev.to/godofgeeks/the-three-pillars-of-observability-644 [1]; https://amquesteducation.com/blog/software-observability/ [2]; https://fast.io/resources/best-observability-stacks-for-multi-agent-systems/ [3]

## Finding 4: Recent Evolutions and Critiques (2026)
Monte Carlo's Agent Observability (announced pre-2026) monitors AI agents via context, performance (e.g., latency, token usage, error rates), behavior (trajectory monitors for workflow steps), and outputs, with pre-production evaluations on golden datasets; survey notes 33% of organizations can't disable harmful agents quickly.[4]  
Critique: Pillars (metrics for "what," logs for "when," traces for "where") are workarounds for microservices, evolving toward automated problem-solving beyond data collection (OneUptime Feb 24, 2026 post).[7]  
**Source:** https://www.apmdigest.com/monte-carlo-introduces-new-agent-observability-capabilities [4]; https://oneuptime.com/blog/post/2026-02-24-the-observability-stack-is-dying/view [7]
