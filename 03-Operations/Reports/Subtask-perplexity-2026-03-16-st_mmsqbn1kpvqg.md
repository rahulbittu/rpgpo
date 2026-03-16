# Subtask Output — Research zero-downtime deployment best practices
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Best Practices for Zero-Downtime Deployments in Stateful Applications

Zero-downtime deployments for stateful applications rely on Kubernetes-native features like rolling updates, readiness probes, preStop hooks, and traffic management tools such as Flagger or Istio, combined with GitOps operators like Flux CD or ArgoCD.[1][2] Key configurations include `maxUnavailable: 0` to avoid capacity loss, `maxSurge: 1` for gradual pod replacement, `minReadySeconds` for pod stability, `successThreshold: 2` on readiness probes, and `preStop` hooks with 15-second sleep for connection draining.[1][2] Pod Disruption Budgets (PDBs) with `minAvailable` protect against disruptions, while `terminationGracePeriodSeconds` should exceed preStop sleep plus max request duration (e.g., 45+ seconds).[2]

- **Blue-Green Deployments**: Use Flagger to mirror deployments and switch traffic post-validation; configure Istio DestinationRules with `maxConnections: 100`, `http2MaxRequests: 1000`, and circuit breaking (`consecutive5xxErrors: 5`, `interval: 30s`).[1]
- **Canary Releases**: Gradually shift traffic via Flagger metrics analysis; pair with load balancers like NGINX or Traefik for failover.[1][5]
- **Application-Level Support**: Implement graceful shutdown handlers returning HTTP 503 during drain, health endpoints, and feature flags for gradual rollouts.[2][3]
- **Database Migrations (Stateful Challenge Mitigation)**: Decouple from app deploys using safe operations, data replication, transactional steps; ensure app works pre/during/post-migration across multiple instances behind a load balancer.[3]
- **Automation and Monitoring**: Set `remediateLastFailure: true` on HelmReleases for auto-rollback; monitor with alerts for error spikes using tools like OneUptime; test under load in staging.[1][2]
- **Immutable Infrastructure**: Deploy new instances instead of mutating existing ones to avoid config drift.[3][6]

For Laravel/Django (stateful via DB), enable zero-downtime via build pipelines keeping 3-4 prior releases for rollback, Supervisor/Horizon for queues, and Laravel Cloud (launched Feb 2025) for managed push-to-deploy.[4]

## Challenges in Stateful Applications

Stateful apps face higher risks from database migrations, connection draining, and sync delays compared to stateless ones; common failures include pod evictions without ready replacements, short grace periods causing 503s, and migration data corruption.[1][2][3] Kubernetes migrations risk downtime without blue-green/canary setups, as live traffic shifts demand meticulous planning for state sync (e.g., persistent volumes).[5] DNS TTL delays slow cutovers; multi-cloud networking adds refactoring weeks.[6][8]

- **Migration Risks**: Unsafe DB ops cause corruption; coupled deploys fail if app can't handle schema changes mid-traffic.[3]
- **Traffic and Probes**: Inaccurate readiness probes trigger false rollouts; missing preStop leads to abrupt shutdowns mid-request.[2]
- **Scaling Limits**: High-traffic apps need redundancy (3+ instances), but solo/single-server setups break zero-downtime.[4]
- **Tool-Specific**: ArgoCD needs `ApplyOutOfSyncOnly: true`; Flux requires matching health check timeouts to rollout duration.[1][2]

## Real-World Examples and Sources

### Finding 1: Flux CD Zero-Downtime Guide (Mar 6, 2026)
Details rolling updates (`maxUnavailable: 0`), Flagger blue-green with Istio circuit breakers, PDBs; emphasizes preStop hooks and metrics analysis.  
**Source**: https://oneuptime.com/blog/post/2026-03-06-implement-zero-downtime-deployments-flux-cd/view[1]

### Finding 2: ArgoCD Zero-Downtime Checklist (Feb 26, 2026)
Specifies `preStop sleep 15`, `terminationGracePeriodSeconds >45s`, load testing; warns default 30s grace is insufficient for stateful draining.  
**Source**: https://oneuptime.com/blog/post/2026-02-26-argocd-zero-downtime-deployments/view[2]

### Finding 3: Django DB Migration Focus
Highlights migrations as top downtime cause; recommends decoupled safe ops, load-balanced multi-instances (condition: app functional during schema flux).  
**Source**: https://www.vintasoftware.com/blog/django-zero-downtime-guide[3]

### Finding 4: Laravel Zero-Downtime Pipelines
Keep 3-4 releases for rollback; Laravel Cloud (Feb 2025 launch) auto-scales but risks vendor lock-in.  
**Source**: https://www.deployhq.com/blog/how-to-deploy-laravel-zero-downtime-build-pipelines-and-best-practices[4]

### Finding 5: Kubernetes Cloud Migration (Recent)
Blue-green/canary viable for zero-downtime stateful moves; load balancer failover essential.  
**Source**: https://apprecode.com/blog/kubernetes-migration-strategy-moving-to-the-cloud-without-downtime[5]

**Next Steps**:  
1. Audit your Deployment YAML: Add `maxUnavailable: 0`, `preStop: sleep 15`, probe `successThreshold: 2`; test in staging with Locust load (1000 req/s).  
2. For stateful (e.g., Postgres), script decoupled migrations via Flyway/Liquibase; validate with `kubectl rollout status`.  
3. Deploy Flagger (v0.34+): `helm install flagger fluxcd/flagger -n flagger-system`; configure canary for 10% traffic shift.[1]
