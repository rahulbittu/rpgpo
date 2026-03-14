"use strict";
// GPO Traceability Ledger — Append-only audit trail of material system actions
Object.defineProperty(exports, "__esModule", { value: true });
exports.append = append;
exports.getAll = getAll;
exports.getByDomain = getByDomain;
exports.getByProject = getByProject;
exports.getById = getById;
exports.getByTarget = getByTarget;
const fs = require('fs');
const path = require('path');
const LEDGER_FILE = path.resolve(__dirname, '..', '..', 'state', 'traceability-ledger.json');
function uid() { return 'tl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Append an entry to the traceability ledger */
function append(opts) {
    const ledger = readJson(LEDGER_FILE, []);
    const entry = {
        entry_id: uid(),
        actor: opts.actor,
        action: opts.action,
        target_type: opts.target_type,
        target_id: opts.target_id,
        scope: { isolation_level: 'project', ...opts.scope },
        detail: opts.detail || '',
        linked_artifact_ids: opts.linked_artifact_ids || [],
        created_at: new Date().toISOString(),
    };
    ledger.unshift(entry);
    if (ledger.length > 2000)
        ledger.length = 2000;
    writeJson(LEDGER_FILE, ledger);
    return entry;
}
/** Get all ledger entries */
function getAll() {
    return readJson(LEDGER_FILE, []);
}
/** Get by domain */
function getByDomain(domain) {
    return getAll().filter(e => e.scope.domain === domain);
}
/** Get by project */
function getByProject(projectId) {
    return getAll().filter(e => e.scope.project_id === projectId);
}
/** Get by entry ID */
function getById(entryId) {
    return getAll().find(e => e.entry_id === entryId) || null;
}
/** Get by target */
function getByTarget(targetType, targetId) {
    return getAll().filter(e => e.target_type === targetType && e.target_id === targetId);
}
module.exports = { append, getAll, getByDomain, getByProject, getById, getByTarget };
//# sourceMappingURL=traceability-ledger.js.map