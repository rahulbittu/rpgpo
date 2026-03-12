# TopRanker Backlog Refinement Process

## Cadence
- **Before every sprint**: Backlog refinement session
- **Every 5 sprints**: Architectural Audit (findings go straight to sprint planning)
- **Attendees**: SLT + Architecture Council + Department Leads
- **Output**: Prioritized sprint backlog with clear acceptance criteria

## Architectural Audit (Every 5 Sprints)
**Trigger**: After sprints 55, 60, 65, 70, ... (every 5th sprint)
**Led by**: Marcus Chen (CTO) + Architecture Council (James, Priya, Alex, Mei)
**Reviewed by**: Nadia Kaur (Security), Carlos Ruiz (QA), Victoria Ashworth (Legal)
**Output**: `/docs/audits/ARCH-AUDIT-N.md` — findings categorized as CRITICAL / HIGH / MEDIUM / LOW

### What Gets Audited
1. **Security**: Hardcoded secrets, auth bypass vectors, input validation, RBAC gaps
2. **Performance**: File sizes (>800 LOC = split candidate), N+1 queries, bundle bloat
3. **Type Safety**: `as any` count, TS errors, missing types at system boundaries
4. **Code Duplication**: Shared constants imported from multiple sources, copy-paste patterns
5. **Test Coverage**: Lines of business logic vs lines of test, untested critical paths
6. **Dependency Health**: Outdated packages, unused deps, security advisories
7. **Architecture**: Module coupling, circular imports, separation of concerns
8. **Data Model**: Schema gaps, missing indexes, migration safety
9. **Compliance**: Privacy policy accuracy, legal claims vs actual implementation

### Audit → Sprint Pipeline
1. CRITICAL findings become P0 in the NEXT sprint (no exceptions)
2. HIGH findings enter the backlog as P1 (scheduled within 2 sprints)
3. MEDIUM findings are tracked in backlog as P2
4. LOW findings are documented but not scheduled unless capacity allows

## Process

### 1. Department Pre-Meetings (Before Refinement)
Each department runs their own meeting and brings prioritized ideas:

| Department | Lead | Brings To Refinement |
|-----------|------|---------------------|
| Engineering | Sarah Nakamura / Marcus Chen | Tech debt, performance, infrastructure |
| Design & Animation | Elena Torres / Kai Nakamura | UI polish, animation specs, brand consistency |
| Legal & Compliance | Victoria Ashworth / Jordan Blake | Compliance gaps, policy updates, App Store |
| Revenue & Growth | Rachel Wei / Jasmine Taylor | Revenue features, marketing needs, launch readiness |
| Security | Nadia Kaur | Vulnerability findings, audit results |
| Value & Engagement | Jordan (CVO) | User retention, incentive systems, NPS data |
| Data & Analytics | Aria | Tracking gaps, fraud signals, dashboard needs |
| QA | Carlos Ruiz | Regression list, test coverage gaps, bug triage |

### 2. Backlog Refinement Meeting (45 min)
1. **Bug Triage** (10 min) — Carlos presents production issues, severity-ranked
2. **Department Proposals** (15 min) — Each department presents top 2 items
3. **CEO Priority Override** (5 min) — Rahul adds/removes items based on vision
4. **Estimation & Sequencing** (10 min) — Story point estimation, dependency mapping
5. **Sprint Selection** (5 min) — Final sprint backlog locked

### 3. Sprint Planning (15 min)
- Assign owners to each backlog item
- Define acceptance criteria and test requirements
- Identify cross-department dependencies

## Acceptance Criteria for Every Sprint Item
Every item entering a sprint MUST have:
1. **What**: Clear description of the change
2. **Why**: How it serves the trust mission or fixes a production issue
3. **Test Plan**: How we verify it works (unit test, manual test, screenshot)
4. **Owner**: Named team member responsible
5. **Story Points**: Complexity estimate (1, 2, 3, 5, 8, 13)

## Testing Requirements (CEO MANDATE — March 7, 2026)
- **No code ships without testing**
- Unit tests for all business logic (credibility, ratings, scoring)
- Integration tests for all API endpoints
- Manual verification for UI changes
- TypeScript must be clean (zero new errors)

## SLT Meeting Cadence
| Meeting | Frequency | Attendees | Duration |
|---------|-----------|-----------|----------|
| Daily Standup | Daily | All active team members | 15 min |
| Sprint Planning | Before each sprint | SLT + Architecture | 30 min |
| Backlog Refinement | Before each sprint | Full team | 45 min |
| Sprint Review | After each sprint | SLT + Stakeholders | 30 min |
| Retrospective | After each sprint | Full team | 20 min |
| CEO Strategy | Bi-weekly | SLT only | 60 min |

## Document Trail
Every sprint produces:
1. `/docs/SPRINT-N-*.md` — Sprint doc with team discussions, changes, performance
2. `/docs/retros/RETRO-N-*.md` — Retrospective with actions and morale
3. Test results (when test suite is ready)
4. This backlog refinement doc is updated with current priorities

---

## Current Backlog (Post-Sprint 55 + Arch Audit #1)

### P0 — Critical (Audit CRITICAL + existing P0)
| # | Item | Source | Owner | Points | Status |
|---|------|--------|-------|--------|--------|
| 1 | **C1: Remove session secret fallback** | AUDIT | Nadia Kaur | 2 | SPRINT 56 |
| 2 | **C2: Centralize admin emails, remove demo account** | AUDIT | Priya Sharma | 3 | SPRINT 56 |
| 3 | **H3: API endpoint tests (auth + ratings + business)** | AUDIT | Sage + Carlos | 8 | SPRINT 56 |
| 4 | **H4: Centralized env config with validation** | AUDIT | Alex Volkov | 3 | SPRINT 56 |
| 5 | Google OAuth: add production domain | BACKLOG | Alex Volkov | 2 | BLOCKED |
| 6 | Photo pipeline: fetch Google Places photos | BACKLOG | Pixel | 8 | NEXT |

### P1 — High (Audit HIGH + existing P1)
| # | Item | Source | Owner | Points | Status |
|---|------|--------|-------|--------|--------|
| 7 | **H1: Split storage.ts + large components** | AUDIT | James Park | 8 | SPRINT 57 |
| 8 | **H2: Eliminate `as any` casts (<10)** | AUDIT | Mei Lin | 5 | SPRINT 57 |
| 9 | **H5: Structured logging (replace console.log)** | AUDIT | Nina Petrov | 3 | SPRINT 57 |
| 10 | Security audit: all public endpoints | BACKLOG | Nadia Kaur | 5 | NEXT |
| 11 | Google Maps integration (real map) | BACKLOG | Atlas | 8 | NEXT |
| 12 | Analytics: instrument all 4 screens | BACKLOG | Aria | 5 | NEXT |

### P2 — Important (Audit MEDIUM + existing P2)
| # | Item | Source | Owner | Points | Status |
|---|------|--------|-------|--------|--------|
| 13 | **M1: Category data deduplication** | AUDIT | James Park | 2 | BACKLOG |
| 14 | **M2: Database indexes** | AUDIT | Priya Sharma | 3 | BACKLOG |
| 15 | **M3: Rate limiting on public endpoints** | AUDIT | Nadia Kaur | 3 | BACKLOG |
| 16 | **M4: CORS configuration** | AUDIT | Alex Volkov | 2 | BACKLOG |
| 17 | Staging environment + Sentry | BACKLOG | Nina Petrov | 8 | NEXT |
| 18 | Business outreach: Dallas top 100 | BACKLOG | Cole | 3 | NEXT |
| 19 | Custom logo design | BACKLOG | Amara Obi | 5 | NEXT |
| 20 | Marketing launch playbook | BACKLOG | Jasmine Taylor + Marco | 5 | NEXT |
| 21 | Top Judge rewards & tier perks UI | BACKLOG | Jordan (CVO) + James | 5 | DONE (Sprint 54) |

### P3 — Future (Audit LOW + existing P3)
| # | Item | Source | Owner | Points | Status |
|---|------|--------|-------|--------|--------|
| 22 | **L2: Git hooks + CI/CD pipeline** | AUDIT | Nina Petrov | 5 | BACKLOG |
| 23 | **L3: Dependency audit** | AUDIT | Alex Volkov | 2 | BACKLOG |
| 24 | **L4: Fix pre-existing TS error** | AUDIT | Mei Lin | 1 | BACKLOG |
| 25 | OpenTable integration | BACKLOG | TBD | 13 | BACKLOG |
| 26 | Payment methods (Apple Pay) | BACKLOG | TBD | 8 | BACKLOG |
| 27 | Expand beyond restaurants | BACKLOG | All | 13 | BACKLOG |
| 28 | GPS-based rating verification | BACKLOG | Legal + Eng | 8 | BACKLOG |
| 29 | Hindi/multilingual support | BACKLOG | TBD | 8 | BACKLOG |

### Completed (Sprints 51-55)
| # | Item | Sprint |
|---|------|--------|
| - | Featured Placement / Promoted Listings | 51 |
| - | Production bugfixes (NetworkBanner, rate gating, tab dot) | 52 |
| - | Rating flow collapse (6 screens to 2) | 52 |
| - | Backlog refinement process | 52 |
| - | Vitest testing foundation (39 tests) | 53 |
| - | Tier perks engine + profile rewards UI | 54 |
| - | Multi-city seeding (32 businesses, 4 cities) | 55 |
| - | Unit tests: credibility calc + tier perks | 53 |
| - | Non-Dallas cities: seed data | 55 |
