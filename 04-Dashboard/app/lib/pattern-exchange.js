"use strict";
// GPO Shared Pattern Exchange — Safe sharing of reusable patterns across projects
// Candidates are redacted, approved, promoted, tracked, and deprecatable.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCandidate = createCandidate;
exports.getCandidates = getCandidates;
exports.approveCandidate = approveCandidate;
exports.rejectCandidate = rejectCandidate;
exports.getPatterns = getPatterns;
exports.getPatternsForEngine = getPatternsForEngine;
exports.getPatternsForProject = getPatternsForProject;
exports.deprecatePattern = deprecatePattern;
exports.usePattern = usePattern;
exports.getUsageRecords = getUsageRecords;
const fs = require('fs');
const path = require('path');
const CANDIDATES_FILE = path.resolve(__dirname, '..', '..', 'state', 'pattern-candidates.json');
const PATTERNS_FILE = path.resolve(__dirname, '..', '..', 'state', 'shared-patterns.json');
const USAGE_FILE = path.resolve(__dirname, '..', '..', 'state', 'pattern-usage.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Simple redaction: remove project-specific identifiers */
function redact(content, sourceProject) {
    return content
        .replace(new RegExp(sourceProject, 'gi'), '[PROJECT]')
        .replace(/prj_\w+/g, '[PROJECT_ID]')
        .replace(/task_id[:\s]*["']?\w+["']?/gi, 'task_id: [REDACTED]');
}
// ═══════════════════════════════════════════
// Pattern Candidates
// ═══════════════════════════════════════════
function createCandidate(opts) {
    const candidates = readJson(CANDIDATES_FILE, []);
    const candidate = {
        candidate_id: uid('pc'),
        source_project: opts.source_project,
        source_domain: opts.source_domain,
        candidate_type: opts.candidate_type,
        title: opts.title,
        content: opts.content,
        redacted_content: redact(opts.content, opts.source_project),
        artifact_ref: opts.artifact_ref,
        status: 'pending',
        target_scope: opts.target_scope || 'engine_shared',
        created_at: new Date().toISOString(),
    };
    candidates.unshift(candidate);
    if (candidates.length > 200)
        candidates.length = 200;
    writeJson(CANDIDATES_FILE, candidates);
    return candidate;
}
function getCandidates() {
    return readJson(CANDIDATES_FILE, []);
}
function approveCandidate(candidateId, targetScope) {
    const candidates = readJson(CANDIDATES_FILE, []);
    const idx = candidates.findIndex(c => c.candidate_id === candidateId);
    if (idx === -1 || candidates[idx].status !== 'pending')
        return null;
    candidates[idx].status = 'approved';
    if (targetScope)
        candidates[idx].target_scope = targetScope;
    writeJson(CANDIDATES_FILE, candidates);
    // Promote to shared pattern
    const candidate = candidates[idx];
    const pattern = {
        pattern_id: uid('sp'),
        candidate_id: candidateId,
        pattern_type: candidate.candidate_type,
        title: candidate.title,
        content: candidate.redacted_content, // Use redacted version
        scope: candidate.target_scope,
        source_domain: candidate.source_domain,
        uses: 0,
        state: 'experimental',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    const patterns = readJson(PATTERNS_FILE, []);
    patterns.unshift(pattern);
    if (patterns.length > 200)
        patterns.length = 200;
    writeJson(PATTERNS_FILE, patterns);
    return pattern;
}
function rejectCandidate(candidateId) {
    const candidates = readJson(CANDIDATES_FILE, []);
    const idx = candidates.findIndex(c => c.candidate_id === candidateId);
    if (idx === -1)
        return null;
    candidates[idx].status = 'rejected';
    writeJson(CANDIDATES_FILE, candidates);
    return candidates[idx];
}
// ═══════════════════════════════════════════
// Shared Patterns
// ═══════════════════════════════════════════
function getPatterns() {
    return readJson(PATTERNS_FILE, []);
}
function getPatternsForEngine(domain) {
    return getPatterns().filter(p => p.scope === 'operator_global' || (p.scope === 'engine_shared' && p.source_domain === domain));
}
function getPatternsForProject(projectId) {
    // Projects see operator_global + engine_shared patterns (not project_private from other projects)
    return getPatterns().filter(p => p.scope === 'operator_global' || p.scope === 'engine_shared');
}
function deprecatePattern(patternId) {
    const patterns = getPatterns();
    const idx = patterns.findIndex(p => p.pattern_id === patternId);
    if (idx === -1)
        return null;
    patterns[idx].state = 'deprecated';
    patterns[idx].updated_at = new Date().toISOString();
    writeJson(PATTERNS_FILE, patterns);
    return patterns[idx];
}
function usePattern(patternId, projectId, context = '') {
    const patterns = getPatterns();
    const idx = patterns.findIndex(p => p.pattern_id === patternId);
    if (idx === -1 || patterns[idx].state === 'deprecated')
        return null;
    patterns[idx].uses++;
    patterns[idx].updated_at = new Date().toISOString();
    writeJson(PATTERNS_FILE, patterns);
    const record = {
        usage_id: uid('pu'), pattern_id: patternId, project_id: projectId,
        context, created_at: new Date().toISOString(),
    };
    const records = readJson(USAGE_FILE, []);
    records.unshift(record);
    if (records.length > 500)
        records.length = 500;
    writeJson(USAGE_FILE, records);
    return record;
}
function getUsageRecords() {
    return readJson(USAGE_FILE, []);
}
module.exports = {
    createCandidate, getCandidates, approveCandidate, rejectCandidate,
    getPatterns, getPatternsForEngine, getPatternsForProject,
    deprecatePattern, usePattern, getUsageRecords,
};
//# sourceMappingURL=pattern-exchange.js.map