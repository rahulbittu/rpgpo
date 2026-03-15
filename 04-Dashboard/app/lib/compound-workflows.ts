// GPO Compound Workflows — Multi-engine orchestration with DAG execution

import type { CompoundWorkflowTemplate, CompoundWorkflowRun } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');

const TEMPLATES_FILE = path.resolve(__dirname, '..', '..', 'state', 'compound-workflow-templates.json');
const RUNS_FILE = path.resolve(__dirname, '..', '..', 'state', 'compound-workflow-runs.json');

function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ── Template CRUD ──

export function createWorkflowTemplate(data: Partial<CompoundWorkflowTemplate>): CompoundWorkflowTemplate {
  const templates = readJson<CompoundWorkflowTemplate[]>(TEMPLATES_FILE, []);
  const template: CompoundWorkflowTemplate = {
    id: 'cwt_' + crypto.randomBytes(4).toString('hex'),
    name: data.name || 'Untitled Workflow',
    description: data.description || '',
    nodes: data.nodes || [],
    edges: data.edges || [],
    parameters: data.parameters || [],
    tags: data.tags || [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  templates.push(template);
  writeJson(TEMPLATES_FILE, templates);
  return template;
}

export function getWorkflowTemplate(id: string): CompoundWorkflowTemplate | null {
  return readJson<CompoundWorkflowTemplate[]>(TEMPLATES_FILE, []).find(t => t.id === id) || null;
}

export function listWorkflowTemplates(): CompoundWorkflowTemplate[] {
  return readJson<CompoundWorkflowTemplate[]>(TEMPLATES_FILE, []);
}

export function deleteWorkflowTemplate(id: string): boolean {
  const templates = readJson<CompoundWorkflowTemplate[]>(TEMPLATES_FILE, []);
  const idx = templates.findIndex(t => t.id === id);
  if (idx < 0) return false;
  templates.splice(idx, 1);
  writeJson(TEMPLATES_FILE, templates);
  return true;
}

// ── Run Management ──

export function startWorkflowRun(templateId: string, params: Record<string, unknown>): CompoundWorkflowRun {
  const template = getWorkflowTemplate(templateId);
  if (!template) throw new Error('Template not found: ' + templateId);

  const runs = readJson<CompoundWorkflowRun[]>(RUNS_FILE, []);
  const run: CompoundWorkflowRun = {
    id: 'cwr_' + crypto.randomBytes(4).toString('hex'),
    templateId,
    params,
    status: 'running',
    nodeRuns: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Initialize node runs
  for (const node of template.nodes) {
    run.nodeRuns[node.id] = { status: 'pending' };
  }

  // Find ready nodes (no incoming edges)
  const targets = new Set(template.edges.map(e => e.to));
  const readyNodes = template.nodes.filter(n => !targets.has(n.id));

  // Execute ready nodes
  for (const node of readyNodes) {
    executeNode(run, node, template, params);
  }

  runs.push(run);
  if (runs.length > 100) runs.splice(0, runs.length - 100);
  writeJson(RUNS_FILE, runs);
  return run;
}

export function getWorkflowRun(id: string): CompoundWorkflowRun | null {
  return readJson<CompoundWorkflowRun[]>(RUNS_FILE, []).find(r => r.id === id) || null;
}

export function listWorkflowRuns(): CompoundWorkflowRun[] {
  return readJson<CompoundWorkflowRun[]>(RUNS_FILE, []).sort((a, b) => b.createdAt - a.createdAt);
}

export function onNodeComplete(runId: string, nodeId: string, output: string): void {
  const runs = readJson<CompoundWorkflowRun[]>(RUNS_FILE, []);
  const run = runs.find(r => r.id === runId);
  if (!run) return;

  run.nodeRuns[nodeId] = { ...run.nodeRuns[nodeId], status: 'completed', output, completedAt: Date.now() };
  run.updatedAt = Date.now();

  // Check if all nodes complete
  const allComplete = Object.values(run.nodeRuns).every(nr => nr.status === 'completed' || nr.status === 'failed');
  if (allComplete) {
    run.status = Object.values(run.nodeRuns).some(nr => nr.status === 'failed') ? 'failed' : 'completed';
  }

  writeJson(RUNS_FILE, runs);
}

// ── Built-in Workflow Templates ──

export function seedBuiltinTemplates(): number {
  const existing = listWorkflowTemplates();
  if (existing.length > 0) return 0;

  const builtins: Partial<CompoundWorkflowTemplate>[] = [
    {
      name: 'Research → Analyze → Plan',
      description: 'Research a topic, analyze findings, then create an action plan',
      tags: ['research', 'analysis', 'planning'],
      nodes: [
        { id: 'research', name: 'Research', engineId: 'research', type: 'engine', promptTemplate: 'Research {{topic}} thoroughly. Include real data, sources, and citations.' },
        { id: 'analyze', name: 'Analyze', engineId: 'finance', type: 'engine', promptTemplate: 'Analyze the research findings and identify key opportunities, risks, and recommendations.', inputBindings: { priorResearch: { source: 'nodeOutput', nodeId: 'research' } } },
        { id: 'plan', name: 'Action Plan', engineId: 'chief_of_staff', type: 'engine', promptTemplate: 'Create a detailed action plan based on the analysis. Include specific steps, timelines, and priorities.', inputBindings: { analysis: { source: 'nodeOutput', nodeId: 'analyze' } } },
      ],
      edges: [{ from: 'research', to: 'analyze' }, { from: 'analyze', to: 'plan' }],
      parameters: [{ name: 'topic', type: 'string', required: true, description: 'What to research' }],
    },
    {
      name: 'News → Strategy → Brief',
      description: 'Gather news, analyze strategically, produce executive brief',
      tags: ['news', 'strategy', 'briefing'],
      nodes: [
        { id: 'news', name: 'News Gather', engineId: 'newsroom', type: 'engine', promptTemplate: 'Search for the latest news on {{topic}}. Include sources and dates.' },
        { id: 'strategy', name: 'Strategic Analysis', engineId: 'research', type: 'engine', promptTemplate: 'Analyze the news findings for strategic implications.', inputBindings: { newsData: { source: 'nodeOutput', nodeId: 'news' } } },
        { id: 'brief', name: 'Executive Brief', engineId: 'chief_of_staff', type: 'engine', promptTemplate: 'Produce a concise executive brief with key takeaways and recommended actions.', inputBindings: { analysis: { source: 'nodeOutput', nodeId: 'strategy' } } },
      ],
      edges: [{ from: 'news', to: 'strategy' }, { from: 'strategy', to: 'brief' }],
      parameters: [{ name: 'topic', type: 'string', required: true, description: 'News topic' }],
    },
    {
      name: 'Income Research Pipeline',
      description: 'Research income ideas, evaluate market, create business plan',
      tags: ['income', 'research', 'business'],
      nodes: [
        { id: 'ideas', name: 'Idea Research', engineId: 'research', type: 'engine', promptTemplate: 'Research {{count}} passive income ideas for {{profile}}. Include revenue estimates.' },
        { id: 'market', name: 'Market Analysis', engineId: 'finance', type: 'engine', promptTemplate: 'Analyze the market for the top ideas. Include competition, market size, and barriers.', inputBindings: { ideas: { source: 'nodeOutput', nodeId: 'ideas' } } },
        { id: 'plan', name: 'Business Plan', engineId: 'chief_of_staff', type: 'engine', promptTemplate: 'Create a business plan for the most promising opportunity.', inputBindings: { market: { source: 'nodeOutput', nodeId: 'market' } } },
      ],
      edges: [{ from: 'ideas', to: 'market' }, { from: 'market', to: 'plan' }],
      parameters: [
        { name: 'count', type: 'number', required: false, default: 5, description: 'Number of ideas' },
        { name: 'profile', type: 'string', required: false, default: 'a data engineer', description: 'Target profile' },
      ],
    },
  ];

  let seeded = 0;
  for (const b of builtins) {
    createWorkflowTemplate(b);
    seeded++;
  }
  return seeded;
}

function executeNode(run: CompoundWorkflowRun, node: any, template: CompoundWorkflowTemplate, params: Record<string, unknown>): void {
  run.nodeRuns[node.id] = { status: 'running', startedAt: Date.now() };

  // Resolve prompt template with params
  let prompt = node.promptTemplate || '';
  for (const [key, val] of Object.entries(params)) {
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
  }

  // Create a real task via intake
  try {
    const intake = require('./intake') as { createTask(body: any): any };
    const queue = require('./queue') as { addTask(type: string, label: string, meta: any): any };
    const task = intake.createTask({
      raw_request: prompt,
      domain: node.engineId || 'general',
      urgency: 'normal',
      desired_outcome: node.desiredOutcome || 'Specific, actionable output',
    });
    run.nodeRuns[node.id].taskId = task.task_id;
    queue.addTask('deliberate', `Deliberate (workflow): ${task.title}`, { taskId: task.task_id, autoApprove: true });
    console.log(`[compound-workflow] Started node ${node.id} as task ${task.task_id}`);
  } catch (e) {
    run.nodeRuns[node.id].status = 'failed';
    console.log(`[compound-workflow] Error starting node ${node.id}: ${(e as Error).message?.slice(0, 100)}`);
  }
}

module.exports = { createWorkflowTemplate, getWorkflowTemplate, listWorkflowTemplates, deleteWorkflowTemplate, startWorkflowRun, getWorkflowRun, listWorkflowRuns, onNodeComplete, seedBuiltinTemplates };
