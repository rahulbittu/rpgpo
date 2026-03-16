# Subtask Output — Write guide on zero-downtime deployments
## Model: gpt-4o
## Stage: report
## Date: 2026-03-16

## Comprehensive Guide on Implementing Zero-Downtime Deployments for Stateful Applications

Zero-downtime deployments are crucial for maintaining service availability and user satisfaction, especially for stateful applications where data consistency and session management are paramount. This guide outlines specific techniques for achieving zero-downtime deployments, focusing on database migration coordination, session handling, and websocket reconnection.

### Key Techniques and Configurations

1. **Kubernetes Rolling Updates**
   - **Configuration**: Use `maxUnavailable: 0` to ensure no capacity loss during updates and `maxSurge: 1` for gradual pod replacement. Set `minReadySeconds` to ensure pods are stable before receiving traffic. Implement `preStop` hooks with a 15-second sleep to allow for connection draining.
   - **Expected Outcome**: Smooth transition between old and new versions without downtime.
   - **First Step**: Configure your deployment YAML with these settings and test in a staging environment.

2. **Traffic Management with Flagger and Istio**
   - **Blue-Green Deployments**: Use Flagger to mirror deployments and switch traffic only after validation. Configure Istio with `maxConnections: 100`, `http2MaxRequests: 1000`, and circuit breaking (`consecutive5xxErrors: 5`, `interval: 30s`).
   - **Expected Outcome**: Seamless traffic switching with minimal risk of failure.
   - **First Step**: Set up Flagger and Istio in your Kubernetes cluster and perform a dry run.

3. **Canary Releases**
   - **Implementation**: Gradually shift traffic using Flagger's metrics analysis. Pair with load balancers like NGINX or Traefik for automatic failover.
   - **Expected Outcome**: Reduced risk by testing new versions with a small user base before full rollout.
   - **First Step**: Define canary release strategy in Flagger and integrate with your CI/CD pipeline.

4. **Application-Level Support**
   - **Graceful Shutdown**: Implement handlers that return HTTP 503 during connection draining. Use health endpoints and feature flags for progressive rollouts.
   - **Expected Outcome**: Improved application resilience and user experience during updates.
   - **First Step**: Add graceful shutdown logic to your application codebase.

### Database Migration Coordination

1. **Decoupled Migrations**
   - **Technique**: Perform database migrations separately from application deployments. Use safe operations that are backward-compatible.
   - **Expected Outcome**: Minimized risk of data inconsistency and application errors.
   - **First Step**: Plan and execute database schema changes in a separate deployment cycle.

2. **Data Replication and Transactional Integrity**
   - **Implementation**: Use data replication strategies and ensure transactional integrity during migrations.
   - **Expected Outcome**: Consistent data state across old and new application versions.
   - **First Step**: Set up database replication and test transactional operations in a controlled environment.

### Session Handling

1. **Session Persistence**
   - **Technique**: Use external session stores like Redis to maintain session state across deployments.
   - **Expected Outcome**: Continuous user sessions without interruption during updates.
   - **First Step**: Integrate Redis or a similar solution into your application architecture.

### Websocket Reconnection

1. **Reconnection Strategies**
   - **Implementation**: Implement client-side reconnection logic with exponential backoff and server-side support for session resumption.
   - **Expected Outcome**: Robust websocket connections that recover gracefully from disruptions.
   - **First Step**: Update client-side websocket handling to include reconnection logic and test under simulated network conditions.

### Additional Considerations

- **Pod Disruption Budgets (PDBs)**: Set `minAvailable` to protect against disruptions during updates.
- **Termination Grace Period**: Ensure `terminationGracePeriodSeconds` is set to exceed the preStop sleep plus the maximum request duration (e.g., 45+ seconds).

By following these specific techniques and configurations, you can achieve zero-downtime deployments for your stateful applications, ensuring high availability and a seamless user experience. Implement these strategies incrementally, starting with a staging environment to validate each step before production rollout.

**Word Count**: 590
