# Subtask Output — Research Kubernetes RBAC best practices
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# Kubernetes RBAC Best Practices for Multi-Team Organizations

Based on current sources, here are the specific, actionable RBAC practices for multi-team environments:

## Core RBAC Architecture for Multi-Tenancy

**Use namespaces with RBAC, resource quotas, and network policies as the foundation for logical separation between teams.**[6] For larger organizations requiring stricter isolation, **virtual clusters offer a stronger isolation model** than shared namespaces alone.[6]

The standard RBAC components are:
- **Role** (namespace-scoped): Defines permissions within a single namespace
- **ClusterRole** (cluster-scoped): Defines permissions across all namespaces
- **RoleBinding** (namespace-scoped): Grants a Role or ClusterRole to subjects in a namespace
- **ClusterRoleBinding** (cluster-scoped): Grants a ClusterRole to subjects cluster-wide[1]

## Critical Best Practices (2026)

**1. Start with least privilege** — Give teams only the permissions they need for their specific job functions.[1] RBAC misconfigurations still account for **over 35% of breaches**, with common patterns including CI/CD pipelines with cluster-admin access, wildcard roles (*:*), and developers with far more access than needed.[3]

**2. Use Groups over individual users** — Bind roles to groups managed by your identity provider rather than individual user accounts.[1] This simplifies access management at scale.

**3. Prefer namespaced Roles** — Use ClusterRoles only when cross-namespace access is truly needed.[1] For multi-team setups, namespace-level isolation is typically sufficient.

**4. Never use cluster-admin for applications** — Create specific roles for each workload instead.[1]

**5. Enforce RBAC linting during CI/CD** — Automatically detect misconfigurations before deployment.[3]

**6. Rotate all service account tokens and use ephemeral credentials only** — Avoid long-lived static tokens.[3]

**7. Use resourceNames when possible** — Restrict access to specific resources by name rather than broad wildcards.[1]

**8. Audit regularly** — Review RoleBindings and ClusterRoleBindings periodically using tools like `kubectl get rolebindings --all-namespaces -o wide`.[1]

## Centralized Governance at Scale

**For multi-cluster environments, define RBAC policies in a central Git repository as a single source of truth.**[2] Use **OPA/Kyverno to enforce global policy federation** across all clusters, and implement **secure GitOps pipelines** for consistent enforcement.[3]

**Test all RBAC changes in staging environments before production** — Never apply security configurations directly to production.[2]

## Sources

- Source: https://oneuptime.com/blog/post/2026-02-20-kubernetes-rbac-roles-bindings/view (February 20, 2026)
- Source: https://www.plural.sh/blog/kubernetes-cis-benchmark-guide/ (CIS Benchmark Guide)
- Source: https://www.anantacloud.com/post/kubernetes-security-in-2026-modern-threats-and-how-to-defend-against-them (March 2026 threat analysis)
- Source: https://www.vcluster.com/blog/building-an-internal-kubernetes-platform (2026 Platform Guide)
