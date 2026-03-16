# Subtask Output — Research Kubernetes Blue-Green Deployment Strategies
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Namespace-Based Routing
Kubernetes blue-green deployments often use separate namespaces for blue and green environments to isolate them, with traffic switching via Kubernetes Services or Ingress controllers by updating selectors.

- **Terraform Implementation Example**: Define blue (`my-app-blue`) and green (`my-app-green`) deployments in the `production` namespace. Set replicas to 4 for the active color (e.g., `local.active_color = "blue"`) and 0 for inactive. The shared Service selector matches `app = "my-app"` and `color = local.active_color`, enabling instant switching without DNS.[4]
- **Portainer Kubernetes Lifecycle**: Spin up blue/green clusters or namespaces, sync workloads with ArgoCD, and shift traffic at the load balancer post-health checks; full process takes ~1 week for upgrades.[2]

Source: https://oneuptime.com/blog/post/2026-02-23-kubernetes-rolling-updates-terraform/view[4]; https://www.portainer.io/blog/kubernetes-lifecycle-management[2]

## Database Migration Coordination
Coordinate DB changes by deploying green with new schema/port first, testing in isolation, then switching app traffic while keeping DB dual-compatible temporarily.

- **Tencent Cloud Approach**: Switch DB port in green environment pre-traffic shift; use TencentDB for managed failover. Post-switch, update blue DB port for rollback readiness. Tools: Tencent Kubernetes Engine (TKE) + Traffic Manager.[5]
- **General Best Practice**: Deploy new DB version alongside old; validate green app against it before cutover. Immutable IaC (e.g., Terraform) ensures DB config parity across environments.[1][3]

Source: https://www.tencentcloud.com/techpedia/142014[5]; https://octopus.com/devops/software-deployments/blue-green-deployment-best-practices/[1]

## Health Check Gates
Implement gates via monitoring tools and Kubernetes readiness/liveness probes before traffic switch; automate validation in CI/CD.

- **Argo Rollouts Integration**: Extends Kubernetes for blue-green with built-in health analysis; verifies metrics (e.g., error rates) before full switch, auto-rollback on spikes.[7]
- **Portainer Drills**: Run daily health checks in test namespaces mirroring prod; only proceed if 100% clean, using canary subsets for validation.[2]
- **Monitoring Post-Switch**: Track error rates, performance; tools like Prometheus integrate with Kubernetes probes.[1][3]

Source: https://www.pulumi.com/blog/gitops-best-practices-i-wish-i-had-known-before/[7]; https://www.portainer.io/blog/kubernetes-lifecycle-management[2]

## Automated Rollback Triggers
Triggers based on metric thresholds (e.g., error rate >5%) revert Service selector to blue instantly.

- **Kubernetes Service Selector Switch**: In Terraform example, flip `local.active_color` var via CI/CD (e.g., ArgoCD); replicas scale to 0 on inactive, enabling zero-downtime rollback in seconds.[4]
- **Argo Rollouts**: Automates rollback on health gate failure during blue-green; integrates with GitOps for declarative reversions.[7]
- **Load Balancer Fallback**: Shift traffic back if post-switch monitoring detects issues; rule: move upgrade date if tests fail.[2]

Source: https://oneuptime.com/blog/post/2026-02-23-kubernetes-rolling-updates-terraform/view[4]; https://www.pulumi.com/blog/gitops-best-practices-i-wish-i-had-known-before/[7]

## DNS Cutover vs Ingress Switching
**DNS Cutover**: Slower due to TTL propagation (e.g., set low TTL pre-deploy: 60s, revert to 300s post); risks inconsistency during cache expiry.[1]  
**Ingress Switching**: Faster, Kubernetes-native; update Ingress/Service selector points to green pods instantly via controller (e.g., NGINX Ingress), no propagation delay.[3][4]

| Aspect | DNS Cutover | Ingress Switching |
|--------|-------------|-------------------|
| **Speed** | Minutes (TTL-dependent) | Seconds (API update) |
| **Tools** | Route53/Cloud DNS | Kubernetes Ingress (e.g., NGINX), Service selectors |
| **Rollback** | Reverse DNS + wait TTL | Flip selector instantly |
| **Use Case** | Cross-cluster | Intra-cluster/namespace |

Source: https://octopus.com/devops/software-deployments/blue-green-deployment-best-practices/[1]; https://oneuptime.com/blog/post/2026-02-23-kubernetes-rolling-updates-terraform/view[4]

## Key Tools
- **ArgoCD + Argo Rollouts**: GitOps sync + advanced blue-green/canary with auto-analysis (2025+ best practice).[2][7]
- **Terraform**: IaC for deployments/services (replicas=4 example).[4]
- **TKE/TencentDB**: Managed K8s + DB for ported migrations.[5]
- **Portainer**: Lifecycle mgmt with daily drills.[2]

**Next Steps**:
1. Clone Terraform example[4]; test in minikube with `active_color` toggle.
2. Install Argo Rollouts: `kubectl create namespace argocd-rollouts; kubectl apply -n argocd-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml`.
3. Run Portainer-style drill: Mirror prod namespace, deploy green v1.1, validate probes >99% ready.
4. Benchmark Ingress vs DNS: Measure switch time in your cluster.

No results from last 30 days (post-2026-02-14); latest is 2026-02-23[4]. For fresher data, search "Kubernetes blue-green ArgoCD 2026".
