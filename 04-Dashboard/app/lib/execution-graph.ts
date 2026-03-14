// GPO Execution Graph — Structured execution plan for board-routed tasks
// Creates dependency-aware graphs with sequential/parallel modes,
// scoped by domain (engine), project_id, and environment lane.

import type {
  Domain, Lane, ExecutionGraph, ExecutionNode, GraphStatus, NodeStatus,
  ExecutionMode, SubtaskStage, RiskLevel, IntakeTask,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const GRAPHS_FILE = path.resolve(__dirname, '..', '..', 'state', 'execution-graphs.json');
const NODES_FILE = path.resolve(__dirname, '..', '..', 'state', 'execution-nodes.json');

function uid(prefix: string): string {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch { return fallback; }
}

function writeJson(file: string, data: unknown): void {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════
// Graph State Machine
// ═══════════════════════════════════════════

const GRAPH_TRANSITIONS: Record<GraphStatus, GraphStatus[]> = {
  draft:     ['ready', 'canceled'],
  ready:     ['executing', 'canceled'],
  executing: ['paused', 'completed', 'failed'],
  paused:    ['executing', 'canceled'],
  completed: [],
  failed:    ['draft'],      // allow rebuild
  canceled:  ['draft'],      // allow re-create
};

const NODE_TRANSITIONS: Record<NodeStatus, NodeStatus[]> = {
  pending:      ['ready', 'skipped', 'canceled'],
  ready:        ['running', 'waiting_gate', 'canceled'],
  running:      ['completed', 'failed', 'waiting_gate'],
  waiting_gate: ['ready', 'running', 'completed', 'failed', 'canceled'],
  completed:    [],
  failed:       ['pending'],  // allow retry
  skipped:      [],
  canceled:     ['pending'],  // allow re-plan
};

export function isValidGraphTransition(from: GraphStatus, to: GraphStatus): boolean {
  return (GRAPH_TRANSITIONS[from] || []).includes(to);
}

export function isValidNodeTransition(from: NodeStatus, to: NodeStatus): boolean {
  return (NODE_TRANSITIONS[from] || []).includes(to);
}

const GRAPH_TERMINAL: ReadonlySet<GraphStatus> = new Set(['completed', 'failed', 'canceled']);
const NODE_TERMINAL: ReadonlySet<NodeStatus> = new Set(['completed', 'failed', 'skipped', 'canceled']);

// ═══════════════════════════════════════════
// Graph CRUD
// ═══════════════════════════════════════════

export function createGraph(opts: {
  task_id: string;
  domain: Domain;
  project_id?: string;
  lane?: Lane;
  title: string;
  board_rationale: string;
  chief_of_staff_plan: string;
  execution_mode?: ExecutionMode;
}): ExecutionGraph {
  const graphs = readJson<ExecutionGraph[]>(GRAPHS_FILE, []);

  const graph: ExecutionGraph = {
    graph_id: uid('eg'),
    task_id: opts.task_id,
    domain: opts.domain,
    project_id: opts.project_id,
    lane: opts.lane || 'dev',
    status: 'draft',
    execution_mode: opts.execution_mode || 'sequential',
    title: opts.title,
    board_rationale: opts.board_rationale,
    chief_of_staff_plan: opts.chief_of_staff_plan,
    nodes: [],
    approval_gates: [],
    review_contracts: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  graphs.unshift(graph);
  if (graphs.length > 200) graphs.length = 200;
  writeJson(GRAPHS_FILE, graphs);
  return graph;
}

export function getGraph(graphId: string): ExecutionGraph | null {
  return readJson<ExecutionGraph[]>(GRAPHS_FILE, []).find(g => g.graph_id === graphId) || null;
}

export function getGraphForTask(taskId: string): ExecutionGraph | null {
  return readJson<ExecutionGraph[]>(GRAPHS_FILE, []).find(g => g.task_id === taskId) || null;
}

export function getAllGraphs(): ExecutionGraph[] {
  return readJson<ExecutionGraph[]>(GRAPHS_FILE, []);
}

export function updateGraph(graphId: string, updates: Partial<ExecutionGraph>): ExecutionGraph | null {
  const graphs = readJson<ExecutionGraph[]>(GRAPHS_FILE, []);
  const idx = graphs.findIndex(g => g.graph_id === graphId);
  if (idx === -1) return null;
  Object.assign(graphs[idx], updates, { updated_at: new Date().toISOString() });
  writeJson(GRAPHS_FILE, graphs);
  return graphs[idx];
}

export function updateGraphStatus(graphId: string, status: GraphStatus): ExecutionGraph | null {
  const graph = getGraph(graphId);
  if (!graph) return null;
  if (!isValidGraphTransition(graph.status, status)) return null;

  // Runtime enforcement check on execution start
  if (status === 'executing') {
    try {
      const re = require('./runtime-enforcement') as { shouldProceed(t: string, gid: string): boolean };
      if (!re.shouldProceed('node_queue', graphId)) {
        console.log(`[execution-graph] Runtime enforcement blocked graph ${graphId} from executing`);
        return null;
      }
    } catch { /* runtime enforcement not loaded — allow */ }
  }

  const updates: Partial<ExecutionGraph> = { status };
  if (GRAPH_TERMINAL.has(status)) updates.completed_at = new Date().toISOString();
  return updateGraph(graphId, updates);
}

// ═══════════════════════════════════════════
// Node CRUD
// ═══════════════════════════════════════════

export function addNode(opts: {
  graph_id: string;
  title: string;
  description: string;
  stage: SubtaskStage;
  assigned_agent: string;
  execution_mode?: ExecutionMode;
  depends_on?: string[];
  risk_level?: RiskLevel;
  subtask_id?: string;
}): ExecutionNode {
  const nodes = readJson<ExecutionNode[]>(NODES_FILE, []);

  const node: ExecutionNode = {
    node_id: uid('en'),
    graph_id: opts.graph_id,
    subtask_id: opts.subtask_id,
    title: opts.title,
    description: opts.description,
    stage: opts.stage,
    assigned_agent: opts.assigned_agent,
    execution_mode: opts.execution_mode || 'sequential',
    depends_on: opts.depends_on || [],
    status: 'pending',
    risk_level: opts.risk_level || 'green',
    gate_ids: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  nodes.unshift(node);
  if (nodes.length > 500) nodes.length = 500;
  writeJson(NODES_FILE, nodes);

  // Add to graph's node list
  const graph = getGraph(opts.graph_id);
  if (graph) {
    graph.nodes.push(node.node_id);
    updateGraph(opts.graph_id, { nodes: graph.nodes });
  }

  return node;
}

export function getNode(nodeId: string): ExecutionNode | null {
  return readJson<ExecutionNode[]>(NODES_FILE, []).find(n => n.node_id === nodeId) || null;
}

export function getNodesForGraph(graphId: string): ExecutionNode[] {
  return readJson<ExecutionNode[]>(NODES_FILE, []).filter(n => n.graph_id === graphId);
}

export function updateNode(nodeId: string, updates: Partial<ExecutionNode>): ExecutionNode | null {
  const nodes = readJson<ExecutionNode[]>(NODES_FILE, []);
  const idx = nodes.findIndex(n => n.node_id === nodeId);
  if (idx === -1) return null;
  Object.assign(nodes[idx], updates, { updated_at: new Date().toISOString() });
  writeJson(NODES_FILE, nodes);
  return nodes[idx];
}

export function updateNodeStatus(nodeId: string, status: NodeStatus): ExecutionNode | null {
  const node = getNode(nodeId);
  if (!node) return null;
  if (!isValidNodeTransition(node.status, status)) return null;

  // Runtime enforcement check on node start
  if (status === 'running') {
    try {
      const re = require('./runtime-enforcement') as { shouldProceed(t: string, gid: string, nid?: string): boolean };
      if (!re.shouldProceed('node_start', node.graph_id, nodeId)) {
        console.log(`[execution-graph] Runtime enforcement blocked node ${nodeId} from running`);
        return null;
      }
    } catch { /* runtime enforcement not loaded — allow */ }
  }

  const updates: Partial<ExecutionNode> = { status };
  if (NODE_TERMINAL.has(status)) updates.completed_at = new Date().toISOString();
  return updateNode(nodeId, updates);
}

// ═══════════════════════════════════════════
// Graph Logic — dependency resolution, readiness
// ═══════════════════════════════════════════

/** Find nodes that are ready to execute (all dependencies completed) */
export function findReadyNodes(graphId: string): ExecutionNode[] {
  const nodes = getNodesForGraph(graphId);
  const completedIds = new Set(nodes.filter(n => n.status === 'completed').map(n => n.node_id));

  return nodes.filter(n => {
    if (n.status !== 'pending') return false;
    // All dependencies must be completed
    return n.depends_on.every(depId => completedIds.has(depId));
  });
}

/** Check if all nodes in a graph are terminal */
export function isGraphComplete(graphId: string): { complete: boolean; allPassed: boolean } {
  const nodes = getNodesForGraph(graphId);
  if (nodes.length === 0) return { complete: false, allPassed: false };

  const complete = nodes.every(n => NODE_TERMINAL.has(n.status));
  const allPassed = nodes.every(n => n.status === 'completed' || n.status === 'skipped');
  return { complete, allPassed };
}

/** Build a graph from a task's board deliberation */
export function buildFromDeliberation(task: IntakeTask, chiefPlan: string): ExecutionGraph | null {
  const delib = task.board_deliberation;
  if (!delib) return null;

  const graph = createGraph({
    task_id: task.task_id,
    domain: task.domain,
    project_id: (task as any).project_id,
    title: task.title,
    board_rationale: delib.interpreted_objective + '. ' + delib.recommended_strategy,
    chief_of_staff_plan: chiefPlan,
    execution_mode: delib.subtasks.length > 1 ? 'mixed' : 'sequential',
  });

  // Create nodes from subtasks
  const subtaskNodes: ExecutionNode[] = [];
  for (let i = 0; i < delib.subtasks.length; i++) {
    const st = delib.subtasks[i];
    const depNodeIds: string[] = [];

    // Map subtask depends_on indices to node IDs
    if (st.depends_on) {
      for (const dep of st.depends_on) {
        const depIdx = typeof dep === 'number' ? dep : parseInt(dep as string, 10);
        if (!isNaN(depIdx) && depIdx >= 0 && depIdx < subtaskNodes.length) {
          depNodeIds.push(subtaskNodes[depIdx].node_id);
        }
      }
    }

    const node = addNode({
      graph_id: graph.graph_id,
      title: st.title,
      description: st.expected_output,
      stage: st.stage,
      assigned_agent: st.assigned_model || 'openai',
      risk_level: st.risk_level || 'green',
      depends_on: depNodeIds,
    });
    subtaskNodes.push(node);
  }

  return graph;
}

/** Rebuild an existing graph (e.g., after failure) */
export function rebuildGraph(graphId: string): ExecutionGraph | null {
  const graph = getGraph(graphId);
  if (!graph) return null;
  if (graph.status !== 'failed' && graph.status !== 'canceled') return null;

  // Reset all nodes to pending
  const nodes = getNodesForGraph(graphId);
  for (const node of nodes) {
    updateNode(node.node_id, { status: 'pending', error: undefined, completed_at: undefined });
  }

  return updateGraph(graphId, { status: 'draft', completed_at: undefined });
}

module.exports = {
  // State machine
  isValidGraphTransition, isValidNodeTransition,
  // Graph CRUD
  createGraph, getGraph, getGraphForTask, getAllGraphs, updateGraph, updateGraphStatus,
  // Node CRUD
  addNode, getNode, getNodesForGraph, updateNode, updateNodeStatus,
  // Logic
  findReadyNodes, isGraphComplete, buildFromDeliberation, rebuildGraph,
};
