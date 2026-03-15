// GPO Task Graph — Dependency visualization + critical path analysis

export interface TaskGraphNode {
  id: string;
  label: string;
  status: string;
  model?: string;
  stage?: string;
  durationMs?: number;
  deps: string[];
  dependents: string[];
  isCritical: boolean;
  level: number;
}

export interface TaskGraphEdge {
  from: string;
  to: string;
  critical: boolean;
}

export interface TaskGraph {
  taskId: string;
  nodes: TaskGraphNode[];
  edges: TaskGraphEdge[];
  criticalPath: string[];
  criticalPathMs: number;
  totalNodes: number;
  completedNodes: number;
  bottleneck?: string;
}

export function buildTaskGraph(taskId: string): TaskGraph | null {
  try {
    const intake = require('./intake') as { getTask(id: string): any; getSubtasksForTask(id: string): any[] };
    const task = intake.getTask(taskId);
    if (!task) return null;

    const subtasks = intake.getSubtasksForTask(taskId);
    if (subtasks.length === 0) return null;

    const nodes: TaskGraphNode[] = [];
    const edges: TaskGraphEdge[] = [];
    const nodeMap = new Map<string, TaskGraphNode>();

    // Build nodes
    for (let i = 0; i < subtasks.length; i++) {
      const st = subtasks[i];
      const deps = (st.depends_on || []).map((d: string | number) => {
        if (typeof d === 'number' && d < subtasks.length) return subtasks[d].subtask_id;
        return String(d);
      });

      const node: TaskGraphNode = {
        id: st.subtask_id,
        label: st.title || `Subtask ${i + 1}`,
        status: st.status,
        model: st.assigned_model,
        stage: st.stage,
        durationMs: st.duration_ms || 0,
        deps,
        dependents: [],
        isCritical: false,
        level: 0,
      };

      nodes.push(node);
      nodeMap.set(st.subtask_id, node);
    }

    // Build edges and dependents
    for (const node of nodes) {
      for (const depId of node.deps) {
        edges.push({ from: depId, to: node.id, critical: false });
        const depNode = nodeMap.get(depId);
        if (depNode) depNode.dependents.push(node.id);
      }
    }

    // Compute levels (topological sort for visualization)
    const visited = new Set<string>();
    function computeLevel(nodeId: string): number {
      const node = nodeMap.get(nodeId);
      if (!node) return 0;
      if (visited.has(nodeId)) return node.level;
      visited.add(nodeId);
      if (node.deps.length === 0) { node.level = 0; return 0; }
      node.level = Math.max(...node.deps.map(d => computeLevel(d) + 1));
      return node.level;
    }
    for (const node of nodes) computeLevel(node.id);

    // Compute critical path (longest path through the graph)
    const criticalPath = computeCriticalPath(nodes, nodeMap);

    // Mark critical nodes and edges
    const criticalSet = new Set(criticalPath);
    for (const node of nodes) node.isCritical = criticalSet.has(node.id);
    for (const edge of edges) edge.critical = criticalSet.has(edge.from) && criticalSet.has(edge.to);

    // Compute critical path duration
    const criticalPathMs = criticalPath.reduce((sum, id) => {
      const node = nodeMap.get(id);
      return sum + (node?.durationMs || 0);
    }, 0);

    // Find bottleneck (longest running non-complete node on critical path)
    const bottleneck = criticalPath
      .map(id => nodeMap.get(id))
      .filter(n => n && n.status !== 'done')
      .sort((a, b) => (b?.durationMs || 0) - (a?.durationMs || 0))[0]?.id;

    return {
      taskId,
      nodes: nodes.sort((a, b) => a.level - b.level),
      edges,
      criticalPath,
      criticalPathMs,
      totalNodes: nodes.length,
      completedNodes: nodes.filter(n => n.status === 'done').length,
      bottleneck,
    };
  } catch {
    return null;
  }
}

function computeCriticalPath(nodes: TaskGraphNode[], nodeMap: Map<string, TaskGraphNode>): string[] {
  // Find the longest path from any root to any leaf
  const roots = nodes.filter(n => n.deps.length === 0);
  let longestPath: string[] = [];
  let longestDuration = 0;

  function dfs(nodeId: string, path: string[], duration: number): void {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    const newPath = [...path, nodeId];
    const newDuration = duration + (node.durationMs || 0);

    if (node.dependents.length === 0) {
      if (newDuration > longestDuration) {
        longestDuration = newDuration;
        longestPath = newPath;
      }
      return;
    }

    for (const depId of node.dependents) {
      dfs(depId, newPath, newDuration);
    }
  }

  for (const root of roots) dfs(root.id, [], 0);

  // If no path found (simple linear), return all nodes
  if (longestPath.length === 0) return nodes.map(n => n.id);
  return longestPath;
}

export function getGraphForTask(taskId: string): TaskGraph | null {
  return buildTaskGraph(taskId);
}

module.exports = { buildTaskGraph, getGraphForTask };
