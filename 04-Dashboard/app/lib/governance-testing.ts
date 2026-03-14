// GPO Governance Testing — Reusable what-if test cases for graphs and dossiers
// Persist test cases, run against simulation engine, track pass/fail.

import type {
  SimulationScope, SimulationOverrides, GovernanceTestCase,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const TESTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'governance-tests.json');

function uid(): string { return 'gt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ═══════════════════════════════════════════
// Built-in Test Templates
// ═══════════════════════════════════════════

function builtInTests(relatedType: SimulationScope, relatedId: string): GovernanceTestCase[] {
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

export function getTestsForEntity(relatedType: SimulationScope, relatedId: string): GovernanceTestCase[] {
  return readJson<GovernanceTestCase[]>(TESTS_FILE, []).filter(t => t.related_type === relatedType && t.related_id === relatedId);
}

export function getAllTests(): GovernanceTestCase[] {
  return readJson<GovernanceTestCase[]>(TESTS_FILE, []);
}

// ═══════════════════════════════════════════
// Test Suite Execution
// ═══════════════════════════════════════════

/** Run a full what-if test suite for an entity */
export function runTestSuite(relatedType: SimulationScope, relatedId: string): GovernanceTestCase[] {
  const sim = require('./policy-simulation') as {
    runSimulation(rt: string, rid: string, lane: string, overrides?: SimulationOverrides): import('./types').SimulationResult;
  };

  // Get existing or generate built-in tests
  let tests = getTestsForEntity(relatedType, relatedId);
  if (tests.length === 0) {
    tests = builtInTests(relatedType, relatedId);
  }

  // Run each test
  for (const test of tests) {
    const lane = test.scenario.lane || 'dev';
    const result = sim.runSimulation(relatedType, relatedId, lane as import('./types').Lane, test.scenario);
    test.actual_outcome = result.outcome;
    test.passed = test.actual_outcome === test.expected_outcome;
    test.last_run_at = new Date().toISOString();
  }

  // Persist
  const allTests = readJson<GovernanceTestCase[]>(TESTS_FILE, []);
  // Remove old tests for this entity
  const others = allTests.filter(t => !(t.related_type === relatedType && t.related_id === relatedId));
  others.unshift(...tests);
  if (others.length > 500) others.length = 500;
  writeJson(TESTS_FILE, others);

  return tests;
}

module.exports = {
  getTestsForEntity, getAllTests, runTestSuite,
};
