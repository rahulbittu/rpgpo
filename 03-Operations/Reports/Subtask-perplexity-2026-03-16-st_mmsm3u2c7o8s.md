# Subtask Output — Research Kubernetes Operators and Related Concepts
## Model: sonar
## Stage: research
## Date: 2026-03-16

## Kubernetes Operators
Kubernetes **operators** extend the platform's built-in controllers by using the controller pattern to manage complex, stateful applications through declarative reconciliation loops, ensuring actual cluster state matches desired state defined in custom resources.[1]

- Operators watch for Custom Resource Definitions (CRDs) and Custom Resources (CRs), then automate deployment, scaling, upgrades, and self-healing beyond native Kubernetes capabilities like Deployments.[1]
- Example: **Appian Operator** installs via Helm chart, defines an **Appian CRD** for specifying configs like custom properties, images, init containers, URLs, and ingress; the operator reconciles these into managed Kubernetes resources.[1]

## Custom Resource Definitions (CRDs)
**CRDs** extend the Kubernetes API with custom objects, acting like "classes" that define specs for domain-specific resources; **CRs** are instances ("objects") applied against these CRDs.[1]

- CRDs enable operators to expose application-specific configurations at the API level, similar to built-in resources like Pods or Deployments.[1]
- Operators register CRDs upon installation, allowing users to declare desired states for managed apps.[1]

## Controller Pattern
The **controller pattern** is Kubernetes' core reconciliation loop: controllers continuously compare **desired state** (from manifests/CRs) against **actual state**, performing actions to align them, including self-healing (e.g., restarting failed pods).[1][3]

- Built-in examples: Deployment Controller manages replicas; if a pod fails, it reconciles by launching a replacement.[1]
- Custom controllers in operators follow this infinite loop for app-specific logic, like handling backups or failover.[1]

## Operator Framework
The **Operator Framework** is an open-source toolkit for building, packaging, and deploying operators as Kubernetes-native apps, supporting languages like Go, Helm, and Ansible.[6]

- Used by operators like **VerticaDB Operator** on OperatorHub.io for database lifecycle management.[6]
- Example: **Kagenti Operator** (GitHub repo) automates AI agent deployment, discovery, and security using the framework.[4]

## Decision-Making Guidelines: Build vs Use Existing Operators
No search results from the last 30 days (as of March 2026) provide explicit, current decision matrices; guidelines inferred from operator docs emphasize checking OperatorHub or catalogs first for maturity and maintenance.

| Scenario | Use Existing Operator | Build Custom Operator | Examples/Sources |
|----------|-----------------------|-----------------------|------------------|
| Standard app with active community support | Preferred: Faster deployment, battle-tested reconciliation (e.g., databases, messaging). | Avoid unless gaps in features. | **VerticaDB Operator** [6]; **Appian Operator** exposes configs via CRD without custom dev [1]. |
| Unique domain logic (e.g., AI agents, custom autoscaling) | If partial match exists, fork/extend. | Build if no operator covers specifics like proprietary scaling or security. | **Kagenti Operator** for AI agents [4]; Custom Proactive Autoscaler (CPA) controller for edge latency SLOs (p95 <60ms), using composite signals over HPA [2]. |
| High-scale/enterprise needs | Use certified operators from Red Hat OperatorHub. | Build for vendor-specific integrations. | **Red Hat Advanced Cluster Security (RHACS)** uses Sensor/Collector controllers for policy enforcement [5]. |

**Next Steps**:
- Search OperatorHub.io for your app (e.g., "database operator" yields 50+ options like VerticaDB).[6]
- Install/test: `helm install appian-operator appian/appian-operator --namespace appian` (adapt from Appian docs).[1]
- If building: Start with Operator SDK (framework tool), define CRD spec, implement reconcile loop; validate with `make install` on minikube.[1][6]
- Check CNCF landscape or GitHub stars for adoption (e.g., Kagenti: recent AI-focused).[4]
