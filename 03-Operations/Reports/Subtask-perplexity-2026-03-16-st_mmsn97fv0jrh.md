# Subtask Output — Research Best Practices for Microservice Deployment
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Pre-Deployment Checks
Run automated tests on infrastructure and application code, including static analysis with **tflint** or **checkov** for misconfigurations, unit tests for modules, integration tests in staging for components like load balancers, and policy enforcement with **Open Policy Agent (OPA)** to reject non-compliant configs.[1] Verify code review approval, production build success, environment variables, and database migrations readiness.[5] Ensure immutable, versioned images in a central registry and path filters in monorepos to trigger only affected service pipelines.[2]

**Next Steps:** Integrate **tflint** and **OPA** into your CI pipeline (e.g., Harness CI) for every PR; test in staging with identical Kubernetes versions to production.[1][2]

## Deployment Processes
Deploy microservices independently using dedicated infrastructure to isolate faults, with per-service pipelines templated from shared standards for linting, testing, and builds.[2][3] Adopt blue-green deployments: provision green environment, shadow production traffic for validation, then switch with Redis for session data to avoid sticky session issues; use feature flags for gradual rollout and A/B testing.[4] Automate via IaC with parameterization for environments and continuous delivery tools like Harness CD.[1]

**Examples/Tools:** Kubernetes for orchestration; immutable infrastructure; traffic shadowing pre-switch.[2][4]  
**Next Steps:** Template pipelines in GitHub Actions or Harness for 5-10 services, targeting <2-minute deploys.[2]

## Smoke Testing
Post-deployment, run health checks defined per service in pipelines to confirm passing status before full traffic switch; correlate logs/metrics with deployment timestamps in observability tools.[2] Use traffic shadowing in blue-green for real-time validation without user impact.[4]

**Next Steps:** Define smoke tests as API endpoint pings (e.g., /healthz) in pipeline YAML; integrate with **Prometheus** for immediate failure detection.[2]

## Rollback Strategies
Enable <2-minute rollbacks to previous versioned image via immutable artifacts; use blue-green to revert traffic instantly or feature flags to disable issues.[2][4] Five-phase workflow: Prepare, Backup, Deploy, Verify, Confirm/Rollback.[5]

**Next Steps:** Store images in **Amazon ECR** or **Docker Hub** with tags like v1.2.3; script rollback as `kubectl rollout undo deployment/service-name` in Kubernetes.[2]

## Monitoring Verification
Integrate observability from deploy: timestamp/version labels in dashboards for logs/metrics; alert on violations via IaC pipelines.[1][2] Use **Prometheus/Grafana** for performance, **GuardDuty** for threat detection on API patterns, and **CloudWatch** for 4XX spikes.[2][6] Ensure debuggability by single-responsibility services for easier profiling.[3]

**Next Steps:** Deploy **Datadog** or **New Relic** agents per service; set alerts for >5% error rate post-deploy, verifying within 5 minutes.[2]
