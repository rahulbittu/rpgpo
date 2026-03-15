# GPO Canonical Naming Map

## Internal ID → Canonical Display Name

| Internal ID | Canonical Display Name | Status |
|---|---|---|
| `startup` | Code & Product Engineering | Active |
| `writing` | Writing & Documentation | Active |
| `research` | Research & Analysis | Active |
| `learning` | Learning & Tutoring | Active |
| `personalops` | Scheduling & Life Operations | Active |
| `health` | Health & Wellness Coach | Active |
| `shopping` | Shopping & Buying Advisor | Active |
| `travel` | Travel & Relocation Planner | Active |
| `wealthresearch` | Personal Finance & Investing | Active |
| `topranker` | Startup & Business Builder | Active |
| `careeregine` | Career & Job Search | Active |
| `screenwriting` | Screenwriting & Story Development | Active |
| `music` | Music & Audio Creation | Active |
| `newsroom` | News & Intelligence | Active |
| `founder2founder` | Filmmaking & Video Production | Active |
| `home` | Home & Lifestyle Design | Active |
| `general` | General | Active |

## Legacy Terms to Remove from Operator-Facing Surfaces

| Term | Replacement | Context |
|---|---|---|
| RPGPO | GPO | Product name |
| TopRanker | (removed or Startup & Business Builder) | Engine name |
| CareerEngine / careeregine | Career & Job Search | Engine name |
| WealthResearch | Personal Finance & Investing | Engine name |
| PersonalOps | Scheduling & Life Operations | Engine name |
| Founder2Founder | Filmmaking & Video Production | Engine name |
| Newsroom | News & Intelligence | Engine name |

## Compatibility Rule

Internal IDs (`topranker`, `careeregine`, etc.) remain in:
- State JSON files
- API responses
- Backend routing
- Domain detection

The `domainLabel()` function in app.js maps these to canonical names at the UI layer.
