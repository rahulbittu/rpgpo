# GPO Accessibility Standards

## Minimum Requirements

- **Color contrast:** 4.5:1 for body text, 3:1 for large text (WCAG AA)
- **Focus indicators:** Visible focus ring on all interactive elements
- **Keyboard navigation:** All actions reachable via keyboard
- **Screen reader:** Semantic HTML, ARIA labels where needed
- **Motion:** Respect `prefers-reduced-motion` for animations

## Current Gaps

- No focus ring styles defined
- No `prefers-reduced-motion` media query
- Sidebar navigation not keyboard-accessible (relies on click handlers)
- Some color combinations may fail contrast (--text-faint on --bg-base)
- No ARIA labels on icon-only buttons

## Implementation Plan

1. Add global focus ring: `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`
2. Add `prefers-reduced-motion` to disable pulse animations
3. Add `role="navigation"` to sidebar, `role="main"` to content
4. Add `aria-label` to all icon-only buttons
5. Verify contrast ratios for all text/background combinations
