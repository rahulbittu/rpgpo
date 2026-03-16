# Subtask Output — Research Git Branching Strategies
## Model: sonar
## Stage: audit
## Date: 2026-03-16

## GitFlow Branching Strategy
GitFlow uses multiple long-lived branches including **develop** and **master**, plus supporting branches like **feature/**, **release/**, and **hotfix/** for structured releases in enterprises or legacy apps with formal QA.[1][3][5]  
- Best for large teams with scheduled releases (e.g., weekly or longer cycles); provides stable releases and clear hotfix paths but causes merge pain and slow releases.[1][4][5]  
- **CI/CD Integration**: Works with GitHub, GitLab, but requires manual cherry-picks; seen as slow in 2026 debates.[1][2]  
Source: https://sesamedisk.com/git-workflow-architecture-case-study/[1]; https://circleci.com/blog/git-tags-vs-branches/[3]; https://dev.to/akshaykurve/15-open-source-tools-every-developer-should-try-in-2026-d26[5]

## GitHub Flow Branching Strategy
GitHub Flow relies on a single **main** branch with short-lived **feature** branches, emphasizing pull requests (PRs), code reviews, and rapid deploys via GitHub Actions.[2][6]  
- Best for fast-moving SaaS or small/medium teams with continuous deployment; simple, enables quick audits but risks bad code to production without feature flags.[1][2][5]  
- **CI/CD Integration**: Native to GitHub with Actions for building/testing (2,000 free minutes/month for private repos); includes branch protection, security scanning, and PR-triggered workflows.[2][4][6] Example: Developers push feature branches, open PRs for review, merge to main for auto-deploy.  
Source: https://www.youtube.com/watch?v=WrgH8pK4LCY (Feb 19, 2026)[2]; https://www.deployhq.com/blog/ci-cd-pipelines-complete-guide[4]; https://www.spiralcompute.co.nz/learn-how-to-use-github-actions-automated-workflows-efficiently/[6]

## Trunk-Based Development
Trunk-Based uses a single **trunk** (main) branch with ephemeral short-lived branches for small, frequent commits; always keeps trunk deployable.[1][3][8]  
- Best for high-scale, AI-driven, or CI/CD-heavy teams with fast iteration; minimizes branch drift and speeds incident response but demands strict CI discipline (broken trunk blocks merges).[1][3][5]  
- **CI/CD Integration**: Pairs with GitLab AI/CI, GitHub Agents, or hybrids; auto-deploys ephemeral branches like **qa/** or **staging/** post-PR merge; uses feature flags for safer releases.[1][3][4] 2025–2026 SaaS case: Migrated to trunk + environment branches after GitLab shift, with AI code fixes via Copilot.  
Source: https://sesamedisk.com/git-workflow-architecture-case-study/[1]; https://circleci.com/blog/git-tags-vs-branches/[3]; https://gist.github.com/MangaD/36eccbf1a51c08a3cb6b773b892a9e82[8]

## Comparison and 2026 CI/CD Trends
| Strategy | Best For | Key Pros | Key Cons | Tooling Fit (2026) |
|----------|----------|----------|----------|--------------------|
| **GitFlow** | Enterprises, legacy apps | Stable releases, hotfix paths | Slow releases, merge conflicts | GitHub/GitLab (debated as outdated) [1] |
| **GitHub Flow** | Small/med SaaS teams | Simple, fast deploys | Feature flag needs, prod risks | GitHub Actions/Copilot [1][2] |
| **Trunk-Based** | High-scale CI/CD teams | Fast feedback, minimal drift | Strict CI required | GitLab AI, GitHub Agents, CircleCI [1][3] |

- **Trends**: Trunk-based with feature flags preferred for most teams in 2026 due to smaller changes and fewer breaks; integrates with GitHub Actions (caching, matrix builds), CircleCI filters, or DeployHQ for CD.[3][4][6] No data from last 30 days (post-Feb 19, 2026) found after alt searches like "git branching strategies 2026 CI/CD comparison".  
Source: https://sesamedisk.com/git-workflow-architecture-case-study/[1]; https://www.deployhq.com/blog/ci-cd-pipelines-complete-guide[4]
