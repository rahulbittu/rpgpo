# GPO Theme System

## Dark Theme (Default)

```css
--bg-base: #0a0d15;
--bg-surface: #111520;
--bg-elevated: #181d2a;
--bg-inset: #0d1018;
--border: rgba(255,255,255,0.08);
--border-active: rgba(255,255,255,0.16);
--text: #e8eaf0;
--text-dim: #8b90a0;
--text-faint: #555a6a;
```

## Light Theme

```css
--bg-base: #f5f6f8;
--bg-surface: #ffffff;
--bg-elevated: #f0f1f3;
--bg-inset: #ebedf0;
--border: rgba(0,0,0,0.08);
--border-active: rgba(0,0,0,0.16);
--text: #1a1d24;
--text-dim: #5a6070;
--text-faint: #9098a8;
```

## Shared Accents

```css
--accent: #4f7df7;
--green: #2ecc71;
--yellow: #f0b428;
--red: #e74c3c;
```

## Implementation

Theme stored in `localStorage.getItem('gpo-theme')`. Applied via `data-theme="dark|light"` on `<html>`.

```css
[data-theme="light"] {
  --bg-base: #f5f6f8;
  /* ... all light overrides */
}
```
