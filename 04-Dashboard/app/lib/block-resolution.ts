// GPO Block Resolution — Explicit resolution records for runtime blocks
// Supports resolve, reopen, link override, create consumption record.

import type {
  BlockResolutionRecord, EscalationPauseRecord,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const RESOLUTIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'block-resolutions.json');
const PAUSES_FILE = path.resolve(__dirname, '..', '..', 'state', 'escalation-pauses.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ═══════════════════════════════════════════
// Block Resolution
// ═══════════════════════════════════════════

/** Resolve a runtime block */
export function resolveBlock(blockId: string, outcome: BlockResolutionRecord['outcome'], notes: string = '', overrideId?: string): BlockResolutionRecord | null {
  // Find the block
  let graphId = '';
  let nodeId: string | undefined;
  try {
    const re = require('./runtime-enforcement') as { getBlocks(): import('./types').ExecutionBlockRecord[] };
    const blocks = re.getBlocks();
    const block = blocks.find((b: any) => b.block_id === blockId);
    if (!block) return null;
    graphId = block.graph_id;
    nodeId = block.node_id;

    // Mark block as resolved in the blocks file
    const blocksFile = path.resolve(__dirname, '..', '..', 'state', 'runtime-blocks.json');
    const allBlocks = readJson<any[]>(blocksFile, []);
    const idx = allBlocks.findIndex((b: any) => b.block_id === blockId);
    if (idx >= 0) {
      allBlocks[idx].resolved = true;
      allBlocks[idx].resolved_at = new Date().toISOString();
      writeJson(blocksFile, allBlocks);
    }
  } catch { return null; }

  // If override cleared the block, consume it
  if (overrideId && outcome === 'override_cleared') {
    try {
      const oo = require('./override-operations') as { consumeOverride(oid: string, did: string, gid?: string): unknown };
      oo.consumeOverride(overrideId, blockId, graphId);
    } catch { /* */ }
  }

  // Create resolution record
  const record: BlockResolutionRecord = {
    resolution_id: uid('br'),
    block_id: blockId,
    graph_id: graphId,
    node_id: nodeId,
    outcome,
    override_id: overrideId,
    notes,
    created_at: new Date().toISOString(),
  };
  const records = readJson<BlockResolutionRecord[]>(RESOLUTIONS_FILE, []);
  records.unshift(record);
  if (records.length > 300) records.length = 300;
  writeJson(RESOLUTIONS_FILE, records);

  return record;
}

/** Reopen a block (mark as unresolved again) */
export function reopenBlock(blockId: string): boolean {
  try {
    const blocksFile = path.resolve(__dirname, '..', '..', 'state', 'runtime-blocks.json');
    const blocks = readJson<any[]>(blocksFile, []);
    const idx = blocks.findIndex((b: any) => b.block_id === blockId);
    if (idx >= 0) {
      blocks[idx].resolved = false;
      blocks[idx].resolved_at = undefined;
      writeJson(blocksFile, blocks);
      return true;
    }
  } catch { /* */ }
  return false;
}

export function getAllResolutions(): BlockResolutionRecord[] {
  return readJson<BlockResolutionRecord[]>(RESOLUTIONS_FILE, []);
}

// ═══════════════════════════════════════════
// Escalation Pause Records
// ═══════════════════════════════════════════

/** Create an escalation pause record */
export function createPause(graphId: string, nodeId: string | undefined, escalationEventId: string, reason: string): EscalationPauseRecord {
  const record: EscalationPauseRecord = {
    pause_id: uid('ep'),
    graph_id: graphId,
    node_id: nodeId,
    escalation_event_id: escalationEventId,
    reason,
    status: 'paused',
    created_at: new Date().toISOString(),
  };
  const records = readJson<EscalationPauseRecord[]>(PAUSES_FILE, []);
  records.unshift(record);
  if (records.length > 200) records.length = 200;
  writeJson(PAUSES_FILE, records);
  return record;
}

/** Resume a paused execution */
export function resumePause(pauseId: string): EscalationPauseRecord | null {
  const records = readJson<EscalationPauseRecord[]>(PAUSES_FILE, []);
  const idx = records.findIndex(r => r.pause_id === pauseId);
  if (idx === -1 || records[idx].status !== 'paused') return null;
  records[idx].status = 'resumed';
  records[idx].resumed_at = new Date().toISOString();
  writeJson(PAUSES_FILE, records);
  return records[idx];
}

export function getAllPauses(): EscalationPauseRecord[] {
  return readJson<EscalationPauseRecord[]>(PAUSES_FILE, []);
}

export function getActivePauses(): EscalationPauseRecord[] {
  return getAllPauses().filter(p => p.status === 'paused');
}

module.exports = {
  resolveBlock, reopenBlock, getAllResolutions,
  createPause, resumePause, getAllPauses, getActivePauses,
};
