# GPO Frontend V2 — Theme System

## Principle

Both themes are first-class. Not "dark mode with a light fallback." The product must look intentionally designed in both.

## Dark Theme

```css
[data-theme="dark"] {
  --bg-0: #0a0c14;       /* deepest background */
  --bg-1: #10131c;       /* sidebar, panels */
  --bg-2: #161a26;       /* cards, surfaces */
  --bg-3: #1c2030;       /* hover, elevated */
  --bg-input: #0e1018;   /* input fields, code blocks */

  --border-0: rgba(255,255,255,0.06);
  --border-1: rgba(255,255,255,0.10);
  --border-2: rgba(255,255,255,0.16);

  --text-0: #ebedf2;     /* primary text */
  --text-1: #9098aa;     /* secondary */
  --text-2: #565e72;     /* tertiary/disabled */

  --accent: #4e7ef7;
  --accent-hover: #6090ff;
  --accent-bg: rgba(78,126,247,0.08);

  --ok: #34d399;
  --warn: #fbbf24;
  --err: #f87171;
  --info: #60a5fa;
}
```

## Light Theme

```css
[data-theme="light"] {
  --bg-0: #f7f8fa;
  --bg-1: #ffffff;
  --bg-2: #f0f1f4;
  --bg-3: #e8eaee;
  --bg-input: #f0f1f4;

  --border-0: rgba(0,0,0,0.06);
  --border-1: rgba(0,0,0,0.10);
  --border-2: rgba(0,0,0,0.16);

  --text-0: #1a1d26;
  --text-1: #5a6274;
  --text-2: #9ca3b4;

  /* Same accents — they work in both themes */
}
```

## Implementation

- Theme attribute on `<html data-theme="dark">`
- All colors reference CSS variables — never hardcoded
- Stored in `localStorage.getItem('gpo-theme')`
- Restored before first paint (script in `<head>`)
- Toggle in Settings with immediate visual feedback

## What Must Not Happen

- Light theme showing dark scrollbars (set `color-scheme: light` / `dark`)
- White text on white background
- Dark borders on light cards
- Invisible focus rings
- Input fields that disappear
