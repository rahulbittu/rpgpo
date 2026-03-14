// GPO Chief of Staff Layer
// Sits between Board of AI synthesis and execution.
// Interprets board results, routes work, generates next-best-actions,
// and keeps the operator focused on what matters most.

import type {
  Domain, IntakeTask, Subtask, NextAction, ActionPriority,
  ChiefOfStaffBrief, EngineRecommendation, MissionHealthCheck,
  MissionStatementLevel, BoardDeliberation, RiskLevel,
  ExecutionGraph, Lane,
} from './types';

const context = require('./context') as {
  getOperatorProfile(): import('./types').OperatorProfile;
  getMissionContext(d: Domain): import('./types').MissionContextRecord;
  getArtifacts(d: Domain): import('./types').ArtifactRef[];
  getOpenQuestions(d: Domain): import('./types').OpenQuestion[];
};

const engines = require('./engines') as {
  getAllEngines(): import('./types').Engine[];
  getEngine(d: Domain): import('./types').Engine | undefined;
  getEngineContext(d: Domain): import('./types').EngineContext;
  getEngineDisplayName(d: Domain): string;
};

const projects = require('./projects') as {
  getAllProjects(): import('./types').Project[];
  getDefaultProject(d: Domain): import('./types').Project | null;
  getProjectContext(id: string): import('./types').ProjectContext | null;
};

const missions = require('./mission-statements') as {
  getOperatorStatement(): import('./types').MissionStatement | null;
  getEngineStatement(d: Domain): import('./types').MissionStatement | null;
  getProjectStatement(id: string): import('./types').MissionStatement | null;
  checkMissionAlignment(desc: string, d?: Domain, p?: string): { aligned: boolean; reason: string; statement_snippet: string };
};

const intake = require('./intake') as {
  getAllTasks(): IntakeTask[];
  getSubtasksForTask(id: string): Subtask[];
};

const autonomy = require('./autonomy') as {
  getAllBlockers(): import('./types').Blocker[];
};

function uid(): string {
  return 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ═══════════════════════════════════════════
// Board Interpretation
// ═══════════════════════════════════════════

/** Interpret a board result and produce a Chief of Staff routing decision */
export function interpretBoardResult(task: IntakeTask): {
  summary: string;
  risk_assessment: string;
  recommended_route: string;
  key_concerns: string[];
  approval_needed: boolean;
} {
  const delib = task.board_deliberation;
  if (!delib) {
    return {
      summary: `Task "${task.title}" has not been deliberated yet.`,
      risk_assessment: 'unknown',
      recommended_route: 'Send to Board for deliberation first',
      key_concerns: ['No board deliberation available'],
      approval_needed: true,
    };
  }

  const subtaskCount = delib.subtasks?.length || 0;
  const hasCodeWork = delib.is_code_task || delib.subtasks?.some(s => ['implement', 'build', 'code'].includes(s.stage));
  const hasRedRisk = delib.risk_level === 'red' || delib.subtasks?.some(s => s.risk_level === 'red');
  const hasYellowRisk = delib.risk_level === 'yellow' || delib.subtasks?.some(s => s.risk_level === 'yellow');

  const concerns: string[] = [];
  if (delib.key_unknowns?.length) concerns.push(...delib.key_unknowns.slice(0, 3));
  if (delib.approval_points?.length) concerns.push(...delib.approval_points.slice(0, 2));
  if (hasRedRisk) concerns.push('Contains red-risk subtasks requiring explicit approval');

  let route = 'Execute plan with standard governance';
  if (hasRedRisk) route = 'Requires operator review before any execution';
  else if (hasCodeWork && hasYellowRisk) route = 'Code changes need review — builder execution with approval gates';
  else if (!hasCodeWork && !hasYellowRisk) route = 'Low-risk research/analysis — can auto-execute green subtasks';

  return {
    summary: `${subtaskCount} subtasks planned. ${delib.interpreted_objective}`,
    risk_assessment: delib.risk_level,
    recommended_route: route,
    key_concerns: concerns,
    approval_needed: hasRedRisk || hasYellowRisk,
  };
}

// ═══════════════════════════════════════════
// Next Best Actions — Reverse Prompting
// ═══════════════════════════════════════════

/** Generate next-best-actions across all engines and projects */
export function getNextBestActions(limit: number = 10): NextAction[] {
  const allActions: NextAction[] = [];
  const allEngines = engines.getAllEngines();
  const allTasks = intake.getAllTasks();
  const blockers = autonomy.getAllBlockers();
  const blockerTaskIds = new Set(blockers.map(b => b.task_id).filter(Boolean));

  // 1. Pending tasks needing deliberation
  for (const task of allTasks) {
    if (task.status === 'intake') {
      allActions.push({
        id: uid(),
        title: `Send "${task.title}" to Board for deliberation`,
        why: 'New task waiting in intake — needs board assessment before work can begin',
        priority: task.urgency === 'critical' ? 'critical' : task.urgency === 'high' ? 'high' : 'medium',
        level: 'engine',
        scope_id: task.domain,
        domain: task.domain,
        mission_alignment: missions.checkMissionAlignment(task.raw_request, task.domain).reason,
        blocked: false,
        needs_approval: false,
        suggested_capability: 'deliberation',
        suggested_agent: 'openai-api',
        estimated_complexity: 'small',
      });
    }
  }

  // 2. Planned tasks needing approval
  for (const task of allTasks) {
    if (task.status === 'planned') {
      const delib = task.board_deliberation;
      const subtaskCount = delib?.subtasks?.length || 0;
      allActions.push({
        id: uid(),
        title: `Review and approve plan for "${task.title}"`,
        why: `Plan with ${subtaskCount} subtasks is ready — execution blocked until approved`,
        priority: 'high',
        level: 'engine',
        scope_id: task.domain,
        domain: task.domain,
        mission_alignment: missions.checkMissionAlignment(task.raw_request, task.domain).reason,
        blocked: false,
        needs_approval: true,
        suggested_capability: 'approval-handling',
        suggested_agent: 'operator',
        estimated_complexity: 'trivial',
      });
    }
  }

  // 3. Subtasks needing approval
  for (const task of allTasks) {
    if (['executing', 'waiting_approval'].includes(task.status)) {
      const subtasks = intake.getSubtasksForTask(task.task_id);
      for (const sub of subtasks) {
        if (sub.status === 'waiting_approval') {
          const isCodeReview = sub.builder_outcome === 'code_applied';
          allActions.push({
            id: uid(),
            title: isCodeReview
              ? `Review code changes for "${sub.title}"`
              : `Approve "${sub.title}"`,
            why: isCodeReview
              ? `Builder applied code changes — review diff before merging`
              : `Subtask waiting for operator approval to proceed`,
            priority: isCodeReview ? 'high' : 'medium',
            level: 'engine',
            scope_id: task.domain,
            domain: task.domain,
            mission_alignment: missions.checkMissionAlignment(sub.title, task.domain).reason,
            blocked: false,
            needs_approval: true,
            suggested_capability: 'approval-handling',
            suggested_agent: 'operator',
            estimated_complexity: 'trivial',
          });
        }
      }
    }
  }

  // 4. Blocked work needing resolution
  for (const blocker of blockers) {
    allActions.push({
      id: uid(),
      title: `Resolve blocker: ${blocker.title}`,
      why: blocker.description,
      priority: blocker.severity === 'high' ? 'high' : 'medium',
      level: 'engine',
      scope_id: (blocker.domain as Domain) || 'general',
      domain: (blocker.domain as Domain) || 'general',
      mission_alignment: 'Removing blockers enables mission progress',
      blocked: true,
      blocker_reason: blocker.resume_action,
      needs_approval: false,
      suggested_capability: undefined,
      estimated_complexity: 'small',
    });
  }

  // 5. Engine-level recommendations from context
  for (const engine of allEngines) {
    const ctx = engines.getEngineContext(engine.domain);
    const missionCtx = context.getMissionContext(engine.domain);
    const openQs = context.getOpenQuestions(engine.domain);

    // Open questions needing answers
    for (const q of openQs.slice(0, 2)) {
      allActions.push({
        id: uid(),
        title: `Answer open question: ${q.question.slice(0, 60)}`,
        why: `Open question in ${engine.display_name} — answering unblocks decision-making`,
        priority: q.priority === 'high' ? 'high' : 'medium',
        level: 'engine',
        scope_id: engine.domain,
        domain: engine.domain,
        mission_alignment: missions.checkMissionAlignment(q.question, engine.domain).reason,
        blocked: false,
        needs_approval: false,
        suggested_capability: 'research',
        suggested_agent: 'perplexity-api',
        estimated_complexity: 'small',
      });
    }

    // Next actions from mission context
    for (const action of (missionCtx.next_actions || []).slice(0, 2)) {
      allActions.push({
        id: uid(),
        title: action,
        why: `Recommended next action for ${engine.display_name}`,
        priority: 'medium',
        level: 'engine',
        scope_id: engine.domain,
        domain: engine.domain,
        mission_alignment: missions.checkMissionAlignment(action, engine.domain).reason,
        blocked: false,
        needs_approval: false,
        suggested_capability: 'deliberation',
        estimated_complexity: 'medium',
      });
    }
  }

  // Sort by priority, then by approval-needed (approvals first)
  const priorityOrder: Record<ActionPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  allActions.sort((a, b) => {
    const pa = priorityOrder[a.priority];
    const pb = priorityOrder[b.priority];
    if (pa !== pb) return pa - pb;
    if (a.needs_approval !== b.needs_approval) return a.needs_approval ? -1 : 1;
    return 0;
  });

  return allActions.slice(0, limit);
}

/** Get next actions scoped to a specific engine */
export function getEngineActions(domain: Domain, limit: number = 5): NextAction[] {
  return getNextBestActions(50).filter(a => a.domain === domain).slice(0, limit);
}

/** Get next actions scoped to a specific project */
export function getProjectActions(projectId: string, domain: Domain, limit: number = 5): NextAction[] {
  const project = projects.getDefaultProject(domain);
  if (!project || project.project_id !== projectId) return [];

  const actions: NextAction[] = [];
  const projCtx = projects.getProjectContext(projectId);

  if (projCtx) {
    for (const action of (projCtx.next_actions || []).slice(0, limit)) {
      const alignment = missions.checkMissionAlignment(action, domain, projectId);
      actions.push({
        id: uid(),
        title: action,
        why: `Project-level next action`,
        priority: 'medium',
        level: 'project',
        scope_id: projectId,
        domain,
        mission_alignment: alignment.reason,
        blocked: false,
        needs_approval: false,
        estimated_complexity: 'medium',
      });
    }

    for (const issue of (projCtx.known_issues || []).slice(0, 2)) {
      actions.push({
        id: uid(),
        title: `Address: ${issue}`,
        why: 'Known issue in project — resolving improves quality',
        priority: 'medium',
        level: 'project',
        scope_id: projectId,
        domain,
        mission_alignment: missions.checkMissionAlignment(issue, domain, projectId).reason,
        blocked: false,
        needs_approval: false,
        suggested_capability: 'deliberation',
        estimated_complexity: 'medium',
      });
    }
  }

  return actions.slice(0, limit);
}

// ═══════════════════════════════════════════
// Chief of Staff Brief — Full operator summary
// ═══════════════════════════════════════════

/** Generate a full Chief of Staff brief for the operator */
export function generateBrief(): ChiefOfStaffBrief {
  const operator = context.getOperatorProfile();
  const allEngineList = engines.getAllEngines();
  const allActions = getNextBestActions(20);
  const blockers = autonomy.getAllBlockers();

  // Build per-engine recommendations
  const byEngine: EngineRecommendation[] = [];
  for (const engine of allEngineList) {
    const engineActions = allActions.filter(a => a.domain === engine.domain);
    const missionStatement = missions.getEngineStatement(engine.domain);
    const ctx = engines.getEngineContext(engine.domain);

    let health: EngineRecommendation['health'] = 'idle';
    const hasBlockers = engineActions.some(a => a.blocked);
    const hasWork = engineActions.length > 0;
    if (hasBlockers) health = 'blocked';
    else if (engineActions.some(a => a.priority === 'critical' || a.priority === 'high')) health = 'needs_attention';
    else if (hasWork) health = 'healthy';

    byEngine.push({
      domain: engine.domain,
      engine_name: engine.display_name,
      mission_statement: missionStatement?.statement,
      actions: engineActions.slice(0, 3),
      health,
      summary: ctx.context_summary || engine.description,
    });
  }

  // Mission health checks
  const missionHealth: MissionHealthCheck[] = [];
  const opStatement = missions.getOperatorStatement();
  missionHealth.push({
    level: 'operator',
    scope_id: 'operator',
    label: `${operator.name}'s GPO`,
    statement_snippet: opStatement?.statement?.slice(0, 80) || '',
    alignment: opStatement ? 'on_track' : 'no_statement',
    reason: opStatement
      ? 'Operator mission statement is set — all work should align'
      : 'No operator mission statement — set one to guide prioritization',
  });

  for (const engine of allEngineList) {
    const stmt = missions.getEngineStatement(engine.domain);
    const engineActions = allActions.filter(a => a.domain === engine.domain);
    const hasBlockedWork = engineActions.some(a => a.blocked);
    const hasActiveWork = engineActions.length > 0;

    let alignment: MissionHealthCheck['alignment'] = 'no_statement';
    let reason = 'No engine mission statement set';
    if (stmt) {
      if (hasBlockedWork) { alignment = 'stalled'; reason = 'Has blocked work — needs attention'; }
      else if (hasActiveWork) { alignment = 'on_track'; reason = 'Active work aligned with mission'; }
      else { alignment = 'drifting'; reason = 'No active work — consider new initiatives'; }
    }

    missionHealth.push({
      level: 'engine',
      scope_id: engine.domain,
      label: engine.display_name,
      statement_snippet: stmt?.statement?.slice(0, 80) || '',
      alignment,
      reason,
    });
  }

  // Focus recommendation
  const topAction = allActions[0];
  const focusRec = topAction
    ? `Focus on: ${topAction.title} (${topAction.priority} priority)`
    : 'All clear — consider reviewing mission statements or starting new initiatives';

  return {
    generated_at: new Date().toISOString(),
    operator_summary: `${operator.name} | ${allActions.length} recommended actions | ${blockers.length} blockers`,
    top_priorities: allActions.slice(0, 5),
    by_engine: byEngine,
    blockers_summary: blockers.map(b => b.title),
    mission_health: missionHealth,
    focus_recommendation: focusRec,
  };
}

// ═══════════════════════════════════════════
// Work Orders — Board → Chief of Staff → Execution
// ═══════════════════════════════════════════

interface WorkOrder {
  task_id: string;
  task_title: string;
  domain: Domain;
  project_id?: string;
  lane: Lane;
  board_rationale: string;
  chief_of_staff_plan: string;
  risk_level: RiskLevel;
  is_code_task: boolean;
  node_count: number;
}

/** Build a work order from a task's board decision */
export function buildWorkOrder(taskId: string): WorkOrder | null {
  const allTasks = intake.getAllTasks();
  const task = allTasks.find(t => t.task_id === taskId);
  if (!task || !task.board_deliberation) return null;

  const delib = task.board_deliberation;
  const interpretation = interpretBoardResult(task);

  const plan = [
    `Objective: ${delib.interpreted_objective}`,
    `Strategy: ${delib.recommended_strategy}`,
    `Route: ${interpretation.recommended_route}`,
    interpretation.key_concerns.length > 0
      ? `Concerns: ${interpretation.key_concerns.join('; ')}`
      : '',
    `Risk: ${delib.risk_level}`,
  ].filter(Boolean).join('\n');

  return {
    task_id: taskId,
    task_title: task.title,
    domain: task.domain,
    project_id: (task as any).project_id,
    lane: 'dev', // default lane
    board_rationale: delib.interpreted_objective + '. ' + delib.recommended_strategy,
    chief_of_staff_plan: plan,
    risk_level: delib.risk_level,
    is_code_task: delib.is_code_task,
    node_count: delib.subtasks?.length || 0,
  };
}

/** Create an execution graph from a work order */
export function createExecutionGraph(taskId: string): ExecutionGraph | null {
  const workOrder = buildWorkOrder(taskId);
  if (!workOrder) return null;

  try {
    const eg = require('./execution-graph') as {
      buildFromDeliberation(task: IntakeTask, plan: string): ExecutionGraph | null;
    };
    const allTasks = intake.getAllTasks();
    const task = allTasks.find(t => t.task_id === taskId);
    if (!task) return null;

    return eg.buildFromDeliberation(task, workOrder.chief_of_staff_plan);
  } catch (e) {
    console.error('[chief-of-staff] Failed to create execution graph:', (e as Error).message);
    return null;
  }
}

/** Attach approval gates to an execution graph */
export function attachApprovalGates(graphId: string): string[] {
  try {
    const eg = require('./execution-graph') as { getGraph(id: string): ExecutionGraph | null };
    const ag = require('./approval-gates') as {
      attachDefaultGates(id: string, lane: Lane, risk: RiskLevel): import('./types').ApprovalGate[];
    };
    const graph = eg.getGraph(graphId);
    if (!graph) return [];

    // Determine risk from graph context
    const allTasks = intake.getAllTasks();
    const task = allTasks.find(t => t.task_id === graph.task_id);
    const riskLevel = task?.board_deliberation?.risk_level || task?.risk_level || 'green';

    const gates = ag.attachDefaultGates(graphId, graph.lane, riskLevel);
    return gates.map(g => g.gate_id);
  } catch (e) {
    console.error('[chief-of-staff] Failed to attach gates:', (e as Error).message);
    return [];
  }
}

/** Attach review contracts to an execution graph */
export function attachReviewContracts(graphId: string): string[] {
  try {
    const eg = require('./execution-graph') as { getGraph(id: string): ExecutionGraph | null };
    const rc = require('./review-contracts') as {
      attachDefaultReviews(id: string, lane: Lane, risk: RiskLevel, isCode: boolean): import('./types').ReviewContract[];
    };
    const graph = eg.getGraph(graphId);
    if (!graph) return [];

    const allTasks = intake.getAllTasks();
    const task = allTasks.find(t => t.task_id === graph.task_id);
    const riskLevel = task?.board_deliberation?.risk_level || task?.risk_level || 'green';
    const isCodeTask = task?.board_deliberation?.is_code_task || false;

    const reviews = rc.attachDefaultReviews(graphId, graph.lane, riskLevel, isCodeTask);
    return reviews.map(r => r.review_id);
  } catch (e) {
    console.error('[chief-of-staff] Failed to attach reviews:', (e as Error).message);
    return [];
  }
}

/** Generate a promotion dossier from a completed execution graph */
export function generatePromotionDossier(graphId: string): import('./types').PromotionDossier | null {
  try {
    const pd = require('./promotion-dossiers') as {
      generateDossier(id: string): import('./types').PromotionDossier | null;
    };
    return pd.generateDossier(graphId);
  } catch (e) {
    console.error('[chief-of-staff] Failed to generate dossier:', (e as Error).message);
    return null;
  }
}

/** Full orchestration: build work order → create graph → attach gates → attach reviews */
export function orchestrateTask(taskId: string): {
  graph: ExecutionGraph | null;
  gate_ids: string[];
  review_ids: string[];
} {
  const graph = createExecutionGraph(taskId);
  if (!graph) return { graph: null, gate_ids: [], review_ids: [] };

  const gate_ids = attachApprovalGates(graph.graph_id);
  const review_ids = attachReviewContracts(graph.graph_id);

  return { graph, gate_ids, review_ids };
}

// ═══════════════════════════════════════════
// Part 21: Provider Selection + Collaboration + Reverse Prompting
// ═══════════════════════════════════════════

/** Select the best provider for a role given task context */
export function selectProviderForRole(
  role: import('./types').AgentRole,
  taskKind: import('./types').TaskKind,
  domain?: Domain,
  projectId?: string
): { provider_id: import('./types').Provider; fit_score: number; confidence: number; source: string } | null {
  try {
    const pr = require('./provider-registry') as {
      selectBestProvider(r: string, tk: string, d?: string, p?: string): { provider_id: string; fit_score: number; confidence: number; source: string } | null;
    };
    return pr.selectBestProvider(role, taskKind, domain, projectId) as any;
  } catch { return null; }
}

/** Find matching collaboration contract for a role handoff */
export function selectCollaborationContract(
  fromRole: import('./types').AgentRole,
  toRole: import('./types').AgentRole,
  domain?: Domain,
  projectId?: string
): import('./types').CollaborationContract | null {
  try {
    const cc = require('./collaboration-contracts') as {
      findContract(fr: string, tr: string, d?: string, p?: string): import('./types').CollaborationContract | null;
    };
    return cc.findContract(fromRole, toRole, domain, projectId);
  } catch { return null; }
}

/** Record a handoff between two execution nodes */
export function recordHandoff(
  graphId: string,
  fromNodeId: string,
  toNodeId: string,
  summary: string,
  artifacts: string[] = [],
  openQuestions: string[] = []
): import('./types').ExecutionHandoffRecord | null {
  try {
    const eg = require('./execution-graph') as {
      getNode(id: string): import('./types').ExecutionNode | null;
    };
    const fromNode = eg.getNode(fromNodeId);
    const toNode = eg.getNode(toNodeId);
    if (!fromNode || !toNode) return null;

    const fromProvider = fromNode.assigned_agent.includes('claude') ? 'claude'
      : fromNode.assigned_agent.includes('gemini') ? 'gemini'
      : fromNode.assigned_agent.includes('perplexity') ? 'perplexity' : 'openai';
    const toProvider = toNode.assigned_agent.includes('claude') ? 'claude'
      : toNode.assigned_agent.includes('gemini') ? 'gemini'
      : toNode.assigned_agent.includes('perplexity') ? 'perplexity' : 'openai';

    const fromRole = fromNode.stage === 'research' ? 'researcher'
      : ['implement', 'build', 'code'].includes(fromNode.stage) ? 'builder' : 'reasoner';
    const toRole = toNode.stage === 'research' ? 'researcher'
      : ['implement', 'build', 'code'].includes(toNode.stage) ? 'builder' : 'reasoner';

    // Find matching contract
    const contract = selectCollaborationContract(
      fromRole as import('./types').AgentRole,
      toRole as import('./types').AgentRole
    );

    const cc = require('./collaboration-contracts') as {
      recordHandoff(opts: Record<string, unknown>): import('./types').ExecutionHandoffRecord;
    };
    return cc.recordHandoff({
      graph_id: graphId,
      contract_id: contract?.contract_id,
      from_node_id: fromNodeId,
      to_node_id: toNodeId,
      from_provider: fromProvider,
      to_provider: toProvider,
      from_role: fromRole,
      to_role: toRole,
      summary,
      artifacts,
      open_questions: openQuestions,
      confidence: 70,
      accepted: null,
    });
  } catch { return null; }
}

/** Run reverse prompting on a completed graph */
export function runReversePrompting(graphId: string): import('./types').ReversePromptingRun | null {
  try {
    const rp = require('./reverse-prompting') as {
      runReversePrompting(id: string): import('./types').ReversePromptingRun | null;
    };
    return rp.runReversePrompting(graphId);
  } catch (e) {
    console.error('[chief-of-staff] Reverse prompting failed:', (e as Error).message);
    return null;
  }
}

// ═══════════════════════════════════════════
// Part 22: Governance — Policies, Budgets, Escalation, Documentation
// ═══════════════════════════════════════════

/** Resolve effective operator policies for a given scope */
export function resolvePolicy(domain?: Domain, projectId?: string) {
  try {
    const op = require('./operator-policies') as {
      resolveAllPolicies(d?: string, p?: string): Record<string, { value: string; source: string }>;
    };
    return op.resolveAllPolicies(domain, projectId);
  } catch { return {}; }
}

/** Resolve effective autonomy budget */
export function resolveAutonomyBudget(
  lane: import('./types').Lane, domain?: Domain, projectId?: string
) {
  try {
    const ab = require('./autonomy-budgets') as {
      resolveBudget(l: string, d?: string, p?: string): import('./types').AutonomyBudget;
    };
    return ab.resolveBudget(lane, domain, projectId);
  } catch { return null; }
}

/** Evaluate escalation rules against a graph */
export function evaluateEscalation(graphId: string, nodeId?: string): import('./types').EscalationEvent[] {
  try {
    const eg = require('./escalation-governance') as {
      evaluateEscalation(gid: string, nid?: string): import('./types').EscalationEvent[];
    };
    return eg.evaluateEscalation(graphId, nodeId);
  } catch { return []; }
}

/** Check documentation requirements for a scope */
export function checkDocumentationRequirements(
  scopeType: import('./types').DocScopeType,
  relatedId: string,
  lane: import('./types').Lane
) {
  try {
    const dg = require('./documentation-governance') as {
      checkRequirements(st: string, id: string, l: string): { met: boolean; missing: string[]; present: string[]; block_level: string; blocking: boolean };
    };
    return dg.checkRequirements(scopeType, relatedId, lane);
  } catch { return { met: true, missing: [], present: [], block_level: 'warn', blocking: false }; }
}

/** Apply full governance checks before execution */
export function applyGovernanceBeforeExecution(taskId: string, graphId: string): {
  policies: Record<string, unknown>;
  budget: import('./types').AutonomyBudget | null;
  escalations: import('./types').EscalationEvent[];
  doc_check: { met: boolean; missing: string[]; blocking: boolean };
  can_proceed: boolean;
  blockers: string[];
} {
  // Get task context
  const allTasks = intake.getAllTasks();
  const task = allTasks.find(t => t.task_id === taskId);
  const domain = task?.domain;
  const projectId = (task as any)?.project_id;

  let graph: import('./types').ExecutionGraph | null = null;
  try {
    const eg = require('./execution-graph') as { getGraph(id: string): import('./types').ExecutionGraph | null };
    graph = eg.getGraph(graphId);
  } catch { /* */ }

  const lane = graph?.lane || 'dev';
  const policies = resolvePolicy(domain, projectId);
  const budget = resolveAutonomyBudget(lane, domain, projectId);
  const escalations = evaluateEscalation(graphId);
  const doc_check = checkDocumentationRequirements('execution_graph', graphId, lane);

  const blockers: string[] = [];
  if (doc_check.blocking) blockers.push(`Documentation missing: ${doc_check.missing.join(', ')}`);
  for (const esc of escalations) {
    if (esc.action === 'pause_execution') blockers.push(`Escalation: ${esc.detail}`);
    if (esc.action === 'require_operator_approval') blockers.push(`Approval needed: ${esc.detail}`);
  }

  return {
    policies,
    budget,
    escalations,
    doc_check,
    can_proceed: blockers.length === 0,
    blockers,
  };
}

// ═══════════════════════════════════════════
// Part 23: Simulation, Governance Testing, Release Readiness
// ═══════════════════════════════════════════

/** Run a governance simulation scenario */
export function simulateGovernanceScenario(
  relatedType: import('./types').SimulationScope,
  relatedId: string,
  lane: import('./types').Lane,
  overrides?: import('./types').SimulationOverrides
): import('./types').SimulationResult | null {
  try {
    const ps = require('./policy-simulation') as {
      runSimulation(rt: string, rid: string, l: string, o?: unknown): import('./types').SimulationResult;
    };
    return ps.runSimulation(relatedType, relatedId, lane, overrides);
  } catch { return null; }
}

/** Run a what-if test suite against an entity */
export function runWhatIfTestSuite(
  relatedType: import('./types').SimulationScope,
  relatedId: string
): import('./types').GovernanceTestCase[] {
  try {
    const gt = require('./governance-testing') as {
      runTestSuite(rt: string, rid: string): import('./types').GovernanceTestCase[];
    };
    return gt.runTestSuite(relatedType, relatedId);
  } catch { return []; }
}

/** Compute release readiness score */
export function computeReleaseReadiness(
  relatedType: import('./types').SimulationScope,
  relatedId: string
): import('./types').ReleaseReadinessScore | null {
  try {
    const rr = require('./release-readiness') as {
      computeScore(rt: string, rid: string): import('./types').ReleaseReadinessScore;
    };
    return rr.computeScore(relatedType, relatedId);
  } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 24: Enforcement, Overrides, Promotion Control
// ═══════════════════════════════════════════

/** Evaluate enforcement for an action */
export function evaluateEnforcement(
  relatedType: import('./types').SimulationScope,
  relatedId: string,
  action: import('./types').EnforcementAction,
  lane: import('./types').Lane
): import('./types').EnforcementDecision | null {
  try {
    const ee = require('./enforcement-engine') as {
      evaluate(rt: string, rid: string, a: string, l: string): import('./types').EnforcementDecision;
    };
    return ee.evaluate(relatedType, relatedId, action, lane);
  } catch { return null; }
}

/** Request an override for a blocked action */
export function requestOverride(
  relatedType: import('./types').SimulationScope,
  relatedId: string,
  action: import('./types').EnforcementAction,
  overrideType: import('./types').OverrideType,
  reason: string,
  notes?: string
): import('./types').OverrideEntry | null {
  try {
    const ol = require('./override-ledger') as {
      requestOverride(opts: Record<string, unknown>): import('./types').OverrideEntry;
    };
    return ol.requestOverride({ related_type: relatedType, related_id: relatedId, action, override_type: overrideType, reason, notes });
  } catch { return null; }
}

/** Evaluate whether a dossier can be promoted */
export function resolvePromotionDecision(dossierId: string, targetLane: import('./types').Lane): import('./types').PromotionDecision | null {
  try {
    const pc = require('./promotion-control') as {
      evaluatePromotion(id: string, lane: string): import('./types').PromotionDecision;
    };
    return pc.evaluatePromotion(dossierId, targetLane);
  } catch { return null; }
}

/** Execute promotion with enforcement */
export function applyPromotionControl(dossierId: string, targetLane: import('./types').Lane): {
  decision: import('./types').PromotionDecision | null;
  promoted: boolean;
} {
  try {
    const pc = require('./promotion-control') as {
      executePromotion(id: string, lane: string): { decision: import('./types').PromotionDecision; promoted: boolean };
    };
    return pc.executePromotion(dossierId, targetLane);
  } catch { return { decision: null, promoted: false }; }
}

// ═══════════════════════════════════════════
// Part 25: Exception Analytics, Drift, Tuning
// ═══════════════════════════════════════════

export function analyzeExceptions(domain?: Domain, projectId?: string) {
  try { const ea = require('./exception-analytics') as { aggregate(o?: Record<string, unknown>): unknown }; return ea.aggregate({ domain, project_id: projectId }); } catch { return null; }
}

export function detectGovernanceDrift(scopeLevel: string = 'global', scopeId: string = 'global', domain?: Domain) {
  try { const gd = require('./governance-drift') as { detectDrift(sl: string, si: string, d?: string): unknown }; return gd.detectDrift(scopeLevel, scopeId, domain); } catch { return null; }
}

export function generatePolicyTuning(scopeLevel: string = 'global', scopeId: string = 'global', domain?: Domain) {
  try { const pt = require('./policy-tuning') as { generateRecommendations(sl: string, si: string, d?: string): unknown }; return pt.generateRecommendations(scopeLevel, scopeId, domain); } catch { return []; }
}

export function applyApprovedTuning(decisionId: string) {
  try { const pt = require('./policy-tuning') as { applyRecommendation(id: string): unknown }; return pt.applyRecommendation(decisionId); } catch { return null; }
}

export function getGovernanceHealth(scopeLevel: string = 'global', scopeId: string = 'global', domain?: Domain) {
  try { const pt = require('./policy-tuning') as { computeHealth(sl: string, si: string, d?: string): unknown }; return pt.computeHealth(scopeLevel, scopeId, domain); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 26: Governance Ops, Drift Resolution, Tuning Application
// ═══════════════════════════════════════════

export function getGovernanceOpsView(filters?: Record<string, unknown>) {
  try { const go = require('./governance-ops') as { getOpsView(o?: Record<string, unknown>): unknown }; return go.getOpsView(filters); } catch { return null; }
}

export function resolveScopedDrift(scopeLevel: string = 'global', scopeId: string = 'global', domain?: Domain) {
  try { const sdr = require('./scoped-drift-resolution') as { generateResolutions(sl: string, si: string, d?: string): unknown }; return sdr.generateResolutions(scopeLevel, scopeId, domain); } catch { return []; }
}

export function previewTuningApplication(recId: string) {
  try { const ta = require('./tuning-application') as { previewApplication(id: string): unknown }; return ta.previewApplication(recId); } catch { return null; }
}

export function applyTuningApplication(recId: string, approver: string = 'operator') {
  try { const ta = require('./tuning-application') as { applyTuning(id: string, a: string): unknown }; return ta.applyTuning(recId, approver); } catch { return null; }
}

export function rollbackTuningApplication(rollbackId: string) {
  try { const ta = require('./tuning-application') as { rollback(id: string): unknown }; return ta.rollback(rollbackId); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 27: Runtime Enforcement, Worker Governance, Execution Hooks
// ═══════════════════════════════════════════

export function evaluateRuntimeGovernance(graphId: string, nodeId?: string, action?: string) {
  try { const re = require('./runtime-enforcement') as { checkTransition(t: string, g: string, n?: string): unknown }; return re.checkTransition(action || 'node_start', graphId, nodeId); } catch { return null; }
}

export function getRuntimeEnforcementSummary() {
  try { const re = require('./runtime-enforcement') as { getSummary(): unknown }; return re.getSummary(); } catch { return null; }
}

export function attachExecutionHooks(graphId: string) {
  try { const eh = require('./execution-hooks') as { attachHooks(g: string): unknown }; return eh.attachHooks(graphId); } catch { return []; }
}

export function resolveWorkerDecision(graphId: string, nodeId: string | undefined, action: string) {
  try { const wg = require('./worker-governance') as { evaluateWorkerAction(g: string, n: string | undefined, a: string): unknown }; return wg.evaluateWorkerAction(graphId, nodeId, action); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 28: Override Ops, Exception Lifecycle, Block Resolution
// ═══════════════════════════════════════════

export function getOverrideOperationsView(filters?: Record<string, unknown>) {
  try { const oo = require('./override-operations') as { getOpsView(f?: Record<string, unknown>): unknown }; return oo.getOpsView(filters); } catch { return null; }
}

export function createExceptionCase(sourceType: string, sourceId: string, meta?: Record<string, unknown>) {
  try { const el = require('./exception-lifecycle') as { createCase(o: Record<string, unknown>): unknown }; return el.createCase({ source_type: sourceType, source_id: sourceId, title: `Exception: ${sourceType}:${sourceId}`, ...meta }); } catch { return null; }
}

export function assignExceptionOwner(caseId: string, owner: string) {
  try { const el = require('./exception-lifecycle') as { assignOwner(id: string, o: string): unknown }; return el.assignOwner(caseId, owner); } catch { return null; }
}

export function resolveBlock(blockId: string, outcome: string, notes?: string, overrideId?: string) {
  try { const br = require('./block-resolution') as { resolveBlock(id: string, o: string, n: string, oid?: string): unknown }; return br.resolveBlock(blockId, outcome, notes || '', overrideId); } catch { return null; }
}

export function consumeOverrideAction(overrideId: string, decisionId: string) {
  try { const oo = require('./override-operations') as { consumeOverride(oid: string, did: string): unknown }; return oo.consumeOverride(overrideId, decisionId); } catch { return null; }
}

export function resumeEscalatedExecution(pauseId: string) {
  try { const br = require('./block-resolution') as { resumePause(id: string): unknown }; return br.resumePause(pauseId); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 29: Project Isolation + Pattern Exchange
// ═══════════════════════════════════════════

export function evaluateCrossProjectAccess(sourceProject: string, targetProject: string, artifactType: string, action?: string) {
  try { const pi = require('./project-isolation') as { evaluateAccess(s: string, t: string, a: string, act?: string): unknown }; return pi.evaluateAccess(sourceProject, targetProject, artifactType, action); } catch { return null; }
}

export function createPatternExchangeCandidate(sourceProject: string, artifactRef: string, candidateType: string, title: string, content: string, domain: string) {
  try { const pe = require('./pattern-exchange') as { createCandidate(o: Record<string, unknown>): unknown }; return pe.createCandidate({ source_project: sourceProject, source_domain: domain, candidate_type: candidateType, title, content, artifact_ref: artifactRef }); } catch { return null; }
}

export function approveSharedPattern(candidateId: string, targetScope?: string) {
  try { const pe = require('./pattern-exchange') as { approveCandidate(id: string, s?: string): unknown }; return pe.approveCandidate(candidateId, targetScope); } catch { return null; }
}

export function useSharedPattern(projectId: string, patternId: string, context?: string) {
  try { const pe = require('./pattern-exchange') as { usePattern(pid: string, proj: string, ctx?: string): unknown }; return pe.usePattern(patternId, projectId, context); } catch { return null; }
}

export function recordIsolationViolation(sourceProject: string, targetProject: string, artifactType: string, reason: string) {
  return evaluateCrossProjectAccess(sourceProject, targetProject, artifactType, 'violation_check');
}

// ═══════════════════════════════════════════
// Part 30: Provider Reliability, Cost, Latency
// ═══════════════════════════════════════════

export function getProviderReliability(providerId?: string, domain?: Domain, projectId?: string) {
  try { const pr = require('./provider-reliability') as { computeReliability(id?: string, d?: string, p?: string): unknown }; return pr.computeReliability(providerId, domain, projectId); } catch { return []; }
}

export function evaluateProviderCost(providerId: string, action: string, lane: string, domain?: Domain, projectId?: string) {
  try { const cg = require('./cost-governance') as { evaluateCost(id: string, a: string, l: string, d?: string, p?: string): unknown }; return cg.evaluateCost(providerId, action, lane, domain, projectId); } catch { return null; }
}

export function evaluateProviderLatency(providerId: string, role: string, lane: string, domain?: Domain) {
  try { const lg = require('./latency-governance') as { evaluateLatency(id: string, r: string, l: string, d?: string): unknown }; return lg.evaluateLatency(providerId, role, lane, domain); } catch { return null; }
}

export function chooseProviderWithGovernance(role: string, taskKind: string, domain: Domain, projectId?: string, lane: string = 'dev') {
  // Start with registry selection, then filter by reliability/cost/latency
  const pick = selectProviderForRole(role as any, taskKind as any, domain, projectId);
  if (!pick) return null;

  let reliabilityOk = true;
  try {
    const pr = require('./provider-reliability') as { computeReliability(id: string): import('./types').ProviderReliabilitySnapshot[] };
    const snaps = pr.computeReliability(pick.provider_id);
    if (snaps[0]?.health === 'unstable') reliabilityOk = false;
  } catch { /* */ }

  let costOk = true;
  try {
    const cg = require('./cost-governance') as { evaluateCost(id: string, a: string, l: string, d?: string): import('./types').ProviderCostDecision };
    const cd = cg.evaluateCost(pick.provider_id, 'execute', lane, domain);
    if (cd.outcome === 'hard_block') costOk = false;
  } catch { /* */ }

  return { ...pick, reliability_ok: reliabilityOk, cost_ok: costOk, governed: true };
}

export function recordProviderIncident(providerId: string, incidentType: string, metadata?: Record<string, unknown>) {
  try { const pr = require('./provider-reliability') as { recordIncident(o: Record<string, unknown>): unknown }; return pr.recordIncident({ provider_id: providerId, incident_type: incidentType, detail: (metadata as any)?.detail || incidentType, domain: (metadata as any)?.domain, project_id: (metadata as any)?.project_id, severity: (metadata as any)?.severity }); } catch { return null; }
}

export function getProviderGovernanceSummary() {
  try { const lg = require('./latency-governance') as { getGovernanceSummary(): unknown }; return lg.getGovernanceSummary(); } catch { return []; }
}

// ═══════════════════════════════════════════
// Part 31: Artifact Registry, Evidence Chain, Traceability
// ═══════════════════════════════════════════

export function registerArtifact(artifactType: string, sourceId: string, title: string, metadata?: Record<string, unknown>) {
  try { const ar = require('./artifact-registry') as { register(o: Record<string, unknown>): unknown }; return ar.register({ source_id: sourceId, type: artifactType, title, producer: 'chief_of_staff', ...metadata }); } catch { return null; }
}

export function linkEvidence(sourceId: string, targetId: string, relation: string, notes?: string) {
  try { const ec = require('./evidence-chain') as { link(s: string, t: string, r: string, n?: string): unknown }; return ec.link(sourceId, targetId, relation, notes); } catch { return null; }
}

export function buildEvidenceBundle(relatedType: string, relatedId: string) {
  try { const ec = require('./evidence-chain') as { buildBundle(t: string, id: string): unknown }; return ec.buildBundle(relatedType, relatedId); } catch { return null; }
}

export function getLineageSummary(artifactId: string) {
  try { const ec = require('./evidence-chain') as { getLineage(id: string): unknown }; return ec.getLineage(artifactId); } catch { return null; }
}

export function appendTraceabilityEntry(action: string, targetType: string, targetId: string, metadata?: Record<string, unknown>) {
  try { const tl = require('./traceability-ledger') as { append(o: Record<string, unknown>): unknown }; return tl.append({ actor: 'chief_of_staff', action, target_type: targetType, target_id: targetId, ...metadata }); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 32: Audit Hub, Compliance Export, Policy History
// ═══════════════════════════════════════════

export function getAuditView(filters?: Record<string, unknown>) {
  try { const ah = require('./audit-hub') as { query(f?: Record<string, unknown>): unknown }; return ah.query(filters); } catch { return null; }
}

export function buildAuditPackage(scopeType: string, relatedId: string) {
  try { const ah = require('./audit-hub') as { buildPackage(s: string, id: string): unknown }; return ah.buildPackage(scopeType, relatedId); } catch { return null; }
}

export function exportComplianceBundle(scopeType: string, relatedId: string, opts?: Record<string, unknown>) {
  try { const ce = require('./compliance-export') as { buildExport(r: Record<string, unknown>): unknown }; return ce.buildExport({ scope_type: scopeType, related_id: relatedId, include_evidence: true, include_policies: true, include_overrides: true, redact_sensitive: true, ...opts }); } catch { return null; }
}

export function getPolicyHistory(targetType: string, targetId?: string) {
  try { const ph = require('./policy-history') as { getHistory(t: string, id: string): unknown; getVersionsForType(t: string): unknown }; return targetId ? ph.getHistory(targetType, targetId) : ph.getVersionsForType(targetType); } catch { return null; }
}

export function appendPolicyChangeRecord(targetType: string, targetId: string, beforeState: Record<string, unknown>, afterState: Record<string, unknown>, reason: string, metadata?: Record<string, unknown>) {
  try { const ph = require('./policy-history') as { recordChange(o: Record<string, unknown>): unknown }; return ph.recordChange({ target_type: targetType, target_id: targetId, before_state: beforeState, after_state: afterState, actor: 'chief_of_staff', reason, ...metadata }); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 33: Approval Workspace, Delegation, Escalation Inbox
// ═══════════════════════════════════════════

export function createApprovalRequest(sourceType: string, sourceId: string, title: string, metadata?: Record<string, unknown>) {
  try { const aw = require('./approval-workspace') as { createRequest(o: Record<string, unknown>): unknown }; return aw.createRequest({ source_type: sourceType, source_id: sourceId, title, ...metadata }); } catch { return null; }
}

export function getApprovalWorkspace(filters?: Record<string, unknown>) {
  try { const aw = require('./approval-workspace') as { getWorkspace(f?: Record<string, unknown>): unknown; getSummary(): unknown }; return { items: aw.getWorkspace(filters), summary: aw.getSummary() }; } catch { return null; }
}

export function applyApprovalDecision(requestId: string, decision: string, notes?: string) {
  try { const aw = require('./approval-workspace') as { applyDecision(id: string, d: string, n?: string): unknown }; return aw.applyDecision(requestId, decision as any, notes); } catch { return null; }
}

export function getEscalationInbox(filters?: Record<string, unknown>) {
  try { const ei = require('./escalation-inbox') as { getInbox(f?: Record<string, unknown>): unknown }; return ei.getInbox(filters); } catch { return []; }
}

export function resolveEscalationInboxItem(itemId: string, action: string, notes?: string) {
  try {
    const ei = require('./escalation-inbox') as { resolveItem(id: string, n?: string): unknown; triageItem(id: string, n?: string): unknown; delegateItem(id: string, d: string, n?: string): unknown; dismissItem(id: string, n?: string): unknown };
    if (action === 'resolve') return ei.resolveItem(itemId, notes);
    if (action === 'triage') return ei.triageItem(itemId, notes);
    if (action === 'dismiss') return ei.dismissItem(itemId, notes);
    return ei.resolveItem(itemId, notes);
  } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 34: Release Orchestration, Pipeline, Rollback
// ═══════════════════════════════════════════

export function createReleasePlan(projectId: string, sourceArtifacts: Record<string, string[]>, targetLane: string) {
  try { const ro = require('./release-orchestration') as { createPlan(o: Record<string, unknown>): unknown }; return ro.createPlan({ project_id: projectId, domain: 'general', target_lane: targetLane, title: `Release to ${targetLane}`, ...sourceArtifacts }); } catch { return null; }
}

export function evaluatePromotionPipeline(dossierId: string, targetLane: string) {
  try { const ep = require('./environment-pipeline') as { evaluate(id: string, l: string): unknown }; return ep.evaluate(dossierId, targetLane); } catch { return null; }
}

export function executeReleasePlan(planId: string) {
  try { const ro = require('./release-orchestration') as { executePlan(id: string): unknown }; return ro.executePlan(planId); } catch { return null; }
}

export function verifyReleaseExecution(executionId: string, notes?: string) {
  try { const ro = require('./release-orchestration') as { verifyExecution(id: string, n?: string): unknown }; return ro.verifyExecution(executionId, notes); } catch { return null; }
}

export function createRollbackPlan(releaseExecutionId: string, trigger: string, metadata?: Record<string, unknown>) {
  try { const rc = require('./rollback-control') as { createPlan(o: Record<string, unknown>): unknown }; return rc.createPlan({ release_execution_id: releaseExecutionId, trigger, description: (metadata as any)?.description || trigger, affected_artifacts: (metadata as any)?.affected_artifacts }); } catch { return null; }
}

export function executeRollback(planId: string) {
  try { const rc = require('./rollback-control') as { executePlan(id: string): unknown }; return rc.executePlan(planId); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 35: Collaboration Runtime, Negotiation, Consensus
// ═══════════════════════════════════════════

export function createCollaborationSession(scopeType: string, scopeId: string, participants: Array<{ provider_id: string; role: string }>, protocolType: string, metadata?: Record<string, unknown>) {
  try { const cr = require('./collaboration-runtime') as { createSession(o: Record<string, unknown>): unknown }; return cr.createSession({ scope_type: scopeType, scope_id: scopeId, participants, protocol_type: protocolType, ...metadata }); } catch { return null; }
}

export function recordAgentProposal(sessionId: string, providerId: string, role: string, content: string, confidence: number, rationale: string) {
  try { const cr = require('./collaboration-runtime') as { addProposal(s: string, p: string, r: string, c: string, cf: number, rt: string): unknown }; return cr.addProposal(sessionId, providerId, role, content, confidence, rationale); } catch { return null; }
}

export function runNegotiationProtocol(sessionId: string) {
  try { const np = require('./negotiation-protocols') as { runNegotiation(id: string): unknown }; return np.runNegotiation(sessionId); } catch { return null; }
}

export function computeConsensus(sessionId: string) {
  try { const ac = require('./agent-consensus') as { computeConsensus(id: string): unknown }; return ac.computeConsensus(sessionId); } catch { return null; }
}

export function resolveCollaborationOutcome(sessionId: string) {
  const negotiation = runNegotiationProtocol(sessionId);
  const consensus = computeConsensus(sessionId);
  return { negotiation, consensus };
}

// ═══════════════════════════════════════════
// Part 36: Productization, Tenant Admin, Subscription, Deployment
// ═══════════════════════════════════════════

export function getTenantAdminView(tenantId: string = 'rpgpo') {
  try { const ta = require('./tenant-admin') as { getTenant(id: string): unknown }; return ta.getTenant(tenantId); } catch { return null; }
}

export function evaluateSubscriptionEntitlements(tenantId: string, features: string[]) {
  try { const so = require('./subscription-operations') as { evaluateEntitlements(id: string, f: string[]): unknown }; return so.evaluateEntitlements(tenantId, features); } catch { return []; }
}

export function recordUsageMeter(tenantId: string, meterType: string, amount: number) {
  try { const so = require('./subscription-operations') as { recordUsage(id: string, t: string, a: number): unknown }; return so.recordUsage(tenantId, meterType, amount); } catch { return null; }
}

export function computeDeploymentReadiness(scopeType: string = 'platform', scopeId: string = 'gpo') {
  try { const dr = require('./deployment-readiness') as { computeReadiness(s: string, id: string): unknown }; return dr.computeReadiness(scopeType, scopeId); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 37: Security Hardening, Secret Governance, Data Boundaries
// ═══════════════════════════════════════════

export function evaluateSecretAccess(secretId: string, actor: string, action: string) {
  try { const sg = require('./secret-governance') as { evaluateAccess(id: string, a: string, act: string): unknown }; return sg.evaluateAccess(secretId, actor, action); } catch { return null; }
}

export function getSecurityPosture(scopeType?: string, scopeId?: string) {
  try { const sh = require('./security-hardening') as { runAssessment(s?: string, id?: string): unknown }; return sh.runAssessment(scopeType, scopeId); } catch { return null; }
}

export function evaluateDataBoundary(sourceScope: string, targetScope: string, artifactType: string, action?: string) {
  try { const db = require('./data-boundaries') as { evaluateBoundary(s: string, t: string, a: string, act?: string): unknown }; return db.evaluateBoundary(sourceScope, targetScope, artifactType, action); } catch { return null; }
}

export function recordBoundaryViolation(metadata: Record<string, unknown>) {
  try { const db = require('./data-boundaries') as { recordViolation(s: string, t: string, a: string, sv?: string, d?: string): unknown }; return db.recordViolation(metadata.source_scope as string || '', metadata.target_scope as string || '', metadata.artifact_type as string || '', metadata.severity as string, metadata.detail as string); } catch { return null; }
}

export function getHardeningChecklist() {
  try { const sh = require('./security-hardening') as { getChecklist(): unknown }; return sh.getChecklist(); } catch { return []; }
}

// ═══════════════════════════════════════════
// Part 38: Observability, Reliability, SLO/SLA
// ═══════════════════════════════════════════

export function getObservabilityView(filters?: Record<string, unknown>) {
  try { const obs = require('./observability') as { getMetrics(f?: Record<string, unknown>): unknown; query(f?: Record<string, unknown>): unknown }; return { metrics: obs.getMetrics(filters), events: (obs.query(filters) as any[]).slice(0, 20) }; } catch { return null; }
}

export function getReliabilitySummary() {
  try { const rg = require('./reliability-governance') as { getServiceHealth(): unknown }; return rg.getServiceHealth(); } catch { return null; }
}

export function getSLOStatus() {
  try { const slo = require('./slo-sla') as { getStatuses(): unknown }; return slo.getStatuses(); } catch { return []; }
}

export function recordReliabilityIncident(subsystem: string, title: string, detail: string, metadata?: Record<string, unknown>) {
  try { const rg = require('./reliability-governance') as { recordIncident(o: Record<string, unknown>): unknown }; return rg.recordIncident({ subsystem, title, detail, ...metadata }); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 39: Skill Packs, Engine Templates, Capability Composer
// ═══════════════════════════════════════════

export function createSkillPack(definition: Record<string, unknown>) {
  try { const sp = require('./skill-packs') as { createPack(d: Record<string, unknown>): unknown }; return sp.createPack(definition); } catch { return null; }
}

export function bindSkillPack(scopeType: string, scopeId: string, packId: string) {
  try { const sp = require('./skill-packs') as { bindPack(pid: string, st: string, si: string): unknown }; return sp.bindPack(packId, scopeType, scopeId); } catch { return null; }
}

export function createEngineTemplate(definition: Record<string, unknown>) {
  try { const et = require('./engine-templates') as { createTemplate(d: Record<string, unknown>): unknown }; return et.createTemplate(definition); } catch { return null; }
}

export function instantiateEngineTemplate(templateId: string, tenantId: string, engineId: string, domain: string) {
  try { const et = require('./engine-templates') as { instantiate(t: string, tn: string, e: string, d: string): unknown }; return et.instantiate(templateId, tenantId, engineId, domain); } catch { return null; }
}

export function composeDomainCapabilities(engineId: string, projectId?: string) {
  try { const dc = require('./domain-capability-composer') as { compose(e: string, p?: string): unknown }; return dc.compose(engineId, projectId); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 40: Extensions, Marketplace, Integration Governance
// ═══════════════════════════════════════════

export function createExtensionPackage(definition: Record<string, unknown>) {
  try { const ef = require('./extension-framework') as { createPackage(d: Record<string, unknown>): unknown }; return ef.createPackage(definition); } catch { return null; }
}

export function installExtension(extensionId: string, tenantId: string, scope?: string) {
  try { const ef = require('./extension-framework') as { installPackage(id: string, t: string, s?: string): unknown }; return ef.installPackage(extensionId, tenantId, scope); } catch { return null; }
}

export function publishMarketplaceListing(assetRef: string, assetType: string, metadata: Record<string, unknown>) {
  try { const mp = require('./marketplace') as { publish(o: Record<string, unknown>): unknown }; return mp.publish({ asset_type: assetType, asset_ref: assetRef, ...metadata }); } catch { return null; }
}

export function evaluateIntegrationAccess(integrationId: string, tenantId: string, action?: string) {
  try { const ig = require('./integration-governance') as { evaluateAccess(id: string, t: string, a?: string): unknown }; return ig.evaluateAccess(integrationId, tenantId, action); } catch { return null; }
}

export function getMarketplaceSummary() {
  try { const mp = require('./marketplace') as { getSummary(): unknown }; return mp.getSummary(); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 41: UI Surface Audit + Readiness
// ═══════════════════════════════════════════

export function getUISurfaceAudit() {
  try { const ua = require('./ui-surface-audit') as { runAudit(): unknown }; return ua.runAudit(); } catch { return null; }
}

export function getUIReadiness() {
  try { const ur = require('./ui-readiness') as { computeReadiness(): unknown }; return ur.computeReadiness(); } catch { return null; }
}

export function getUIWiringGaps(area?: string) {
  try { const udw = require('./ui-data-wiring') as { getWiringGaps(a?: string): unknown }; return udw.getWiringGaps(area); } catch { return []; }
}

// ═══════════════════════════════════════════
// Part 42: Workflow Activation + E2E Flow + Actions
// ═══════════════════════════════════════════

export function getWorkflowActivationReport() {
  try { const wa = require('./workflow-activation') as { getReport(): unknown }; return wa.getReport(); } catch { return null; }
}

export function runE2EFlowCheck(flowId: string) {
  try { const ef = require('./e2e-flow-state') as { runFlow(id: string): unknown }; return ef.runFlow(flowId); } catch { return null; }
}

export function getOperatorActions(area?: string) {
  try { const oa = require('./operator-actions') as { getActions(a?: string): unknown; getActionSummary(): unknown }; return { actions: oa.getActions(area), summary: oa.getActionSummary() }; } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 43: Action Visibility + Runtime Completion
// ═══════════════════════════════════════════

export function getVisibleOperatorActions(area?: string) {
  try { const av = require('./action-visibility') as { getVisibleActions(a?: string): unknown }; return av.getVisibleActions(area); } catch { return []; }
}

export function getRuntimeCompletionReport() {
  try { const rc = require('./runtime-enforcement-completion') as { getReport(): unknown }; return rc.getReport(); } catch { return null; }
}

export function getActionVisibilityGaps() {
  try { const av = require('./action-visibility') as { getGaps(): unknown }; return av.getGaps(); } catch { return []; }
}

// ═══════════════════════════════════════════
// Part 44: UX Polish, Navigation, Targeted Refresh
// ═══════════════════════════════════════════

export function getUXConsistencyReport() {
  try { const ux = require('./ux-polish') as { getConsistencyReport(): unknown }; return ux.getConsistencyReport(); } catch { return null; }
}

export function getNavigationMap() {
  try { const nc = require('./navigation-consistency') as { getMap(): unknown }; return nc.getMap(); } catch { return []; }
}

export function getNavigationGaps() {
  try { const nc = require('./navigation-consistency') as { getGaps(): unknown }; return nc.getGaps(); } catch { return []; }
}

export function getTargetedRefreshPlans(area?: string) {
  try { const tr = require('./targeted-refresh') as { getPlans(): unknown; getPlanForArea(a: string): unknown }; return area ? tr.getPlanForArea(area) : tr.getPlans(); } catch { return area ? null : []; }
}

export function getOperatorJourneys() {
  try { const ux = require('./ux-polish') as { getJourneys(): unknown }; return ux.getJourneys(); } catch { return []; }
}

// ═══════════════════════════════════════════
// Part 45: Real Telemetry + Measured Reliability + Alert Routing
// ═══════════════════════════════════════════

export function getTelemetryWiringReport() {
  try { const tw = require('./telemetry-wiring') as { getWiringReport(): unknown }; return tw.getWiringReport(); } catch { return null; }
}

export function getMeasuredReliability(scope?: string) {
  try { const mr = require('./measured-reliability') as { computeReliability(s?: string): unknown }; return mr.computeReliability(scope); } catch { return null; }
}

export function getAlertRoutingSummary() {
  try { const ar = require('./alert-routing') as { getRoutingHistory(): unknown; getBreaches(): unknown }; return { routes: ar.getRoutingHistory(), breaches: ar.getBreaches() }; } catch { return null; }
}

export function runAlertCheck() {
  try { const ar = require('./alert-routing') as { runAlertCheck(): unknown }; return ar.runAlertCheck(); } catch { return []; }
}

// ═══════════════════════════════════════════
// Part 46: Isolation + Entitlement + Boundary Enforcement
// ═══════════════════════════════════════════

export function evaluateTenantIsolation(sourceTenant: string, targetTenant: string, action?: string) {
  try { const tir = require('./tenant-isolation-runtime') as { evaluate(s: string, t: string, a?: string): unknown }; return tir.evaluate(sourceTenant, targetTenant, action); } catch { return null; }
}

export function evaluateAPIEntitlement(route: string, tenantId?: string) {
  try { const aee = require('./api-entitlement-enforcement') as { evaluate(r: string, t?: string): unknown }; return aee.evaluate(route, tenantId); } catch { return null; }
}

export function evaluateBoundaryEnforcement(requestType: string, sourceScope: string, targetScope: string, artifactType: string) {
  try { const be = require('./boundary-enforcement') as { enforce(rt: string, ss: string, ts: string, at: string): unknown }; return be.enforce(requestType, sourceScope, targetScope, artifactType); } catch { return null; }
}

export function getIsolationEnforcementReport() {
  try { const be = require('./boundary-enforcement') as { getReport(): unknown }; return be.getReport(); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 47: Runtime Capability Activation
// ═══════════════════════════════════════════

export function activateComposedCapabilities(engineId: string, projectId?: string) {
  try { const rca = require('./runtime-capability-activation') as { activate(e: string, p?: string): unknown }; return rca.activate(engineId, projectId); } catch { return []; }
}

export function bindTemplateRuntime(templateId: string, engineId: string, projectId?: string) {
  try { const trb = require('./template-runtime-binding') as { bind(t: string, e: string, p?: string): unknown }; return trb.bind(templateId, engineId, projectId); } catch { return null; }
}

export function evaluateExtensionPermissions(extensionId: string, permission: string, action?: string) {
  try { const epe = require('./extension-permission-enforcement') as { evaluate(id: string, p: string, a?: string): unknown }; return epe.evaluate(extensionId, permission, action); } catch { return null; }
}

export function getRuntimeActivationReport() {
  try { const rca = require('./runtime-capability-activation') as { getReport(): unknown }; return rca.getReport(); } catch { return null; }
}

export function getCapabilityConflicts(engineId?: string) {
  try { const rca = require('./runtime-capability-activation') as { getConflicts(e?: string): unknown }; return rca.getConflicts(engineId); } catch { return []; }
}

// ═══════════════════════════════════════════
// Part 48: Production Readiness Closure + Operator Acceptance
// ═══════════════════════════════════════════

export function getProductionReadinessClosure() {
  try { const prc = require('./production-readiness-closure') as { computeClosure(): unknown }; return prc.computeClosure(); } catch { return null; }
}

export function getLiveIntegrationStatus(area?: string) {
  try { const lih = require('./live-integration-hardening') as { getStatus(a?: string): unknown; getSummary(): unknown }; return area ? lih.getStatus(area) : { statuses: lih.getStatus(), summary: lih.getSummary() }; } catch { return null; }
}

export function runOperatorAcceptance() {
  try { const oa = require('./operator-acceptance') as { runAcceptance(): unknown }; return oa.runAcceptance(); } catch { return null; }
}

export function getShipReadinessDecision() {
  try { const prc = require('./production-readiness-closure') as { getShipDecision(): unknown }; return prc.getShipDecision(); } catch { return null; }
}

// ═══════════════════════════════════════════
// Part 49: Ship Blocker Closure + Middleware + Workflow Completion
// ═══════════════════════════════════════════

export function getShipBlockerSummary() {
  try { const sbc = require('./ship-blocker-closure') as { getSummary(): unknown; getBlockers(): unknown }; return { summary: sbc.getSummary(), blockers: sbc.getBlockers() }; } catch { return null; }
}

export function getMiddlewareCoverageReport() {
  try { const me = require('./middleware-enforcement') as { getCoverageReport(): unknown }; return me.getCoverageReport(); } catch { return []; }
}

export function getWorkflowCompletionReport() {
  try { const owc = require('./operator-workflow-completion') as { getCompletionReport(): unknown }; return owc.getCompletionReport(); } catch { return null; }
}

export function resolveShipBlocker(blockerId: string, evidence?: string) {
  try { const sbc = require('./ship-blocker-closure') as { resolveBlocker(id: string, e?: string): unknown }; return sbc.resolveBlocker(blockerId, evidence); } catch { return null; }
}

// Part 50: Go-Live Closure + Provider Gating + Readiness Reconciliation
export function getGoLiveClosureReport() {
  try { const glc = require('./go-live-closure') as { getClosureReport(): unknown }; return glc.getClosureReport(); } catch { return null; }
}
export function evaluateReleaseProviderGating(releaseId?: string) {
  try { const rpg = require('./release-provider-gating') as { evaluateProviderGating(id: string): unknown }; return rpg.evaluateProviderGating(releaseId || 'current'); } catch { return null; }
}
export function getReadinessReconciliation() {
  try { const rr = require('./readiness-reconciliation') as { reconcile(): unknown }; return rr.reconcile(); } catch { return null; }
}

// Part 51: Protected Path Validation + Middleware Truth + Enforcement Evidence
export function getProtectedPathSummary() {
  try { const ppv = require('./protected-path-validation') as { getSummary(): unknown }; return ppv.getSummary(); } catch { return null; }
}
export function runProtectedPathValidation(pathId?: string) {
  try {
    const ppv = require('./protected-path-validation') as { validatePath(id: string): unknown; validateAll(): unknown };
    return pathId ? ppv.validatePath(pathId) : ppv.validateAll();
  } catch { return null; }
}
export function getMiddlewareTruthReport() {
  try { const lmw = require('./live-middleware-wiring') as { getTruthReport(): unknown }; return lmw.getTruthReport(); } catch { return null; }
}
export function getEnforcementEvidence(scopeType?: string, scopeId?: string) {
  try {
    const ee = require('./enforcement-evidence') as { getEvidence(a?: string): unknown; getEvidenceByScope(st: string, si: string): unknown };
    return (scopeType && scopeId) ? ee.getEvidenceByScope(scopeType, scopeId) : ee.getEvidence(scopeType);
  } catch { return null; }
}

// Part 52: HTTP Middleware Validation + Final Blocker Reconciliation + Final Ship Decision
export function runHTTPMiddlewareValidation() {
  try { const hmv = require('./http-middleware-validation') as { runValidation(): unknown }; return hmv.runValidation(); } catch { return null; }
}
export function getFinalBlockerReconciliation() {
  try { const fbr = require('./final-blocker-reconciliation') as { reconcile(): unknown }; return fbr.reconcile(); } catch { return null; }
}
export function getFinalWorkflowClosure() {
  try { const fsd = require('./final-ship-decision') as { getWorkflowClosure(): unknown }; return fsd.getWorkflowClosure(); } catch { return null; }
}
export function getFinalShipDecisionReport() {
  try { const fsd = require('./final-ship-decision') as { computeDecision(): unknown }; return fsd.computeDecision(); } catch { return null; }
}

// Part 53: Network HTTP Validation + Reliability Closure + Clean-State Go
export async function runNetworkHTTPValidation() {
  try { const nhv = require('./network-http-validation') as { runValidation(): Promise<unknown> }; return await nhv.runValidation(); } catch { return null; }
}
export function getReliabilityClosureReport() {
  try { const rc = require('./reliability-closure') as { computeClosure(): unknown }; return rc.computeClosure(); } catch { return null; }
}
export function runCleanStateVerification() {
  try { const csv = require('./clean-state-verification') as { verify(): unknown }; return csv.verify(); } catch { return null; }
}
export function getFinalGoVerificationReport() {
  try { const csv = require('./clean-state-verification') as { computeFinalGoVerification(): unknown }; return csv.computeFinalGoVerification(); } catch { return null; }
}

// Part 54: Live Server Proof + Go Authorization
export async function runLiveServerProof() {
  try { const lsp = require('./live-server-proof') as { runProof(): Promise<unknown> }; return await lsp.runProof(); } catch { return null; }
}
export function getValidationHarnessState() {
  try { const vho = require('./validation-harness-orchestrator') as { getLatestExecution(): unknown }; return vho.getLatestExecution(); } catch { return null; }
}
export function getGoAuthorizationDecision() {
  try { const ga = require('./go-authorization') as { computeAuthorization(): unknown }; return ga.computeAuthorization(); } catch { return null; }
}

// Part 55: Inline Route Enforcement + Final Unconditional Go
export function getRouteMiddlewareCoverage() {
  try { const rme = require('./route-middleware-enforcement') as { getCoverage(): unknown }; return rme.getCoverage(); } catch { return null; }
}
export async function runFinalGoProof() {
  try { const fgp = require('./final-go-proof') as { runProof(): Promise<unknown> }; return await fgp.runProof(); } catch { return null; }
}
export function getUnconditionalGoReport() {
  try { const fgp = require('./final-go-proof') as { getUnconditionalGoReport(): unknown }; return fgp.getUnconditionalGoReport(); } catch { return null; }
}

// Part 56: Route Protection Expansion + Mutation Guards + Deep Redaction
export function getRouteProtectionExpansionReport() {
  try { const rpe = require('./route-protection-expansion') as { getExpansionReport(): unknown }; return rpe.getExpansionReport(); } catch { return null; }
}
export function getMutationProtectionReport() {
  try { const mg = require('./mutation-route-guards') as { getReport(): unknown }; return mg.getReport(); } catch { return null; }
}
export function getDeepRedactionReport() {
  try { const dr = require('./deep-redaction') as { getReport(): unknown }; return dr.getReport(); } catch { return null; }
}
export function getProtectionRegressionChecks() {
  try {
    const checks: Array<{ check_id: string; area: string; passed: boolean; detail: string }> = [];
    // Verify ship-critical guards still work
    const hrg = require('./http-response-guard') as { guard(r: string, t: string, p: string): { allowed: boolean; outcome: string } };
    const d1 = hrg.guard('/api/tenant-admin', 'rpgpo-other', 'default');
    checks.push({ check_id: 'reg_isolation', area: 'tenant_isolation', passed: !d1.allowed, detail: d1.allowed ? 'REGRESSION: cross-tenant not denied' : 'Cross-tenant correctly denied' });
    const d2 = hrg.guard('/api/tenant-admin', 'free_tenant', 'default');
    checks.push({ check_id: 'reg_entitlement', area: 'entitlement', passed: !d2.allowed, detail: d2.allowed ? 'REGRESSION: non-entitled not denied' : 'Non-entitled correctly denied' });
    const d3 = hrg.guard('/api/audit-hub', 'rpgpo', 'other-project');
    checks.push({ check_id: 'reg_boundary', area: 'boundary_redaction', passed: d3.outcome === 'redact', detail: d3.outcome === 'redact' ? 'Redaction correctly applied' : `REGRESSION: expected redact, got ${d3.outcome}` });
    const d4 = hrg.guard('/api/audit-hub', 'rpgpo', 'default');
    checks.push({ check_id: 'reg_allow', area: 'same_scope_allow', passed: d4.allowed, detail: d4.allowed ? 'Same-scope correctly allowed' : 'REGRESSION: same-scope denied' });
    return checks;
  } catch { return []; }
}

// Part 57: Product Shell + Output Surfacing + Task Experience
export function getProductShellState() {
  try { const ps = require('./product-shell') as { getConsolidationReport(): unknown }; return ps.getConsolidationReport(); } catch { return null; }
}
export function getOutputSurfacingReport() {
  try { const fos = require('./final-output-surfacing') as { getSurfacingReport(): unknown }; return fos.getSurfacingReport(); } catch { return null; }
}
export function getTaskExperienceReport() {
  try { const te = require('./task-experience') as { getAllExperiences(): unknown }; return te.getAllExperiences(); } catch { return null; }
}

// Part 58: Engine Catalog + Output Contracts + Mission Acceptance
export function getEngineCatalogSummary() {
  try { const ec = require('./engine-catalog') as { getCatalogSummary(): unknown }; return ec.getCatalogSummary(); } catch { return null; }
}
export function getOutputContractReport() {
  try { const oc = require('./output-contracts') as { getVisibilityReport(): unknown }; return oc.getVisibilityReport(); } catch { return null; }
}
export function validateTaskAgainstOutputContract(taskId: string) {
  try { const oc = require('./output-contracts') as { validateTask(id: string): unknown }; return oc.validateTask(taskId); } catch { return null; }
}
export function getMissionAcceptanceSummary() {
  try { const mas = require('./mission-acceptance-suite') as { getRunSummary(): unknown }; return mas.getRunSummary(); } catch { return null; }
}

// Part 59: Structured Deliverables + Contract Enforcement + Rendering
export function getBoardContractContext(engineId: string) {
  try { const ce = require('./contract-enforcement') as { buildBoardContractContext(id: string): unknown }; return ce.buildBoardContractContext(engineId); } catch { return null; }
}
export function getDeliverable(taskId: string) {
  try { const ce = require('./contract-enforcement') as { getDeliverable(id: string): unknown }; return ce.getDeliverable(taskId); } catch { return null; }
}
export function renderDeliverable(taskId: string) {
  try {
    const ce = require('./contract-enforcement') as { getDeliverable(id: string): import('./types').StructuredDeliverable | null; enforceAtCompletion(id: string, eid: string): import('./types').ContractEnforcementResult };
    const dr = require('./deliverable-rendering') as { toRenderModel(eid: string, d: import('./types').StructuredDeliverable, e?: import('./types').ContractEnforcementResult): import('./types').RenderModel };
    const d = ce.getDeliverable(taskId);
    if (!d) return null;
    const enforcement = ce.enforceAtCompletion(taskId, d.engineId);
    const model = dr.toRenderModel(d.engineId, d, enforcement);
    return { deliverable: d, model, enforcement };
  } catch { return null; }
}
export function validateDeliverableForTask(taskId: string) {
  try {
    const ce = require('./contract-enforcement') as { getDeliverable(id: string): import('./types').StructuredDeliverable | null; enforceAtCompletion(id: string, eid: string): unknown };
    const d = ce.getDeliverable(taskId);
    if (!d) return { status: 'hard_fail', missingFields: ['no_deliverable'] };
    return ce.enforceAtCompletion(taskId, d.engineId);
  } catch { return null; }
}

// Part 60: Deliverable Store
export function getDeliverableStoreIndex() {
  try { const ds = require('./deliverable-store') as { getStoreIndex(): unknown }; return ds.getStoreIndex(); } catch { return null; }
}
export function getStoredDeliverable(deliverableId: string, version?: number) {
  try {
    const ds = require('./deliverable-store') as { getLatest(id: string): unknown; getByVersion(id: string, v: number): unknown };
    return version ? ds.getByVersion(deliverableId, version) : ds.getLatest(deliverableId);
  } catch { return null; }
}
export function getDeliverableHistory(deliverableId: string) {
  try { const ds = require('./deliverable-store') as { listHistory(id: string): unknown }; return ds.listHistory(deliverableId); } catch { return null; }
}
export function migrateDeliverables() {
  try { const ds = require('./deliverable-store') as { migrateFlatStore(): unknown }; return ds.migrateFlatStore(); } catch { return null; }
}

module.exports = {
  interpretBoardResult,
  getNextBestActions, getEngineActions, getProjectActions,
  generateBrief,
  // Part 20
  buildWorkOrder, createExecutionGraph,
  attachApprovalGates, attachReviewContracts,
  generatePromotionDossier, orchestrateTask,
  // Part 21
  selectProviderForRole, selectCollaborationContract,
  recordHandoff, runReversePrompting,
  // Part 22
  resolvePolicy, resolveAutonomyBudget,
  evaluateEscalation, checkDocumentationRequirements,
  applyGovernanceBeforeExecution,
  // Part 23
  simulateGovernanceScenario, runWhatIfTestSuite,
  computeReleaseReadiness,
  // Part 24
  evaluateEnforcement, requestOverride,
  resolvePromotionDecision, applyPromotionControl,
  // Part 25
  analyzeExceptions, detectGovernanceDrift,
  generatePolicyTuning, applyApprovedTuning,
  getGovernanceHealth,
  // Part 26
  getGovernanceOpsView, resolveScopedDrift,
  previewTuningApplication, applyTuningApplication,
  rollbackTuningApplication,
  // Part 27
  evaluateRuntimeGovernance, getRuntimeEnforcementSummary,
  attachExecutionHooks, resolveWorkerDecision,
  // Part 28
  getOverrideOperationsView, createExceptionCase,
  assignExceptionOwner, resolveBlock,
  consumeOverrideAction, resumeEscalatedExecution,
  // Part 29
  evaluateCrossProjectAccess, createPatternExchangeCandidate,
  approveSharedPattern, useSharedPattern, recordIsolationViolation,
  // Part 30
  getProviderReliability, evaluateProviderCost, evaluateProviderLatency,
  chooseProviderWithGovernance, recordProviderIncident, getProviderGovernanceSummary,
  // Part 31
  registerArtifact, linkEvidence, buildEvidenceBundle,
  getLineageSummary, appendTraceabilityEntry,
  // Part 32
  getAuditView, buildAuditPackage, exportComplianceBundle,
  getPolicyHistory, appendPolicyChangeRecord,
  // Part 33
  createApprovalRequest, getApprovalWorkspace, applyApprovalDecision,
  getEscalationInbox, resolveEscalationInboxItem,
  // Part 34
  createReleasePlan, evaluatePromotionPipeline, executeReleasePlan,
  verifyReleaseExecution, createRollbackPlan, executeRollback,
  // Part 35
  createCollaborationSession, recordAgentProposal, runNegotiationProtocol,
  computeConsensus, resolveCollaborationOutcome,
  // Part 36
  getTenantAdminView, evaluateSubscriptionEntitlements,
  recordUsageMeter, computeDeploymentReadiness,
  // Part 37
  evaluateSecretAccess, getSecurityPosture, evaluateDataBoundary,
  recordBoundaryViolation, getHardeningChecklist,
  // Part 38
  getObservabilityView, getReliabilitySummary, getSLOStatus,
  recordReliabilityIncident,
  // Part 39
  createSkillPack, bindSkillPack, createEngineTemplate,
  instantiateEngineTemplate, composeDomainCapabilities,
  // Part 40
  createExtensionPackage, installExtension, publishMarketplaceListing,
  evaluateIntegrationAccess, getMarketplaceSummary,
  // Part 41
  getUISurfaceAudit, getUIReadiness, getUIWiringGaps,
  // Part 42
  getWorkflowActivationReport, runE2EFlowCheck, getOperatorActions,
  // Part 43
  getVisibleOperatorActions, getRuntimeCompletionReport, getActionVisibilityGaps,
  // Part 44
  getUXConsistencyReport, getNavigationMap, getNavigationGaps,
  getTargetedRefreshPlans, getOperatorJourneys,
  // Part 45
  getTelemetryWiringReport, getMeasuredReliability,
  getAlertRoutingSummary, runAlertCheck,
  // Part 46
  evaluateTenantIsolation, evaluateAPIEntitlement,
  evaluateBoundaryEnforcement, getIsolationEnforcementReport,
  // Part 47
  activateComposedCapabilities, bindTemplateRuntime,
  evaluateExtensionPermissions, getRuntimeActivationReport,
  getCapabilityConflicts,
  // Part 48
  getProductionReadinessClosure, getLiveIntegrationStatus,
  runOperatorAcceptance, getShipReadinessDecision,
  // Part 49
  getShipBlockerSummary, getMiddlewareCoverageReport,
  getWorkflowCompletionReport, resolveShipBlocker,
  // Part 50
  getGoLiveClosureReport, evaluateReleaseProviderGating,
  getReadinessReconciliation,
  // Part 51
  getProtectedPathSummary, runProtectedPathValidation,
  getMiddlewareTruthReport, getEnforcementEvidence,
  // Part 52
  runHTTPMiddlewareValidation, getFinalBlockerReconciliation,
  getFinalWorkflowClosure, getFinalShipDecisionReport,
  // Part 53
  runNetworkHTTPValidation, getReliabilityClosureReport,
  runCleanStateVerification, getFinalGoVerificationReport,
  // Part 54
  runLiveServerProof, getValidationHarnessState,
  getGoAuthorizationDecision,
  // Part 55
  getRouteMiddlewareCoverage, runFinalGoProof,
  getUnconditionalGoReport,
  // Part 56
  getRouteProtectionExpansionReport, getMutationProtectionReport,
  getDeepRedactionReport, getProtectionRegressionChecks,
  // Part 57
  getProductShellState, getOutputSurfacingReport,
  getTaskExperienceReport,
  // Part 58
  getEngineCatalogSummary, getOutputContractReport,
  validateTaskAgainstOutputContract, getMissionAcceptanceSummary,
  // Part 59
  getBoardContractContext, getDeliverable,
  renderDeliverable, validateDeliverableForTask,
  // Part 60
  getDeliverableStoreIndex, getStoredDeliverable,
  getDeliverableHistory, migrateDeliverables,
};
