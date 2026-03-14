# Cost Governance

## Cost Tiers
| Provider | Input/1K | Output/1K | Tier |
|----------|----------|-----------|------|
| Claude | $0 | $0 | free |
| OpenAI | $2.50 | $10.00 | medium |
| Gemini | $0.10 | $0.40 | low |
| Perplexity | $1.00 | $5.00 | low |

## Decision Outcomes
- allow — within budget
- warn — budget low
- soft_block — budget exhausted (non-prod)
- hard_block — budget exhausted (prod)
- fallback_required — reroute to cheaper provider

## Budget Windows
Daily limits from autonomy budgets: dev $10, beta $5, prod $2.
