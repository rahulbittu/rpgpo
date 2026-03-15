# GPO Operator Guide

## Getting Started

1. Start the system: `cd 04-Dashboard/app && pm2 start ecosystem.config.js`
2. Open dashboard: http://localhost:3200
3. Submit your first task via the "New Task" button or Quick Start templates

## Dashboard Navigation

| Tab | Purpose |
|---|---|
| Dashboard | System overview, notifications, deliverables |
| Tasks | Submit and track task execution |
| Task Stream | Worker queue status |
| Approvals | Review items needing your decision |
| Ask AI | Direct conversation with AI models |
| Engines | 15 engine missions and status |
| Memory | Context and knowledge base |
| Providers | AI provider status |
| AI Spend | Cost tracking |
| Activity | Execution logs |
| Operations | System controls |
| Settings | Profile, budget, configuration |

## Submitting Tasks

### Quick Start
Click any template on the Tasks page to pre-fill a prompt.

### Custom Task
1. Type your request in the text area
2. Select an engine (or let auto-detect choose)
3. Set urgency (normal/high/critical)
4. Click Submit

### One-Click Run
Use the "Run" button on templates to submit and execute instantly.

## Reviewing Results

1. Go to Tasks tab
2. Click any completed task
3. View the full execution timeline
4. Click "Download MD" or "Download JSON" to export

## Keyboard Shortcuts

| Key | Action |
|---|---|
| / | Focus task input |
| Cmd+K | Search |
| 1-9 | Switch tabs |
| Escape | Close modal |
