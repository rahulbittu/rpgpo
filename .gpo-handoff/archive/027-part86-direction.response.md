```
You are the RPGPO builder for Part 86.

Part 86: Premium UI Component Library + Final Visual Polish

Objective
Transform the 04-Dashboard UI into a premium-quality, consistent, responsive, dark-first design with a typed, reusable component system, refined color tokens, loading skeletons, error boundaries, responsive breakpoints, and premium micro-interactions. Preserve all existing functionality and routes. No frameworks; keep raw Node.js HTTP server and CommonJS on server; use browser ES modules for UI. Maintain privacy-first constraints (no external CDNs).

Scope and Constraints
- Do not break existing routes or behaviors; preserve all working functionality.
- No new frontend frameworks; use TypeScript ES modules compiled to JS, imported via type=module.
- Keep server.js as raw Node.js HTTP (no Express). Add only minimal API endpoints with guards.
- Host all assets locally (fonts, icons). No external network calls for UI assets.
- Respect existing governance, guards, deep-redaction, RBAC visibility rules in the UI.
- Ship behind a reversible feature flag ui.v2 (enabled by default), with backout to legacy styles.

Repository Paths
- 04-Dashboard/app/ (UI code)
- 04-Dashboard/app/index.html, app.js, operator.js, style.css, operator.css (existing)
- 04-Dashboard/app/ui/ (new UI library)
- 04-Dashboard/app/assets/ (fonts, icons)
- 04-Dashboard/app/docs/ (UI-specific docs)
- 04-Dashboard/server.js (API endpoints and route guards)
- 04-Dashboard/lib/types.ts (add UI types)
- 04-Dashboard/state/ (persist UI preferences, error reports)

Deliverables
1) UI Component Library (vanilla TS, typed, accessible)
2) Theme tokens (dark-first, refined palette), base styles, responsive utilities
3) Loading primitives: skeleton, shimmer, spinners
4) Error boundaries: per-view guard and global crash panel + safe recovery
5) Micro-interactions: toasts, tooltips, subtle hover/press, focus rings, reduce-motion support
6) Responsive breakpoints and layout utilities
7) UI Preferences (theme, density, motion) persistence (local + server)
8) Component usage across key surfaces (Mission Control, Releases/Deliverables, Engines, Tasks)
9) Docs: design system, tokens, component contracts, migration guide
10) Acceptance suite updates for UI verification
11) Backout plan: toggle to legacy styles

File/Module Plan

A) Types
- 04-Dashboard/lib/types.ts
  - Add:
    - export type UITheme = 'dark' | 'light' | 'system';
    - export type UIDensity = 'comfortable' | 'compact';
    - export type UIMotionPref = 'auto' | 'reduce';
    - export interface UIPreferences { theme: UITheme; density: UIDensity; motion: UIMotionPref; updatedAt: string; }
    - export interface UIToast { id: string; level: 'info' | 'success' | 'warning' | 'error'; title: string; message?: string; timeoutMs?: number; }
    - export interface UIErrorReport { id: string; route: string; name: string; message: string; stack?: string; userAgent?: string; time: string; tenant?: string; }
    - export interface UIComponentContract { name: string; version: string; props: Record<string, string>; events?: string[]; }

B) UI Library (new)
- 04-Dashboard/app/ui/types.ts
  - Re-export UI types for browser (mirror of lib/types with DOM-safe declarations).
- 04-Dashboard/app/ui/styles/
  - base.css: CSS reset, base typography, focus-visible, selection, scrollbars, motion reduction.
  - tokens.css: CSS variables for color, spacing, radii, elevation, z, typography, timing, opacities.
  - theme-dark.css: refined dark palette (primary, accent, success, warning, danger, bg/fg, surfaces).
  - theme-light.css: optional light theme parity (derive from tokens; dark is default).
  - components.css: common component classes; import tokens/base; minimal duplication.
  - responsive.css: breakpoint utilities (sm/md/lg/xl/2xl), grid/flex helpers, visibility utils.
- 04-Dashboard/app/ui/components/
  - component-base.ts: base class with lifecycle, ARIA helpers, event typing, attribute sync.
  - button.ts: button variants (primary/secondary/ghost/danger), sizes, loading, disabled, icons.
  - input.ts: input + label + help + error, with validation state.
  - select.ts: custom select with keyboard nav, ARIA combobox, sizes.
  - textarea.ts
  - checkbox.ts, radio.ts, switch.ts
  - badge.ts, tag.ts, status-dot.ts
  - card.ts, panel.ts, divider.ts, toolbar.ts
  - table.ts: table with sticky header, empty state, density support.
  - modal.ts: focus trap, escape close, portal, animation.
  - tabs.ts: keyboard navigation, ARIA roles.
  - dropdown.ts, context-menu.ts
  - tooltip.ts: hover/focus delay, smart positioning, prefers-reduced-motion.
  - toast.ts: stack manager, timeouts, announce via aria-live.
  - skeleton.ts: lines/rects/avatar/list/grid skeleton patterns.
  - spinner.ts
  - navbar.ts, sidebar.ts, breadcrumb.ts, pagination.ts
- 04-Dashboard/app/ui/system/
  - prefs.ts: get/set UI prefs (localStorage + server fetch/save, debounce, tenant-aware).
  - error-boundary.ts: withErrorBoundary(fn, { name, mount, onError }) wrapper; global listeners.
  - motion.ts: transition helpers; safe durations; prefers-reduced-motion compliance.
  - responsive.ts: breakpoint detection, container queries helpers.
  - icons.ts: inline SVG registry (add core icons: check, x, alert, info, spinner, chevron, dots).
  - theme.ts: applyTheme(theme), applyDensity(), applyMotion(); ui.v2 flag bootstrap.
  - a11y.ts: focus-visible polyfill, skip-to-content, aria utils.
  - router-hooks.ts: hook points to show skeletons during fetches in app.js/operator.js routes.
- 04-Dashboard/app/ui/index.ts
  - Entry: initialize ui.v2; load styles; install global error boundary; hydrate preferences; expose UI registry.

C) Assets
- 04-Dashboard/app/assets/fonts/
  - Inter variable or static family (local files), LICENSE.
  - Fallback to system font stack if unavailable.
- 04-Dashboard/app/assets/icons/
  - SVGs for core set (24px grid), license headers.

D) API Endpoints (server.js)
- POST /api/ui/preferences
  - Body: UIPreferences
  - Auth: same operator auth; apply route guards; tenant isolate; deep redaction on logs.
  - Persist: state/ui-preferences.json (by tenant / operator key).
- GET /api/ui/preferences
  - Returns stored UIPreferences or defaults.
- POST /api/ui/error-report
  - Body: UIErrorReport
  - Auth + guards; persist: state/ui-errors.json (append-logs with rotation: keep last 5k).

E) Server: Guards/Types
- Wire new routes to existing http-response-guard.ts, redact sensitive fields, validate JSON schema.
- Add types for payload validation (use minimal inline validators consistent with existing practice).

F) Integration Touchpoints (migrate usage incrementally)
- index.html
  - Add link tags for base.css, tokens.css, theme-dark.css (default), components.css, responsive.css.
  - Add script type=module for /app/ui/index.js (compiled).
  - Add data-ui-v2="true" on <html> when ui.v2 enabled.
- app.js and operator.js
  - Import from /app/ui/system/router-hooks.js to show/hide skeletons during async loads.
  - Replace legacy spinners with spinner + skeleton patterns at view-level:
    - Mission Control initial load
    - Releases/Deliverables panel
    - Engines catalog
    - Tasks/Queue and Task detail
    - Logs/Observability
    - Settings
  - Wrap top-level render for each major view with withErrorBoundary.
  - Replace ad-hoc toasts/alerts with toast.ts manager.
  - Use button/input/select components for primary interactions without changing underlying behavior.
  - Respect RBAC: disable or hide component actions based on existing RBAC checks.
- style.css, operator.css
  - Keep but reduce to legacy-only styles; ensure specificity doesn’t override v2 components.
  - Add .legacy class gates to avoid conflicts; v2 components are namespaced (.ui-, data-ui-v2 attr).

G) Theming and Tokens
- tokens.css (HSL; dark-first)
  - Color
    - --color-bg: hsl(220 18% 6%)
    - --color-surface: hsl(220 14% 10%)
    - --color-surface-2: hsl(220 12% 12%)
    - --color-border: hsl(220 10% 24%)
    - --color-fg: hsl(220 25% 96%)
    - --color-muted: hsl(220 8% 65%)
    - --color-primary: hsl(252 100% 70%)
    - --color-primary-contrast: hsl(0 0% 100%)
    - --color-accent: hsl(200 100% 60%)
    - --color-success: hsl(151 55% 46%)
    - --color-warning: hsl(43 96% 56%)
    - --color-danger: hsl(0 84% 60%)
    - --shadow-color: 220 20% 2%
  - Radii: --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-full: 999px
  - Spacing: --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px
  - Typography: --font-sans: "Inter var", system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"; --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; Sizes: --text-xs: 12px; --text-sm: 13px; --text-md: 14px; --text-lg: 16px; --text-xl: 18px
  - Elevation: --elev-1: 0 1px 2px hsl(var(--shadow-color) / 0.25), 0 1px 1px hsl(var(--shadow-color) / 0.35); --elev-2: 0 4px 12px hsl(var(--shadow-color) / 0.35)
  - Timing: --ease-standard: cubic-bezier(0.2, 0.0, 0, 1); --dur-1: 120ms; --dur-2: 180ms; --dur-3: 240ms
  - Opacity: --opacity-disabled: 0.5; --opacity-muted: 0.75
- theme-light.css
  - Provide light equivalents with AA contrast.
- theme.ts
  - applyTheme to toggle class on html: data-theme="dark" | "light".
  - Density utility: data-density="comfortable" | "compact" affecting paddings, table row height.
  - Motion utility: respects prefers-reduced-motion unless overridden by UIMotionPref=auto.

H) Loading and Error Handling
- skeleton.ts: API renderSkeletonLines(count), renderSkeletonCard(), renderSkeletonTable(rows)
- spinner.ts: overlay and inline spinner variants
- error-boundary.ts:
  - withErrorBoundary({ name, mount, render, onError? }): try/catch render; on error show crash panel with:
    - Non-technical user message + "Copy details" collapsible
    - "Report" button to POST /api/ui/error-report
    - "Retry" button re-invokes render
- Global:
  - window.onerror and unhandledrejection to show toast and log report (rate-limited)

I) Micro-interactions and A11y
- button, card, inputs: focus ring: 2px outline with --color-accent; shadow on hover within motion rules
- tooltip: accessible via focus/aria-describedby, eight-way positioning, collision detection
- toast: aria-live="polite", max 3 visible, stack bottom-right, swipe-to-dismiss on touch
- dropdown/context-menu: keyboard nav (Arrow, Home/End), typeahead within list
- modal: body scroll lock, focus trap, escape to close, click outside to close (configurable)
- table: sticky header, row hover, compact mode reduces row height to 36px

J) Responsive
- Breakpoints: sm 640px, md 768px, lg 1024px, xl 1280px, 2xl 1536px
- Utilities: .hidden-{bp}-up/down, .grid-{n}, .gap-{n}, .col-span-{n}, .flex-{wrap/col}, .justify-*, .items-*, .w-*, .h-*
- Navbar/Sidebar collapse at md; icons-only sidebar on sm; breadcrumbs collapse on narrow

K) UI Preferences
- prefs.ts:
  - getLocalPrefs(), saveLocalPrefs()
  - loadServerPrefs(tenant?), saveServerPrefs() with debounce 500ms
  - merge strategy: server wins unless stale; timestamp-based
- Settings UI control (reuse Settings view): Theme selector, Density selector, Motion selector; save to server + local

L) RBAC and States
- Components expose disabled and tooltip for denied actions; never hide critical warnings
- Buttons with destructive variant require confirm modal; match existing guard flows
- Respect operator role: render disabled-with-reason for restricted capabilities

M) Feature Flag and Backout
- Add ui.v2 flag to prefs with default true; expose toggle in Settings (admin-only)
- If disabled, remove data-ui-v2 and unload v2 CSS; revert to legacy classes

N) Documentation
- 04-Dashboard/app/docs/ui-design-system.md: philosophy, tokens, usage examples
- 04-Dashboard/app/docs/ui-component-contracts.md: per-component props/events, versions
- 04-Dashboard/app/docs/ui-theming.md: tokens, extending, light/dark, density
- 04-Dashboard/app/docs/ui-migration-guide.md: replacing legacy classes, do/don’t
- 04-Dashboard/app/docs/ui-error-handling.md: boundary patterns, reporting
- 04-Dashboard/app/docs/ui-acceptance-checklist.md

O) Testing and Acceptance
- Manual acceptance scripts for each page with screenshots checklist (documented)
- Lightweight DOM tests (where applicable) to assert:
  - Tokens applied: computed styles for bg/fg/border
  - Keyboard nav works for menu, tabs, dropdown, modal
  - Error boundary surfaces and recovery works
  - Skeleton visible during async fetch, replaced on resolve, no flash of unstyled content
  - Toast stack behavior and aria-live announcements
- Performance budgets (local dev):
  - Additional CSS payload for v2 <= 45KB gzip
  - First paint remains < 1200ms on baseline MacBook dev
  - No layout shift > 0.1 CLS from initial render to idle
- Accessibility:
  - All interactive components have discernible names
  - Color contrast AA minimum for text and UI components
  - Focus visible on keyboard only; trap cycles in modals; skip-to-content available

API Contracts

1) GET /api/ui/preferences
- Query: ?tenant={id} (optional; infer if omitted)
- Response: { theme: 'dark'|'light'|'system', density: 'comfortable'|'compact', motion: 'auto'|'reduce', updatedAt: ISO }
- Guards: auth + tenant isolation; redact none

2) POST /api/ui/preferences
- Body: UIPreferences
- Response: { ok: true, savedAt: ISO }
- Guards: auth + tenant isolation; validate enums; updatedAt server-generated

3) POST /api/ui/error-report
- Body: UIErrorReport { route, name, message, stack?, userAgent?, time, tenant? }
- Response: { ok: true, id }
- Guards: auth; deep-redaction on message/stack if any secrets heuristics; rate-limit per IP/user (e.g., 20/min)

Server Implementation Notes
- server.js: Add route handlers near existing API section; reuse existing JSON body parser; integrate with http-response-guard.ts
- state/ui-preferences.json: { [tenantKey:string]: UIPreferences }
- state/ui-errors.json: append-only log array with rotation when >5000 entries; keep last 5000
- Update middleware logs to tag UI routes with category: 'ui'

UI Integration Targets
- Mission Control (home): Replace primary buttons, filters, loading states, alerts, cards
- Releases > Deliverables panel: Cards, tabs, table, skeleton while loading deliverables
- Engines catalog: Grid with cards, tooltip over engine details, modal for engine config
- Tasks/Queue: Table with status-dot, badge, pagination; per-row actions via dropdown; skeleton on fetch
- Task detail: Panels, tabs, code blocks styled with tokens, toasts on copy
- Logs/Observability: Table virtualized feel (no heavy lib), compact mode, filters with select/input
- Settings: New UI preferences section; modal confirmations for risky actions

Refactors (Non-breaking)
- Ensure all new components namespace classes with .ui- prefix
- All DOM queries within components scoped to shadow root or container to avoid leakage
- Avoid mutating legacy global styles; add .legacy root class to contain legacy-specific overrides

Accessibility and Motion
- Respect prefers-reduced-motion: disable non-essential transitions; use transform-based animations
- Tooltips delay: show 200ms, hide 100ms; keep open on focus
- Toasts readable time minimum: 4s unless user dismisses
- Focus ring visible color: --color-accent on dark, auto-adjust on light

Security and Privacy
- No external fonts/CDNs; ship Inter locally with license
- CSP: ensure font-src 'self'; style-src 'self' 'unsafe-inline' only if already used; prefer inline hash if applicable
- Error report redaction: strip large payloads (>10KB), truncate stack to 2KB, mask tokens via existing redaction util

Performance
- Preload fonts with <link rel="preload" as="font" type="font/woff2" crossorigin>
- Use content-visibility: auto on offscreen panels
- Avoid heavy box-shadows; rely on shadow tokens
- Debounce expensive layout handlers; use ResizeObserver where needed

Rollout Plan
- Phase 1: Land tokens, base, responsive; wire theme/prefs; add toasts, skeletons
- Phase 2: Replace components in Settings, Mission Control
- Phase 3: Replace components in Releases/Deliverables, Engines
- Phase 4: Replace in Tasks/Queue, Logs
- Phase 5: Polish micro-interactions, final QA
- Backout: Toggle ui.v2 off in Settings; CSS unload sequence removes v2 CSS links and data attributes

Acceptance Criteria (must pass)
- Consistent visual tokens across all updated pages; no mixed legacy styles unless ui.v2 disabled
- Dark theme is default and readable with AA contrast; light theme toggle works
- All async views show skeletons within 100ms and replace with content on resolve; no flash
- Global and per-view error boundaries catch and surface errors; POST to /api/ui/error-report invoked
- Components keyboard accessible; modals trap focus; dropdowns and tabs navigate via keyboard
- Responsive layout degrades gracefully at sm/md/lg/xl; sidebar collapses; breadcrumbs collapse
- UI preferences persist across reloads and new sessions (local + server)
- No broken routes; all prior workflows and buttons still function
- Performance budgets upheld

Implementation Steps
1) Create directories and skeleton files per plan; commit scaffolding
2) Implement tokens, base, responsive CSS; import in index.html; wire theme.ts
3) Implement core components (button, input, select, card, skeleton, spinner, toast)
4) Add prefs APIs to server.js with guards; add types; create state files
5) Implement error-boundary.ts and global handlers; wire to app.js/operator.js render roots
6) Replace UI on Settings page (add UI preferences section)
7) Replace Mission Control primary actions and lists; add skeletons on load
8) Replace Releases/Deliverables panel with cards/tabs/table; add skeletons
9) Replace Engines catalog; add modal details; tooltip microcopy
10) Replace Tasks/Queue table; add status-dot, pagination, dropdown actions
11) Replace Logs/Observability filters and table; compact density option
12) A11y pass; keyboard nav; focus rings; ARIA roles
13) Performance pass; preloads; measure; optimize where needed
14) Docs: write design system, contracts, theming, migration, error handling
15) Update acceptance checklist; run manual QA script; fix issues
16) Commit with Part 86 tags and changelog

Changelog Template
- Part 86: Premium UI Component Library + Final Visual Polish
  - Added: UI tokens, dark/light themes, responsive utilities
  - Added: Typed component library (buttons, inputs, selects, tables, modals, tabs, toasts, tooltips, skeletons, spinners, cards)
  - Added: UI preferences APIs and persistence
  - Added: Error boundaries and UI error reporting
  - Updated: Mission Control, Releases/Deliverables, Engines, Tasks, Logs to use v2 components
  - Docs: design system, tokens, contracts, migration, error handling
  - Acceptance: UI checklist updated; performance and a11y bars met

Notes
- Maintain enterprise-grade, typed contracts via TypeScript across components.
- Avoid regressions; where unsure, leave legacy UI and gate v2 by feature flag.
- Keep diffs isolated by feature area to simplify review.

Begin implementation now. Reference existing guards, redaction, and RBAC utilities to ensure parity.
```
