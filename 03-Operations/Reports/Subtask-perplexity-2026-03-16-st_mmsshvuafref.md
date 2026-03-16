# Subtask Output — Research CI/CD Best Practices for Monorepos
## Model: sonar
## Stage: audit
## Date: 2026-03-16

# CI/CD Pipelines in Monorepos: Best Practices and Tools

## Finding 1: Affected-Only Testing and Deployment Strategy

The most critical optimization for monorepo CI/CD is implementing **affected-only builds**—running tests and deployments only for changed projects rather than rebuilding everything on every commit.[2] Both **Nx** and **Turborepo** provide "affected" commands that filter which projects need rebuilding, drastically reducing CI execution time.[2] This approach is essential because full rebuilds of large monorepos create severe performance bottlenecks, even for minor changes.[2]

**Practical implementation:** GitHub Actions requires path filtering to avoid rebuilding everything on every push when using monorepos with Nx or Turborepo.[7] GitLab CI has native monorepo support through parent-child pipelines—a single `.gitlab-ci.yml` dynamically generates child pipelines only for changed services in a 10-service monorepo setup.[7]

Source: https://codewithyoha.com/blogs/monorepo-tooling-in-2026-nx-turborepo-and-bazel-compared

Source: https://eitt.academy/knowledge-base/jenkins-vs-github-actions-vs-gitlab-ci-cicd-2026/

## Finding 2: Remote Caching as Performance Multiplier

**Remote caching** is described as "arguably the most impactful feature of modern monorepo tools."[2] Setting up remote caching maximizes build speed across your team and CI/CD pipelines by avoiding redundant builds across developers' machines and CI runners.[2]

Source: https://codewithyoha.com/blogs/monorepo-tooling-in-2026-nx-turborepo-and-bazel-compared

## Finding 3: Top CI/CD Tools with Monorepo Support

**Semaphore** is explicitly noted as "the only CI/CD solution that provides powerful out-of-the-box support for monorepo projects" as of 2026.[6] It offers seamless GitHub integration and cloud-based continuous integration and deployment.[6]

**GitLab CI** provides native monorepo support through parent-child pipelines, making it ideal for microservices architectures.[7]

**GitHub Actions** requires custom path filtering configuration for monorepos but supports reusable workflows—one change in a reusable workflow propagates to 50 services automatically (DRY CI/CD principle).[7]

Source: https://www.testmuai.com/blog/best-ci-cd-tools/

Source: https://eitt.academy/knowledge-base/jenkins-vs-github-actions-vs-gitlab-ci-cicd-2026/

## Finding 4: Monorepo Tooling Landscape (Nx, Turborepo, Bazel)

Three dominant monorepo tools compete in 2026:[2]

- **Nx**: Provides "affected" commands for selective builds
- **Turborepo**: Offers filtering capabilities for affected projects
- **Bazel**: Used by Pinterest, which consolidated 1,365+ repositories into four large monorepos using Bazel, reducing maintenance burden and accelerating feature development[5]

Source: https://codewithyoha.com/blogs/monorepo-tooling-in-2026-nx-turborepo-and-bazel-compared

Source: https://www.vintasoftware.com/blog/django-react-monorepo

## Finding 5: Atomic Commits and Unified CI/CD Benefits

Monorepo CI/CD enables **atomic commits** where backend updates, TypeScript type generation, frontend components, and routes merge or revert as a single unit.[5] This eliminates the coordination overhead of multirepo setups, where renaming an API endpoint requires separate backend PR, frontend PR, and carefully timed deployments.[5]

**Unified CI/CD** in monorepos tests the entire application together in a single pipeline, catching integration issues before deployment—a major advantage over multirepo architectures with duplicated pipeline configurations.[5]

Source: https://www.vintasoftware.com/blog/django-react-monorepo

## Finding 6: Monorepo Structure Best Practices

For **Flux CD GitOps** monorepos specifically:[1]

- Layer dependencies clearly (infrastructure independent of apps; apps depend on infrastructure)
- Use base and overlays pattern (common configs in `base/`, environment-specific in overlays)
- Limit directory depth to 3-4 levels maximum for readability
- Use CODEOWNERS to define code owners for different directories
- Validate in CI by running `kustomize build` on all paths before merging
- Protect main branch and require reviews for production changes

Source: https://oneuptime.com/blog/post/2026-03-06-structure-monorepo-flux-cd-gitops/view

## Finding 7: Common Pitfalls to Avoid

**Lack of standardization** defeats monorepo benefits—allowing each team to use different tools, configurations, or coding styles reduces maintainability.[2] **Poor CI/CD integration** where pipelines rebuild everything on every commit wastes the monorepo tool's power.[2] Establish consistent project structure conventions for naming and dependency management to reduce cognitive load.[2]

Source: https://codewithyoha.com/blogs/monorepo-tooling-in-2026-nx-turborepo-and-bazel-compared
