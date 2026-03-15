# Subtask Output — Research Node.js Deployment Best Practices
## Model: sonar
## Stage: audit
## Date: 2026-03-15

## Pre-Deployment Checks
Run these Node.js-specific validations before production deployment to catch issues early:

- **Dependency validation**: Use `npm audit` and `npm outdated` to check versions, maintenance status, and lock dependencies; remove unnecessary libraries. Tools: Snyk, Dependabot, OWASP Dependency Check.[1]
- **Vulnerability scanning**: Scan for CVEs with `npm audit`; prioritize high/critical severity. Tools: Snyk, Trivy, OWASP Dependency Check.[1]
- **Code quality**: Run `npm run lint` and `tsc --noEmit` for static analysis; enable ESLint rules like no-debugger, no-dupe-args, no-dupe-keys.[1][3]
- **Install with lockfile**: Always use `npm ci` in CI/CD for exact package-lock.json versions.[3]
- **Performance/Scalability**: Verify stateless design, DB indexing, rate limiting, queues (Redis, BullMQ, RabbitMQ).[1]
- **Security hardening**: Add helmet() for headers (customize CSP), express-rate-limit (20 req/min windowMs: 1*60*1000), compression.[5]
- **Node version**: Specify in package.json: `"engines": {"node": ">=22.0.0"}`.[5]
- **Local Docker test**: Build and run image with health checks (/_ah/health, /_ah/live, /_ah/ready).[2]

**Next step**: Integrate into CI pipeline: `npm ci && npm audit && npm run lint && npm run test`.

Source: https://dev.to/gaurav_talesara/before-you-deploy-ai-generated-code-a-production-checklist-1m80[1]

Source: https://oneuptime.com/blog/post/2026-02-17-how-to-deploy-a-nodejs-application-to-app-engine-flexible-environment-with-custom-docker-runtime/view[2]

Source: https://www.tatvasoft.com/blog/node-js-best-practices/[3]

Source: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/deployment[5]

## Rollback Procedures
No explicit rollback steps in recent sources; use platform-native blue-green or canary deploys.

- App Engine Flex: Supports version-based rollbacks via `gcloud app versions delete` after deploying new version.[2]
- General: Tag releases in Git, use Docker tags; revert via `git revert` and redeploy.[2]

**Next step**: For Vercel/Railway (common Node hosts), enable automatic rollbacks on failed health checks; test with `docker run` locally.

Source: https://oneuptime.com/blog/post/2026-02-17-how-to-deploy-a-nodejs-application-to-app-engine-flexible-environment-with-custom-docker-runtime/view[2]

## Monitoring
Enable structured logging and health endpoints from day one.

- **Health checks**: Implement /_ah/health (periodic), /_ah/live (process alive), /_ah/ready (DB/cache ready); return 200 OK.[2]
- **Logging**: Use console.log for SIGTERM graceful shutdown; integrate Winston/Pino for production.[2]
- **Scalability signals**: Monitor queues (Redis/BullMQ), rate limits.[1]

**Next step**: Add New Relic or Datadog agent; alert on >500ms latency or error rate >1%.

Source: https://oneuptime.com/blog/post/2026-02-17-how-to-deploy-a-nodejs-application-to-app-engine-flexible-environment-with-custom-docker-runtime/view[2]

Source: https://dev.to/gaurav_talesara/before-you-deploy-ai-generated-code-a-production-checklist-1m80[1]

## Post-Deployment Validation
Verify functionality immediately after deploy.

- **Smoke tests**: Hit root endpoint, confirm Node version/process.env.NODE_ENV.[2]
- **Load test**: Simulate traffic; check stateless handling, no perf regressions.[1]
- **AAA testing structure**: Arrange data, Act on endpoints, Assert results match (e.g., Joi-validated bodies).[3]

**Next step**: Automate with GitHub Actions: post-deploy curl health checks, fail if !=200; run Artillery load test (100 req/sec for 1min).

Source: https://oneuptime.com/blog/post/2026-02-17-how-to-deploy-a-nodejs-application-to-app-engine-flexible-environment-with-custom-docker-runtime/view[2]

Source: https://www.tatvasoft.com/blog/node-js-best-practices/[3]

Source: https://dev.to/gaurav_talesara/before-you-deploy-ai-generated-code-a-production-checklist-1m80[1]

**No results found** for explicit rollback numbers/metrics or 2026-specific Node.js deploy benchmarks; sources focus on checks over full pipelines. Refine search: "Node.js production rollback Vercel 2026".
