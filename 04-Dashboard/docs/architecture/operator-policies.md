# Operator Preference Policies

## Purpose

Operator policies let the operator declare how strict or permissive GPO should be across 7 policy areas. Policies cascade with precedence: project > engine > operator > global defaults.

## Policy Areas

| Area | Default | Options | Effect |
|------|---------|---------|--------|
| `execution_style` | balanced | permissive, balanced, strict | Controls auto-execution aggressiveness |
| `review_strictness` | balanced | permissive, balanced, strict | How thorough reviews must be |
| `documentation_strictness` | balanced | permissive, balanced, strict | Documentation requirements enforcement |
| `provider_override_mode` | advisory | advisory, enforced, off | Provider registry recommendations |
| `interruption_mode` | balanced | permissive, balanced, strict | When to interrupt the operator |
| `learning_promotion_mode` | advisory | advisory, enforced, off | Auto-promote experimental fits/recipes |
| `board_recheck_bias` | balanced | permissive, balanced, strict | Tendency to recheck with the Board |

## API

- `GET /api/operator-policies` — All policies
- `POST /api/operator-policies` — Create policy
- `POST /api/operator-policies/:id/toggle` — Enable/disable

## Resolution

`resolvePolicy(area, domain?, projectId?)` returns the effective value and its source.
