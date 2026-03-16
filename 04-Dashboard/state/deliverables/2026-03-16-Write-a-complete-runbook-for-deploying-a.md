# Write a complete runbook for deploying a new microservice to production. Include

**Domain:** writing | **Date:** 2026-03-16 | **Subtasks:** 2



## Research Best Practices for Microservice Deployment
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

## Synthesize Runbook for Microservice Deployment
# Microservice Deployment Runbook

This runbook provides a detailed guide for deploying a new microservice to production. It includes pre-deployment checks, deployment steps, smoke tests, rollback procedures, and monitoring verification. Each section is crafted to ensure a smooth, reliable deployment process.

## Pre-Deployment Checks

1. **Automated Testing:**
   - **Infrastructure Code:** Use **tflint** or **checkov** to perform static analysis for misconfigurations.
   - **Application Code:** Run unit tests for individual modules and integration tests in a staging environment that mirrors production.
   - **Policy Compliance:** Implement **Open Policy Agent (OPA)** to enforce policies and reject non-compliant configurations.
   - **Code Review:** Ensure all code changes are reviewed and approved.
   - **Build Verification:** Confirm successful production build.
   - **Environment Checks:** Verify environment variables and readiness for database migrations.
   - **Image Management:** Ensure images are immutable, versioned, and stored in a central registry.
   - **Path Filters:** Use path filters in monorepos to trigger pipelines only for affected services.

   **Next Steps:** Integrate **tflint** and **OPA** into your CI pipeline (e.g., Harness CI) for every pull request; test in staging with identical Kubernetes versions to production.

## Deployment Processes

1. **Independent Deployment:**
   - Deploy microservices independently using dedicated infrastructure to prevent fault propagation.
   - Use per-service pipelines templated from shared standards for linting, testing, and builds.

2. **Deployment Strategy:**
   - **Blue-Green Deployment:** 
     - Provision a green environment and shadow production traffic for validation.
     - Use Redis for session data to avoid sticky session issues.
     - Switch traffic to the green environment once validated.
   - **Feature Flags:** Implement for gradual rollout and A/B testing.

3. **Automation:**
   - Use Infrastructure as Code (IaC) with parameterization for different environments.
   - Employ continuous delivery tools like Harness CD for automated deployments.

   **Examples/Tools:** Kubernetes for orchestration; traffic shadowing pre-switch.

   **Next Steps:** Template pipelines in GitHub Actions or Harness for standardized deployment processes.

## Smoke Tests

1. **Post-Deployment Verification:**
   - Execute basic functionality tests to ensure the service is operational.
   - Validate key endpoints and service responses.

2. **Performance Checks:**
   - Monitor response times and error rates.
   - Ensure no degradation in service performance compared to previous deployments.

   **Next Steps:** Develop a suite of automated smoke tests to run immediately after deployment.

## Rollback Procedures

1. **Immediate Rollback:**
   - Maintain a rollback plan for each deployment.
   - Use versioned images to quickly revert to the previous stable version if issues arise.

2. **Rollback Automation:**
   - Automate rollback processes in your CI/CD pipeline to minimize downtime.

   **Next Steps:** Implement automated rollback scripts and test them in a staging environment.

## Monitoring Verification

1. **Monitoring Setup:**
   - Ensure monitoring tools are configured to track key metrics such as CPU usage, memory consumption, and request latency.
   - Set up alerts for abnormal patterns or thresholds being breached.

2. **Post-Deployment Monitoring:**
   - Continuously monitor the service post-deployment to catch any issues early.
   - Compare current metrics with historical data to identify anomalies.

   **Next Steps:** Review and update monitoring dashboards and alert configurations to cover new service metrics.

---

This runbook is designed to provide a comprehensive, actionable guide for deploying microservices. By adhering to these steps, you can ensure a reliable and efficient deployment process. [Word Count: 561]