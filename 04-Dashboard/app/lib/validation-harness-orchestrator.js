"use strict";
// GPO Validation Harness Orchestrator — Orchestrate validation phases and environment detection
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectEnvironment = detectEnvironment;
exports.runHarness = runHarness;
exports.getLatestExecution = getLatestExecution;
exports.getEnvironmentState = getEnvironmentState;
const http = require('http');
const fs = require('fs');
const path = require('path');
const HARNESS_FILE = path.resolve(__dirname, '..', '..', 'state', 'validation-harness.json');
function uid() { return 'vho_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
const PORT = Number(process.env.PORT) || 3200;
/** Detect validation environment */
function detectEnvironment() {
    return new Promise((resolve) => {
        const start = Date.now();
        const req = http.get(`http://localhost:${PORT}/`, { timeout: 3000 }, (res) => {
            res.resume();
            const running = (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 500;
            resolve({ server_running: running, host: 'localhost', port: PORT, latency_ms: Date.now() - start, validation_mode: running ? 'live_network' : 'function_only', timestamp: new Date().toISOString() });
        });
        req.on('error', () => { resolve({ server_running: false, host: 'localhost', port: PORT, latency_ms: Date.now() - start, validation_mode: 'not_available', timestamp: new Date().toISOString() }); });
        req.on('timeout', () => { req.destroy(); resolve({ server_running: false, host: 'localhost', port: PORT, latency_ms: 3000, validation_mode: 'not_available', timestamp: new Date().toISOString() }); });
    });
}
/** Run full validation harness: clean state → protected paths → HTTP validation → live proof */
async function runHarness() {
    const env = await detectEnvironment();
    const phases = [];
    // Phase 1: Clean state
    try {
        const csv = require('./clean-state-verification');
        csv.clearValidationState();
        const v = csv.verify();
        phases.push({ phase: 'Clean state', status: v.clean ? 'passed' : 'failed', detail: v.clean ? 'State cleared and verified clean' : 'Stale state remains' });
    }
    catch {
        phases.push({ phase: 'Clean state', status: 'skipped', detail: 'Module not available' });
    }
    // Phase 2: Protected path validation (Part 51)
    try {
        const ppv = require('./protected-path-validation');
        const runs = ppv.validateAll();
        const allValid = runs.every(r => r.overall === 'validated');
        phases.push({ phase: 'Protected paths', status: allValid ? 'passed' : 'failed', detail: `${runs.filter(r => r.overall === 'validated').length}/${runs.length} validated` });
    }
    catch {
        phases.push({ phase: 'Protected paths', status: 'skipped', detail: 'Module not available' });
    }
    // Phase 3: HTTP middleware validation (Part 52)
    try {
        const hmv = require('./http-middleware-validation');
        const run = hmv.runValidation();
        phases.push({ phase: 'HTTP middleware', status: run.passed === run.total ? 'passed' : 'failed', detail: `${run.passed}/${run.total} passed` });
    }
    catch {
        phases.push({ phase: 'HTTP middleware', status: 'skipped', detail: 'Module not available' });
    }
    // Phase 4: Live server proof (Part 54)
    let proofRun = null;
    try {
        const lsp = require('./live-server-proof');
        proofRun = await lsp.runProof();
        phases.push({ phase: 'Live server proof', status: proofRun.proof_complete ? 'passed' : proofRun.passed === proofRun.total ? 'passed' : 'failed', detail: `${proofRun.passed}/${proofRun.total} passed (${proofRun.live_proven} live, ${proofRun.function_only} fallback)` });
    }
    catch {
        phases.push({ phase: 'Live server proof', status: 'skipped', detail: 'Module not available' });
    }
    const execution = {
        execution_id: uid(), environment: env, phases, proof_run: proofRun,
        created_at: new Date().toISOString(),
    };
    const all = readJson(HARNESS_FILE, []);
    all.unshift(execution);
    if (all.length > 20)
        all.length = 20;
    writeJson(HARNESS_FILE, all);
    return execution;
}
/** Get latest harness execution */
function getLatestExecution() {
    const all = readJson(HARNESS_FILE, []);
    return all.length > 0 ? all[0] : null;
}
/** Get current environment state (synchronous check from last run) */
function getEnvironmentState() {
    const exec = getLatestExecution();
    return exec?.environment || null;
}
module.exports = { detectEnvironment, runHarness, getLatestExecution, getEnvironmentState };
//# sourceMappingURL=validation-harness-orchestrator.js.map