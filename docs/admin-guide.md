# GPO Admin Guide

## System Management

### Starting GPO
```bash
cd 04-Dashboard/app
pm2 start ecosystem.config.js
```

### Stopping GPO
```bash
pm2 stop rpgpo-server rpgpo-worker
```

### Checking Status
```bash
pm2 list                              # Process status
curl http://localhost:3200/api/health  # System health
pm2 logs rpgpo-worker --lines 20      # Worker logs
```

### Restarting After Code Changes
```bash
cd 04-Dashboard/app
npx tsc                               # Compile TypeScript
pm2 restart rpgpo-server rpgpo-worker  # Restart both
```

## API Keys

API keys are stored in `04-Dashboard/app/.env`:
```
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
GEMINI_API_KEY=AIza...
```

## State Management

All state is in `04-Dashboard/state/` as JSON files.

### Backup
```bash
curl -X POST http://localhost:3200/api/backup/snapshot
```

### State Files
| File | Purpose | Max Size |
|---|---|---|
| intake-tasks.json | All submitted tasks | 2000 entries |
| subtasks.json | Subtask execution data | 2000 entries |
| tasks.json | Worker queue | ~200 entries |
| costs.json | API cost ledger | Growing |
| deliverables/ | Output files | Growing |

### Clearing Old Data
Old completed tasks are auto-pruned at 2000 entries. Deliverable files persist indefinitely.

## Cost Management

### Budget Controls (Settings tab)
- Daily spend limit
- Warning threshold
- Auto-disable on limit
- Gemini model selection (flash-lite vs flash)

### Current Costs
```bash
curl http://localhost:3200/api/costs
```

## Monitoring

### Health Check
```bash
curl http://localhost:3200/api/health
```

Checks: state directory, file validity, stuck tasks, provider keys, operator profile, mission contexts, state size.

### Auto-Repair
```bash
curl -X POST http://localhost:3200/api/health/repair
```

Fixes: stuck tasks, missing files, stale state.

## Governance

### Approval Gates
- Non-code tasks: auto-execute (green risk, report stage)
- Code tasks: require approval (implement stage)
- Red risk: always require approval

### Provider Fallback
- Perplexity fails → OpenAI
- Gemini fails → OpenAI
- Claude fails → builder fallback prompt saved

## Troubleshooting

| Problem | Fix |
|---|---|
| Tasks stuck in "planned" | Check subtask store limit, run health repair |
| Worker not picking up tasks | `pm2 restart rpgpo-worker` |
| Perplexity returning weak data | Check API key, increase search recency |
| Dashboard not loading | Check server is running: `pm2 list` |
| SSE not connecting | Restart server: `pm2 restart rpgpo-server` |
