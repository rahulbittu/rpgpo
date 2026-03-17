# GPO Frontend Refactor Plan

## Phase 1: Foundation (Batches 1-2)
- [x] Audit current frontend — 19 screens inventoried, 7 non-functional found
- [x] Document design principles, tokens, component architecture
- [ ] Define remaining docs (brand direction, stitch brief)

## Phase 2: Cleanup (Batch 3)
Priority: Remove dead weight before adding new structure.

1. **Remove 6 non-functional screens** (Dossiers, Governance, Audit, Releases, Structured I/O, Admin)
   - Remove HTML sections, nav items, and any dead JS
   - These screens have zero render functions — they are architecture fantasy

2. **Remove legacy TopRanker tab** (tab-topranker)
   - Consolidate into Engines screen
   - Remove `renderTopRanker()` function

3. **Remove hardcoded naming**
   - Replace "Rahul" with "Operator" in greetings and status text
   - Replace `needsRahulHero` element IDs with `pendingActionHero`
   - Remove RPGPO-specific scope warnings

## Phase 3: Design System (Batch 3-4)
Add design tokens to CSS and normalize components.

1. **Add spacing tokens** to `:root` — replace all ad-hoc values
2. **Add unified button system** — `.btn`, `.btn-primary/secondary/ghost/danger`, `.btn-sm/md`
3. **Add unified surface system** — `.surface`, `.surface-accent/success/warning/danger`
4. **Add state components** — `.empty-state`, `.loading-state`, `.error-state`
5. **Add accessibility** — focus rings, reduced motion, ARIA

## Phase 4: Screen Redesign (Batches 4-6)

### P1 — Dashboard + New Task
- Dashboard: reduce from 10+ sections to focused layout
  - Primary: current task focus + pending actions
  - Secondary: today's summary + recent deliverables
  - Remove: redundant status strips, excessive metrics
- New Task: clearer submission flow with better template access

### P2 — Tasks + Approvals + Engines
- Tasks: loading states, better filter UI, status badges
- Approvals: clearer action hierarchy
- Engines: canonical names, consistent cards

### P3 — Settings + Costs + Activity
- Settings: grouped configuration sections
- Costs: structured display, not raw dump
- Activity: timeline view with filtering

## Phase 5: Polish (Batch 7-8)
- Consistency pass across all screens
- Responsive behavior (mobile sidebar collapse)
- Animation consistency (respect reduced-motion)
- Final hierarchy check

## Rules

- No screen redesign before primitives are defined
- No ad-hoc CSS — use tokens
- No new button/card classes — use the unified system
- No fake features — remove non-functional screens first
- Backend must remain untouched unless wiring requires it
