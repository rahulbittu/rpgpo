"use strict";
// GPO Chief of Staff Layer
// Sits between Board of AI synthesis and execution.
// Interprets board results, routes work, generates next-best-actions,
// and keeps the operator focused on what matters most.
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpretBoardResult = interpretBoardResult;
exports.getNextBestActions = getNextBestActions;
exports.getEngineActions = getEngineActions;
exports.getProjectActions = getProjectActions;
exports.generateBrief = generateBrief;
exports.buildWorkOrder = buildWorkOrder;
exports.createExecutionGraph = createExecutionGraph;
exports.attachApprovalGates = attachApprovalGates;
exports.attachReviewContracts = attachReviewContracts;
exports.generatePromotionDossier = generatePromotionDossier;
exports.orchestrateTask = orchestrateTask;
exports.selectProviderForRole = selectProviderForRole;
exports.selectCollaborationContract = selectCollaborationContract;
exports.recordHandoff = recordHandoff;
exports.runReversePrompting = runReversePrompting;
exports.resolvePolicy = resolvePolicy;
exports.resolveAutonomyBudget = resolveAutonomyBudget;
exports.evaluateEscalation = evaluateEscalation;
exports.checkDocumentationRequirements = checkDocumentationRequirements;
exports.applyGovernanceBeforeExecution = applyGovernanceBeforeExecution;
exports.simulateGovernanceScenario = simulateGovernanceScenario;
exports.runWhatIfTestSuite = runWhatIfTestSuite;
exports.computeReleaseReadiness = computeReleaseReadiness;
exports.evaluateEnforcement = evaluateEnforcement;
exports.requestOverride = requestOverride;
exports.resolvePromotionDecision = resolvePromotionDecision;
exports.applyPromotionControl = applyPromotionControl;
exports.analyzeExceptions = analyzeExceptions;
exports.detectGovernanceDrift = detectGovernanceDrift;
exports.generatePolicyTuning = generatePolicyTuning;
exports.applyApprovedTuning = applyApprovedTuning;
exports.getGovernanceHealth = getGovernanceHealth;
exports.getGovernanceOpsView = getGovernanceOpsView;
exports.resolveScopedDrift = resolveScopedDrift;
exports.previewTuningApplication = previewTuningApplication;
exports.applyTuningApplication = applyTuningApplication;
exports.rollbackTuningApplication = rollbackTuningApplication;
exports.evaluateRuntimeGovernance = evaluateRuntimeGovernance;
exports.getRuntimeEnforcementSummary = getRuntimeEnforcementSummary;
exports.attachExecutionHooks = attachExecutionHooks;
exports.resolveWorkerDecision = resolveWorkerDecision;
exports.getOverrideOperationsView = getOverrideOperationsView;
exports.createExceptionCase = createExceptionCase;
exports.assignExceptionOwner = assignExceptionOwner;
exports.resolveBlock = resolveBlock;
exports.consumeOverrideAction = consumeOverrideAction;
exports.resumeEscalatedExecution = resumeEscalatedExecution;
exports.evaluateCrossProjectAccess = evaluateCrossProjectAccess;
exports.createPatternExchangeCandidate = createPatternExchangeCandidate;
exports.approveSharedPattern = approveSharedPattern;
exports.useSharedPattern = useSharedPattern;
exports.recordIsolationViolation = recordIsolationViolation;
exports.getProviderReliability = getProviderReliability;
exports.evaluateProviderCost = evaluateProviderCost;
exports.evaluateProviderLatency = evaluateProviderLatency;
exports.chooseProviderWithGovernance = chooseProviderWithGovernance;
exports.recordProviderIncident = recordProviderIncident;
exports.getProviderGovernanceSummary = getProviderGovernanceSummary;
exports.registerArtifact = registerArtifact;
exports.linkEvidence = linkEvidence;
exports.buildEvidenceBundle = buildEvidenceBundle;
exports.getLineageSummary = getLineageSummary;
exports.appendTraceabilityEntry = appendTraceabilityEntry;
exports.getAuditView = getAuditView;
exports.buildAuditPackage = buildAuditPackage;
exports.exportComplianceBundle = exportComplianceBundle;
exports.getPolicyHistory = getPolicyHistory;
exports.appendPolicyChangeRecord = appendPolicyChangeRecord;
exports.createApprovalRequest = createApprovalRequest;
exports.getApprovalWorkspace = getApprovalWorkspace;
exports.applyApprovalDecision = applyApprovalDecision;
exports.getEscalationInbox = getEscalationInbox;
exports.resolveEscalationInboxItem = resolveEscalationInboxItem;
exports.createReleasePlan = createReleasePlan;
exports.evaluatePromotionPipeline = evaluatePromotionPipeline;
exports.executeReleasePlan = executeReleasePlan;
exports.verifyReleaseExecution = verifyReleaseExecution;
exports.createRollbackPlan = createRollbackPlan;
exports.executeRollback = executeRollback;
exports.createCollaborationSession = createCollaborationSession;
exports.recordAgentProposal = recordAgentProposal;
exports.runNegotiationProtocol = runNegotiationProtocol;
exports.computeConsensus = computeConsensus;
exports.resolveCollaborationOutcome = resolveCollaborationOutcome;
exports.getTenantAdminView = getTenantAdminView;
exports.evaluateSubscriptionEntitlements = evaluateSubscriptionEntitlements;
exports.recordUsageMeter = recordUsageMeter;
exports.computeDeploymentReadiness = computeDeploymentReadiness;
exports.evaluateSecretAccess = evaluateSecretAccess;
exports.getSecurityPosture = getSecurityPosture;
exports.evaluateDataBoundary = evaluateDataBoundary;
exports.recordBoundaryViolation = recordBoundaryViolation;
exports.getHardeningChecklist = getHardeningChecklist;
exports.getObservabilityView = getObservabilityView;
exports.getReliabilitySummary = getReliabilitySummary;
exports.getSLOStatus = getSLOStatus;
exports.recordReliabilityIncident = recordReliabilityIncident;
exports.createSkillPack = createSkillPack;
exports.bindSkillPack = bindSkillPack;
exports.createEngineTemplate = createEngineTemplate;
exports.instantiateEngineTemplate = instantiateEngineTemplate;
exports.composeDomainCapabilities = composeDomainCapabilities;
exports.createExtensionPackage = createExtensionPackage;
exports.installExtension = installExtension;
exports.publishMarketplaceListing = publishMarketplaceListing;
exports.evaluateIntegrationAccess = evaluateIntegrationAccess;
exports.getMarketplaceSummary = getMarketplaceSummary;
exports.getUISurfaceAudit = getUISurfaceAudit;
exports.getUIReadiness = getUIReadiness;
exports.getUIWiringGaps = getUIWiringGaps;
exports.getWorkflowActivationReport = getWorkflowActivationReport;
exports.runE2EFlowCheck = runE2EFlowCheck;
exports.getOperatorActions = getOperatorActions;
exports.getVisibleOperatorActions = getVisibleOperatorActions;
exports.getRuntimeCompletionReport = getRuntimeCompletionReport;
exports.getActionVisibilityGaps = getActionVisibilityGaps;
exports.getUXConsistencyReport = getUXConsistencyReport;
exports.getNavigationMap = getNavigationMap;
exports.getNavigationGaps = getNavigationGaps;
exports.getTargetedRefreshPlans = getTargetedRefreshPlans;
exports.getOperatorJourneys = getOperatorJourneys;
exports.getTelemetryWiringReport = getTelemetryWiringReport;
exports.getMeasuredReliability = getMeasuredReliability;
exports.getAlertRoutingSummary = getAlertRoutingSummary;
exports.runAlertCheck = runAlertCheck;
exports.evaluateTenantIsolation = evaluateTenantIsolation;
exports.evaluateAPIEntitlement = evaluateAPIEntitlement;
exports.evaluateBoundaryEnforcement = evaluateBoundaryEnforcement;
exports.getIsolationEnforcementReport = getIsolationEnforcementReport;
exports.activateComposedCapabilities = activateComposedCapabilities;
exports.bindTemplateRuntime = bindTemplateRuntime;
exports.evaluateExtensionPermissions = evaluateExtensionPermissions;
exports.getRuntimeActivationReport = getRuntimeActivationReport;
exports.getCapabilityConflicts = getCapabilityConflicts;
exports.getProductionReadinessClosure = getProductionReadinessClosure;
exports.getLiveIntegrationStatus = getLiveIntegrationStatus;
exports.runOperatorAcceptance = runOperatorAcceptance;
exports.getShipReadinessDecision = getShipReadinessDecision;
exports.getShipBlockerSummary = getShipBlockerSummary;
exports.getMiddlewareCoverageReport = getMiddlewareCoverageReport;
exports.getWorkflowCompletionReport = getWorkflowCompletionReport;
exports.resolveShipBlocker = resolveShipBlocker;
exports.getGoLiveClosureReport = getGoLiveClosureReport;
exports.evaluateReleaseProviderGating = evaluateReleaseProviderGating;
exports.getReadinessReconciliation = getReadinessReconciliation;
exports.getProtectedPathSummary = getProtectedPathSummary;
exports.runProtectedPathValidation = runProtectedPathValidation;
exports.getMiddlewareTruthReport = getMiddlewareTruthReport;
exports.getEnforcementEvidence = getEnforcementEvidence;
exports.runHTTPMiddlewareValidation = runHTTPMiddlewareValidation;
exports.getFinalBlockerReconciliation = getFinalBlockerReconciliation;
exports.getFinalWorkflowClosure = getFinalWorkflowClosure;
exports.getFinalShipDecisionReport = getFinalShipDecisionReport;
exports.runNetworkHTTPValidation = runNetworkHTTPValidation;
exports.getReliabilityClosureReport = getReliabilityClosureReport;
exports.runCleanStateVerification = runCleanStateVerification;
exports.getFinalGoVerificationReport = getFinalGoVerificationReport;
exports.runLiveServerProof = runLiveServerProof;
exports.getValidationHarnessState = getValidationHarnessState;
exports.getGoAuthorizationDecision = getGoAuthorizationDecision;
exports.getRouteMiddlewareCoverage = getRouteMiddlewareCoverage;
exports.runFinalGoProof = runFinalGoProof;
exports.getUnconditionalGoReport = getUnconditionalGoReport;
exports.getRouteProtectionExpansionReport = getRouteProtectionExpansionReport;
exports.getMutationProtectionReport = getMutationProtectionReport;
exports.getDeepRedactionReport = getDeepRedactionReport;
exports.getProtectionRegressionChecks = getProtectionRegressionChecks;
exports.getProductShellState = getProductShellState;
exports.getOutputSurfacingReport = getOutputSurfacingReport;
exports.getTaskExperienceReport = getTaskExperienceReport;
exports.getEngineCatalogSummary = getEngineCatalogSummary;
exports.getOutputContractReport = getOutputContractReport;
exports.validateTaskAgainstOutputContract = validateTaskAgainstOutputContract;
exports.getMissionAcceptanceSummary = getMissionAcceptanceSummary;
exports.getBoardContractContext = getBoardContractContext;
exports.getDeliverable = getDeliverable;
exports.renderDeliverable = renderDeliverable;
exports.validateDeliverableForTask = validateDeliverableForTask;
exports.getDeliverableStoreIndex = getDeliverableStoreIndex;
exports.getStoredDeliverable = getStoredDeliverable;
exports.getDeliverableHistory = getDeliverableHistory;
exports.migrateDeliverables = migrateDeliverables;
exports.mergeDeliverableFragments = mergeDeliverableFragments;
exports.validateMergedDeliverable = validateMergedDeliverable;
exports.diffDeliverableVersions = diffDeliverableVersions;
exports.attachDeliverableEvidence = attachDeliverableEvidence;
exports.proposeDeliverable = proposeDeliverable;
exports.approveDeliverable = approveDeliverable;
exports.rejectDeliverable = rejectDeliverable;
exports.getDeliverableApprovalRequests = getDeliverableApprovalRequests;
exports.buildReleaseCandidate = buildReleaseCandidate;
exports.getReleaseCandidates = getReleaseCandidates;
exports.getCurrentRelease = getCurrentRelease;
const context = require('./context');
const engines = require('./engines');
const projects = require('./projects');
const missions = require('./mission-statements');
const intake = require('./intake');
const autonomy = require('./autonomy');
function uid() {
    return 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
// ═══════════════════════════════════════════
// Board Interpretation
// ═══════════════════════════════════════════
/** Interpret a board result and produce a Chief of Staff routing decision */
function interpretBoardResult(task) {
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
    const concerns = [];
    if (delib.key_unknowns?.length)
        concerns.push(...delib.key_unknowns.slice(0, 3));
    if (delib.approval_points?.length)
        concerns.push(...delib.approval_points.slice(0, 2));
    if (hasRedRisk)
        concerns.push('Contains red-risk subtasks requiring explicit approval');
    let route = 'Execute plan with standard governance';
    if (hasRedRisk)
        route = 'Requires operator review before any execution';
    else if (hasCodeWork && hasYellowRisk)
        route = 'Code changes need review — builder execution with approval gates';
    else if (!hasCodeWork && !hasYellowRisk)
        route = 'Low-risk research/analysis — can auto-execute green subtasks';
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
function getNextBestActions(limit = 10) {
    const allActions = [];
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
            scope_id: blocker.domain || 'general',
            domain: blocker.domain || 'general',
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
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    allActions.sort((a, b) => {
        const pa = priorityOrder[a.priority];
        const pb = priorityOrder[b.priority];
        if (pa !== pb)
            return pa - pb;
        if (a.needs_approval !== b.needs_approval)
            return a.needs_approval ? -1 : 1;
        return 0;
    });
    return allActions.slice(0, limit);
}
/** Get next actions scoped to a specific engine */
function getEngineActions(domain, limit = 5) {
    return getNextBestActions(50).filter(a => a.domain === domain).slice(0, limit);
}
/** Get next actions scoped to a specific project */
function getProjectActions(projectId, domain, limit = 5) {
    const project = projects.getDefaultProject(domain);
    if (!project || project.project_id !== projectId)
        return [];
    const actions = [];
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
function generateBrief() {
    const operator = context.getOperatorProfile();
    const allEngineList = engines.getAllEngines();
    const allActions = getNextBestActions(20);
    const blockers = autonomy.getAllBlockers();
    // Build per-engine recommendations
    const byEngine = [];
    for (const engine of allEngineList) {
        const engineActions = allActions.filter(a => a.domain === engine.domain);
        const missionStatement = missions.getEngineStatement(engine.domain);
        const ctx = engines.getEngineContext(engine.domain);
        let health = 'idle';
        const hasBlockers = engineActions.some(a => a.blocked);
        const hasWork = engineActions.length > 0;
        if (hasBlockers)
            health = 'blocked';
        else if (engineActions.some(a => a.priority === 'critical' || a.priority === 'high'))
            health = 'needs_attention';
        else if (hasWork)
            health = 'healthy';
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
    const missionHealth = [];
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
        let alignment = 'no_statement';
        let reason = 'No engine mission statement set';
        if (stmt) {
            if (hasBlockedWork) {
                alignment = 'stalled';
                reason = 'Has blocked work — needs attention';
            }
            else if (hasActiveWork) {
                alignment = 'on_track';
                reason = 'Active work aligned with mission';
            }
            else {
                alignment = 'drifting';
                reason = 'No active work — consider new initiatives';
            }
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
/** Build a work order from a task's board decision */
function buildWorkOrder(taskId) {
    const allTasks = intake.getAllTasks();
    const task = allTasks.find(t => t.task_id === taskId);
    if (!task || !task.board_deliberation)
        return null;
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
        project_id: task.project_id,
        lane: 'dev', // default lane
        board_rationale: delib.interpreted_objective + '. ' + delib.recommended_strategy,
        chief_of_staff_plan: plan,
        risk_level: delib.risk_level,
        is_code_task: delib.is_code_task,
        node_count: delib.subtasks?.length || 0,
    };
}
/** Create an execution graph from a work order */
function createExecutionGraph(taskId) {
    const workOrder = buildWorkOrder(taskId);
    if (!workOrder)
        return null;
    try {
        const eg = require('./execution-graph');
        const allTasks = intake.getAllTasks();
        const task = allTasks.find(t => t.task_id === taskId);
        if (!task)
            return null;
        return eg.buildFromDeliberation(task, workOrder.chief_of_staff_plan);
    }
    catch (e) {
        console.error('[chief-of-staff] Failed to create execution graph:', e.message);
        return null;
    }
}
/** Attach approval gates to an execution graph */
function attachApprovalGates(graphId) {
    try {
        const eg = require('./execution-graph');
        const ag = require('./approval-gates');
        const graph = eg.getGraph(graphId);
        if (!graph)
            return [];
        // Determine risk from graph context
        const allTasks = intake.getAllTasks();
        const task = allTasks.find(t => t.task_id === graph.task_id);
        const riskLevel = task?.board_deliberation?.risk_level || task?.risk_level || 'green';
        const gates = ag.attachDefaultGates(graphId, graph.lane, riskLevel);
        return gates.map(g => g.gate_id);
    }
    catch (e) {
        console.error('[chief-of-staff] Failed to attach gates:', e.message);
        return [];
    }
}
/** Attach review contracts to an execution graph */
function attachReviewContracts(graphId) {
    try {
        const eg = require('./execution-graph');
        const rc = require('./review-contracts');
        const graph = eg.getGraph(graphId);
        if (!graph)
            return [];
        const allTasks = intake.getAllTasks();
        const task = allTasks.find(t => t.task_id === graph.task_id);
        const riskLevel = task?.board_deliberation?.risk_level || task?.risk_level || 'green';
        const isCodeTask = task?.board_deliberation?.is_code_task || false;
        const reviews = rc.attachDefaultReviews(graphId, graph.lane, riskLevel, isCodeTask);
        return reviews.map(r => r.review_id);
    }
    catch (e) {
        console.error('[chief-of-staff] Failed to attach reviews:', e.message);
        return [];
    }
}
/** Generate a promotion dossier from a completed execution graph */
function generatePromotionDossier(graphId) {
    try {
        const pd = require('./promotion-dossiers');
        return pd.generateDossier(graphId);
    }
    catch (e) {
        console.error('[chief-of-staff] Failed to generate dossier:', e.message);
        return null;
    }
}
/** Full orchestration: build work order → create graph → attach gates → attach reviews */
function orchestrateTask(taskId) {
    const graph = createExecutionGraph(taskId);
    if (!graph)
        return { graph: null, gate_ids: [], review_ids: [] };
    const gate_ids = attachApprovalGates(graph.graph_id);
    const review_ids = attachReviewContracts(graph.graph_id);
    return { graph, gate_ids, review_ids };
}
// ═══════════════════════════════════════════
// Part 21: Provider Selection + Collaboration + Reverse Prompting
// ═══════════════════════════════════════════
/** Select the best provider for a role given task context */
function selectProviderForRole(role, taskKind, domain, projectId) {
    try {
        const pr = require('./provider-registry');
        return pr.selectBestProvider(role, taskKind, domain, projectId);
    }
    catch {
        return null;
    }
}
/** Find matching collaboration contract for a role handoff */
function selectCollaborationContract(fromRole, toRole, domain, projectId) {
    try {
        const cc = require('./collaboration-contracts');
        return cc.findContract(fromRole, toRole, domain, projectId);
    }
    catch {
        return null;
    }
}
/** Record a handoff between two execution nodes */
function recordHandoff(graphId, fromNodeId, toNodeId, summary, artifacts = [], openQuestions = []) {
    try {
        const eg = require('./execution-graph');
        const fromNode = eg.getNode(fromNodeId);
        const toNode = eg.getNode(toNodeId);
        if (!fromNode || !toNode)
            return null;
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
        const contract = selectCollaborationContract(fromRole, toRole);
        const cc = require('./collaboration-contracts');
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
    }
    catch {
        return null;
    }
}
/** Run reverse prompting on a completed graph */
function runReversePrompting(graphId) {
    try {
        const rp = require('./reverse-prompting');
        return rp.runReversePrompting(graphId);
    }
    catch (e) {
        console.error('[chief-of-staff] Reverse prompting failed:', e.message);
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 22: Governance — Policies, Budgets, Escalation, Documentation
// ═══════════════════════════════════════════
/** Resolve effective operator policies for a given scope */
function resolvePolicy(domain, projectId) {
    try {
        const op = require('./operator-policies');
        return op.resolveAllPolicies(domain, projectId);
    }
    catch {
        return {};
    }
}
/** Resolve effective autonomy budget */
function resolveAutonomyBudget(lane, domain, projectId) {
    try {
        const ab = require('./autonomy-budgets');
        return ab.resolveBudget(lane, domain, projectId);
    }
    catch {
        return null;
    }
}
/** Evaluate escalation rules against a graph */
function evaluateEscalation(graphId, nodeId) {
    try {
        const eg = require('./escalation-governance');
        return eg.evaluateEscalation(graphId, nodeId);
    }
    catch {
        return [];
    }
}
/** Check documentation requirements for a scope */
function checkDocumentationRequirements(scopeType, relatedId, lane) {
    try {
        const dg = require('./documentation-governance');
        return dg.checkRequirements(scopeType, relatedId, lane);
    }
    catch {
        return { met: true, missing: [], present: [], block_level: 'warn', blocking: false };
    }
}
/** Apply full governance checks before execution */
function applyGovernanceBeforeExecution(taskId, graphId) {
    // Get task context
    const allTasks = intake.getAllTasks();
    const task = allTasks.find(t => t.task_id === taskId);
    const domain = task?.domain;
    const projectId = task?.project_id;
    let graph = null;
    try {
        const eg = require('./execution-graph');
        graph = eg.getGraph(graphId);
    }
    catch { /* */ }
    const lane = graph?.lane || 'dev';
    const policies = resolvePolicy(domain, projectId);
    const budget = resolveAutonomyBudget(lane, domain, projectId);
    const escalations = evaluateEscalation(graphId);
    const doc_check = checkDocumentationRequirements('execution_graph', graphId, lane);
    const blockers = [];
    if (doc_check.blocking)
        blockers.push(`Documentation missing: ${doc_check.missing.join(', ')}`);
    for (const esc of escalations) {
        if (esc.action === 'pause_execution')
            blockers.push(`Escalation: ${esc.detail}`);
        if (esc.action === 'require_operator_approval')
            blockers.push(`Approval needed: ${esc.detail}`);
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
function simulateGovernanceScenario(relatedType, relatedId, lane, overrides) {
    try {
        const ps = require('./policy-simulation');
        return ps.runSimulation(relatedType, relatedId, lane, overrides);
    }
    catch {
        return null;
    }
}
/** Run a what-if test suite against an entity */
function runWhatIfTestSuite(relatedType, relatedId) {
    try {
        const gt = require('./governance-testing');
        return gt.runTestSuite(relatedType, relatedId);
    }
    catch {
        return [];
    }
}
/** Compute release readiness score */
function computeReleaseReadiness(relatedType, relatedId) {
    try {
        const rr = require('./release-readiness');
        return rr.computeScore(relatedType, relatedId);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 24: Enforcement, Overrides, Promotion Control
// ═══════════════════════════════════════════
/** Evaluate enforcement for an action */
function evaluateEnforcement(relatedType, relatedId, action, lane) {
    try {
        const ee = require('./enforcement-engine');
        return ee.evaluate(relatedType, relatedId, action, lane);
    }
    catch {
        return null;
    }
}
/** Request an override for a blocked action */
function requestOverride(relatedType, relatedId, action, overrideType, reason, notes) {
    try {
        const ol = require('./override-ledger');
        return ol.requestOverride({ related_type: relatedType, related_id: relatedId, action, override_type: overrideType, reason, notes });
    }
    catch {
        return null;
    }
}
/** Evaluate whether a dossier can be promoted */
function resolvePromotionDecision(dossierId, targetLane) {
    try {
        const pc = require('./promotion-control');
        return pc.evaluatePromotion(dossierId, targetLane);
    }
    catch {
        return null;
    }
}
/** Execute promotion with enforcement */
function applyPromotionControl(dossierId, targetLane) {
    try {
        const pc = require('./promotion-control');
        return pc.executePromotion(dossierId, targetLane);
    }
    catch {
        return { decision: null, promoted: false };
    }
}
// ═══════════════════════════════════════════
// Part 25: Exception Analytics, Drift, Tuning
// ═══════════════════════════════════════════
function analyzeExceptions(domain, projectId) {
    try {
        const ea = require('./exception-analytics');
        return ea.aggregate({ domain, project_id: projectId });
    }
    catch {
        return null;
    }
}
function detectGovernanceDrift(scopeLevel = 'global', scopeId = 'global', domain) {
    try {
        const gd = require('./governance-drift');
        return gd.detectDrift(scopeLevel, scopeId, domain);
    }
    catch {
        return null;
    }
}
function generatePolicyTuning(scopeLevel = 'global', scopeId = 'global', domain) {
    try {
        const pt = require('./policy-tuning');
        return pt.generateRecommendations(scopeLevel, scopeId, domain);
    }
    catch {
        return [];
    }
}
function applyApprovedTuning(decisionId) {
    try {
        const pt = require('./policy-tuning');
        return pt.applyRecommendation(decisionId);
    }
    catch {
        return null;
    }
}
function getGovernanceHealth(scopeLevel = 'global', scopeId = 'global', domain) {
    try {
        const pt = require('./policy-tuning');
        return pt.computeHealth(scopeLevel, scopeId, domain);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 26: Governance Ops, Drift Resolution, Tuning Application
// ═══════════════════════════════════════════
function getGovernanceOpsView(filters) {
    try {
        const go = require('./governance-ops');
        return go.getOpsView(filters);
    }
    catch {
        return null;
    }
}
function resolveScopedDrift(scopeLevel = 'global', scopeId = 'global', domain) {
    try {
        const sdr = require('./scoped-drift-resolution');
        return sdr.generateResolutions(scopeLevel, scopeId, domain);
    }
    catch {
        return [];
    }
}
function previewTuningApplication(recId) {
    try {
        const ta = require('./tuning-application');
        return ta.previewApplication(recId);
    }
    catch {
        return null;
    }
}
function applyTuningApplication(recId, approver = 'operator') {
    try {
        const ta = require('./tuning-application');
        return ta.applyTuning(recId, approver);
    }
    catch {
        return null;
    }
}
function rollbackTuningApplication(rollbackId) {
    try {
        const ta = require('./tuning-application');
        return ta.rollback(rollbackId);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 27: Runtime Enforcement, Worker Governance, Execution Hooks
// ═══════════════════════════════════════════
function evaluateRuntimeGovernance(graphId, nodeId, action) {
    try {
        const re = require('./runtime-enforcement');
        return re.checkTransition(action || 'node_start', graphId, nodeId);
    }
    catch {
        return null;
    }
}
function getRuntimeEnforcementSummary() {
    try {
        const re = require('./runtime-enforcement');
        return re.getSummary();
    }
    catch {
        return null;
    }
}
function attachExecutionHooks(graphId) {
    try {
        const eh = require('./execution-hooks');
        return eh.attachHooks(graphId);
    }
    catch {
        return [];
    }
}
function resolveWorkerDecision(graphId, nodeId, action) {
    try {
        const wg = require('./worker-governance');
        return wg.evaluateWorkerAction(graphId, nodeId, action);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 28: Override Ops, Exception Lifecycle, Block Resolution
// ═══════════════════════════════════════════
function getOverrideOperationsView(filters) {
    try {
        const oo = require('./override-operations');
        return oo.getOpsView(filters);
    }
    catch {
        return null;
    }
}
function createExceptionCase(sourceType, sourceId, meta) {
    try {
        const el = require('./exception-lifecycle');
        return el.createCase({ source_type: sourceType, source_id: sourceId, title: `Exception: ${sourceType}:${sourceId}`, ...meta });
    }
    catch {
        return null;
    }
}
function assignExceptionOwner(caseId, owner) {
    try {
        const el = require('./exception-lifecycle');
        return el.assignOwner(caseId, owner);
    }
    catch {
        return null;
    }
}
function resolveBlock(blockId, outcome, notes, overrideId) {
    try {
        const br = require('./block-resolution');
        return br.resolveBlock(blockId, outcome, notes || '', overrideId);
    }
    catch {
        return null;
    }
}
function consumeOverrideAction(overrideId, decisionId) {
    try {
        const oo = require('./override-operations');
        return oo.consumeOverride(overrideId, decisionId);
    }
    catch {
        return null;
    }
}
function resumeEscalatedExecution(pauseId) {
    try {
        const br = require('./block-resolution');
        return br.resumePause(pauseId);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 29: Project Isolation + Pattern Exchange
// ═══════════════════════════════════════════
function evaluateCrossProjectAccess(sourceProject, targetProject, artifactType, action) {
    try {
        const pi = require('./project-isolation');
        return pi.evaluateAccess(sourceProject, targetProject, artifactType, action);
    }
    catch {
        return null;
    }
}
function createPatternExchangeCandidate(sourceProject, artifactRef, candidateType, title, content, domain) {
    try {
        const pe = require('./pattern-exchange');
        return pe.createCandidate({ source_project: sourceProject, source_domain: domain, candidate_type: candidateType, title, content, artifact_ref: artifactRef });
    }
    catch {
        return null;
    }
}
function approveSharedPattern(candidateId, targetScope) {
    try {
        const pe = require('./pattern-exchange');
        return pe.approveCandidate(candidateId, targetScope);
    }
    catch {
        return null;
    }
}
function useSharedPattern(projectId, patternId, context) {
    try {
        const pe = require('./pattern-exchange');
        return pe.usePattern(patternId, projectId, context);
    }
    catch {
        return null;
    }
}
function recordIsolationViolation(sourceProject, targetProject, artifactType, reason) {
    return evaluateCrossProjectAccess(sourceProject, targetProject, artifactType, 'violation_check');
}
// ═══════════════════════════════════════════
// Part 30: Provider Reliability, Cost, Latency
// ═══════════════════════════════════════════
function getProviderReliability(providerId, domain, projectId) {
    try {
        const pr = require('./provider-reliability');
        return pr.computeReliability(providerId, domain, projectId);
    }
    catch {
        return [];
    }
}
function evaluateProviderCost(providerId, action, lane, domain, projectId) {
    try {
        const cg = require('./cost-governance');
        return cg.evaluateCost(providerId, action, lane, domain, projectId);
    }
    catch {
        return null;
    }
}
function evaluateProviderLatency(providerId, role, lane, domain) {
    try {
        const lg = require('./latency-governance');
        return lg.evaluateLatency(providerId, role, lane, domain);
    }
    catch {
        return null;
    }
}
function chooseProviderWithGovernance(role, taskKind, domain, projectId, lane = 'dev') {
    // Start with registry selection, then filter by reliability/cost/latency
    const pick = selectProviderForRole(role, taskKind, domain, projectId);
    if (!pick)
        return null;
    let reliabilityOk = true;
    try {
        const pr = require('./provider-reliability');
        const snaps = pr.computeReliability(pick.provider_id);
        if (snaps[0]?.health === 'unstable')
            reliabilityOk = false;
    }
    catch { /* */ }
    let costOk = true;
    try {
        const cg = require('./cost-governance');
        const cd = cg.evaluateCost(pick.provider_id, 'execute', lane, domain);
        if (cd.outcome === 'hard_block')
            costOk = false;
    }
    catch { /* */ }
    return { ...pick, reliability_ok: reliabilityOk, cost_ok: costOk, governed: true };
}
function recordProviderIncident(providerId, incidentType, metadata) {
    try {
        const pr = require('./provider-reliability');
        return pr.recordIncident({ provider_id: providerId, incident_type: incidentType, detail: metadata?.detail || incidentType, domain: metadata?.domain, project_id: metadata?.project_id, severity: metadata?.severity });
    }
    catch {
        return null;
    }
}
function getProviderGovernanceSummary() {
    try {
        const lg = require('./latency-governance');
        return lg.getGovernanceSummary();
    }
    catch {
        return [];
    }
}
// ═══════════════════════════════════════════
// Part 31: Artifact Registry, Evidence Chain, Traceability
// ═══════════════════════════════════════════
function registerArtifact(artifactType, sourceId, title, metadata) {
    try {
        const ar = require('./artifact-registry');
        return ar.register({ source_id: sourceId, type: artifactType, title, producer: 'chief_of_staff', ...metadata });
    }
    catch {
        return null;
    }
}
function linkEvidence(sourceId, targetId, relation, notes) {
    try {
        const ec = require('./evidence-chain');
        return ec.link(sourceId, targetId, relation, notes);
    }
    catch {
        return null;
    }
}
function buildEvidenceBundle(relatedType, relatedId) {
    try {
        const ec = require('./evidence-chain');
        return ec.buildBundle(relatedType, relatedId);
    }
    catch {
        return null;
    }
}
function getLineageSummary(artifactId) {
    try {
        const ec = require('./evidence-chain');
        return ec.getLineage(artifactId);
    }
    catch {
        return null;
    }
}
function appendTraceabilityEntry(action, targetType, targetId, metadata) {
    try {
        const tl = require('./traceability-ledger');
        return tl.append({ actor: 'chief_of_staff', action, target_type: targetType, target_id: targetId, ...metadata });
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 32: Audit Hub, Compliance Export, Policy History
// ═══════════════════════════════════════════
function getAuditView(filters) {
    try {
        const ah = require('./audit-hub');
        return ah.query(filters);
    }
    catch {
        return null;
    }
}
function buildAuditPackage(scopeType, relatedId) {
    try {
        const ah = require('./audit-hub');
        return ah.buildPackage(scopeType, relatedId);
    }
    catch {
        return null;
    }
}
function exportComplianceBundle(scopeType, relatedId, opts) {
    try {
        const ce = require('./compliance-export');
        return ce.buildExport({ scope_type: scopeType, related_id: relatedId, include_evidence: true, include_policies: true, include_overrides: true, redact_sensitive: true, ...opts });
    }
    catch {
        return null;
    }
}
function getPolicyHistory(targetType, targetId) {
    try {
        const ph = require('./policy-history');
        return targetId ? ph.getHistory(targetType, targetId) : ph.getVersionsForType(targetType);
    }
    catch {
        return null;
    }
}
function appendPolicyChangeRecord(targetType, targetId, beforeState, afterState, reason, metadata) {
    try {
        const ph = require('./policy-history');
        return ph.recordChange({ target_type: targetType, target_id: targetId, before_state: beforeState, after_state: afterState, actor: 'chief_of_staff', reason, ...metadata });
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 33: Approval Workspace, Delegation, Escalation Inbox
// ═══════════════════════════════════════════
function createApprovalRequest(sourceType, sourceId, title, metadata) {
    try {
        const aw = require('./approval-workspace');
        return aw.createRequest({ source_type: sourceType, source_id: sourceId, title, ...metadata });
    }
    catch {
        return null;
    }
}
function getApprovalWorkspace(filters) {
    try {
        const aw = require('./approval-workspace');
        return { items: aw.getWorkspace(filters), summary: aw.getSummary() };
    }
    catch {
        return null;
    }
}
function applyApprovalDecision(requestId, decision, notes) {
    try {
        const aw = require('./approval-workspace');
        return aw.applyDecision(requestId, decision, notes);
    }
    catch {
        return null;
    }
}
function getEscalationInbox(filters) {
    try {
        const ei = require('./escalation-inbox');
        return ei.getInbox(filters);
    }
    catch {
        return [];
    }
}
function resolveEscalationInboxItem(itemId, action, notes) {
    try {
        const ei = require('./escalation-inbox');
        if (action === 'resolve')
            return ei.resolveItem(itemId, notes);
        if (action === 'triage')
            return ei.triageItem(itemId, notes);
        if (action === 'dismiss')
            return ei.dismissItem(itemId, notes);
        return ei.resolveItem(itemId, notes);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 34: Release Orchestration, Pipeline, Rollback
// ═══════════════════════════════════════════
function createReleasePlan(projectId, sourceArtifacts, targetLane) {
    try {
        const ro = require('./release-orchestration');
        return ro.createPlan({ project_id: projectId, domain: 'general', target_lane: targetLane, title: `Release to ${targetLane}`, ...sourceArtifacts });
    }
    catch {
        return null;
    }
}
function evaluatePromotionPipeline(dossierId, targetLane) {
    try {
        const ep = require('./environment-pipeline');
        return ep.evaluate(dossierId, targetLane);
    }
    catch {
        return null;
    }
}
function executeReleasePlan(planId) {
    try {
        const ro = require('./release-orchestration');
        return ro.executePlan(planId);
    }
    catch {
        return null;
    }
}
function verifyReleaseExecution(executionId, notes) {
    try {
        const ro = require('./release-orchestration');
        return ro.verifyExecution(executionId, notes);
    }
    catch {
        return null;
    }
}
function createRollbackPlan(releaseExecutionId, trigger, metadata) {
    try {
        const rc = require('./rollback-control');
        return rc.createPlan({ release_execution_id: releaseExecutionId, trigger, description: metadata?.description || trigger, affected_artifacts: metadata?.affected_artifacts });
    }
    catch {
        return null;
    }
}
function executeRollback(planId) {
    try {
        const rc = require('./rollback-control');
        return rc.executePlan(planId);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 35: Collaboration Runtime, Negotiation, Consensus
// ═══════════════════════════════════════════
function createCollaborationSession(scopeType, scopeId, participants, protocolType, metadata) {
    try {
        const cr = require('./collaboration-runtime');
        return cr.createSession({ scope_type: scopeType, scope_id: scopeId, participants, protocol_type: protocolType, ...metadata });
    }
    catch {
        return null;
    }
}
function recordAgentProposal(sessionId, providerId, role, content, confidence, rationale) {
    try {
        const cr = require('./collaboration-runtime');
        return cr.addProposal(sessionId, providerId, role, content, confidence, rationale);
    }
    catch {
        return null;
    }
}
function runNegotiationProtocol(sessionId) {
    try {
        const np = require('./negotiation-protocols');
        return np.runNegotiation(sessionId);
    }
    catch {
        return null;
    }
}
function computeConsensus(sessionId) {
    try {
        const ac = require('./agent-consensus');
        return ac.computeConsensus(sessionId);
    }
    catch {
        return null;
    }
}
function resolveCollaborationOutcome(sessionId) {
    const negotiation = runNegotiationProtocol(sessionId);
    const consensus = computeConsensus(sessionId);
    return { negotiation, consensus };
}
// ═══════════════════════════════════════════
// Part 36: Productization, Tenant Admin, Subscription, Deployment
// ═══════════════════════════════════════════
function getTenantAdminView(tenantId = 'rpgpo') {
    try {
        const ta = require('./tenant-admin');
        return ta.getTenant(tenantId);
    }
    catch {
        return null;
    }
}
function evaluateSubscriptionEntitlements(tenantId, features) {
    try {
        const so = require('./subscription-operations');
        return so.evaluateEntitlements(tenantId, features);
    }
    catch {
        return [];
    }
}
function recordUsageMeter(tenantId, meterType, amount) {
    try {
        const so = require('./subscription-operations');
        return so.recordUsage(tenantId, meterType, amount);
    }
    catch {
        return null;
    }
}
function computeDeploymentReadiness(scopeType = 'platform', scopeId = 'gpo') {
    try {
        const dr = require('./deployment-readiness');
        return dr.computeReadiness(scopeType, scopeId);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 37: Security Hardening, Secret Governance, Data Boundaries
// ═══════════════════════════════════════════
function evaluateSecretAccess(secretId, actor, action) {
    try {
        const sg = require('./secret-governance');
        return sg.evaluateAccess(secretId, actor, action);
    }
    catch {
        return null;
    }
}
function getSecurityPosture(scopeType, scopeId) {
    try {
        const sh = require('./security-hardening');
        return sh.runAssessment(scopeType, scopeId);
    }
    catch {
        return null;
    }
}
function evaluateDataBoundary(sourceScope, targetScope, artifactType, action) {
    try {
        const db = require('./data-boundaries');
        return db.evaluateBoundary(sourceScope, targetScope, artifactType, action);
    }
    catch {
        return null;
    }
}
function recordBoundaryViolation(metadata) {
    try {
        const db = require('./data-boundaries');
        return db.recordViolation(metadata.source_scope || '', metadata.target_scope || '', metadata.artifact_type || '', metadata.severity, metadata.detail);
    }
    catch {
        return null;
    }
}
function getHardeningChecklist() {
    try {
        const sh = require('./security-hardening');
        return sh.getChecklist();
    }
    catch {
        return [];
    }
}
// ═══════════════════════════════════════════
// Part 38: Observability, Reliability, SLO/SLA
// ═══════════════════════════════════════════
function getObservabilityView(filters) {
    try {
        const obs = require('./observability');
        return { metrics: obs.getMetrics(filters), events: obs.query(filters).slice(0, 20) };
    }
    catch {
        return null;
    }
}
function getReliabilitySummary() {
    try {
        const rg = require('./reliability-governance');
        return rg.getServiceHealth();
    }
    catch {
        return null;
    }
}
function getSLOStatus() {
    try {
        const slo = require('./slo-sla');
        return slo.getStatuses();
    }
    catch {
        return [];
    }
}
function recordReliabilityIncident(subsystem, title, detail, metadata) {
    try {
        const rg = require('./reliability-governance');
        return rg.recordIncident({ subsystem, title, detail, ...metadata });
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 39: Skill Packs, Engine Templates, Capability Composer
// ═══════════════════════════════════════════
function createSkillPack(definition) {
    try {
        const sp = require('./skill-packs');
        return sp.createPack(definition);
    }
    catch {
        return null;
    }
}
function bindSkillPack(scopeType, scopeId, packId) {
    try {
        const sp = require('./skill-packs');
        return sp.bindPack(packId, scopeType, scopeId);
    }
    catch {
        return null;
    }
}
function createEngineTemplate(definition) {
    try {
        const et = require('./engine-templates');
        return et.createTemplate(definition);
    }
    catch {
        return null;
    }
}
function instantiateEngineTemplate(templateId, tenantId, engineId, domain) {
    try {
        const et = require('./engine-templates');
        return et.instantiate(templateId, tenantId, engineId, domain);
    }
    catch {
        return null;
    }
}
function composeDomainCapabilities(engineId, projectId) {
    try {
        const dc = require('./domain-capability-composer');
        return dc.compose(engineId, projectId);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 40: Extensions, Marketplace, Integration Governance
// ═══════════════════════════════════════════
function createExtensionPackage(definition) {
    try {
        const ef = require('./extension-framework');
        return ef.createPackage(definition);
    }
    catch {
        return null;
    }
}
function installExtension(extensionId, tenantId, scope) {
    try {
        const ef = require('./extension-framework');
        return ef.installPackage(extensionId, tenantId, scope);
    }
    catch {
        return null;
    }
}
function publishMarketplaceListing(assetRef, assetType, metadata) {
    try {
        const mp = require('./marketplace');
        return mp.publish({ asset_type: assetType, asset_ref: assetRef, ...metadata });
    }
    catch {
        return null;
    }
}
function evaluateIntegrationAccess(integrationId, tenantId, action) {
    try {
        const ig = require('./integration-governance');
        return ig.evaluateAccess(integrationId, tenantId, action);
    }
    catch {
        return null;
    }
}
function getMarketplaceSummary() {
    try {
        const mp = require('./marketplace');
        return mp.getSummary();
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 41: UI Surface Audit + Readiness
// ═══════════════════════════════════════════
function getUISurfaceAudit() {
    try {
        const ua = require('./ui-surface-audit');
        return ua.runAudit();
    }
    catch {
        return null;
    }
}
function getUIReadiness() {
    try {
        const ur = require('./ui-readiness');
        return ur.computeReadiness();
    }
    catch {
        return null;
    }
}
function getUIWiringGaps(area) {
    try {
        const udw = require('./ui-data-wiring');
        return udw.getWiringGaps(area);
    }
    catch {
        return [];
    }
}
// ═══════════════════════════════════════════
// Part 42: Workflow Activation + E2E Flow + Actions
// ═══════════════════════════════════════════
function getWorkflowActivationReport() {
    try {
        const wa = require('./workflow-activation');
        return wa.getReport();
    }
    catch {
        return null;
    }
}
function runE2EFlowCheck(flowId) {
    try {
        const ef = require('./e2e-flow-state');
        return ef.runFlow(flowId);
    }
    catch {
        return null;
    }
}
function getOperatorActions(area) {
    try {
        const oa = require('./operator-actions');
        return { actions: oa.getActions(area), summary: oa.getActionSummary() };
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 43: Action Visibility + Runtime Completion
// ═══════════════════════════════════════════
function getVisibleOperatorActions(area) {
    try {
        const av = require('./action-visibility');
        return av.getVisibleActions(area);
    }
    catch {
        return [];
    }
}
function getRuntimeCompletionReport() {
    try {
        const rc = require('./runtime-enforcement-completion');
        return rc.getReport();
    }
    catch {
        return null;
    }
}
function getActionVisibilityGaps() {
    try {
        const av = require('./action-visibility');
        return av.getGaps();
    }
    catch {
        return [];
    }
}
// ═══════════════════════════════════════════
// Part 44: UX Polish, Navigation, Targeted Refresh
// ═══════════════════════════════════════════
function getUXConsistencyReport() {
    try {
        const ux = require('./ux-polish');
        return ux.getConsistencyReport();
    }
    catch {
        return null;
    }
}
function getNavigationMap() {
    try {
        const nc = require('./navigation-consistency');
        return nc.getMap();
    }
    catch {
        return [];
    }
}
function getNavigationGaps() {
    try {
        const nc = require('./navigation-consistency');
        return nc.getGaps();
    }
    catch {
        return [];
    }
}
function getTargetedRefreshPlans(area) {
    try {
        const tr = require('./targeted-refresh');
        return area ? tr.getPlanForArea(area) : tr.getPlans();
    }
    catch {
        return area ? null : [];
    }
}
function getOperatorJourneys() {
    try {
        const ux = require('./ux-polish');
        return ux.getJourneys();
    }
    catch {
        return [];
    }
}
// ═══════════════════════════════════════════
// Part 45: Real Telemetry + Measured Reliability + Alert Routing
// ═══════════════════════════════════════════
function getTelemetryWiringReport() {
    try {
        const tw = require('./telemetry-wiring');
        return tw.getWiringReport();
    }
    catch {
        return null;
    }
}
function getMeasuredReliability(scope) {
    try {
        const mr = require('./measured-reliability');
        return mr.computeReliability(scope);
    }
    catch {
        return null;
    }
}
function getAlertRoutingSummary() {
    try {
        const ar = require('./alert-routing');
        return { routes: ar.getRoutingHistory(), breaches: ar.getBreaches() };
    }
    catch {
        return null;
    }
}
function runAlertCheck() {
    try {
        const ar = require('./alert-routing');
        return ar.runAlertCheck();
    }
    catch {
        return [];
    }
}
// ═══════════════════════════════════════════
// Part 46: Isolation + Entitlement + Boundary Enforcement
// ═══════════════════════════════════════════
function evaluateTenantIsolation(sourceTenant, targetTenant, action) {
    try {
        const tir = require('./tenant-isolation-runtime');
        return tir.evaluate(sourceTenant, targetTenant, action);
    }
    catch {
        return null;
    }
}
function evaluateAPIEntitlement(route, tenantId) {
    try {
        const aee = require('./api-entitlement-enforcement');
        return aee.evaluate(route, tenantId);
    }
    catch {
        return null;
    }
}
function evaluateBoundaryEnforcement(requestType, sourceScope, targetScope, artifactType) {
    try {
        const be = require('./boundary-enforcement');
        return be.enforce(requestType, sourceScope, targetScope, artifactType);
    }
    catch {
        return null;
    }
}
function getIsolationEnforcementReport() {
    try {
        const be = require('./boundary-enforcement');
        return be.getReport();
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 47: Runtime Capability Activation
// ═══════════════════════════════════════════
function activateComposedCapabilities(engineId, projectId) {
    try {
        const rca = require('./runtime-capability-activation');
        return rca.activate(engineId, projectId);
    }
    catch {
        return [];
    }
}
function bindTemplateRuntime(templateId, engineId, projectId) {
    try {
        const trb = require('./template-runtime-binding');
        return trb.bind(templateId, engineId, projectId);
    }
    catch {
        return null;
    }
}
function evaluateExtensionPermissions(extensionId, permission, action) {
    try {
        const epe = require('./extension-permission-enforcement');
        return epe.evaluate(extensionId, permission, action);
    }
    catch {
        return null;
    }
}
function getRuntimeActivationReport() {
    try {
        const rca = require('./runtime-capability-activation');
        return rca.getReport();
    }
    catch {
        return null;
    }
}
function getCapabilityConflicts(engineId) {
    try {
        const rca = require('./runtime-capability-activation');
        return rca.getConflicts(engineId);
    }
    catch {
        return [];
    }
}
// ═══════════════════════════════════════════
// Part 48: Production Readiness Closure + Operator Acceptance
// ═══════════════════════════════════════════
function getProductionReadinessClosure() {
    try {
        const prc = require('./production-readiness-closure');
        return prc.computeClosure();
    }
    catch {
        return null;
    }
}
function getLiveIntegrationStatus(area) {
    try {
        const lih = require('./live-integration-hardening');
        return area ? lih.getStatus(area) : { statuses: lih.getStatus(), summary: lih.getSummary() };
    }
    catch {
        return null;
    }
}
function runOperatorAcceptance() {
    try {
        const oa = require('./operator-acceptance');
        return oa.runAcceptance();
    }
    catch {
        return null;
    }
}
function getShipReadinessDecision() {
    try {
        const prc = require('./production-readiness-closure');
        return prc.getShipDecision();
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Part 49: Ship Blocker Closure + Middleware + Workflow Completion
// ═══════════════════════════════════════════
function getShipBlockerSummary() {
    try {
        const sbc = require('./ship-blocker-closure');
        return { summary: sbc.getSummary(), blockers: sbc.getBlockers() };
    }
    catch {
        return null;
    }
}
function getMiddlewareCoverageReport() {
    try {
        const me = require('./middleware-enforcement');
        return me.getCoverageReport();
    }
    catch {
        return [];
    }
}
function getWorkflowCompletionReport() {
    try {
        const owc = require('./operator-workflow-completion');
        return owc.getCompletionReport();
    }
    catch {
        return null;
    }
}
function resolveShipBlocker(blockerId, evidence) {
    try {
        const sbc = require('./ship-blocker-closure');
        return sbc.resolveBlocker(blockerId, evidence);
    }
    catch {
        return null;
    }
}
// Part 50: Go-Live Closure + Provider Gating + Readiness Reconciliation
function getGoLiveClosureReport() {
    try {
        const glc = require('./go-live-closure');
        return glc.getClosureReport();
    }
    catch {
        return null;
    }
}
function evaluateReleaseProviderGating(releaseId) {
    try {
        const rpg = require('./release-provider-gating');
        return rpg.evaluateProviderGating(releaseId || 'current');
    }
    catch {
        return null;
    }
}
function getReadinessReconciliation() {
    try {
        const rr = require('./readiness-reconciliation');
        return rr.reconcile();
    }
    catch {
        return null;
    }
}
// Part 51: Protected Path Validation + Middleware Truth + Enforcement Evidence
function getProtectedPathSummary() {
    try {
        const ppv = require('./protected-path-validation');
        return ppv.getSummary();
    }
    catch {
        return null;
    }
}
function runProtectedPathValidation(pathId) {
    try {
        const ppv = require('./protected-path-validation');
        return pathId ? ppv.validatePath(pathId) : ppv.validateAll();
    }
    catch {
        return null;
    }
}
function getMiddlewareTruthReport() {
    try {
        const lmw = require('./live-middleware-wiring');
        return lmw.getTruthReport();
    }
    catch {
        return null;
    }
}
function getEnforcementEvidence(scopeType, scopeId) {
    try {
        const ee = require('./enforcement-evidence');
        return (scopeType && scopeId) ? ee.getEvidenceByScope(scopeType, scopeId) : ee.getEvidence(scopeType);
    }
    catch {
        return null;
    }
}
// Part 52: HTTP Middleware Validation + Final Blocker Reconciliation + Final Ship Decision
function runHTTPMiddlewareValidation() {
    try {
        const hmv = require('./http-middleware-validation');
        return hmv.runValidation();
    }
    catch {
        return null;
    }
}
function getFinalBlockerReconciliation() {
    try {
        const fbr = require('./final-blocker-reconciliation');
        return fbr.reconcile();
    }
    catch {
        return null;
    }
}
function getFinalWorkflowClosure() {
    try {
        const fsd = require('./final-ship-decision');
        return fsd.getWorkflowClosure();
    }
    catch {
        return null;
    }
}
function getFinalShipDecisionReport() {
    try {
        const fsd = require('./final-ship-decision');
        return fsd.computeDecision();
    }
    catch {
        return null;
    }
}
// Part 53: Network HTTP Validation + Reliability Closure + Clean-State Go
async function runNetworkHTTPValidation() {
    try {
        const nhv = require('./network-http-validation');
        return await nhv.runValidation();
    }
    catch {
        return null;
    }
}
function getReliabilityClosureReport() {
    try {
        const rc = require('./reliability-closure');
        return rc.computeClosure();
    }
    catch {
        return null;
    }
}
function runCleanStateVerification() {
    try {
        const csv = require('./clean-state-verification');
        return csv.verify();
    }
    catch {
        return null;
    }
}
function getFinalGoVerificationReport() {
    try {
        const csv = require('./clean-state-verification');
        return csv.computeFinalGoVerification();
    }
    catch {
        return null;
    }
}
// Part 54: Live Server Proof + Go Authorization
async function runLiveServerProof() {
    try {
        const lsp = require('./live-server-proof');
        return await lsp.runProof();
    }
    catch {
        return null;
    }
}
function getValidationHarnessState() {
    try {
        const vho = require('./validation-harness-orchestrator');
        return vho.getLatestExecution();
    }
    catch {
        return null;
    }
}
function getGoAuthorizationDecision() {
    try {
        const ga = require('./go-authorization');
        return ga.computeAuthorization();
    }
    catch {
        return null;
    }
}
// Part 55: Inline Route Enforcement + Final Unconditional Go
function getRouteMiddlewareCoverage() {
    try {
        const rme = require('./route-middleware-enforcement');
        return rme.getCoverage();
    }
    catch {
        return null;
    }
}
async function runFinalGoProof() {
    try {
        const fgp = require('./final-go-proof');
        return await fgp.runProof();
    }
    catch {
        return null;
    }
}
function getUnconditionalGoReport() {
    try {
        const fgp = require('./final-go-proof');
        return fgp.getUnconditionalGoReport();
    }
    catch {
        return null;
    }
}
// Part 56: Route Protection Expansion + Mutation Guards + Deep Redaction
function getRouteProtectionExpansionReport() {
    try {
        const rpe = require('./route-protection-expansion');
        return rpe.getExpansionReport();
    }
    catch {
        return null;
    }
}
function getMutationProtectionReport() {
    try {
        const mg = require('./mutation-route-guards');
        return mg.getReport();
    }
    catch {
        return null;
    }
}
function getDeepRedactionReport() {
    try {
        const dr = require('./deep-redaction');
        return dr.getReport();
    }
    catch {
        return null;
    }
}
function getProtectionRegressionChecks() {
    try {
        const checks = [];
        // Verify ship-critical guards still work
        const hrg = require('./http-response-guard');
        const d1 = hrg.guard('/api/tenant-admin', 'rpgpo-other', 'default');
        checks.push({ check_id: 'reg_isolation', area: 'tenant_isolation', passed: !d1.allowed, detail: d1.allowed ? 'REGRESSION: cross-tenant not denied' : 'Cross-tenant correctly denied' });
        const d2 = hrg.guard('/api/tenant-admin', 'free_tenant', 'default');
        checks.push({ check_id: 'reg_entitlement', area: 'entitlement', passed: !d2.allowed, detail: d2.allowed ? 'REGRESSION: non-entitled not denied' : 'Non-entitled correctly denied' });
        const d3 = hrg.guard('/api/audit-hub', 'rpgpo', 'other-project');
        checks.push({ check_id: 'reg_boundary', area: 'boundary_redaction', passed: d3.outcome === 'redact', detail: d3.outcome === 'redact' ? 'Redaction correctly applied' : `REGRESSION: expected redact, got ${d3.outcome}` });
        const d4 = hrg.guard('/api/audit-hub', 'rpgpo', 'default');
        checks.push({ check_id: 'reg_allow', area: 'same_scope_allow', passed: d4.allowed, detail: d4.allowed ? 'Same-scope correctly allowed' : 'REGRESSION: same-scope denied' });
        return checks;
    }
    catch {
        return [];
    }
}
// Part 57: Product Shell + Output Surfacing + Task Experience
function getProductShellState() {
    try {
        const ps = require('./product-shell');
        return ps.getConsolidationReport();
    }
    catch {
        return null;
    }
}
function getOutputSurfacingReport() {
    try {
        const fos = require('./final-output-surfacing');
        return fos.getSurfacingReport();
    }
    catch {
        return null;
    }
}
function getTaskExperienceReport() {
    try {
        const te = require('./task-experience');
        return te.getAllExperiences();
    }
    catch {
        return null;
    }
}
// Part 58: Engine Catalog + Output Contracts + Mission Acceptance
function getEngineCatalogSummary() {
    try {
        const ec = require('./engine-catalog');
        return ec.getCatalogSummary();
    }
    catch {
        return null;
    }
}
function getOutputContractReport() {
    try {
        const oc = require('./output-contracts');
        return oc.getVisibilityReport();
    }
    catch {
        return null;
    }
}
function validateTaskAgainstOutputContract(taskId) {
    try {
        const oc = require('./output-contracts');
        return oc.validateTask(taskId);
    }
    catch {
        return null;
    }
}
function getMissionAcceptanceSummary() {
    try {
        const mas = require('./mission-acceptance-suite');
        return mas.getRunSummary();
    }
    catch {
        return null;
    }
}
// Part 59: Structured Deliverables + Contract Enforcement + Rendering
function getBoardContractContext(engineId) {
    try {
        const ce = require('./contract-enforcement');
        return ce.buildBoardContractContext(engineId);
    }
    catch {
        return null;
    }
}
function getDeliverable(taskId) {
    try {
        const ce = require('./contract-enforcement');
        return ce.getDeliverable(taskId);
    }
    catch {
        return null;
    }
}
function renderDeliverable(taskId) {
    try {
        const ce = require('./contract-enforcement');
        const dr = require('./deliverable-rendering');
        const d = ce.getDeliverable(taskId);
        if (!d)
            return null;
        const enforcement = ce.enforceAtCompletion(taskId, d.engineId);
        const model = dr.toRenderModel(d.engineId, d, enforcement);
        return { deliverable: d, model, enforcement };
    }
    catch {
        return null;
    }
}
function validateDeliverableForTask(taskId) {
    try {
        const ce = require('./contract-enforcement');
        const d = ce.getDeliverable(taskId);
        if (!d)
            return { status: 'hard_fail', missingFields: ['no_deliverable'] };
        return ce.enforceAtCompletion(taskId, d.engineId);
    }
    catch {
        return null;
    }
}
// Part 60: Deliverable Store
function getDeliverableStoreIndex() {
    try {
        const ds = require('./deliverable-store');
        return ds.getStoreIndex();
    }
    catch {
        return null;
    }
}
function getStoredDeliverable(deliverableId, version) {
    try {
        const ds = require('./deliverable-store');
        return version ? ds.getByVersion(deliverableId, version) : ds.getLatest(deliverableId);
    }
    catch {
        return null;
    }
}
function getDeliverableHistory(deliverableId) {
    try {
        const ds = require('./deliverable-store');
        return ds.listHistory(deliverableId);
    }
    catch {
        return null;
    }
}
function migrateDeliverables() {
    try {
        const ds = require('./deliverable-store');
        return ds.migrateFlatStore();
    }
    catch {
        return null;
    }
}
// Part 61: Merge Pipeline
function mergeDeliverableFragments(taskId, fragments) {
    try {
        const ce = require('./contract-enforcement');
        const dm = require('./deliverable-merge');
        const base = ce.getDeliverable(taskId);
        if (!base)
            return null;
        return dm.mergeScaffold(base, fragments);
    }
    catch {
        return null;
    }
}
function validateMergedDeliverable(engineId, taskId) {
    try {
        const ce = require('./contract-enforcement');
        const dm = require('./deliverable-merge');
        const d = ce.getDeliverable(taskId);
        if (!d)
            return { passed: false, violations: [{ field: 'deliverable', message: 'No deliverable found' }], warnings: [] };
        return dm.validateMerged(engineId, d);
    }
    catch {
        return null;
    }
}
function diffDeliverableVersions(deliverableId, v1, v2) {
    try {
        const ds = require('./deliverable-store');
        const dm = require('./deliverable-merge');
        const a = ds.getByVersion(deliverableId, v1);
        const b = ds.getByVersion(deliverableId, v2);
        if (!a || !b)
            return null;
        return dm.diff(a.content, b.content);
    }
    catch {
        return null;
    }
}
// Part 62: Evidence Linking + Approval Lifecycle
function attachDeliverableEvidence(deliverableId, version, refs) {
    try {
        const el = require('./evidence-linker');
        return el.attachEvidence(deliverableId, version, refs);
    }
    catch {
        return null;
    }
}
function proposeDeliverable(deliverableId, version) {
    try {
        const ag = require('./approval-gates-deliverables');
        return ag.propose(deliverableId, version);
    }
    catch {
        return null;
    }
}
function approveDeliverable(deliverableId, version, approver) {
    try {
        const ag = require('./approval-gates-deliverables');
        return ag.approve(deliverableId, version, approver);
    }
    catch {
        return null;
    }
}
function rejectDeliverable(deliverableId, version, reviewer, reason) {
    try {
        const ag = require('./approval-gates-deliverables');
        return ag.reject(deliverableId, version, reviewer, reason);
    }
    catch {
        return null;
    }
}
function getDeliverableApprovalRequests(deliverableId) {
    try {
        const ag = require('./approval-gates-deliverables');
        return ag.getRequests(deliverableId);
    }
    catch {
        return null;
    }
}
// Part 64: Release Assembly
function buildReleaseCandidate(project, channel) {
    try {
        const ra = require('./release-assembly');
        return ra.buildCandidate(project, channel, 'operator');
    }
    catch {
        return null;
    }
}
function getReleaseCandidates(project, channel) {
    try {
        const ra = require('./release-assembly');
        return ra.getCandidates(project, channel);
    }
    catch {
        return null;
    }
}
function getCurrentRelease(project, channel) {
    try {
        const ra = require('./release-assembly');
        return ra.getCurrentRelease(project, channel);
    }
    catch {
        return null;
    }
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
    // Part 61
    mergeDeliverableFragments, validateMergedDeliverable,
    diffDeliverableVersions,
    // Part 62
    attachDeliverableEvidence, proposeDeliverable,
    approveDeliverable, rejectDeliverable,
    getDeliverableApprovalRequests,
    // Part 64
    buildReleaseCandidate, getReleaseCandidates,
    getCurrentRelease,
};
//# sourceMappingURL=chief-of-staff.js.map