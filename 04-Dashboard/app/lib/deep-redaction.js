"use strict";
// GPO Deep Redaction — Field-level stripping and masking beyond metadata-only redaction
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuleSets = getRuleSets;
exports.redactDeep = redactDeep;
exports.getReport = getReport;
exports.validateRedaction = validateRedaction;
const fs = require('fs');
const path = require('path');
const EXEC_FILE = path.resolve(__dirname, '..', '..', 'state', 'deep-redaction-executions.json');
function uid() { return 'dr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Default redaction rule sets */
function getRuleSets() {
    return [
        {
            category: 'audit_evidence',
            fields: [
                { field_pattern: 'source_scope', action: 'mask', reason: 'Cross-project scope identifier' },
                { field_pattern: 'target_scope', action: 'mask', reason: 'Cross-project scope identifier' },
                { field_pattern: 'linked_path_id', action: 'strip', reason: 'Internal validation reference' },
                { field_pattern: 'scope_id', action: 'mask', reason: 'Scope identifier' },
            ],
        },
        {
            category: 'memory_content',
            fields: [
                { field_pattern: 'content', action: 'strip', reason: 'Sensitive memory content' },
                { field_pattern: 'summary', action: 'mask', reason: 'Summary may contain sensitive data' },
            ],
        },
        {
            category: 'tenant_data',
            fields: [
                { field_pattern: 'api_key', action: 'strip', reason: 'Secret credential' },
                { field_pattern: 'secret', action: 'strip', reason: 'Secret credential' },
                { field_pattern: 'token', action: 'strip', reason: 'Authentication token' },
                { field_pattern: 'password', action: 'strip', reason: 'Password field' },
            ],
        },
        {
            category: 'compliance',
            fields: [
                { field_pattern: 'violation_id', action: 'mask', reason: 'Internal violation tracking' },
                { field_pattern: 'actor', action: 'mask', reason: 'Actor identity in cross-scope context' },
            ],
        },
    ];
}
/** Apply deep redaction to a payload based on applicable rule sets */
function redactDeep(data, route, reason, categories) {
    const ruleSets = getRuleSets();
    const applicableSets = categories ? ruleSets.filter(rs => categories.includes(rs.category)) : ruleSets;
    const fieldsStripped = [];
    const fieldsMasked = [];
    let result = data;
    if (typeof data === 'object' && data !== null) {
        result = redactObject(data, applicableSets, fieldsStripped, fieldsMasked);
    }
    // Add redaction markers
    if (typeof result === 'object' && result !== null) {
        result._redacted = true;
        result._redaction_reason = reason;
        result._redaction_depth = 'field_level';
        if (fieldsStripped.length)
            result._fields_stripped = fieldsStripped;
        if (fieldsMasked.length)
            result._fields_masked = fieldsMasked;
    }
    const exec = {
        record_id: uid(), route, fields_stripped: fieldsStripped, fields_masked: fieldsMasked,
        rule_applied: applicableSets.map(s => s.category).join(','),
        created_at: new Date().toISOString(),
    };
    // Persist execution
    const all = readJson(EXEC_FILE, []);
    all.unshift(exec);
    if (all.length > 300)
        all.length = 300;
    writeJson(EXEC_FILE, all);
    return { data: result, execution: exec };
}
function redactObject(obj, ruleSets, stripped, masked) {
    const result = { ...obj };
    for (const rs of ruleSets) {
        for (const rule of rs.fields) {
            for (const key of Object.keys(result)) {
                if (key.includes(rule.field_pattern) || key === rule.field_pattern) {
                    if (rule.action === 'strip') {
                        delete result[key];
                        stripped.push(key);
                    }
                    else if (rule.action === 'mask') {
                        const val = result[key];
                        if (typeof val === 'string') {
                            result[key] = val.length > 4 ? val.slice(0, 2) + '***' + val.slice(-2) : '***';
                        }
                        else {
                            result[key] = '***';
                        }
                        masked.push(key);
                    }
                    else if (rule.action === 'hash') {
                        result[key] = `[hash:${String(result[key]).length}]`;
                        masked.push(key);
                    }
                }
            }
        }
    }
    // Recurse into arrays
    for (const key of Object.keys(result)) {
        if (Array.isArray(result[key])) {
            result[key] = result[key].map(item => {
                if (typeof item === 'object' && item !== null) {
                    return redactObject(item, ruleSets, stripped, masked);
                }
                return item;
            });
        }
    }
    return result;
}
/** Get deep redaction report */
function getReport() {
    const executions = readJson(EXEC_FILE, []);
    const fieldsStrippedTotal = executions.reduce((s, e) => s + e.fields_stripped.length, 0);
    const fieldsMaskedTotal = executions.reduce((s, e) => s + e.fields_masked.length, 0);
    return { report_id: uid(), rule_sets: getRuleSets(), executions: executions.slice(0, 20), fields_stripped_total: fieldsStrippedTotal, fields_masked_total: fieldsMaskedTotal, created_at: new Date().toISOString() };
}
/** Validate redaction on sample data */
function validateRedaction() {
    const sample = { source_scope: 'project:alpha', target_scope: 'project:beta', content: 'Sensitive memory content here', api_key: 'sk-secret-key-12345', actor: 'operator@example.com', linked_path_id: 'pp_test', normal_field: 'this stays' };
    const { data, execution } = redactDeep(sample, '/api/test', 'Validation test', ['audit_evidence', 'memory_content', 'tenant_data', 'compliance']);
    return { passed: execution.fields_stripped.length > 0 || execution.fields_masked.length > 0, sample_before: sample, sample_after: data, stripped: execution.fields_stripped, masked: execution.fields_masked };
}
module.exports = { getRuleSets, redactDeep, getReport, validateRedaction };
//# sourceMappingURL=deep-redaction.js.map