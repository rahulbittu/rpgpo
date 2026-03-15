# GPO Task Lifecycle

## Flow

1. **Submit** — User submits a request via dashboard or API
2. **Route** — Domain router detects the best engine (keyword scoring)
3. **Deliberate** — Board of AI analyzes the request with 3 perspectives:
   - Chief of Staff: interprets objective, assesses feasibility
   - Critic: challenges assumptions, identifies risks
   - Domain Specialist: proposes technical/strategic approach
4. **Plan** — Board produces subtask breakdown with assigned providers
5. **Execute** — Worker processes each subtask:
   - Perplexity: web search for current data
   - OpenAI: synthesis, analysis, report generation
   - Gemini: strategic comparison
   - Claude: code implementation (local CLI)
6. **Deliver** — Output saved as deliverable, notification sent
7. **Export** — Operator can download MD or JSON

## Provider Roles

| Provider | When Used | Strength |
|---|---|---|
| Perplexity Sonar | Research subtasks | Live web search |
| OpenAI GPT-4o | Synthesis/report subtasks | Structured writing |
| Gemini Flash | Strategy subtasks | Comparative analysis |
| Claude | Code implementation | File editing, testing |

## Governance

- Green risk tasks auto-execute
- Yellow/red risk tasks require operator approval
- Non-code tasks use report stage (no approval gate)
- Code tasks use implement stage (approval required)
