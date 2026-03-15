// GPO Scenario Runner — Execute acceptance scenarios against simulated providers

const { createProviderSim } = require('./provider-sim');

export interface ScenarioResult {
  id: string;
  title: string;
  passed: boolean;
  duration: number;
  stagesVisited: string[];
  assertions: Array<{ check: string; passed: boolean; detail?: string }>;
  errors: string[];
}

export interface SimpleScenario {
  id: string;
  title: string;
  seed?: number;
  engine: string;
  template: string;
  input: Record<string, any>;
  autopilot?: boolean;
  expectations: {
    hasDeliverable?: boolean;
    deliverableFields?: string[];
    workflowCompletes?: boolean;
  };
}

export async function runScenario(scenario: SimpleScenario): Promise<ScenarioResult> {
  const start = Date.now();
  const result: ScenarioResult = {
    id: scenario.id,
    title: scenario.title,
    passed: true,
    duration: 0,
    stagesVisited: [],
    assertions: [],
    errors: [],
  };

  try {
    const sim = createProviderSim({ seed: scenario.seed || 42 });

    // 1. Create workflow
    const orc = require('../workflow-orchestrator');
    orc.init();
    const wf = orc.createFromIntake(`test_${scenario.id}`, {
      tenantId: 'test', projectId: 'test',
      autopilot: { enabled: scenario.autopilot !== false },
    });
    result.stagesVisited.push('intake_received');

    // 2. Simulate deliberation
    const wf2 = orc.handleEvent({ type: 'deliberation_completed', workflowId: wf.id });
    if (wf2) result.stagesVisited.push(wf2.state);

    // 3. Plan
    const wf3 = orc.handleEvent({ type: 'plan_committed', workflowId: wf.id });
    if (wf3) result.stagesVisited.push(wf3.state);

    // 4. Schedule
    const wf4 = orc.handleEvent({ type: 'tasks_scheduled', workflowId: wf.id });
    if (wf4) result.stagesVisited.push(wf4.state);

    // 5. Execute (simulate with provider sim)
    const providerResult = await sim.callProvider('openai', getSchemaForEngine(scenario.engine), scenario.title);

    // 6. Complete execution
    const wf5 = orc.handleEvent({ type: 'task_batch_completed', workflowId: wf.id });
    if (wf5) result.stagesVisited.push(wf5.state);

    // 7. Merge
    const wf6 = orc.handleEvent({ type: 'merge_completed', workflowId: wf.id });
    if (wf6) result.stagesVisited.push(wf6.state);

    // 8. Validate
    const wf7 = orc.handleEvent({ type: 'validation_passed', workflowId: wf.id });
    if (wf7) result.stagesVisited.push(wf7.state);

    // Assertions
    if (scenario.expectations.workflowCompletes) {
      const finalWf = require('../workflow-store').get(wf.id);
      const completed = finalWf && ['approved', 'release_candidate_prepared', 'released'].includes(finalWf.state);
      result.assertions.push({ check: 'workflow_completes', passed: !!completed, detail: finalWf?.state });
      if (!completed) result.passed = false;
    }

    if (scenario.expectations.hasDeliverable) {
      const parsed = JSON.parse(providerResult.text);
      const hasFields = scenario.expectations.deliverableFields?.every(f => f in parsed) ?? true;
      result.assertions.push({ check: 'has_deliverable', passed: true });
      result.assertions.push({ check: 'deliverable_fields', passed: hasFields, detail: Object.keys(parsed).join(',') });
      if (!hasFields) result.passed = false;
    }

    // Evidence check
    const ev = require('../orchestrator-events');
    const evidence = ev.getWorkflowEvidence(wf.id);
    result.assertions.push({ check: 'has_evidence', passed: evidence.length > 0, detail: `${evidence.length} entries` });

    // Cleanup
    const fs = require('fs');
    const path = require('path');
    try { fs.unlinkSync(path.resolve(__dirname, '..', '..', '..', 'state', 'workflows.json')); } catch { /* */ }
    try { fs.rmSync(path.resolve(__dirname, '..', '..', '..', 'state', 'evidence', 'orchestrator'), { recursive: true }); } catch { /* */ }

  } catch (e) {
    result.passed = false;
    result.errors.push((e as Error).message?.slice(0, 200) || 'Unknown error');
  }

  result.duration = Date.now() - start;
  return result;
}

function getSchemaForEngine(engine: string): string {
  const schemas: Record<string, string> = {
    topranker: 'topranker.leaderboard.v1',
    newsroom: 'contract_newsroom',
    shopping: 'contract_shopping',
    general: 'contract_general',
  };
  return schemas[engine] || 'contract_general';
}

export async function runAllScenarios(scenarios: SimpleScenario[]): Promise<{ total: number; passed: number; failed: number; results: ScenarioResult[] }> {
  const results: ScenarioResult[] = [];
  for (const scenario of scenarios) {
    results.push(await runScenario(scenario));
  }
  return {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results,
  };
}

module.exports = { runScenario, runAllScenarios };
