# GPO Screen Inventory

## Operational Screens (Keep + Redesign)

| Screen | Tab ID | Status | Priority |
|---|---|---|---|
| Dashboard | tab-home | Overcrowded — 10+ sections, no hierarchy | P1 |
| New Task | tab-intake | Functional but complex — 5-step flow unclear | P1 |
| Tasks | tab-tasks | Minimal polish, no loading states | P2 |
| Approvals | tab-approvals | Functional | P2 |
| Engines | tab-missions | Working, needs hierarchy cleanup | P2 |
| Memory | tab-memory | Thin — single panel | P3 |
| Providers | tab-providers | Limited render | P3 |
| Costs | tab-costs | Raw data dump, needs structure | P3 |
| Activity | tab-logs | Functional but cluttered | P3 |
| Operations | tab-controls | Too many functions, no hierarchy | P3 |
| Settings | tab-settings | Scattered config, no grouping | P3 |

## Non-Functional Screens (Remove or Hide)

| Screen | Tab ID | Problem |
|---|---|---|
| Dossiers | tab-dossiers | Empty placeholder, no render function |
| Governance | tab-governance | 9 empty slot divs, no implementation |
| Audit | tab-audit | 2 empty slots, no render function |
| Releases | tab-releases | 2 empty slots, no render function |
| Structured I/O | tab-structured-io | 1 empty slot, no implementation |
| Admin | tab-admin | 3 empty slots, no render function |

## Legacy Screens (Remove)

| Screen | Tab ID | Problem |
|---|---|---|
| Startup & Business Builder | tab-topranker | Orphaned engine tab, duplicates Engines screen |

## Legacy Naming Leaks

| Location | Leak | Fix |
|---|---|---|
| app.js line 737 | "Rahul" in greeting | Use "Operator" or config |
| app.js line 1524 | "Waiting for Rahul" | Use "Waiting for operator" |
| index.html line 119 | `needsRahulHero` element ID | Rename to `pendingActionHero` |
| index.html line 304 | `topranker` option value | Use `startup` |
| index.html line 517 | `tab-topranker` section | Remove entirely |
| app.js line 1143 | `renderTopRanker()` function | Remove |
| app.js line 2474 | "RPGPO vs TopRanker" scope text | Use canonical names |
| style.css line 1731 | `topranker` nav rule | Remove |
| style.css lines 1752-1793 | `needsRahulPulse` animation | Rename |
