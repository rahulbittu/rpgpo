"use strict";
// GPO Extension Permission Enforcement — Enforce extension permissions at runtime
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
exports.getDecisions = getDecisions;
const fs = require('fs');
const path = require('path');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'extension-permission-decisions.json');
function uid() { return 'ep_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Evaluate an extension's permission for a specific action */
function evaluate(extensionId, permission, action = 'use', tenantId = 'rpgpo') {
    let outcome = 'denied';
    let reason = 'Extension not found';
    try {
        const ef = require('./extension-framework');
        const pkg = ef.getPackage(extensionId);
        if (!pkg) {
            reason = 'Extension not found';
        }
        else if (pkg.state === 'deprecated') {
            outcome = 'denied';
            reason = 'Extension is deprecated';
        }
        else if (pkg.state !== 'installed') {
            outcome = 'denied';
            reason = 'Extension not installed';
        }
        else if (!pkg.permissions.includes(permission)) {
            outcome = 'denied';
            reason = `Permission "${permission}" not declared by extension`;
        }
        else {
            // Check trust level
            if (pkg.trust_level === 'untrusted') {
                outcome = 'denied_trust';
                reason = 'Untrusted extension cannot use this permission';
            }
            else if (permission === 'access_secrets' && pkg.trust_level !== 'official') {
                outcome = 'denied_trust';
                reason = 'Only official extensions can access secrets';
            }
            else if (permission === 'modify_governance' && pkg.trust_level === 'community') {
                outcome = 'denied_trust';
                reason = 'Community extensions cannot modify governance';
            }
            else if (permission === 'cross_project') {
                // Check isolation
                try {
                    const tir = require('./tenant-isolation-runtime');
                    const isoCheck = tir.evaluate(tenantId, tenantId, 'cross_project');
                    outcome = isoCheck.outcome === 'allow' ? 'granted' : 'denied_isolation';
                    reason = isoCheck.outcome === 'allow' ? 'Cross-project allowed for same tenant' : 'Isolation policy blocks cross-project';
                }
                catch {
                    outcome = 'denied_isolation';
                    reason = 'Isolation check unavailable';
                }
            }
            else {
                outcome = 'granted';
                reason = `Permission "${permission}" granted (trust: ${pkg.trust_level})`;
            }
        }
    }
    catch {
        reason = 'Extension framework not available';
    }
    const decision = { decision_id: uid(), extension_id: extensionId, permission, action, outcome, reason, created_at: new Date().toISOString() };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(decision);
    if (decisions.length > 300)
        decisions.length = 300;
    writeJson(DECISIONS_FILE, decisions);
    // Telemetry for denials
    if (outcome.startsWith('denied')) {
        try {
            const tw = require('./telemetry-wiring');
            tw.emitTelemetry('extension_runtime', 'permission_denied', 'blocked');
        }
        catch { /* */ }
    }
    return decision;
}
function getDecisions(extensionId) {
    const all = readJson(DECISIONS_FILE, []);
    return extensionId ? all.filter(d => d.extension_id === extensionId) : all;
}
module.exports = { evaluate, getDecisions };
//# sourceMappingURL=extension-permission-enforcement.js.map