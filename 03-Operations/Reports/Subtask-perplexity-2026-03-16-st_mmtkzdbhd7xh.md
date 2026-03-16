# Subtask Output — Research Dependency Resolution in Package Managers
## Model: sonar
## Stage: research
## Date: 2026-03-16

# Modern Package Manager Dependency Resolution: npm, yarn, and pnpm

Modern JavaScript package managers resolve dependencies through distinct algorithms and file formats, each with different approaches to semantic versioning, hoisting, and lockfile management.

## Semantic Versioning and Dependency Resolution

All three major package managers—**npm**, **yarn**, and **pnpm**—use semantic versioning (semver) ranges to specify acceptable dependency versions in `package.json`. However, they differ significantly in how they resolve and install these dependencies[1][5][6].

## npm's Flattened Dependency Tree

npm (as of version 3) maintains a **flattened dependency tree** in `node_modules`, which reduces disk space bloat but creates a messy directory structure[5]. This flattening approach means that all packages are hoisted to the root of the modules directory, giving source code access to dependencies that are not explicitly declared as direct dependencies—a phenomenon known as **phantom dependencies**[6].

## Yarn's Approach: Two Distinct Versions

**Yarn Classic (v1)** uses a `yarn.lock` file with a format similar to npm's `package-lock.json` but with different structure, ensuring deterministic installs across environments[1]. Yarn also introduced **resolutions** to override semantic versioning constraints and enforce single versions of dependencies across a project, useful for fixing duplicated packages in monorepos[3].

**Yarn Berry (v2+)** represents a complete architectural rewrite, introducing **Plug'n'Play (PnP)** by default, which eliminates `node_modules` entirely in favor of a `.pnp.cjs` file[1]. This eliminates phantom dependencies by design. Yarn Berry also supports **zero-installs**, where dependencies are committed to the repository, changing security and compliance considerations[1].

## pnpm's Strict Dependency Resolution

pnpm uses a fundamentally different approach with a **non-flat `node_modules` directory** structure[6]. By default, pnpm uses symlinks to add only direct dependencies to the root of `node_modules`, preventing phantom dependencies[6]. This strict isolation means that in a single project, a specific version of a package will always have one set of dependencies, with the exception of packages with peer dependencies[4].

### pnpm's Three-Stage Installation Process

pnpm performs installation in three distinct stages[6]:

1. **Dependency resolution** — All required dependencies are identified and fetched to the store
2. **Directory structure calculation** — The `node_modules` directory structure is calculated based on dependencies
3. **Linking dependencies** — All remaining dependencies are fetched and hard linked from the store to `node_modules`

### Peer Dependency Handling

pnpm resolves peer dependencies from dependencies installed higher in the dependency graph, since they share the same version as their parent[4]. When a package has multiple different sets of peer dependencies, pnpm hard links the package multiple times to support these use cases[4]. The `pnpm-lock.yaml` file contains the complete dependency tree with integrity hashes[1].

pnpm also provides an **overrides** field in `pnpm-workspace.yaml` that allows you to override any dependency in the dependency graph, including peer dependencies, useful for enforcing single versions or backporting fixes[2]. Additionally, the **dedupePeerDependents** setting (default: true) deduplicates packages with peer dependencies when they have no conflicting peer dependencies[2].

## Lockfile Mechanics and Deduplication

All three managers use lockfiles to ensure deterministic installations, but they differ in format and optimization[1]. A common problem across package managers is that their algorithms don't continuously optimize the dependency graph, resulting in multiple versions of the same package being installed when a single version would satisfy semantic versioning ranges[3].

**yarn-deduplicate** is a tool that optimizes Yarn lockfiles by removing unnecessary duplicate package versions[3]. It's recommended to run this tool every time a package is added, updated, or removed, and can be integrated into CI pipelines with `yarn-deduplicate yarn.lock --list --fail`[3].

## Performance and Disk Efficiency

pnpm is recognized for **best performance and disk efficiency** due to its three-stage installation process and hard linking strategy[8]. npm remains the default and most widely supported option[8], while Yarn is particularly strong for monorepos due to its workspace support[8].

---

**Sources:**
- [1] https://sbomgenerator.com/guides/javascript
- [2] https://pnpm.io/next/settings
- [3] https://cpojer.net/posts/dependency-managers-dont-manage-your-dependencies
- [4] https://pnpm.io/how-peers-are-resolved
- [5] https://pnpm.io/pnpm-vs-npm
- [6] https://pnpm.io/motivation
- [8] https://lobehub.com/skills/gaku52-claude-code-skills-dependency-management
