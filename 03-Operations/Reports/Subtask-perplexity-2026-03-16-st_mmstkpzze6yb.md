# Subtask Output — Research Load Testing Tools
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## k6 Overview
k6 is an open-source load testing tool using JavaScript scripting, emphasizing resource efficiency, scalability, and developer-friendly CI/CD integration. As of February 2026, it has 29.9k GitHub stars, surpassing Locust (27.5k) and JMeter (9.2k); a separate source reports 30.1k stars.[1][6] Grafana Labs benchmarks show k6 uses 256 MB memory for a standard test (vs. JMeter's 760 MB, 3x efficiency) and 100 KB per goroutine (vs. JMeter's 1 MB per thread, 10x improvement), generating 300,000+ requests/second on one instance.[1] k6 Operator v1.0 (GA September 2025) enables Kubernetes-native testing with TestRun and PrivateLoadZone CRDs.[1]

**Source:** https://www.vervali.com/blog/best-load-testing-tools-in-2026-definitive-guide-to-jmeter-gatling-k6-loadrunner-locust-blazemeter-neoload-artillery-and-more/[1]; https://testguild.com/load-testing-tools/[6]

## Locust Overview
Locust is a free, Python-based open-source load testing tool focused on simplicity and distributed execution for complex scenarios. It uses an event-based architecture, consuming ~70% fewer resources than JMeter's thread-based model per Rahul Solanki (BlueConch Technologies).[6] As of February 2026, it has 27.5k GitHub stars; suited for simple/local tests due to Python's single-core limits, not large-scale.[1][2]

**Source:** https://www.vervali.com/blog/best-load-testing-tools-in-2026-definitive-guide-to-jmeter-gatling-k6-loadrunner-locust-blazemeter-neoload-artillery-and-more/[1]; https://speedscale.com/blog/the-6-best-performance-testing-tools/[2]; https://testguild.com/load-testing-tools/[6]

## Gatling Overview
Gatling is an open-source load testing tool with Akka-based event-driven architecture, supporting simulations in Java, Scala, Kotlin, JavaScript, or TypeScript via a user-friendly DSL. A single agent simulates 3,000-5,000+ concurrent users (vs. JMeter's ~1,000), reducing infrastructure costs; includes cloud/distributed execution and Helm charts for Kubernetes on AWS/Azure/GCP.[1][3][4] Regarded as top for performance/scalability in modern apps/APIs.[4]

**Source:** https://www.vervali.com/blog/best-load-testing-tools-in-2026-definitive-guide-to-jmeter-gatling-k6-loadrunner-locust-blazemeter-neoload-artillery-and-more/[1]; https://www.vervali.com/blog/load-testing-platform-architecture-2026-data-models-schema-design-and-infrastructure-patterns-for-k6-gatling-and-jmeter/[3]; https://aqua-cloud.io/13-best-tools-for-performance-testing/[4]

## Direct Comparisons
| Tool   | GitHub Stars (Feb 2026) | Memory Efficiency (vs JMeter) | Max Users/Requests per Instance | Scripting Language | Kubernetes Support                  |
|--------|------------------------|-------------------------------|---------------------------------|---------------------|-------------------------------------|
| **k6** | 29.9k-30.1k[1][6]     | 3x (256 MB vs 760 MB)[1]     | 300k req/s[1]                  | JavaScript         | Operator v1.0 (GA Sep 2025)[1]     |
| **Locust** | 27.5k[1]            | 70% less resources[6]        | Event-based, simple scale[2]   | Python             | Standard pods[1]                    |
| **Gatling** | Not specified       | High (3-5k users/agent)[1]   | 3-5k+ users[1]                 | Java/Scala/JS/etc.[3] | Helm charts (AWS/Azure/GCP)[1]     |

All three support CI/CD (e.g., k6/Gatling exit codes for thresholds; tiered tests: 2-min PR smoke, 10-15 min staging, 30-60 min nightly).[3] k6 leads in community size/efficiency; Gatling in per-agent scale; Locust in Python simplicity.[1][2][6]

**Next Steps:** Clone k6 repo (30k+ stars) for JS-based tests; benchmark Locust on your setup (70% less resources); deploy Gatling via Helm for 3-5k user sims. Test via Grafana Labs benchmarks.[1][6]
