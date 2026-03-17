# GPO Design Principles

## Product Identity

GPO is a **governed personal AI operating system**. The UI must reflect:
- **Private** — this is your system, not a public service
- **Intelligent** — the system learns and adapts visibly
- **Calm** — information density without noise
- **Governed** — every action has traceability and approval boundaries
- **Trustworthy** — evidence-backed, not hype-driven

## Visual Principles

### 1. Hierarchy First
Every screen must have one clear primary focus. Secondary content recedes. Nothing competes for equal attention.

### 2. Calm Over Flashy
Dark surfaces with restrained accents. No gradient hero spam, no neon overload, no glassmorphism everywhere. Premium means quiet confidence, not visual noise.

### 3. Operational Clarity
Every visible element must serve an operational purpose. No decorative widgets, no fake charts, no placeholder screens masquerading as features.

### 4. Consistent Surfaces
One card system. One button system. One spacing scale. No ad-hoc styling per screen.

### 5. Evidence Over Assertion
Show what GPO did, how it decided, what the operator can trace. Don't hide the machinery behind marketing surfaces.

## Typography

| Role | Size | Weight | Usage |
|---|---|---|---|
| Page title | 18px | 700 | One per screen |
| Section header | 14px | 600 | Section dividers |
| Body text | 13px | 400 | Primary content |
| Label / meta | 11px | 500 | Tags, timestamps, badges |
| Caption / hint | 10px | 400 | Secondary info, help text |
| Mono / code | 12px | 400 | IDs, code, technical values |

Fonts: `Inter` or system sans-serif for body. Monospace for technical content.

## Spacing Scale

Only these values. No exceptions.

| Token | Value | Usage |
|---|---|---|
| `--sp-2` | 2px | Micro gaps (badge padding) |
| `--sp-4` | 4px | Tight gaps (inline elements) |
| `--sp-8` | 8px | Standard gap (between items) |
| `--sp-12` | 12px | Section padding (inside cards) |
| `--sp-16` | 16px | Panel padding |
| `--sp-24` | 24px | Section margins |
| `--sp-32` | 32px | Page-level spacing |

## Color System

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | #0a0d15 | Page background |
| `--bg-surface` | #111520 | Card/panel background |
| `--bg-elevated` | #181d2a | Hover, active surfaces |
| `--border` | rgba(255,255,255,0.08) | Default borders |
| `--border-active` | rgba(255,255,255,0.16) | Focus/hover borders |
| `--text` | #e8eaf0 | Primary text |
| `--text-dim` | #8b90a0 | Secondary text |
| `--text-faint` | #555a6a | Tertiary / disabled |
| `--accent` | #6b8afd | Primary accent (links, active) |
| `--green` | #50c878 | Success, approved, clean |
| `--yellow` | #f0b428 | Warning, pending, advisory |
| `--red` | #dc503c | Error, failed, denied |

## Disallowed Patterns

- Giant gradient hero banners
- Neon/glow overload
- Glassmorphism on every surface
- Excessive rounded corners (max 8px)
- Fake charts or metrics without real data
- Decorative widgets with no operational purpose
- Inconsistent card styles per screen
- Consumer-playful SaaS feel
- Low-contrast text on dark backgrounds
- User-specific branding in product UI ("Rahul", "RPGPO")
