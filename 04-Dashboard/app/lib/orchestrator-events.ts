// GPO Orchestrator Events — Evidence emission for workflow transitions

import type { TimelineEntry, WorkflowStage } from './workflow-types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const EVIDENCE_DIR = path.resolve(__dirname, '..', '..', 'state', 'evidence', 'orchestrator');

export function createEvidence(args: {
  kind: string;
  workflowId: string;
  from?: WorkflowStage;
  to: WorkflowStage;
  trigger: string;
  by: string;
  note?: string;
}): string {
  const evidenceId = `we_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  const record = {
    evidenceId,
    kind: args.kind,
    workflowId: args.workflowId,
    transition: { from: args.from, to: args.to },
    trigger: args.trigger,
    by: args.by,
    note: args.note,
    createdAt: new Date().toISOString(),
  };

  try {
    if (!fs.existsSync(EVIDENCE_DIR)) fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    const file = path.join(EVIDENCE_DIR, `${args.workflowId}-${evidenceId}.json`);
    fs.writeFileSync(file, JSON.stringify(record, null, 2));
  } catch { /* non-fatal */ }

  return evidenceId;
}

export function getWorkflowEvidence(workflowId: string): any[] {
  const results: any[] = [];
  try {
    if (!fs.existsSync(EVIDENCE_DIR)) return [];
    const files = fs.readdirSync(EVIDENCE_DIR).filter((f: string) => f.startsWith(workflowId) && f.endsWith('.json'));
    for (const file of files) {
      try { results.push(JSON.parse(fs.readFileSync(path.join(EVIDENCE_DIR, file), 'utf-8'))); } catch { /* skip */ }
    }
  } catch { /* */ }
  return results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

module.exports = { createEvidence, getWorkflowEvidence };
