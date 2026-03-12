#!/usr/bin/env node
// RPGPO Dashboard — Refresh State
// Scans real RPGPO files and rebuilds dashboard-state.json
// Safe: read-only scan, writes only to dashboard state file

const fs = require('fs');
const path = require('path');

const RPGPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const STATE_FILE = path.join(RPGPO_ROOT, '04-Dashboard/state/dashboard-state.json');

console.log('Refreshing RPGPO dashboard state...');
console.log('Root:', RPGPO_ROOT);

function readFile(relPath) {
  try { return fs.readFileSync(path.join(RPGPO_ROOT, relPath), 'utf-8'); } catch { return null; }
}

function listDir(relPath) {
  try { return fs.readdirSync(path.join(RPGPO_ROOT, relPath)).filter(f => !f.startsWith('.')); } catch { return []; }
}

function extractField(md, field) {
  const re = new RegExp('^## ' + field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n([\\s\\S]*?)(?=\\n## |$)', 'm');
  const m = md.match(re);
  return m ? m[1].trim() : '';
}

// --- Collect missions ---
const missionFiles = listDir('03-Operations/MissionStatus').filter(f => f.endsWith('.md'));
const missions = missionFiles.map(f => {
  const md = readFile('03-Operations/MissionStatus/' + f);
  if (!md) return null;
  return {
    name: extractField(md, 'Mission'),
    status: extractField(md, 'Current Status'),
    focus: extractField(md, 'Current Objective').slice(0, 100),
    next: extractField(md, 'Next Recommended Actions').split('\n')[0].replace(/^\d+\.\s*/, '').slice(0, 100),
  };
}).filter(Boolean);

// --- Collect pending approvals ---
const approvals = listDir('03-Operations/Approvals/Pending').filter(f => f.endsWith('.md'));

// --- Top priorities from latest daily brief ---
const briefs = listDir('03-Operations/DailyBriefs').filter(f => f.endsWith('.md')).sort().reverse();
let priorities = [];
if (briefs.length > 0) {
  const briefMd = readFile('03-Operations/DailyBriefs/' + briefs[0]);
  if (briefMd) {
    const section = extractField(briefMd, 'Top Priorities');
    priorities = section.split('\n').filter(l => /^\d+\./.test(l)).map(l => l.replace(/^\d+\.\s*/, '').trim());
  }
}

// --- Preserve research queue and recent wins from existing state ---
let existingState = {};
try { existingState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')); } catch {}

const state = {
  system_name: 'RPGPO',
  primary_inbox: 'toprankerapp@gmail.com',
  workspace_root: RPGPO_ROOT,
  last_refreshed: new Date().toISOString(),
  top_priorities: priorities.length > 0 ? priorities : (existingState.top_priorities || []),
  missions,
  pending_approvals: approvals,
  recent_wins: existingState.recent_wins || [],
  research_queue: existingState.research_queue || [],
};

fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

console.log('State refreshed at', new Date().toLocaleString());
console.log('Missions found:', missions.length);
console.log('Pending approvals:', approvals.length);
console.log('Done.');
