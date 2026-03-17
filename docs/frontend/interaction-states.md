# GPO Interaction States

## Every Interactive Element Must Handle

| State | What It Looks Like |
|---|---|
| Default | Base appearance |
| Hover | Subtle border or background shift |
| Active/Pressed | Slight scale-down or color intensify |
| Focus | Visible focus ring (accessibility) |
| Disabled | Reduced opacity (0.4), no pointer events |
| Loading | Spinner or skeleton, disabled interaction |

## Empty States

Every data-driven screen must have a meaningful empty state:

```
[icon]
No [items] yet
[Description of when items will appear]
[Optional: action button to create first item]
```

No screen should show a blank white/dark area with no explanation.

## Loading States

```
[Skeleton rectangles matching expected layout]
```

Never show "Loading..." text alone. Use skeleton shapes that match the expected content layout.

## Error States

```
[icon]
Something went wrong
[Specific error message]
[Retry button]
```

## Task Status Visual States

| Status | Color | Icon | Pulse |
|---|---|---|---|
| intake | `--text-faint` | circle | no |
| deliberating | `--accent` | circle | yes |
| planned | `--accent` | check | no |
| executing | `--yellow` | spinner | yes |
| waiting_approval | `--yellow` | pause | yes |
| done | `--green` | check-circle | no |
| failed | `--red` | x-circle | no |

## Approval States

| State | Primary Action | Secondary | Danger |
|---|---|---|---|
| Pending | Approve | View Details | Reject |
| Approved | — | View Result | — |
| Rejected | Retry | View Reason | — |
