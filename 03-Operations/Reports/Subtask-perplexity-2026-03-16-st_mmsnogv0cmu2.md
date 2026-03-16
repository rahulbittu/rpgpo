# Subtask Output — Research Kubernetes Monitoring
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# Kubernetes Monitoring Best Practices: Prometheus, Grafana, Alerting & SLOs

## Finding 1: Prometheus as the Standard Metrics Collection Tool

**Prometheus is the cloud-native standard** for Kubernetes metrics collection and is recommended by Microsoft Azure as the primary monitoring solution[1]. Prometheus, maintained by the Cloud Native Compute Foundation, is the most common tool used for collecting and analyzing metric data from Kubernetes clusters[1].

**Implementation approach:** Enable collection of Prometheus metrics for your cluster and use Azure Managed Grafana to analyze the collected data[1]. For multi-cluster environments, implement PrometheusRule resources to define alerting rules across clusters[5].

Source: https://learn.microsoft.com/en-us/azure/azure-monitor/containers/best-practices-containers

---

## Finding 2: Critical Kubernetes Metrics to Monitor

Track metrics across **four layers**[4]:

- **Cluster metrics:** Node CPU/memory utilization
- **Node metrics:** Disk usage, network performance
- **Pod metrics:** CPU, memory, restart counts
- **Control plane metrics:** API server latency, scheduler performance

**Scheduler queue length** is a specific early-warning indicator—if the scheduler queue unexpectedly increases to 50+ pods (typically small), this signals resource allocation issues or scheduler performance concerns[4].

**Kube-State-Metrics** is the recommended tool for monitoring object state (nodes, namespaces, deployments, pods) rather than resource usage, allowing monitoring systems to collect configuration and health data at the cluster level[4].

Source: https://middleware.io/blog/kubernetes-metrics/

---

## Finding 3: Grafana Dashboards and Container Insights Integration

**Enable Container Insights** alongside Prometheus to track cluster component performance through views and workbooks[1]. This provides overlapping but complementary data to Prometheus metrics[1].

**Multi-layer monitoring approach:** Effective Kubernetes monitoring requires observability across the entire stack—from infrastructure to application code—to prevent blind spots that hide critical issues[2]. Infrastructure layer monitoring tracks node health (CPU, memory, disk, network) as the foundation[2].

Source: https://learn.microsoft.com/en-us/azure/azure-monitor/containers/best-practices-containers

---

## Finding 4: Alerting Rules and Alert Strategy

**Start with recommended Prometheus alert rules** that detect the most common availability and performance issues[1]. Alerts should be **impactful and actionable**—examples include "host is down" alerts, disk usage warnings, and API server failures[2].

**Multi-cluster alerting example** (from ArgoCD best practices, updated March 10, 2026):

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: argocd-multi-cluster-alerts
spec:
  groups:
    - name: argocd-cluster-health
      rules:
        - alert: ArgocdClusterUnreachable
          expr: argocd_cluster_info{connection_status!="Successful"} == 1
          for: 5m
          labels:
            severity: critical
        - alert: ArgocdClusterSyncFailing
          expr: count(argocd_app_info{sync_status="OutOfSync"}) by (dest_server) > 5
          for: 15m
          labels:
            severity: warning
```

**Alert configuration best practice:** Configure the monitoring system to generate alerts when metrics reach critical thresholds, enabling IT teams to intervene before problems become catastrophic[2].

Source: https://help.splunk.com/ja-jp/appdynamics-on-premises/infrastructure-visibility/26.3.0/monitor-kubernetes-with-the-cluster-agent/overview-of-cluster-monitoring

---

## Finding 5: Health Rules and SLI-Related Metrics

**Splunk AppDynamics Cluster Agent** (updated March 10, 2026) supports creating Health Rules for key metrics[3]:

- Number of error events
- Number of evictions
- Number of threats
- Nodes with memory pressure
- Nodes with disk pressure
- CPU/Memory utilization

**Cluster Dashboard metrics** provide real-time statistics on cluster health, best-practice violations, and missing dependencies, grouped by category and severity[3]. The dashboard tracks resource capacity stats and usage data relative to deployment requests and limits[3].

Source: https://help.splunk.com/ja-jp/appdynamics-on-premises/infrastructure-visibility/26.3.0/monitor-kubernetes-with-the-cluster-agent/overview-of-cluster-monitoring

---

## Finding 6: Monitoring System Scalability and Data Retention

**Scalability as an infrastructure-wide feature** is essential—monitoring systems must handle cluster growth efficiently[2]. **Data retention** (a monitoring system's ability to store and provide access to historical data) enables trend analysis and pattern identification useful for troubleshooting and performance tracking[2].

**Logging and alerting integration:** A sophisticated logging solution must store monitoring data in a way that makes it easy for IT teams to access and scan for root causes of emerging problems[2].

Source: https://www.nutanix.com/how-to/the-step-by-step-guide-to-monitoring-kubernetes

---

## Key Takeaway for Your Setup

The current best practice stack combines **Prometheus for metrics collection** → **Grafana for visualization** → **PrometheusRule resources for alerting** → **Container Insights or AppDynamics for health rule definitions**. Start with recommended alert rules, then add custom log search alerts based on your specific SLI/SLO requirements. Ensure your monitoring system scales with cluster growth and retains historical data for trend analysis.
