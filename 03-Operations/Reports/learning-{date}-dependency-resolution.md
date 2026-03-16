## Explanation

### Semantic Versioning (Semver)
- **Definition**: Semantic versioning is a versioning scheme for software that uses a three-part number format: MAJOR.MINOR.PATCH. Changes in these numbers indicate the level of change in the software, with MAJOR for incompatible changes, MINOR for backward-compatible new features, and PATCH for backward-compatible bug fixes.
- **Usage**: npm, yarn, and pnpm utilize semver to specify which versions of a package are acceptable for a project. For example, a dependency might be specified as "^1.2.3", allowing any version from 1.2.3 to less than 2.0.0.

### Dependency Resolution Algorithms
- **npm**: Uses a flattened dependency tree, where dependencies are hoisted to the top-level `node_modules` directory. This can lead to **phantom dependencies**, where a package can access another package without explicitly declaring it as a dependency[5][6].
- **Yarn (v1)**: Similar to npm, but with a `yarn.lock` file that ensures deterministic installs. Yarn's **resolutions** feature allows overriding of semver constraints to enforce a single version of a package[1][3].
- **Yarn Berry (v2+)**: Introduces Plug'n'Play (PnP), eliminating the need for a `node_modules` directory by using a virtual file system. This approach ensures strict dependency isolation and faster installs.
- **pnpm**: Uses a unique symlink-based approach to create a non-flat node_modules structure, which avoids phantom dependencies and ensures that each package only has access to its declared dependencies[6].

### Lockfile Mechanics
- **npm**: Uses `package-lock.json` to lock the versions of dependencies, ensuring consistent installs across different environments.
- **Yarn**: Uses `yarn.lock`, which serves a similar purpose but is structured differently to accommodate Yarn's additional features like resolutions.
- **pnpm**: Uses `pnpm-lock.yaml`, which captures the exact versions of dependencies and their sub-dependencies, ensuring reproducible builds.

### Phantom Dependencies
- **Definition**: Occur when a package can access another package without declaring it as a dependency, often due to hoisting in npm's flattened tree structure.
- **Impact**: Can lead to unexpected behavior and difficult-to-debug issues, as code may rely on undeclared dependencies that are inadvertently available.

### Hoisting Strategies
- **npm**: Hoists all dependencies to the top-level `node_modules`, leading to potential phantom dependencies.
- **Yarn**: Similar hoisting strategy in v1, but with better control over versions through resolutions.
- **pnpm**: Avoids hoisting by using a symlink structure, ensuring that each package only accesses its declared dependencies[6].

## Examples

- **npm**: If a project depends on package A which in turn depends on package B, npm will hoist package B to the top-level `node_modules`, making it accessible to the entire project, even if not explicitly declared.
- **Yarn Resolutions**: In a monorepo, if multiple packages depend on different versions of the same library, Yarn's resolutions can force a single version to be used across all packages.
- **pnpm**: By using symlinks, pnpm ensures that package A can only access package B if it is explicitly declared as a dependency of A, preventing phantom dependencies.

## Practice Questions

1. How does semantic versioning help in maintaining package compatibility?
2. What are the advantages and disadvantages of npm's hoisting strategy?
3. How does Yarn Berry's Plug'n'Play differ from traditional `node_modules`?
4. Why might a developer choose pnpm over npm or Yarn?

## Further Reading

- [Semantic Versioning Specification](https://semver.org/)
- [npm Documentation on Dependency Resolution](https://docs.npmjs.com/cli/v7/using-npm/dependency-resolution)
- [Yarn's Resolutions Feature](https://classic.yarnpkg.com/en/docs/selective-version-resolutions/)
- [pnpm's Unique Features](https://pnpm.io/motivation)

By understanding these concepts, you can make informed decisions about which package manager best suits your project's needs and how to manage dependencies effectively.