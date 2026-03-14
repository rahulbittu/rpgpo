// GPO Contract Enforcement — Plan-time and completion-time enforcement of output contracts

import type { BoardContractContext, StructuredDeliverable, ContractEnforcementResult, RemediationChecklist } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const DELIVERABLES_DIR = path.resolve(__dirname, '..', '..', 'state', 'deliverables');

function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Build board contract context for an engine */
export function buildBoardContractContext(engineId: string): BoardContractContext {
  let requiredFields: string[] = [];
  let outputType: BoardContractContext['outputType'] = 'document';
  let rubric = '';

  try {
    const oc = require('./output-contracts') as { getContract(id: string): { required_fields: string[]; example_deliverable: string } | null };
    const contract = oc.getContract(engineId);
    if (contract) { requiredFields = contract.required_fields; rubric = `Deliverable must include: ${requiredFields.join(', ')}. Example: ${contract.example_deliverable}`; }
  } catch { /* */ }

  try {
    const ec = require('./engine-catalog') as { getEngine(id: string): { default_output: string } | null };
    const engine = ec.getEngine(engineId);
    if (engine) outputType = engine.default_output as BoardContractContext['outputType'];
  } catch { /* */ }

  return { engineId, outputType, contractVersion: 'v1', requiredFields, rubric };
}

/** Apply contract to a subtask plan — adds Assemble + Validate terminal subtasks */
export function applyContractToPlan(ctx: BoardContractContext, plan: Array<{ title: string; stage: string; [k: string]: unknown }>): Array<{ title: string; stage: string; [k: string]: unknown }> {
  const augmented = [...plan];
  // Add assembly subtask
  augmented.push({ title: `Assemble ${ctx.outputType} deliverable`, stage: 'compile', assigned_role: 'assembler', contract_fields: ctx.requiredFields, contract_engine: ctx.engineId });
  // Add validation gate
  augmented.push({ title: 'Validate deliverable contract', stage: 'validate', assigned_role: 'validator', contract_engine: ctx.engineId });
  return augmented;
}

/** Initialize a deliverable scaffold for a task */
export function initDeliverableScaffold(taskId: string, ctx: BoardContractContext): StructuredDeliverable {
  try {
    const sd = require('./structured-deliverables') as { normalizeDeliverable(id: string, input: unknown): StructuredDeliverable };
    const scaffold = sd.normalizeDeliverable(ctx.engineId, {});
    scaffold.title = `${ctx.engineId} deliverable`;
    const filePath = path.join(DELIVERABLES_DIR, `${taskId}.json`);
    writeJson(filePath, scaffold);
    return scaffold;
  } catch {
    const scaffold: StructuredDeliverable = { kind: 'document', engineId: ctx.engineId, title: '', generatedAt: new Date().toISOString(), sections: [] };
    writeJson(path.join(DELIVERABLES_DIR, `${taskId}.json`), scaffold);
    return scaffold;
  }
}

/** Merge subtask output into existing deliverable scaffold */
export function mergeSubtaskOutput(taskId: string, subtaskId: string, output: unknown): { updated: StructuredDeliverable } {
  const filePath = path.join(DELIVERABLES_DIR, `${taskId}.json`);
  let deliverable = readJson<StructuredDeliverable>(filePath, null as unknown as StructuredDeliverable);

  if (!deliverable) {
    // Auto-init if missing
    const ctx = buildBoardContractContext('general');
    deliverable = initDeliverableScaffold(taskId, ctx);
  }

  // Merge based on kind — extract relevant data from output
  if (typeof output === 'string' && output.length > 0) {
    const d = deliverable as unknown as Record<string, unknown>;
    if (deliverable.kind === 'newsroom') {
      // Try to parse ranked items from text
      const items = (d.rankedItems as unknown[]) || [];
      if (items.length === 0) {
        (d as any).rankedItems = [{ rank: 1, headline: output.slice(0, 100), summary: output.slice(0, 300), source: { name: 'subtask', url: '' } }];
      }
    } else if (deliverable.kind === 'document') {
      const sections = (d.sections as unknown[]) || [];
      (sections as Array<{ heading: string; content: string }>).push({ heading: `From ${subtaskId}`, content: output });
      d.sections = sections;
    } else if (deliverable.kind === 'recommendation') {
      const recs = (d.recommendations as unknown[]) || [];
      (recs as Array<{ label: string; rationale: string }>).push({ label: subtaskId, rationale: output.slice(0, 500) });
      d.recommendations = recs;
    } else if (deliverable.kind === 'action_plan') {
      const steps = (d.steps as unknown[]) || [];
      (steps as Array<{ id: string; description: string }>).push({ id: subtaskId, description: output.slice(0, 300) });
      d.steps = steps;
    } else if (deliverable.kind === 'analysis') {
      const findings = (d.findings as unknown[]) || [];
      (findings as Array<{ label: string; detail: string }>).push({ label: subtaskId, detail: output.slice(0, 500) });
      d.findings = findings;
    } else if (deliverable.kind === 'creative_draft') {
      const artifacts = (d.artifacts as unknown[]) || [];
      (artifacts as Array<{ type: string; content: string }>).push({ type: 'story', content: output });
      d.artifacts = artifacts;
    }
    deliverable.generatedAt = new Date().toISOString();
  }

  writeJson(filePath, deliverable);
  return { updated: deliverable };
}

/** Enforce contract at task completion */
export function enforceAtCompletion(taskId: string, engineId: string): ContractEnforcementResult {
  const filePath = path.join(DELIVERABLES_DIR, `${taskId}.json`);
  const deliverable = readJson<StructuredDeliverable | null>(filePath, null);

  if (!deliverable) {
    return { status: 'hard_fail', missingFields: ['deliverable_not_found'], details: [{ field: 'deliverable', message: 'No deliverable file exists for this task' }] };
  }

  try {
    const sd = require('./structured-deliverables') as { validateDeliverable(id: string, d: StructuredDeliverable): ContractEnforcementResult };
    return sd.validateDeliverable(engineId, deliverable);
  } catch {
    return { status: 'soft_fail', missingFields: ['validation_unavailable'] };
  }
}

/** Generate remediation checklist from enforcement failures */
export function remediationFromFailures(res: ContractEnforcementResult): RemediationChecklist {
  return {
    items: res.missingFields.map((f, i) => ({
      id: `rem_${i}`, label: `Populate ${f}`, fixHint: `Re-run subtask targeting ${f} or manually provide data`, owner: 'agent' as const,
    })),
  };
}

/** Get deliverable for a task */
export function getDeliverable(taskId: string): StructuredDeliverable | null {
  const filePath = path.join(DELIVERABLES_DIR, `${taskId}.json`);
  return readJson<StructuredDeliverable | null>(filePath, null);
}

module.exports = { buildBoardContractContext, applyContractToPlan, initDeliverableScaffold, mergeSubtaskOutput, enforceAtCompletion, remediationFromFailures, getDeliverable };
