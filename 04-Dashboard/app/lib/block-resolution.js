"use strict";
// GPO Block Resolution — Explicit resolution records for runtime blocks
// Supports resolve, reopen, link override, create consumption record.
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBlock = resolveBlock;
exports.reopenBlock = reopenBlock;
exports.getAllResolutions = getAllResolutions;
exports.createPause = createPause;
exports.resumePause = resumePause;
exports.getAllPauses = getAllPauses;
exports.getActivePauses = getActivePauses;
const fs = require('fs');
const path = require('path');
const RESOLUTIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'block-resolutions.json');
const PAUSES_FILE = path.resolve(__dirname, '..', '..', 'state', 'escalation-pauses.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Block Resolution
// ═══════════════════════════════════════════
/** Resolve a runtime block */
function resolveBlock(blockId, outcome, notes = '', overrideId) {
    // Find the block
    let graphId = '';
    let nodeId;
    try {
        const re = require('./runtime-enforcement');
        const blocks = re.getBlocks();
        const block = blocks.find((b) => b.block_id === blockId);
        if (!block)
            return null;
        graphId = block.graph_id;
        nodeId = block.node_id;
        // Mark block as resolved in the blocks file
        const blocksFile = path.resolve(__dirname, '..', '..', 'state', 'runtime-blocks.json');
        const allBlocks = readJson(blocksFile, []);
        const idx = allBlocks.findIndex((b) => b.block_id === blockId);
        if (idx >= 0) {
            allBlocks[idx].resolved = true;
            allBlocks[idx].resolved_at = new Date().toISOString();
            writeJson(blocksFile, allBlocks);
        }
    }
    catch {
        return null;
    }
    // If override cleared the block, consume it
    if (overrideId && outcome === 'override_cleared') {
        try {
            const oo = require('./override-operations');
            oo.consumeOverride(overrideId, blockId, graphId);
        }
        catch { /* */ }
    }
    // Create resolution record
    const record = {
        resolution_id: uid('br'),
        block_id: blockId,
        graph_id: graphId,
        node_id: nodeId,
        outcome,
        override_id: overrideId,
        notes,
        created_at: new Date().toISOString(),
    };
    const records = readJson(RESOLUTIONS_FILE, []);
    records.unshift(record);
    if (records.length > 300)
        records.length = 300;
    writeJson(RESOLUTIONS_FILE, records);
    return record;
}
/** Reopen a block (mark as unresolved again) */
function reopenBlock(blockId) {
    try {
        const blocksFile = path.resolve(__dirname, '..', '..', 'state', 'runtime-blocks.json');
        const blocks = readJson(blocksFile, []);
        const idx = blocks.findIndex((b) => b.block_id === blockId);
        if (idx >= 0) {
            blocks[idx].resolved = false;
            blocks[idx].resolved_at = undefined;
            writeJson(blocksFile, blocks);
            return true;
        }
    }
    catch { /* */ }
    return false;
}
function getAllResolutions() {
    return readJson(RESOLUTIONS_FILE, []);
}
// ═══════════════════════════════════════════
// Escalation Pause Records
// ═══════════════════════════════════════════
/** Create an escalation pause record */
function createPause(graphId, nodeId, escalationEventId, reason) {
    const record = {
        pause_id: uid('ep'),
        graph_id: graphId,
        node_id: nodeId,
        escalation_event_id: escalationEventId,
        reason,
        status: 'paused',
        created_at: new Date().toISOString(),
    };
    const records = readJson(PAUSES_FILE, []);
    records.unshift(record);
    if (records.length > 200)
        records.length = 200;
    writeJson(PAUSES_FILE, records);
    return record;
}
/** Resume a paused execution */
function resumePause(pauseId) {
    const records = readJson(PAUSES_FILE, []);
    const idx = records.findIndex(r => r.pause_id === pauseId);
    if (idx === -1 || records[idx].status !== 'paused')
        return null;
    records[idx].status = 'resumed';
    records[idx].resumed_at = new Date().toISOString();
    writeJson(PAUSES_FILE, records);
    return records[idx];
}
function getAllPauses() {
    return readJson(PAUSES_FILE, []);
}
function getActivePauses() {
    return getAllPauses().filter(p => p.status === 'paused');
}
module.exports = {
    resolveBlock, reopenBlock, getAllResolutions,
    createPause, resumePause, getAllPauses, getActivePauses,
};
//# sourceMappingURL=block-resolution.js.map