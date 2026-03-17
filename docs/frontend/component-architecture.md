# GPO Component Architecture

## Reusable Primitives

These are the building blocks. Every screen is composed from these, not ad-hoc HTML.

### Layout

| Component | Purpose | Usage |
|---|---|---|
| `AppShell` | Page wrapper: sidebar + content area | Root of every view |
| `SideRail` | Left navigation with sections and items | Single instance, always visible |
| `TopBar` | Page title + contextual actions | One per screen |
| `ContentArea` | Scrollable main content zone | Inside AppShell |

### Surfaces

| Component | Purpose | CSS Class |
|---|---|---|
| `SurfacePanel` | Primary content container | `.surface` |
| `SurfaceInset` | Inset area within a panel (code, detail) | `.surface-inset` |
| `SectionHeader` | Section title with optional action button | `.section-header` |

### Data Display

| Component | Purpose | CSS Class |
|---|---|---|
| `MetricTile` | Single metric with label + value | `.metric-tile` |
| `DataRow` | Key-value row in a list | `.data-row` |
| `StatusBadge` | Inline status indicator | `.badge` + `.badge-{status}` |
| `EngineBadge` | Engine name with canonical display | `.engine-badge` |

### Cards

| Component | Purpose | CSS Class |
|---|---|---|
| `TaskCard` | Task summary in list view | `.task-card` + `.task-{status}` |
| `ApprovalCard` | Pending approval with action buttons | `.approval-card` |
| `DeliverableCard` | Completed output with download | `.deliverable-card` |
| `EvidenceCard` | Traceability/audit item | `.evidence-card` |

### Actions

| Component | Purpose | CSS Class |
|---|---|---|
| `ButtonPrimary` | Primary action (1 per section) | `.btn-primary` |
| `ButtonSecondary` | Secondary action | `.btn-secondary` |
| `ButtonGhost` | Tertiary / cancel / back | `.btn-ghost` |
| `ButtonDanger` | Destructive action (reject, delete) | `.btn-danger` |
| `IconButton` | Icon-only action (refresh, close) | `.btn-icon` |

### States

| Component | Purpose | CSS Class |
|---|---|---|
| `EmptyState` | No data / first-time-use | `.empty-state` |
| `LoadingState` | Data loading indicator | `.loading-state` |
| `ErrorState` | Error with retry option | `.error-state` |

### Feedback

| Component | Purpose | CSS Class |
|---|---|---|
| `FeedbackBar` | Good/Needs Work/Bad rating | `.feedback-bar` |
| `Toast` | Transient notification | `.toast` |

## Button System (Replaces 15+ Existing Classes)

```css
.btn { /* shared base */ }
.btn-primary { background: var(--accent); color: white; }
.btn-secondary { background: var(--bg-elevated); border: 1px solid var(--border-active); }
.btn-ghost { background: transparent; color: var(--text-dim); }
.btn-danger { background: var(--red-soft); color: var(--red); border-color: var(--red); }
.btn-icon { /* icon-only, square, no text */ }
.btn-sm { padding: var(--sp-4) var(--sp-8); font-size: var(--text-sm); }
.btn-md { padding: var(--sp-8) var(--sp-16); font-size: var(--text-base); }
```

## Card System (Replaces 12+ Existing Classes)

```css
.surface {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: var(--sp-16);
}
.surface:hover { border-color: var(--border-active); }
.surface-accent { border-left: 3px solid var(--accent); }
.surface-success { border-left: 3px solid var(--green); }
.surface-warning { border-left: 3px solid var(--yellow); }
.surface-danger { border-left: 3px solid var(--red); }
```
