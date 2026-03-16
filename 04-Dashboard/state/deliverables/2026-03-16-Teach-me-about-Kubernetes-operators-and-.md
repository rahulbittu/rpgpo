# Teach me about Kubernetes operators and custom resources. Cover CRDs, controller

**Domain:** learning | **Date:** 2026-03-16 | **Subtasks:** 2



## Research Kubernetes Operators and Related Concepts
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

## Synthesize Information on Kubernetes Operators
## Explanation

### Kubernetes Operators
Kubernetes operators are extensions of the platform's built-in controllers, designed to manage complex, stateful applications. They utilize the controller pattern to ensure that the actual state of the cluster matches the desired state as defined in custom resources. Operators automate tasks such as deployment, scaling, upgrades, and self-healing, which go beyond the capabilities of native Kubernetes resources like Deployments.

### Custom Resource Definitions (CRDs)
CRDs are a way to extend the Kubernetes API by defining custom objects. These act like "classes" for domain-specific resources, with Custom Resources (CRs) being the instances of these classes. CRDs allow operators to expose application-specific configurations at the API level, similar to native Kubernetes resources such as Pods or Deployments.

### Controller Pattern
The controller pattern is a core concept in Kubernetes, involving a reconciliation loop where controllers continuously compare the desired state (as defined in manifests or CRs) with the actual state of the system. The controllers then perform actions to align the two states, including self-healing operations like restarting failed pods.

### Operator Framework
The Operator Framework is a toolkit designed to facilitate the development of Kubernetes operators. It provides tools for building, testing, and packaging operators, streamlining the process of extending Kubernetes functionality with custom logic.

## Examples

- **Appian Operator**: This operator is installed via a Helm chart and defines an Appian CRD to specify configurations such as custom properties, images, init containers, URLs, and ingress. The operator reconciles these configurations into managed Kubernetes resources, automating the deployment and management of the Appian application.

## Guidelines for Building vs. Using Existing Operators

### When to Use Existing Operators
- **Complexity and Maintenance**: If an existing operator meets your application's needs, it is generally more efficient to use it rather than building a new one. This saves development time and reduces maintenance overhead.
- **Community Support**: Established operators often have community support and regular updates, ensuring compatibility with the latest Kubernetes versions.

### When to Build Your Own Operator
- **Unique Requirements**: If your application has unique requirements not addressed by existing operators, building a custom operator may be necessary.
- **Control and Customization**: Developing your own operator allows for complete control over its functionality and customization to fit specific business needs.

### Recommendations
- **Assessment**: Evaluate existing operators for compatibility with your application's requirements. Consider factors such as feature set, community support, and update frequency.
- **Prototype**: If building a custom operator, start with a small prototype to validate the approach and gather feedback.
- **Leverage the Operator Framework**: Use the Operator Framework to streamline the development process, ensuring best practices and efficient management of the operator lifecycle.

## Practice Questions

1. What are the primary benefits of using Kubernetes operators for managing stateful applications?
2. How do CRDs and CRs extend the Kubernetes API, and why are they crucial for operators?
3. Describe the controller pattern and its role in Kubernetes' self-healing capabilities.
4. Under what circumstances should you consider building a custom operator instead of using an existing one?

## Further Reading

- [Kubernetes Operators: Concepts and Examples](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)
- [Custom Resource Definitions: Extending the Kubernetes API](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/)
- [Operator Framework Documentation](https://operatorframework.io/docs/)