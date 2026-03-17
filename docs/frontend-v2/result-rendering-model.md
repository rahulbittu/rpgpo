# GPO Frontend V2 — Result Rendering Model

## Principle

Results are the primary value GPO delivers. They must be rendered richly, not dumped as raw text.

## Rendering Pipeline

```
Raw subtask output (markdown string)
  → Parse markdown to structured HTML
  → Extract headings for table of contents
  → Extract URLs for source cards
  → Detect output type (research/travel/creative/etc.)
  → Apply type-specific rendering
  → Wrap in result card with actions
```

## Result Card Structure

```
┌─────────────────────────────────────────────────┐
│ [Engine Badge]  Title                    [Time] │
│                                                 │
│ ┌─ Rendered Output ──────────────────────────┐  │
│ │ ## Key Findings                            │  │
│ │ - Finding 1 with specific data             │  │
│ │ - Finding 2 with numbers                   │  │
│ │                                            │  │
│ │ ## Recommendations                         │  │
│ │ 1. Action item with timeline               │  │
│ │ 2. Action item with cost                   │  │
│ │                                            │  │
│ │ ## Sources                                 │  │
│ │ [Link 1] [Link 2] [Link 3]                │  │
│ └────────────────────────────────────────────┘  │
│                                                 │
│ [📥 Download MD] [📥 JSON] [🔍 Evidence] [⭐ Rate] │
│                                                 │
│ Was this helpful?  [Yes ✓] [Could be better] [No] │
└─────────────────────────────────────────────────┘
```

## Markdown Rendering

Use a proper markdown renderer, not regex substitution:

| Feature | Rendering |
|---|---|
| `## Heading` | `<h2>` with anchor |
| `**bold**` | `<strong>` |
| `- list item` | `<ul><li>` |
| `1. numbered` | `<ol><li>` |
| `` `code` `` | `<code>` with mono font |
| ```` ```code block``` ```` | `<pre><code>` with syntax highlighting |
| `[text](url)` | `<a href>` that opens in new tab |
| `> blockquote` | `<blockquote>` with left border |
| Tables | HTML `<table>` with striped rows |

## Source Extraction

From the rendered output, extract all URLs and display them as clickable source cards:

```
Sources (3)
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🔗 example.com│ │ 🔗 source2.org│ │ 🔗 data3.gov │
│ "Article title"│ │ "Report name" │ │ "Dataset"    │
└──────────────┘ └──────────────┘ └──────────────┘
```

## File/Download Handling

| File Type | Action |
|---|---|
| Markdown deliverable | Preview inline + download button |
| JSON deliverable | Download button + preview toggle |
| Code files | Syntax-highlighted preview |
| Images (if any) | Inline preview |

## Raw Output Toggle

Raw markdown output is available but secondary:
- Hidden by default
- "Show raw output" toggle at bottom of result card
- Displayed in monospace pre block when toggled
