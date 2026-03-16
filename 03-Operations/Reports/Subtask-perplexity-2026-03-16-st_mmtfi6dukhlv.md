# Subtask Output — Research GitOps Best Practices with ArgoCD
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# GitOps Workflows with ArgoCD: Current Patterns and Best Practices

## Finding 1: ArgoCD Adoption and Market Position

**ArgoCD is used to manage application delivery in nearly 60% of surveyed Kubernetes clusters**, according to a 2025 CNCF end-user survey[3]. The tool is backed by the CNCF as a graduated project and provides declarative continuous delivery with automatic syncs, state reconciliation, and continuous drift detection[3].

**Source:** https://spacelift.io/blog/gitops-tools

---

## Finding 2: Repository Structure for Data Pipelines

For complex deployments like data pipelines, ArgoCD uses a structured Git repository approach with environment-specific overlays. A production example shows:

```
infrastructure/kafka/overlays/production
```

This path structure allows teams to manage multiple components (Kafka, Spark, Flink, Airflow) through a single Git repository, with each component having its own deployment configuration[1].

**Source:** https://oneuptime.com/blog/post/2026-02-26-argocd-gitops-data-pipelines/view

---

## Finding 3: Sync Policies and Safety Patterns

ArgoCD sync policies include critical safety mechanisms:

- **Automated sync with controlled pruning**: Set `prune: false` for critical infrastructure (like Kafka clusters) to prevent accidental deletion when files are removed from Git[1]
- **Self-healing enabled**: `selfHeal: true` ensures the cluster state matches Git continuously[1]
- **Server-side apply**: `ServerSideApply=true` provides better conflict resolution for large manifests[1]

Example configuration:
```yaml
syncPolicy:
  automated:
    prune: false
    selfHeal: true
  syncOptions:
    - CreateNamespace=true
    - ServerSideApply=true
```

**Source:** https://oneuptime.com/blog/post/2026-02-26-argocd-gitops-data-pipelines/view

---

## Finding 4: Drift Detection and Formal Verification

A comprehensive production implementation across **four production platforms managing 850 Kubernetes applications** detected **247 manifest violations** that bypassed traditional linting and security scanning[5]. These violations included:

- Circular dependencies in service mesh configurations
- Inconsistent security context constraints causing pod-restart loops
- Resource limit definitions triggering silent OOMKills during peak traffic

This demonstrates that ArgoCD's drift detection, when combined with formal verification in the CI/CD pipeline, catches issues that standard tools miss[5].

**Source:** https://cloudnativenow.com/contributed-content/beyond-the-green-checkmark-using-formal-verification-to-stop-argocd-drift/

---

## Finding 5: Multi-Cluster Management with Hub-and-Spoke

For edge and IoT deployments, ArgoCD uses a **hub-and-spoke architecture** where a central hub cluster manages hundreds or thousands of edge sites[2]:

**Lightweight Kubernetes distributions for edge:**

| Distribution | Memory Usage | Best For |
|--|--|--|
| K3s | ~512MB | General edge, IoT gateways |
| MicroK8s | ~540MB | Ubuntu-based edge devices |
| K0s | ~500MB | Minimal, single-binary |
| KubeEdge | Varies | Very constrained devices |

K3s is the most popular choice for ArgoCD-managed edge deployments[2].

**Hub setup:**
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/ha/install.yaml
```

Use HA installation for the hub since it manages all edge sites[2].

**Edge cluster registration options:**
- **CLI method** (requires direct network access): `argocd cluster add edge-site-001 --kubeconfig /path/to/edge-site-001-kubeconfig`
- **Declarative via Secret** (better for automation and intermittent connectivity)[2]

**Source:** https://oneuptime.com/blog/post/2026-02-26-argocd-gitops-edge-iot-deployments/view

---

## Finding 6: Multi-Cluster Workload Management

Azure Arc's workload management pattern shows how ArgoCD handles multiple clusters with different reconcilers[6]:

- **Platform repository**: Contains manifests for each cluster type defining workloads and configuration values
- **Compliance reporting**: Clusters report their compliance state to a Deployment Observability Hub
- **Mixed reconcilers**: The same workload can be scheduled to clusters managed by different reconcilers (e.g., Flux and ArgoCD), both pointing to the same Workload Manifests Storage[6]

This enables progressive rollout strategies using historical deployment data across clusters[6].

**Source:** https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-workload-management

---

## Finding 7: Integration with CI/CD and Secret Management

**Tekton Pipeline + ArgoCD integration** is a popular DevOps practice that requires storing the ArgoCD admin secret in Kubernetes Secret CRD, which can then be used in Tekton Pipeline for automated deployments[4].

For Airflow orchestration specifically, GitSync is enabled to pull DAGs directly from a Git repository:
```yaml
dags:
  gitSync:
    enabled: true
    repo: https://github.com/your-org/airflow-dags.git
    branch: main
    subPath: dags
    wait: 60
```

This pattern keeps pipeline definitions in Git while allowing runtime configuration through Kubernetes[1].

**Source:** https://oneuptime.com/blog/post/2026-02-26-argocd-gitops-data-pipelines/view

---

## Finding 8: Custom Health Checks for Advanced Workloads

ArgoCD supports custom CRD health checks for advanced controllers like OpenKruise CloneSet[4]. Configuration is stored in the `argocd-cm` ConfigMap and enables ArgoCD to verify:

- Whether CloneSet is published
- Whether Pods are ready
- Replica update progress

This extends ArgoCD's drift detection beyond standard Kubernetes resources[4].

**Source:** https://openkruise.io/docs/best-practices/gitops-with-kruise

---

## Key Takeaway for Your Data Engineering Role

For building scalable data platforms, the **hub-and-spoke multi-cluster pattern with formal verification** is production-proven: it detected 247 violations across 850 applications that traditional tools missed. Combine this with **K3s for edge deployments** (~512MB memory) and **sync policies with `prune: false`** for critical infrastructure to prevent accidental deletions.
