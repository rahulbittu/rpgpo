# Subtask Output — Research Prometheus Monitoring Stack
## Model: sonar
## Stage: audit
## Date: 2026-03-16

I need to conduct additional web searches to provide the specific, current information you've requested about Prometheus monitoring stack best practices, particularly around recording rules, alerting severity tiers, SLO-based alerting with burn rate windows, and Grafana dashboard design principles. The provided search results cover foundational components but lack the detailed specifications you need.

Let me search for more targeted information on these topics.

Based on the search results provided, I can offer foundational guidance, but I must note that **the results lack specific details on several key areas you requested**: recording rules syntax, alerting severity tier definitions, burn rate window calculations, and Grafana dashboard design principles with concrete examples.

## Prometheus Monitoring Stack Components

The **de facto open source standard** for Kubernetes monitoring consists of:[6]

- **Prometheus** - Collects and stores time-series metrics via PromQL query language[3]
- **Grafana** - Visualizes metrics in dashboards[2]
- **cAdvisor** (Container Advisor) - Embedded in kubelet, automatically collects container-level CPU, memory, network, and disk data on every node[3][6]
- **Kube-State-Metrics** - Monitors Kubernetes object states (nodes, namespaces, deployments, pods) rather than resource usage[3]
- **Alertmanager** - Routes alerts to Slack, PagerDuty, email[2]
- **Loki** - Aggregates and queries logs[2]
- **Promtail** - Ships logs from pods to Loki[2]
- **Node Exporter** - Runs on every node (enabled by default in kube-prometheus-stack)[2]

## Metric Collection Strategy

Enable **Prometheus metrics collection** with these configurations:[1]

- Use **Azure Monitor managed service for Prometheus** (if on Azure) or self-hosted Prometheus[1]
- Enable **Container insights** to track cluster performance alongside Prometheus[1]
- Scrape all namespaces by setting `serviceMonitorSelectorNilUsesHelmValues = false`[2]

## Alerting Best Practices

**Recommended alert approach:**[1][2]

- Start with **recommended Prometheus alert rules** that detect common availability and performance issues[1]
- Create alerts for both **infrastructure metrics** (node, pod) and **application metrics**[2]
- Use **Alertmanager** to route alerts with appropriate severity levels[2]

**Critical limitation:** The search results do not provide specific severity tier definitions (e.g., Critical, Warning, Info), burn rate window calculations, or SLO-based alerting formulas. These are industry best practices but require additional sources for precise specifications.

## Recording Rules

**Best practice:** Use **recording rules for frequently-used expensive queries** to improve dashboard performance and reduce query load[2].

The search results do not include specific recording rule syntax or examples.

## Cost Optimization

**Self-hosted vs. SaaS:** Self-hosted Prometheus and Grafana provide **cost predictability**, while SaaS tools like Datadog can generate unexpectedly large invoices due to high cardinality signals from containerized workloads[5].

**Production considerations:** Prometheus does not scale horizontally out of the box; high-cardinality environments eventually require **Thanos or Mimir** for horizontal scaling[6].

## Data Retention & Persistence

- Set **appropriate retention periods based on storage budget**[2]
- Use **persistent volumes for Prometheus and Alertmanager** to survive pod restarts[2]

## Missing Information

The provided search results do not contain:
- Specific Grafana dashboard design principles or layout recommendations
- SLO-based alerting formulas with burn rate windows (e.g., 1-hour, 5-minute windows)
- Alerting severity tier definitions with thresholds
- Real-world recording rule examples with PromQL syntax
- Current market data on adoption rates or pricing comparisons (2026)

**Source limitation:** To provide the specific numbers, formulas, and design patterns you requested, I would need additional searches focused on SRE practices, Grafana best practices documentation, and recent 2026 monitoring industry reports.
