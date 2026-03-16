# Subtask Output — Write Comprehensive Guide on Blue-Green Deployments
## Model: gpt-4o
## Stage: report
## Date: 2026-03-16

## Comprehensive Guide on Implementing Blue-Green Deployments for Node.js Applications

This guide provides a detailed approach to implementing blue-green deployments for Node.js applications, focusing on load balancer configuration, database migrations, and rollback procedures. Each section includes specific technical details and actionable steps to ensure a smooth deployment process.

### 1. Load Balancer Configuration

#### AWS ECS with Application Load Balancers (ALBs)

- **Objective**: Seamlessly route traffic between blue and green environments.
- **Configuration**:
  - **Provision ALB**: Use AWS Console or AWS Cloud Development Kit (CDK) to create an ALB with two target groups, one for each environment (blue and green).
  - **Dynamic Host Port Mapping**: Ensure this feature is enabled to allow multiple instances of your application to run on the same host.
  - **Path-Based Routing**: Set up path-based routing rules to direct traffic to the appropriate environment.
  - **Weighted Routing**: Initially route a small percentage (e.g., 10%) of traffic to the green environment to test stability:
    ```bash
    aws elbv2 modify-listener --listener-arn <listener-arn> --default-actions Type=forward,TargetGroupArn=<green-target-group-arn>,Weight=10
    ```

#### Azure App Service

- **Objective**: Gradually shift traffic using slots for controlled deployment.
- **Configuration**:
  - **Create Staging Slot**: Deploy the new version of your Node.js application to the staging (green) slot.
  - **Traffic Routing**: Use Azure CLI to gradually shift traffic:
    ```bash
    az webapp traffic-routing set --resource-group myAppRG --name myapp --distribution staging=25
    ```
  - **Slot Swap**: After validation, perform a full swap:
    ```bash
    az webapp deployment slot swap --action swap --resource-group myAppRG --name myapp --slot staging
    ```

### 2. Database Migration Strategies

#### Preparation

- **Objective**: Ensure data consistency and application compatibility during the switch.
- **Configuration**:
  - **Environment Variables**: Configure the green environment to use a new database connection string:
    ```bash
    DATABASE_URL="postgresql://staging-db:5432/myapp"
    ```
  - **Slot-Sticky Settings**: For Azure, ensure the database URL is slot-sticky:
    ```bash
    az webapp config appsettings set --resource-group myAppRG --name myapp --slot-settings DATABASE_URL
    ```

#### Data Synchronization

- **Replication**: Use database replication to keep the staging database updated.
- **Dump/Restore**: Alternatively, perform a dump and restore for smaller datasets.
- **Smoke Tests**: Conduct smoke tests to verify database connectivity and application functionality.

### 3. Rollback Procedures

#### Immediate Rollback

- **Objective**: Quickly revert to the stable environment if issues arise.
- **AWS ECS**:
  - **Revert Traffic**: Modify the ALB listener to direct all traffic back to the blue environment:
    ```bash
    aws elbv2 modify-listener --listener-arn <listener-arn> --default-actions Type=forward,TargetGroupArn=<blue-target-group-arn>,Weight=100
    ```
- **Azure App Service**:
  - **Swap Back**: Use the slot swap feature to revert to the previous version:
    ```bash
    az webapp deployment slot swap --action swap --resource-group myAppRG --name myapp --slot production
    ```

#### Monitoring and Validation

- **Objective**: Ensure stability and performance post-deployment or rollback.
- **Tools**: Use monitoring tools like AWS CloudWatch or Azure Monitor to track application performance and user metrics.
- **Post-Deployment Testing**: Conduct comprehensive tests to validate the application's functionality and performance in the production environment.

### Conclusion

Implementing blue-green deployments for Node.js applications involves careful planning and execution, particularly in configuring load balancers, managing database migrations, and establishing rollback procedures. By following these detailed steps, you can achieve seamless and reliable deployments, minimizing downtime and ensuring a smooth user experience.

**Word Count**: 659
