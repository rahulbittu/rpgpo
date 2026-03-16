# Human Control Boundaries

## Principle

GPO automates what is understood and safe. Human judgment stays where risk or ambiguity is high.

## Where GPO Acts Autonomously

| Action | Risk Level | Why Auto |
|---|---|---|
| Domain routing | Low | Keyword-scored, reversible |
| Board deliberation | Low | Analysis only, no side effects |
| Subtask planning | Low | Plan is reviewable before execution |
| Web search (Perplexity) | Low | Read-only, no account access |
| Content synthesis (OpenAI) | Low | Text generation, no side effects |
| Deliverable file creation | Low | Local file write only |
| Behavior event capture | Low | Append-only logging |

## Where GPO Requires Approval

| Action | Risk Level | Why Gated |
|---|---|---|
| Code changes (Claude builder) | Medium | Modifies repository files |
| Email sending | High | Irreversible outbound communication |
| Financial transactions | Critical | Real money involved |
| Credential changes | Critical | Security-sensitive |
| Data deletion | Critical | Irreversible |

## Where GPO Escalates

- Ambiguous task intent
- Conflicting operator signals
- Provider failures after retry
- Cost threshold exceeded
- Security/privacy boundary reached

## Learned Behavior Boundaries

- Signals below confidence threshold are advisory only
- Stale signals degrade to advisory
- Operator can inspect, suppress, or delete any learned signal
- No hidden adaptation — all active signals are visible
- Learning never overrides explicit operator instructions
