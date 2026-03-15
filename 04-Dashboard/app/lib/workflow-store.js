"use strict";
// GPO Workflow Store — File-backed persistence with idempotency
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.create = create;
exports.get = get;
exports.list = list;
exports.update = update;
exports.appendTimeline = appendTimeline;
exports.recoverDangling = recoverDangling;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const STATE_FILE = path.resolve(__dirname, '..', '..', 'state', 'workflows.json');
function readStore() {
    try {
        if (fs.existsSync(STATE_FILE))
            return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
    catch { /* */ }
    return [];
}
function writeStore(instances) {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(instances, null, 2));
}
function generateId() {
    const ts = Date.now().toString(36);
    const rand = crypto.randomBytes(4).toString('hex');
    return `wf_${ts}_${rand}`;
}
function create(instance) {
    const all = readStore();
    if (all.find(w => w.id === instance.id))
        return instance; // idempotent
    all.push(instance);
    writeStore(all);
    return instance;
}
function get(id) {
    return readStore().find(w => w.id === id) || null;
}
function list(filter) {
    let results = readStore();
    if (filter?.tenantId)
        results = results.filter(w => w.tenantId === filter.tenantId);
    if (filter?.projectId)
        results = results.filter(w => w.projectId === filter.projectId);
    if (filter?.state?.length)
        results = results.filter(w => filter.state.includes(w.state));
    return results;
}
function update(instance, options) {
    if (options?.idempotencyKey && instance.idempotencyKeys.includes(options.idempotencyKey)) {
        return instance; // already applied
    }
    if (options?.idempotencyKey) {
        instance.idempotencyKeys.push(options.idempotencyKey);
        if (instance.idempotencyKeys.length > 100)
            instance.idempotencyKeys = instance.idempotencyKeys.slice(-50);
    }
    instance.updatedAt = new Date().toISOString();
    const all = readStore();
    const idx = all.findIndex(w => w.id === instance.id);
    if (idx >= 0)
        all[idx] = instance;
    else
        all.push(instance);
    writeStore(all);
    return instance;
}
function appendTimeline(id, entry) {
    const instance = get(id);
    if (!instance)
        return null;
    instance.timeline.push(entry);
    return update(instance);
}
function recoverDangling() {
    const all = readStore();
    const recovered = [];
    const stale = [];
    const now = Date.now();
    const staleThreshold = 30 * 60000; // 30 min
    for (const w of all) {
        if (['executing', 'scheduled', 'merging', 'validating'].includes(w.state)) {
            const lastUpdate = new Date(w.updatedAt).getTime();
            if (now - lastUpdate > staleThreshold) {
                stale.push(w.id);
            }
        }
    }
    return { recovered, stale };
}
module.exports = { generateId, create, get, list, update, appendTimeline, recoverDangling };
//# sourceMappingURL=workflow-store.js.map