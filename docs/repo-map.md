# GPO Repository Map

## Top-Level Structure

```
/
├── 00-Governance/        Governance policies and constitution
├── 01-Inbox/             Incoming work items
├── 02-Projects/          Project-specific contexts (CareerEngine, etc.)
├── 03-Operations/        Reports, logs, briefs, mission status
│   ├── DailyBriefs/      Daily operational briefs
│   ├── Logs/             Agent runs and decision logs
│   ├── MissionStatus/    Per-engine mission status files
│   ├── Reports/          AI-generated subtask reports
│   └── Templates/        Reusable task templates
├── 04-Dashboard/         GPO Command Center (main application)
│   ├── app/              Application source code
│   │   ├── server.js     HTTP server (port 3200)
│   │   ├── worker.js     Background task worker
│   │   ├── index.html    Dashboard UI
│   │   ├── app.js        Frontend logic
│   │   ├── operator.js   Admin product layer
│   │   ├── style.css     Base styles
│   │   ├── operator.css  Admin styles
│   │   ├── lib/          275 TypeScript modules
│   │   ├── scripts/      Operational scripts
│   │   └── tests/        Test files
│   └── state/            JSON state files
│       ├── intake-tasks.json    Task store
│       ├── subtasks.json        Subtask store
│       ├── costs.json           API cost tracking
│       ├── deliverables/        Completed task outputs
│       └── context/             Operator profile + mission context
├── artifacts/            Testing artifacts
│   └── testing/          Execution results, verdicts, classification
├── docs/                 Documentation
│   ├── testing/          Test harness, case reports, scoreboard
│   │   └── case-reports/ Individual case report files
│   ├── product/          Canonical naming, admin model
│   ├── handoff/          Claude↔ChatGPT handoff contract
│   └── architecture/     Component and module maps
└── .gpo-handoff/         Agent relay system
```

## Key Files for Review

| File | What It Is |
|---|---|
| `README.md` | Product overview |
| `docs/system-overview.md` | Architecture and how it works |
| `docs/testing/engine-maturity-scoreboard.md` | Official test results |
| `artifacts/testing/strict-case-verdicts.json` | Machine-readable verdicts |
| `04-Dashboard/app/server.js` | Main server (~4000 lines) |
| `04-Dashboard/app/worker.js` | Task execution worker |
| `04-Dashboard/app/lib/deliberation.ts` | Board of AI logic |
| `04-Dashboard/state/context/operator-profile.json` | Operator context |
