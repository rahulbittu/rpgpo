"use strict";
// GPO Governance Testing — Reusable what-if test cases for graphs and dossiers
// Persist test cases, run against simulation engine, track pass/fail.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestsForEntity = getTestsForEntity;
exports.getAllTests = getAllTests;
exports.runTestSuite = runTestSuite;
const fs = require('fs');
const path = require('path');
const TESTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'governance-tests.json');
function uid() { return 'gt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Built-in Test Templates
// ═══════════════════════════════════════════
function builtInTests(relatedType, relatedId) {
    return [
        { test_id: uid(), title: 'Beta lane readiness', description: 'Simulate promotion to beta', related_type: relatedType, related_id: relatedId, scenario: { lane: 'beta' }, expected_outcome: 'pass', created_at: new Date().toISOString() },
        { test_id: uid(), title: 'Prod lane readiness', description: 'Simulate promotion to prod', related_type: relatedType, related_id: relatedId, scenario: { lane: 'prod' }, expected_outcome: 'pass', created_at: new Date().toISOString() },
        { test_id: uid(), title: 'Missing docs in prod', description: 'Prod with missing documentation', related_type: relatedType, related_id: relatedId, scenario: { lane: 'prod', documentation_missing: ['architecture_doc', 'runbook'] }, expected_outcome: 'block', created_at: new Date().toISOString() },
        { test_id: uid(), title: 'Low provider confidence', description: 'Provider confidence below threshold', related_type: relatedType, related_id: relatedId, scenario: { provider_confidence: 30 }, expected_outcome: 'warn', created_at: new Date().toISOString() },
        { test_id: uid(), title: 'Strict review mode', description: 'With strict review policy', related_type: relatedType, related_id: relatedId, scenario: { policies: { review_strictness: 'strict' } }, expected_outcome: 'pass', created_at: new Date().toISOString() },
        { test_id: uid(), title: 'Failed review in beta', description: 'Review failure blocks beta', related_type: relatedType, related_id: relatedId, scenario: { lane: 'beta', review_verdicts: { quality: 'fail' } }, expected_outcome: 'block', created_at: new Date().toISOString() },
    ];
}
// ═══════════════════════════════════════════
// Test CRUD
// ═══════════════════════════════════════════
function getTestsForEntity(relatedType, relatedId) {
    return readJson(TESTS_FILE, []).filter(t => t.related_type === relatedType && t.related_id === relatedId);
}
function getAllTests() {
    return readJson(TESTS_FILE, []);
}
// ═══════════════════════════════════════════
// Test Suite Execution
// ═══════════════════════════════════════════
/** Run a full what-if test suite for an entity */
function runTestSuite(relatedType, relatedId) {
    const sim = require('./policy-simulation');
    // Get existing or generate built-in tests
    let tests = getTestsForEntity(relatedType, relatedId);
    if (tests.length === 0) {
        tests = builtInTests(relatedType, relatedId);
    }
    // Run each test
    for (const test of tests) {
        const lane = test.scenario.lane || 'dev';
        const result = sim.runSimulation(relatedType, relatedId, lane, test.scenario);
        test.actual_outcome = result.outcome;
        test.passed = test.actual_outcome === test.expected_outcome;
        test.last_run_at = new Date().toISOString();
    }
    // Persist
    const allTests = readJson(TESTS_FILE, []);
    // Remove old tests for this entity
    const others = allTests.filter(t => !(t.related_type === relatedType && t.related_id === relatedId));
    others.unshift(...tests);
    if (others.length > 500)
        others.length = 500;
    writeJson(TESTS_FILE, others);
    return tests;
}
module.exports = {
    getTestsForEntity, getAllTests, runTestSuite,
};
//# sourceMappingURL=governance-testing.js.map