"use strict";
// GPO Template Runtime Binding — Make instantiated templates configure live engine behavior
Object.defineProperty(exports, "__esModule", { value: true });
exports.bind = bind;
exports.getBindings = getBindings;
const fs = require('fs');
const path = require('path');
const BINDINGS_FILE = path.resolve(__dirname, '..', '..', 'state', 'template-runtime-bindings.json');
function uid() { return 'trb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Bind a template's defaults into a live engine/project */
function bind(templateId, engineId, projectId) {
    let template = null;
    try {
        const et = require('./engine-templates');
        template = et.getTemplate(templateId);
    }
    catch {
        return null;
    }
    if (!template)
        return null;
    const bindingsApplied = [];
    // Apply provider strategy defaults
    if (template.provider_strategy) {
        try {
            const pr = require('./provider-registry');
            for (const [role, provider] of Object.entries(template.provider_strategy)) {
                pr.upsertFit({ provider_id: provider, role, task_kind: 'general', scope_level: 'engine', scope_id: engineId, fit_score: 70, notes: `Template default: ${template.name}` });
                bindingsApplied.push(`provider:${role}=${provider}`);
            }
        }
        catch { /* */ }
    }
    // Apply governance defaults
    if (template.governance_defaults) {
        try {
            const op = require('./operator-policies');
            for (const [area, value] of Object.entries(template.governance_defaults)) {
                op.createPolicy({ area, value, scope_level: 'engine', scope_id: engineId, rationale: `Template: ${template.name}` });
                bindingsApplied.push(`policy:${area}=${value}`);
            }
        }
        catch { /* */ }
    }
    // Record binding
    const record = { binding_id: uid(), template_id: templateId, engine_id: engineId, project_id: projectId, bindings_applied: bindingsApplied, created_at: new Date().toISOString() };
    const bindings = readJson(BINDINGS_FILE, []);
    bindings.unshift(record);
    if (bindings.length > 100)
        bindings.length = 100;
    writeJson(BINDINGS_FILE, bindings);
    // Telemetry
    try {
        const tw = require('./telemetry-wiring');
        tw.emitTelemetry('runtime_activation', 'template_bound', 'success');
    }
    catch { /* */ }
    return record;
}
function getBindings(engineId) {
    const all = readJson(BINDINGS_FILE, []);
    return engineId ? all.filter(b => b.engine_id === engineId) : all;
}
module.exports = { bind, getBindings };
//# sourceMappingURL=template-runtime-binding.js.map