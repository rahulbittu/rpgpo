"use strict";
// GPO Runtime Capability Activation — Activate composed capabilities into live behavior
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.getActivations = getActivations;
exports.getConflicts = getConflicts;
exports.getReport = getReport;
const fs = require('fs');
const path = require('path');
const ACTIVATIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'runtime-activations.json');
const CONFLICTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'capability-conflicts.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Activate composed capabilities for an engine/project */
function activate(engineId, projectId) {
    const activated = [];
    // Get composition plan
    try {
        const dc = require('./domain-capability-composer');
        const plan = dc.compose(engineId, projectId);
        for (const cap of plan.active_capabilities) {
            const source = cap.source.includes('skill_pack') ? 'skill_pack' : cap.source.includes('template') ? 'engine_template' : cap.source === 'platform' ? 'platform_default' : 'operator_override';
            // Check for conflicts
            const existingConflict = activated.find(a => a.type === cap.name.split(':')[0] && a.source !== source);
            if (existingConflict) {
                recordConflict(engineId, cap.name, existingConflict.source_id, cap.source, 'conflicting_defaults');
            }
            // Check entitlements
            let decision = 'allow';
            try {
                const aee = require('./api-entitlement-enforcement');
                const check = aee.evaluate('/api/skill-packs');
                if (check.outcome.startsWith('denied'))
                    decision = 'block';
            }
            catch { /* entitlements not loaded */ }
            const isActive = !decision.startsWith('block');
            const activation = {
                capability_id: uid('ca'), name: cap.name, type: cap.name.split(':')[0],
                source, source_id: cap.source, engine_id: engineId, project_id: projectId,
                active: isActive, decision, config: {}, created_at: new Date().toISOString(),
            };
            activated.push(activation);
        }
        // Handle blocked capabilities from composition
        for (const blocked of plan.blocked_capabilities) {
            activated.push({
                capability_id: uid('ca'), name: blocked.name, type: 'blocked',
                source: 'platform_default', source_id: 'entitlement', engine_id: engineId,
                project_id: projectId, active: false, decision: 'block',
                config: { reason: blocked.reason }, created_at: new Date().toISOString(),
            });
        }
    }
    catch { /* composition not available */ }
    // Persist
    const existing = readJson(ACTIVATIONS_FILE, []);
    // Replace activations for this engine
    const others = existing.filter(a => a.engine_id !== engineId);
    others.unshift(...activated);
    if (others.length > 500)
        others.length = 500;
    writeJson(ACTIVATIONS_FILE, others);
    // Emit telemetry
    try {
        const tw = require('./telemetry-wiring');
        tw.emitTelemetry('runtime_activation', 'capabilities_activated', 'success');
    }
    catch { /* */ }
    return activated;
}
function recordConflict(engineId, capName, sourceA, sourceB, conflictType) {
    const conflicts = readJson(CONFLICTS_FILE, []);
    conflicts.unshift({ conflict_id: uid('cc'), engine_id: engineId, capability_name: capName, source_a: sourceA, source_b: sourceB, conflict_type: conflictType, resolution: 'source_a_wins', created_at: new Date().toISOString() });
    if (conflicts.length > 100)
        conflicts.length = 100;
    writeJson(CONFLICTS_FILE, conflicts);
}
function getActivations(engineId) {
    const all = readJson(ACTIVATIONS_FILE, []);
    return engineId ? all.filter(a => a.engine_id === engineId) : all;
}
function getConflicts(engineId) {
    const all = readJson(CONFLICTS_FILE, []);
    return engineId ? all.filter(c => c.engine_id === engineId) : all;
}
function getReport() {
    const activations = getActivations();
    const conflicts = getConflicts();
    let extGrants = 0, extDenials = 0;
    try {
        const epe = require('./extension-permission-enforcement');
        const decisions = epe.getDecisions();
        extGrants = decisions.filter(d => d.outcome === 'granted').length;
        extDenials = decisions.filter(d => d.outcome.startsWith('denied')).length;
    }
    catch { /* */ }
    let templateBindings = 0;
    try {
        const trb = require('./template-runtime-binding');
        templateBindings = trb.getBindings().length;
    }
    catch { /* */ }
    return {
        report_id: uid('rar'), total_capabilities: activations.length,
        activated: activations.filter(a => a.active).length,
        blocked: activations.filter(a => !a.active).length,
        conflicts: conflicts.length, template_bindings: templateBindings,
        extension_grants: extGrants, extension_denials: extDenials,
        created_at: new Date().toISOString(),
    };
}
module.exports = { activate, getActivations, getConflicts, getReport };
//# sourceMappingURL=runtime-capability-activation.js.map