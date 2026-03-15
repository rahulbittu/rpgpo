#!/usr/bin/env node
// RPGPO Morning Loop
// Safe: reads files, refreshes state, generates brief skeleton
// Does NOT send emails, post, or make external calls

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RPGPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const today = new Date().toISOString().slice(0, 10);
const BRIEF_DIR = path.join(RPGPO_ROOT, '03-Operations/DailyBriefs');
const BRIEF_FILE = path.join(BRIEF_DIR, `${today}-DailyBrief.md`);

console.log('=== RPGPO Morning Loop ===');
console.log('Date:', today);
console.log('');

// Step 1: Refresh state
console.log('Step 1: Refreshing dashboard state...');
execSync(`node "${path.join(__dirname, 'refresh-state.js')}"`, { stdio: 'inherit' });
console.log('');

// Step 2: Generate brief
if (fs.existsSync(BRIEF_FILE)) {
  console.log('Step 2: Daily brief already exists for today.');
} else {
  console.log('Step 2: Generating daily brief...');

  function readFile(rel) {
    try { return fs.readFileSync(path.join(RPGPO_ROOT, rel), 'utf-8'); } catch { return null; }
  }
  function listDir(rel) {
    try { return fs.readdirSync(path.join(RPGPO_ROOT, rel)).filter(f => !f.startsWith('.')); } catch { return []; }
  }
  function extractField(md, field) {
    const re = new RegExp('^## ' + field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n([\\s\\S]*?)(?=\\n## |$)', 'm');
    const m = md.match(re);
    return m ? m[1].trim() : '';
  }

  const missionFiles = listDir('03-Operations/MissionStatus').filter(f => f.endsWith('.md'));
  let missionSection = '';
  for (const f of missionFiles) {
    const md = readFile('03-Operations/MissionStatus/' + f);
    if (!md) continue;
    const name = extractField(md, 'Mission');
    const status = extractField(md, 'Current Status');
    const blockers = extractField(md, 'Blockers').split('\n')[0].replace(/^- /, '');
    const next = extractField(md, 'Next Recommended Actions').split('\n')[0].replace(/^\d+\.\s*/, '');
    missionSection += `### ${name}\n- current status: ${status}\n- key blocker: ${blockers}\n- recommended next move: ${next}\n\n`;
  }

  const approvalCount = listDir('03-Operations/Approvals/Pending').filter(f => f.endsWith('.md')).length;

  const brief = `# RPGPO Daily Brief

## Date
${today}

## Executive Summary
Morning loop ran. Dashboard state refreshed. Review missions and pending approvals.

## Top Priorities
1. Review pending approvals (${approvalCount} pending)
2. Check TopRanker mission status
3. Advance highest-leverage next action

## Mission Status

${missionSection}
## Pending Approvals
${approvalCount} item(s) pending review.

## Recommended Next Actions
- Review and act on pending approvals
- Advance the TopRanker weekly execution target
- Check for new blockers across missions
`;

  fs.mkdirSync(path.dirname(BRIEF_FILE), { recursive: true });
  fs.writeFileSync(BRIEF_FILE, brief);
  console.log('  Brief created:', BRIEF_FILE);
}

// Step 3: Auto-submit morning tasks via intake API
console.log('Step 3: Submitting morning tasks...');
const http = require('http');

function submitTask(raw_request, domain, urgency) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ raw_request, domain, urgency });
    const req = http.request({
      hostname: 'localhost', port: 3200, path: '/api/intake/run',
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    });
    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const newsResult = await submitTask(
      "Search the web for today's most important AI and technology news. Include specific headlines, sources, and relevance to a data engineer / startup founder.",
      'newsroom', 'high'
    );
    if (newsResult?.ok) console.log('  Morning news task submitted: ' + newsResult.task.title);
    else console.log('  News task failed or already running');
  } catch (e) { console.log('  News task error:', e.message); }

  console.log('');
  console.log('=== Morning loop complete ===');
})();
