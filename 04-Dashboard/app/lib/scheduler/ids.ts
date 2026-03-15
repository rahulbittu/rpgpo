// GPO Scheduler IDs — Deterministic ID generation for queue items

const crypto = require('crypto') as typeof import('crypto');

export function queueItemId(runId: string, nodeId: string): string {
  return 'qi_' + crypto.createHash('sha1').update(`${runId}:${nodeId}`).digest('hex').slice(0, 12);
}

export function attemptId(): string {
  return 'att_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

module.exports = { queueItemId, attemptId };
