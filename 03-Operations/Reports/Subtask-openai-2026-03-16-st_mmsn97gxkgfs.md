# Subtask Output — Synthesize Runbook for Microservice Deployment
## Model: gpt-4o
## Stage: report
## Date: 2026-03-16

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
