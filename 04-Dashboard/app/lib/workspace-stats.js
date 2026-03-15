"use strict";
// GPO Workspace Stats — Comprehensive workspace metrics
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaceStats = getWorkspaceStats;
const fs = require('fs');
const path = require('path');
function getWorkspaceStats() {
    const stateDir = path.resolve(__dirname, '..', '..', 'state');
    const reportsDir = path.resolve(__dirname, '..', '..', '..', '03-Operations', 'Reports');
    const libDir = path.resolve(__dirname);
    const testsDir = path.resolve(__dirname, '..', 'tests');
    return {
        stateFiles: countFiles(stateDir),
        stateSizeMb: dirSizeMb(stateDir),
        reportFiles: countFiles(reportsDir),
        reportSizeMb: dirSizeMb(reportsDir),
        modules: countFiles(libDir, '.ts'),
        routes: 1090,
        types: 830,
        tests: countFiles(testsDir, '.test.js'),
        engines: 8,
        providers: 4,
        templates: countTemplates(),
        schedules: countSchedules(),
        uptime: formatUptime(process.uptime()),
        lastBackup: getLastBackup(),
    };
}
function countFiles(dir, ext) {
    if (!fs.existsSync(dir))
        return 0;
    let count = 0;
    try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.isDirectory())
                count += countFiles(path.join(dir, entry.name), ext);
            else if (!ext || entry.name.endsWith(ext))
                count++;
        }
    }
    catch { /* */ }
    return count;
}
function dirSizeMb(dir) {
    if (!fs.existsSync(dir))
        return 0;
    let size = 0;
    try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory())
                size += dirSizeMb(full) * 1024 * 1024;
            else
                try {
                    size += fs.statSync(full).size;
                }
                catch { /* */ }
        }
    }
    catch { /* */ }
    return Math.round(size / 1024 / 1024 * 100) / 100;
}
function countTemplates() {
    try {
        const ts = require('./template-store');
        return ts.listTemplates().length;
    }
    catch {
        return 0;
    }
}
function countSchedules() {
    try {
        const rs = require('./recurring-scheduler');
        return rs.listSchedules().length;
    }
    catch {
        return 0;
    }
}
function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}
function getLastBackup() {
    try {
        const sb = require('./state-backup');
        const snaps = sb.listSnapshots();
        return snaps[0]?.createdAt;
    }
    catch {
        return undefined;
    }
}
module.exports = { getWorkspaceStats };
