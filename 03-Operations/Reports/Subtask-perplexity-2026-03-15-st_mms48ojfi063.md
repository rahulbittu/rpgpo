# Subtask Output — Research CI/CD Best Practices for Node.js Monorepos
## Model: sonar
## Stage: report
## Date: 2026-03-15

I need to conduct a web search for current best practices in CI/CD pipelines for Node.js monorepos, as the provided search results contain only partial information about monorepo structure and some CI/CD elements, but lack comprehensive coverage of testing strategies, deployment procedures, and rollback mechanisms.

Let me search for this information now.

Based on the search results provided and my analysis, here are the current best practices for CI/CD pipelines in Node.js monorepos:

## Finding 1: Package Manager Setup and Dependency Management

**pnpm with workspace configuration** is the recommended approach for modern Node.js monorepos[2][6]. The critical setup includes:

- Use `pnpm-workspace.yaml` to declare all packages in your monorepo[4]
- Add `pnpm/action-setup@v4` before Node setup in GitHub Actions workflows[2]
- Ensure strict dependency declarations: each package must explicitly declare its own dependencies rather than relying on hoisting[2]

**Example GitHub Actions workflow:**
```yaml
steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 0
  - uses: pnpm/action-setup@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 20
  - run: pnpm install
  - run: pnpm run build
```

This prevents the "sloppy dependency declaration" problem where packages work locally due to hoisting but fail in CI[2].

## Finding 2: Semantic Versioning and Automated Release Management

Use **semantic-release** to automate versioning across your monorepo[3]. This analyzes commit history and determines version bumps automatically:

- `feat` commits → minor version bump (1.3.0 → 1.4.0)
- `fix` commits → patch version bump (1.3.0 → 1.3.1)
- `BREAKING CHANGE` or `feat!` → major version bump (1.x.x → 2.0.0)

**Key advantage:** For tightly coupled services (backend, frontend, database), use a single version across all components[3]. This ensures:
- Docker images tagged with matching versions (backend:v1.0.11, frontend:v1.0.11)
- Database migrations correspond to exact releases
- Each Git tag maps to a deterministic system state
- Rollbacks become straightforward since all components share the same version[3]

## Finding 3: Task Execution Across Monorepo Projects

Use **Lerna** or **mise-en-place** for running tasks across multiple projects[1][4]:

**Lerna approach:**
```bash
lerna run build --scope=addon  # Build specific package
```

**mise approach (experimental monorepo support):**
```bash
mise //...:lint              # Run lint task across all projects
mise '//projects/frontend:*' # Run all tasks in frontend project
mise //...:test*             # Run all test tasks in all projects
```

This allows selective task execution rather than rebuilding everything[1][4].

## Finding 4: Multi-App Deployment Strategy

For monorepos with multiple deployable applications, configure **separate Vercel projects** with distinct deployment commands[5]:

| App | Deploy Command | Source |
|-----|---|---|
| Main App | `npm run deploy` | Root |
| Marketing | `npx vercel --prod` | `packages/web/marketing` |
| Docs | `npx vercel --prod` | `packages/web/docs-site` |

This allows independent deployment pipelines while maintaining a single codebase[5].

## Finding 5: Registry Authentication for Publishing

For **pnpm publish** in CI/CD, configure a root `.npmrc` file since pnpm doesn't automatically pick up `${NODE_AUTH_TOKEN}` from npm-generated config[2]. This is critical when using Lerna v8, which now honors the `npmClient: pnpm` setting for publishing (unlike Lerna v5)[2].

---

**Limitation:** The provided search results do not contain detailed information on:
- Comprehensive testing strategies (unit, integration, e2e test execution order)
- Specific rollback procedures beyond version tagging
- Cache optimization strategies for monorepo CI/CD
- Dependency graph analysis tools for selective testing

For production-grade CI/CD pipelines, you would need additional resources covering these areas.
