// GPO Activity Log — Structured operator action logging
const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const LOG_FILE = path.resolve(__dirname, '..', '..', 'state', 'activity-log.json');
export interface ActivityEntry { id: string; timestamp: number; action: string; category: string; detail?: string; }
let _log: ActivityEntry[] = [];
let _loaded = false;
function load() { if (_loaded) return; try { if (fs.existsSync(LOG_FILE)) _log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')); } catch { _log = []; } _loaded = true; }
function save() { if (_log.length > 2000) _log = _log.slice(-1000); const dir = path.dirname(LOG_FILE); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(LOG_FILE, JSON.stringify(_log)); }
export function logActivity(action: string, category: string, detail?: string): void {
  load(); _log.push({ id: 'act_' + Date.now().toString(36), timestamp: Date.now(), action, category, detail }); save();
}
export function getRecentActivity(limit?: number): ActivityEntry[] { load(); return _log.slice(-(limit || 50)).reverse(); }
module.exports = { logActivity, getRecentActivity };
