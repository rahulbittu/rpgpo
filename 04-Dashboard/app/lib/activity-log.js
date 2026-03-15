"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
exports.getRecentActivity = getRecentActivity;
// GPO Activity Log — Structured operator action logging
const fs = require('fs');
const path = require('path');
const LOG_FILE = path.resolve(__dirname, '..', '..', 'state', 'activity-log.json');
let _log = [];
let _loaded = false;
function load() { if (_loaded)
    return; try {
    if (fs.existsSync(LOG_FILE))
        _log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
}
catch {
    _log = [];
} _loaded = true; }
function save() { if (_log.length > 2000)
    _log = _log.slice(-1000); const dir = path.dirname(LOG_FILE); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(LOG_FILE, JSON.stringify(_log)); }
function logActivity(action, category, detail) {
    load();
    _log.push({ id: 'act_' + Date.now().toString(36), timestamp: Date.now(), action, category, detail });
    save();
}
function getRecentActivity(limit) { load(); return _log.slice(-(limit || 50)).reverse(); }
module.exports = { logActivity, getRecentActivity };
