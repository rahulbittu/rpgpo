"use strict";
// GPO Enterprise Audit Hub — Unified audit view across all governance systems
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.buildPackage = buildPackage;
exports.getPackage = getPackage;
const fs = require('fs');
const path = require('path');
const PACKAGES_FILE = path.resolve(__dirname, '..', '..', 'state', 'audit-packages.json');
function uid() { return 'ap_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Query the audit hub with filters */
function query(filters = {}) {
    let artifacts = [];
    let ledgerEntries = [];
    let evidenceCount = 0;
    try {
        const ar = require('./artifact-registry');
        artifacts = ar.getAll();
    }
    catch { /* */ }
    try {
        const tl = require('./traceability-ledger');
        ledgerEntries = tl.getAll();
    }
    catch { /* */ }
    try {
        const ec = require('./evidence-chain');
        // Count total edges as evidence proxy
        evidenceCount = artifacts.reduce((sum, a) => {
            const e = ec.getEdgesFor(a.artifact_id);
            return sum + e.upstream.length + e.downstream.length;
        }, 0);
    }
    catch { /* */ }
    // Apply filters
    if (filters.domain) {
        artifacts = artifacts.filter(a => a.scope.domain === filters.domain);
        ledgerEntries = ledgerEntries.filter(e => e.scope.domain === filters.domain);
    }
    if (filters.project_id) {
        artifacts = artifacts.filter(a => a.scope.project_id === filters.project_id);
        ledgerEntries = ledgerEntries.filter(e => e.scope.project_id === filters.project_id);
    }
    if (filters.artifact_type)
        artifacts = artifacts.filter(a => a.type === filters.artifact_type);
    if (filters.lane)
        artifacts = artifacts.filter(a => a.scope.lane === filters.lane);
    if (filters.time_from) {
        artifacts = artifacts.filter(a => a.created_at >= filters.time_from);
        ledgerEntries = ledgerEntries.filter(e => e.created_at >= filters.time_from);
    }
    if (filters.time_to) {
        artifacts = artifacts.filter(a => a.created_at <= filters.time_to);
        ledgerEntries = ledgerEntries.filter(e => e.created_at <= filters.time_to);
    }
    const limit = filters.limit || 50;
    return {
        artifacts: artifacts.slice(0, limit),
        ledger_entries: ledgerEntries.slice(0, limit),
        evidence_count: evidenceCount,
        total_results: artifacts.length + ledgerEntries.length,
        query: filters,
        created_at: new Date().toISOString(),
    };
}
/** Build an audit package for a scoped entity */
function buildPackage(scopeType, relatedId) {
    let artifacts = [];
    let ledgerEntries = [];
    let evidence = null;
    const findings = [];
    try {
        const ar = require('./artifact-registry');
        artifacts = ar.getAll().filter(a => a.related_graph_id === relatedId || a.related_dossier_id === relatedId ||
            a.related_task_id === relatedId || a.source_id === relatedId);
    }
    catch { /* */ }
    try {
        const tl = require('./traceability-ledger');
        ledgerEntries = tl.getByTarget(scopeType, relatedId);
    }
    catch { /* */ }
    try {
        const ec = require('./evidence-chain');
        evidence = ec.buildBundle(scopeType, relatedId);
    }
    catch { /* */ }
    // Generate findings
    if (artifacts.length === 0)
        findings.push({ finding_id: uid(), category: 'completeness', severity: 'warning', title: 'No registered artifacts', detail: `No artifacts found for ${scopeType}:${relatedId}`, related_artifact_ids: [], created_at: new Date().toISOString() });
    if (!evidence || evidence.edges.length === 0)
        findings.push({ finding_id: uid(), category: 'traceability', severity: 'info', title: 'No evidence links', detail: 'No evidence chain links found', related_artifact_ids: [], created_at: new Date().toISOString() });
    const summary = `Audit package for ${scopeType}:${relatedId} — ${artifacts.length} artifacts, ${ledgerEntries.length} ledger entries, ${findings.length} findings`;
    const pkg = {
        package_id: uid(), scope_type: scopeType, related_id: relatedId,
        artifacts, evidence, ledger_entries: ledgerEntries,
        findings, summary, created_at: new Date().toISOString(),
    };
    const packages = readJson(PACKAGES_FILE, []);
    packages.unshift(pkg);
    if (packages.length > 100)
        packages.length = 100;
    writeJson(PACKAGES_FILE, packages);
    return pkg;
}
function getPackage(scopeType, relatedId) {
    return readJson(PACKAGES_FILE, []).find(p => p.scope_type === scopeType && p.related_id === relatedId) || null;
}
module.exports = { query, buildPackage, getPackage };
//# sourceMappingURL=audit-hub.js.map