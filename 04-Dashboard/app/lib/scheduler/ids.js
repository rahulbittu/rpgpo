"use strict";
// GPO Scheduler IDs — Deterministic ID generation for queue items
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueItemId = queueItemId;
exports.attemptId = attemptId;
const crypto = require('crypto');
function queueItemId(runId, nodeId) {
    return 'qi_' + crypto.createHash('sha1').update(`${runId}:${nodeId}`).digest('hex').slice(0, 12);
}
function attemptId() {
    return 'att_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
module.exports = { queueItemId, attemptId };
//# sourceMappingURL=ids.js.map