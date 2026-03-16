# Subtask Output — Research Blue-Green Deployment Best Practices
## Model: sonar
## Stage: report
## Date: 2026-03-16

## Load Balancer Configuration for Blue-Green Deployments in Node.js

Application Load Balancers (ALBs) are recommended for Node.js apps on AWS ECS, supporting HTTP/HTTPS traffic routing, multiple target groups per service, dynamic host port mapping, and path-based routing for blue-green switches.[4] In Azure App Service, use traffic routing commands to gradually shift percentages (e.g., 25% then 50%) from production (blue) to staging (green) slots before full swap:

```
az webapp traffic-routing set --resource-group myAppRG --name myapp --distribution staging=25
```
This enables canary-style validation within blue-green before instant slot swaps.[3]

**Next Steps:**
- Provision ALB with two target groups (blue/green ECS services) via AWS Console or CDK; test weighted routing on 10% traffic.
- For Azure, create staging slot, deploy Node.js v1.2.4 to green, run `az webapp deployment slot swap --action preview` for validation.[3][1]

## Database Migration Strategies

Configure green environment's Node.js app with new database connection strings via environment variables before traffic switch, e.g.:

```
DATABASE_URL="postgresql://staging-db:5432/myapp"
```
Set as slot-sticky in Azure (`--slot-settings DATABASE_URL`), sync data via replication or dump/restore, then test connectivity with smoke tests.[2][3] For port changes, update green config first, validate, switch load balancer traffic, and monitor connection pools to avoid stale connections.[2]

**Real Example (Azure Node.js App):** Deploy to staging slot with slot-specific DB URL, preview swap applies production settings to staging DB for testing, then complete swap for zero-downtime cutover.[3]

**Next Steps:**
- Use Knex.js or Sequelize migrations in Node.js; run on green DB replica (e.g., AWS RDS read replica), promote post-switch. Script: `knex migrate:latest --env green`.[2]
- Monitor post-switch with Datadog or CloudWatch for 15-30 mins.[2]

## Rollback Procedures

Instant rollback by switching load balancer traffic back to blue environment—no redeployment needed.[1] In Azure, use `az webapp deployment slot swap --action reset` during preview or `az webapp traffic-routing clear` after partial routing to revert fully.[3] Keep blue warm with prior version (e.g., v1.2.3) for <1s cutback.[1][3]

**Real Example:** After green (v1.2.4) validation fails, flowchart shows LB switch: LB --> Blue (active), Green (standby).[1]

**Next Steps:**
- Automate in CI/CD (e.g., GitHub Actions): if error rate >2% post-switch, trigger `az webapp deployment slot swap --action reset --slot staging`.[3]
- Test rollback in staging: deploy bad version to green, simulate failure, confirm blue traffic resumption in <5s.[1][3]

## Additional Node.js Best Practices

Pin npm dependencies (`cache: 'npm'`) for 30-90s build savings in blue-green pipelines; use PM2 for process management/clustering on both environments.[1][5] Maintain identical setups (e.g., Dockerized Node.js on ECS Fargate) behind ALB for compatibility.[4][5]

**Sources:**
- [1] https://www.deployhq.com/blog/ci-cd-pipelines-complete-guide
- [2] https://www.tencentcloud.com/techpedia/142014
- [3] https://oneuptime.com/blog/post/2026-02-16-how-to-set-up-deployment-slots-for-blue-green-deployments-on-azure-app-service/view
- [4] https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html
- [5] https://www.scalecomputing.com/resources/application-deployment-tools-techniques-and-best-practices
