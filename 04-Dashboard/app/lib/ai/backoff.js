"use strict";
// GPO Backoff — Exponential backoff with jitter for parse retry
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBackoffMs = computeBackoffMs;
exports.computeBackoffMsDeterministic = computeBackoffMsDeterministic;
exports.sleepMs = sleepMs;
/**
 * Compute backoff delay in milliseconds.
 * Formula: baseMs * multiplier^(attempt-1) * (1 +/- jitter)
 */
function computeBackoffMs(args) {
    const { baseMs, multiplier, jitter, attempt } = args;
    const base = baseMs * Math.pow(multiplier, Math.max(0, attempt - 1));
    const jitterFactor = 1 + (Math.random() * 2 - 1) * jitter;
    return Math.max(0, Math.round(base * jitterFactor));
}
/**
 * Deterministic version for testing (no randomness).
 */
function computeBackoffMsDeterministic(args) {
    const { baseMs, multiplier, attempt } = args;
    return Math.round(baseMs * Math.pow(multiplier, Math.max(0, attempt - 1)));
}
/**
 * Non-blocking sleep using setTimeout.
 */
function sleepMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = { computeBackoffMs, computeBackoffMsDeterministic, sleepMs };
//# sourceMappingURL=backoff.js.map