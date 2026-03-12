# Contributing to TopRanker

## Development Workflow

### Branch Strategy
- `main` — Production-ready code
- Feature branches: `feature/SPRINT-N-description`
- Bugfix branches: `fix/description`

### Sprint Cycle
1. **Backlog Refinement** — Prioritize items, assign owners, estimate points
2. **Sprint Execution** — Build, test, document
3. **Sprint Review** — Demo changes, verify acceptance criteria
4. **Retrospective** — What went well, what to improve, action items

### Commit Standards
- One logical change per commit
- Descriptive commit messages: what changed and why
- Reference sprint number when applicable
- All tests must pass before committing

### Pull Request Requirements
- Description of changes with "why" context
- Test results (all tests passing)
- TypeScript clean (zero new errors)
- At least one reviewer approval

## Coding Standards

### TypeScript
- Strict mode enabled
- No `as any` in new code (audit target: <10 total)
- Use proper types at system boundaries (API requests, database results)
- Prefer `interface` over `type` for object shapes

### React Native
- Functional components only
- React Query for server state, `useState`/`useReducer` for local state
- StyleSheet.create for all styles (no inline objects)
- react-native-reanimated for animations

### Backend
- All env vars through `server/config.ts` — never read `process.env` directly
- Admin checks through `shared/admin.ts` — never hardcode email lists
- Input validation with Zod schemas at API boundaries
- All mutation endpoints behind `requireAuth` middleware

### Brand System (Non-Negotiable)
| Element | Value |
|---------|-------|
| Amber | `#C49A1A` |
| Navy | `#0D1B2A` |
| Background | `#F7F6F3` |
| Headings | Playfair Display, weight 900 |
| Body | DM Sans |

Import from `constants/brand.ts` — never hardcode color values.

## Testing Requirements

### CEO Mandate (March 7, 2026)
> "Testing has to be immaculate. Without testing we can't push."

- Unit tests for all business logic (credibility, ratings, scoring)
- Integration tests for all API endpoints
- Manual verification for UI changes
- TypeScript must be clean (zero new errors)

### Running Tests
```bash
npm test              # Run all tests (currently 2117 across 92 files, <2s)
npm run test:watch    # Watch mode for development
```

### Writing Tests
- Place tests in `tests/` directory
- Name: `{module}.test.ts`
- Use `describe`/`it`/`expect` from Vitest
- Test boundary values and edge cases
- Test error cases, not just happy paths

## Documentation Requirements

### Every Sprint Produces
1. `docs/sprints/SPRINT-N-*.md` — Sprint doc with team discussions, changes, performance ratings
2. `docs/retros/RETRO-N-*.md` — Retrospective with actions and morale score

### Every Sprint Item Has
1. **What**: Clear description
2. **Why**: How it serves the trust mission
3. **Test Plan**: How we verify it works
4. **Owner**: Named team member
5. **Story Points**: Complexity estimate (1, 2, 3, 5, 8, 13)

### Architectural Audits (Every 5 Sprints)
- Full codebase scan: security, performance, type safety, duplication, testing
- Output: `docs/audits/ARCH-AUDIT-N.md`
- CRITICAL findings become P0 in the next sprint
- HIGH findings enter backlog as P1

## File Size Guidelines
- Target: <800 LOC per file
- Files >1000 LOC are split candidates (flagged in audits)
- Extract components/modules when a file grows beyond 800 LOC

## Security
- Never commit `.env` files or secrets
- Session secrets must be env vars with no fallbacks
- Admin access through centralized `shared/admin.ts` only
- Rate limiting on all auth endpoints
- Input validation at all API boundaries
