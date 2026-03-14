# Product Shell Architecture

## 18 Sections
| Section | Role | State |
|---------|------|-------|
| Home | primary | shippable |
| Tasks | primary | shippable |
| Intake | primary | shippable |
| Missions | primary | shippable |
| TopRanker | primary | shippable |
| Approvals | primary | shippable |
| Channels | advanced | usable_but_noisy |
| Memory | advanced | shippable |
| Providers | advanced | shippable |
| Costs | advanced | shippable |
| Logs | advanced | shippable |
| Settings | advanced | shippable |
| Governance | operator_only | shippable |
| Audit | operator_only | shippable |
| Releases | operator_only | shippable |
| Admin | operator_only | usable_but_noisy |
| Dossiers | operator_only | incomplete |
| Controls | operator_only | usable_but_noisy |

## Primary Workflow
1. Choose domain/project (Intake)
2. Submit task (Intake)
3. Board deliberates (Intake)
4. Approve if needed (Approvals/Intake)
5. Execution (Tasks/Intake)
6. See final result (Task detail/Home)
