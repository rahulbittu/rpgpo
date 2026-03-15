#!/usr/bin/env node
// RPGPO Evening Loop
// Safe: reads files, logs day summary, refreshes state
// Does NOT send emails, post, or make external calls

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RPGPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const today = new Date().toISOString().slice(0, 10);
const LOG_DIR = path.join(RPGPO_ROOT, '03-Operations/Logs/AgentRuns');

console.log('=== RPGPO Evening Loop ===');
console.log('Date:', today);
console.log('');

// Step 1: Refresh state
console.log('Step 1: Refreshing dashboard state...');
execSync(`node "${path.join(__dirname, 'refresh-state.js')}"`, { stdio: 'inherit' });
console.log('');

// Step 2: Log day summary
console.log('Step 2: Logging evening summary...');

function listDir(rel) {
  try { return fs.readdirSync(path.join(RPGPO_ROOT, rel)).filter(f => !f.startsWith('.')); } catch { return []; }
}

const approvalCount = listDir('03-Operations/Approvals/Pending').filter(f => f.endsWith('.md')).length;
const logCount = listDir('03-Operations/Logs/AgentRuns').filter(f => f.startsWith(today)).length;

const logFile = path.join(LOG_DIR, `${today}-EveningLoop.md`);
// Get today's completed tasks
let completedToday = [];
try {
  const intake = require(path.join(__dirname, '..', 'lib', 'intake'));
  completedToday = intake.getAllTasks()
    .filter(t => t.status === 'done' && (t.updated_at || '').startsWith(today))
    .map(t => `- **${t.title}** (${t.domain})`);
} catch {}

// Get today's costs
let costSummary = '';
try {
  const costs = require(path.join(__dirname, '..', 'lib', 'costs'));
  const cs = costs.getCostSummary();
  if (cs?.today) costSummary = `$${cs.today.cost.toFixed(4)} across ${cs.today.calls} API calls`;
} catch {}

const logContent = `# RPGPO Evening Loop Log

## Date
${today}

## Timestamp
${new Date().toISOString()}

## Summary
Evening loop completed. Dashboard state refreshed.

## Tasks Completed Today
${completedToday.length > 0 ? completedToday.join('\n') : 'No tasks completed today'}

## Stats
- Tasks completed today: ${completedToday.length}
- Pending approvals: ${approvalCount}
- Agent log entries today: ${logCount}
${costSummary ? `- AI spend today: ${costSummary}` : ''}

## Actions Taken
- Dashboard state refreshed
- Evening summary logged

## Risk Level
Green (read-only operations)
`;

fs.mkdirSync(path.dirname(logFile), { recursive: true });
fs.writeFileSync(logFile, logContent);
console.log('  Log created:', logFile);
console.log('');
console.log('=== Evening loop complete ===');
