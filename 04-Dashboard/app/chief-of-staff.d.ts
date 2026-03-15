import type { Domain, IntakeTask, NextAction, ChiefOfStaffBrief, RiskLevel, ExecutionGraph, Lane } from './types';
/** Interpret a board result and produce a Chief of Staff routing decision */
export declare function interpretBoardResult(task: IntakeTask): {
    summary: string;
    risk_assessment: string;
    recommended_route: string;
    key_concerns: string[];
    approval_needed: boolean;
};
/** Generate next-best-actions across all engines and projects */
export declare function getNextBestActions(limit?: number): NextAction[];
/** Get next actions scoped to a specific engine */
export declare function getEngineActions(domain: Domain, limit?: number): NextAction[];
/** Get next actions scoped to a specific project */
export declare function getProjectActions(projectId: string, domain: Domain, limit?: number): NextAction[];
/** Generate a full Chief of Staff brief for the operator */
export declare function generateBrief(): ChiefOfStaffBrief;
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
export declare function buildWorkOrder(taskId: string): WorkOrder | null;
/** Create an execution graph from a work order */
export declare function createExecutionGraph(taskId: string): ExecutionGraph | null;
/** Attach approval gates to an execution graph */
export declare function attachApprovalGates(graphId: string): string[];
/** Attach review contracts to an execution graph */
export declare function attachReviewContracts(graphId: string): string[];
/** Generate a promotion dossier from a completed execution graph */
export declare function generatePromotionDossier(graphId: string): import('./types').PromotionDossier | null;
/** Full orchestration: build work order → create graph → attach gates → attach reviews */
export declare function orchestrateTask(taskId: string): {
    graph: ExecutionGraph | null;
    gate_ids: string[];
    review_ids: string[];
};
/** Select the best provider for a role given task context */
export declare function selectProviderForRole(role: import('./types').AgentRole, taskKind: import('./types').TaskKind, domain?: Domain, projectId?: string): {
    provider_id: import('./types').Provider;
    fit_score: number;
    confidence: number;
    source: string;
} | null;
/** Find matching collaboration contract for a role handoff */
export declare function selectCollaborationContract(fromRole: import('./types').AgentRole, toRole: import('./types').AgentRole, domain?: Domain, projectId?: string): import('./types').CollaborationContract | null;
/** Record a handoff between two execution nodes */
export declare function recordHandoff(graphId: string, fromNodeId: string, toNodeId: string, summary: string, artifacts?: string[], openQuestions?: string[]): import('./types').ExecutionHandoffRecord | null;
/** Run reverse prompting on a completed graph */
export declare function runReversePrompting(graphId: string): import('./types').ReversePromptingRun | null;
/** Resolve effective operator policies for a given scope */
export declare function resolvePolicy(domain?: Domain, projectId?: string): Record<string, {
    value: string;
    source: string;
}>;
/** Resolve effective autonomy budget */
export declare function resolveAutonomyBudget(lane: import('./types').Lane, domain?: Domain, projectId?: string): import("./types").AutonomyBudget | null;
/** Evaluate escalation rules against a graph */
export declare function evaluateEscalation(graphId: string, nodeId?: string): import('./types').EscalationEvent[];
/** Check documentation requirements for a scope */
export declare function checkDocumentationRequirements(scopeType: import('./types').DocScopeType, relatedId: string, lane: import('./types').Lane): {
    met: boolean;
    missing: string[];
    present: string[];
    block_level: string;
    blocking: boolean;
};
/** Apply full governance checks before execution */
export declare function applyGovernanceBeforeExecution(taskId: string, graphId: string): {
    policies: Record<string, unknown>;
    budget: import('./types').AutonomyBudget | null;
    escalations: import('./types').EscalationEvent[];
    doc_check: {
        met: boolean;
        missing: string[];
        blocking: boolean;
    };
    can_proceed: boolean;
    blockers: string[];
};
/** Run a governance simulation scenario */
export declare function simulateGovernanceScenario(relatedType: import('./types').SimulationScope, relatedId: string, lane: import('./types').Lane, overrides?: import('./types').SimulationOverrides): import('./types').SimulationResult | null;
/** Run a what-if test suite against an entity */
export declare function runWhatIfTestSuite(relatedType: import('./types').SimulationScope, relatedId: string): import('./types').GovernanceTestCase[];
/** Compute release readiness score */
export declare function computeReleaseReadiness(relatedType: import('./types').SimulationScope, relatedId: string): import('./types').ReleaseReadinessScore | null;
/** Evaluate enforcement for an action */
export declare function evaluateEnforcement(relatedType: import('./types').SimulationScope, relatedId: string, action: import('./types').EnforcementAction, lane: import('./types').Lane): import('./types').EnforcementDecision | null;
/** Request an override for a blocked action */
export declare function requestOverride(relatedType: import('./types').SimulationScope, relatedId: string, action: import('./types').EnforcementAction, overrideType: import('./types').OverrideType, reason: string, notes?: string): import('./types').OverrideEntry | null;
/** Evaluate whether a dossier can be promoted */
export declare function resolvePromotionDecision(dossierId: string, targetLane: import('./types').Lane): import('./types').PromotionDecision | null;
/** Execute promotion with enforcement */
export declare function applyPromotionControl(dossierId: string, targetLane: import('./types').Lane): {
    decision: import('./types').PromotionDecision | null;
    promoted: boolean;
};
export declare function analyzeExceptions(domain?: Domain, projectId?: string): unknown;
export declare function detectGovernanceDrift(scopeLevel?: string, scopeId?: string, domain?: Domain): unknown;
export declare function generatePolicyTuning(scopeLevel?: string, scopeId?: string, domain?: Domain): unknown;
export declare function applyApprovedTuning(decisionId: string): unknown;
export declare function getGovernanceHealth(scopeLevel?: string, scopeId?: string, domain?: Domain): unknown;
export declare function getGovernanceOpsView(filters?: Record<string, unknown>): unknown;
export declare function resolveScopedDrift(scopeLevel?: string, scopeId?: string, domain?: Domain): unknown;
export declare function previewTuningApplication(recId: string): unknown;
export declare function applyTuningApplication(recId: string, approver?: string): unknown;
export declare function rollbackTuningApplication(rollbackId: string): unknown;
export declare function evaluateRuntimeGovernance(graphId: string, nodeId?: string, action?: string): unknown;
export declare function getRuntimeEnforcementSummary(): unknown;
export declare function attachExecutionHooks(graphId: string): unknown;
export declare function resolveWorkerDecision(graphId: string, nodeId: string | undefined, action: string): unknown;
export declare function getOverrideOperationsView(filters?: Record<string, unknown>): unknown;
export declare function createExceptionCase(sourceType: string, sourceId: string, meta?: Record<string, unknown>): unknown;
export declare function assignExceptionOwner(caseId: string, owner: string): unknown;
export declare function resolveBlock(blockId: string, outcome: string, notes?: string, overrideId?: string): unknown;
export declare function consumeOverrideAction(overrideId: string, decisionId: string): unknown;
export declare function resumeEscalatedExecution(pauseId: string): unknown;
export declare function evaluateCrossProjectAccess(sourceProject: string, targetProject: string, artifactType: string, action?: string): unknown;
export declare function createPatternExchangeCandidate(sourceProject: string, artifactRef: string, candidateType: string, title: string, content: string, domain: string): unknown;
export declare function approveSharedPattern(candidateId: string, targetScope?: string): unknown;
export declare function useSharedPattern(projectId: string, patternId: string, context?: string): unknown;
export declare function recordIsolationViolation(sourceProject: string, targetProject: string, artifactType: string, reason: string): unknown;
export declare function getProviderReliability(providerId?: string, domain?: Domain, projectId?: string): unknown;
export declare function evaluateProviderCost(providerId: string, action: string, lane: string, domain?: Domain, projectId?: string): unknown;
export declare function evaluateProviderLatency(providerId: string, role: string, lane: string, domain?: Domain): unknown;
export declare function chooseProviderWithGovernance(role: string, taskKind: string, domain: Domain, projectId?: string, lane?: string): {
    reliability_ok: boolean;
    cost_ok: boolean;
    governed: boolean;
    provider_id: import("./types").Provider;
    fit_score: number;
    confidence: number;
    source: string;
} | null;
export declare function recordProviderIncident(providerId: string, incidentType: string, metadata?: Record<string, unknown>): unknown;
export declare function getProviderGovernanceSummary(): unknown;
export declare function registerArtifact(artifactType: string, sourceId: string, title: string, metadata?: Record<string, unknown>): unknown;
export declare function linkEvidence(sourceId: string, targetId: string, relation: string, notes?: string): unknown;
export declare function buildEvidenceBundle(relatedType: string, relatedId: string): unknown;
export declare function getLineageSummary(artifactId: string): unknown;
export declare function appendTraceabilityEntry(action: string, targetType: string, targetId: string, metadata?: Record<string, unknown>): unknown;
export declare function getAuditView(filters?: Record<string, unknown>): unknown;
export declare function buildAuditPackage(scopeType: string, relatedId: string): unknown;
export declare function exportComplianceBundle(scopeType: string, relatedId: string, opts?: Record<string, unknown>): unknown;
export declare function getPolicyHistory(targetType: string, targetId?: string): unknown;
export declare function appendPolicyChangeRecord(targetType: string, targetId: string, beforeState: Record<string, unknown>, afterState: Record<string, unknown>, reason: string, metadata?: Record<string, unknown>): unknown;
export declare function createApprovalRequest(sourceType: string, sourceId: string, title: string, metadata?: Record<string, unknown>): unknown;
export declare function getApprovalWorkspace(filters?: Record<string, unknown>): {
    items: unknown;
    summary: unknown;
} | null;
export declare function applyApprovalDecision(requestId: string, decision: string, notes?: string): unknown;
export declare function getEscalationInbox(filters?: Record<string, unknown>): unknown;
export declare function resolveEscalationInboxItem(itemId: string, action: string, notes?: string): unknown;
export declare function createReleasePlan(projectId: string, sourceArtifacts: Record<string, string[]>, targetLane: string): unknown;
export declare function evaluatePromotionPipeline(dossierId: string, targetLane: string): unknown;
export declare function executeReleasePlan(planId: string): unknown;
export declare function verifyReleaseExecution(executionId: string, notes?: string): unknown;
export declare function createRollbackPlan(releaseExecutionId: string, trigger: string, metadata?: Record<string, unknown>): unknown;
export declare function executeRollback(planId: string): unknown;
export declare function createCollaborationSession(scopeType: string, scopeId: string, participants: Array<{
    provider_id: string;
    role: string;
}>, protocolType: string, metadata?: Record<string, unknown>): unknown;
export declare function recordAgentProposal(sessionId: string, providerId: string, role: string, content: string, confidence: number, rationale: string): unknown;
export declare function runNegotiationProtocol(sessionId: string): unknown;
export declare function computeConsensus(sessionId: string): unknown;
export declare function resolveCollaborationOutcome(sessionId: string): {
    negotiation: unknown;
    consensus: unknown;
};
export declare function getTenantAdminView(tenantId?: string): unknown;
export declare function evaluateSubscriptionEntitlements(tenantId: string, features: string[]): unknown;
export declare function recordUsageMeter(tenantId: string, meterType: string, amount: number): unknown;
export declare function computeDeploymentReadiness(scopeType?: string, scopeId?: string): unknown;
export declare function evaluateSecretAccess(secretId: string, actor: string, action: string): unknown;
export declare function getSecurityPosture(scopeType?: string, scopeId?: string): unknown;
export declare function evaluateDataBoundary(sourceScope: string, targetScope: string, artifactType: string, action?: string): unknown;
export declare function recordBoundaryViolation(metadata: Record<string, unknown>): unknown;
export declare function getHardeningChecklist(): unknown;
export declare function getObservabilityView(filters?: Record<string, unknown>): {
    metrics: unknown;
    events: any[];
} | null;
export declare function getReliabilitySummary(): unknown;
export declare function getSLOStatus(): unknown;
export declare function recordReliabilityIncident(subsystem: string, title: string, detail: string, metadata?: Record<string, unknown>): unknown;
export declare function createSkillPack(definition: Record<string, unknown>): unknown;
export declare function bindSkillPack(scopeType: string, scopeId: string, packId: string): unknown;
export declare function createEngineTemplate(definition: Record<string, unknown>): unknown;
export declare function instantiateEngineTemplate(templateId: string, tenantId: string, engineId: string, domain: string): unknown;
export declare function composeDomainCapabilities(engineId: string, projectId?: string): unknown;
export declare function createExtensionPackage(definition: Record<string, unknown>): unknown;
export declare function installExtension(extensionId: string, tenantId: string, scope?: string): unknown;
export declare function publishMarketplaceListing(assetRef: string, assetType: string, metadata: Record<string, unknown>): unknown;
export declare function evaluateIntegrationAccess(integrationId: string, tenantId: string, action?: string): unknown;
export declare function getMarketplaceSummary(): unknown;
export declare function getUISurfaceAudit(): unknown;
export declare function getUIReadiness(): unknown;
export declare function getUIWiringGaps(area?: string): unknown;
export declare function getWorkflowActivationReport(): unknown;
export declare function runE2EFlowCheck(flowId: string): unknown;
export declare function getOperatorActions(area?: string): {
    actions: unknown;
    summary: unknown;
} | null;
export declare function getVisibleOperatorActions(area?: string): unknown;
export declare function getRuntimeCompletionReport(): unknown;
export declare function getActionVisibilityGaps(): unknown;
export declare function getUXConsistencyReport(): unknown;
export declare function getNavigationMap(): unknown;
export declare function getNavigationGaps(): unknown;
export declare function getTargetedRefreshPlans(area?: string): unknown;
export declare function getOperatorJourneys(): unknown;
export declare function getTelemetryWiringReport(): unknown;
export declare function getMeasuredReliability(scope?: string): unknown;
export declare function getAlertRoutingSummary(): {
    routes: unknown;
    breaches: unknown;
} | null;
export declare function runAlertCheck(): unknown;
export declare function evaluateTenantIsolation(sourceTenant: string, targetTenant: string, action?: string): unknown;
export declare function evaluateAPIEntitlement(route: string, tenantId?: string): unknown;
export declare function evaluateBoundaryEnforcement(requestType: string, sourceScope: string, targetScope: string, artifactType: string): unknown;
export declare function getIsolationEnforcementReport(): unknown;
export declare function activateComposedCapabilities(engineId: string, projectId?: string): unknown;
export declare function bindTemplateRuntime(templateId: string, engineId: string, projectId?: string): unknown;
export declare function evaluateExtensionPermissions(extensionId: string, permission: string, action?: string): unknown;
export declare function getRuntimeActivationReport(): unknown;
export declare function getCapabilityConflicts(engineId?: string): unknown;
export declare function getProductionReadinessClosure(): unknown;
export declare function getLiveIntegrationStatus(area?: string): unknown;
export declare function runOperatorAcceptance(): unknown;
export declare function getShipReadinessDecision(): unknown;
export declare function getShipBlockerSummary(): {
    summary: unknown;
    blockers: unknown;
} | null;
export declare function getMiddlewareCoverageReport(): unknown;
export declare function getWorkflowCompletionReport(): unknown;
export declare function resolveShipBlocker(blockerId: string, evidence?: string): unknown;
export declare function getGoLiveClosureReport(): unknown;
export declare function evaluateReleaseProviderGating(releaseId?: string): unknown;
export declare function getReadinessReconciliation(): unknown;
export declare function getProtectedPathSummary(): unknown;
export declare function runProtectedPathValidation(pathId?: string): unknown;
export declare function getMiddlewareTruthReport(): unknown;
export declare function getEnforcementEvidence(scopeType?: string, scopeId?: string): unknown;
export declare function runHTTPMiddlewareValidation(): unknown;
export declare function getFinalBlockerReconciliation(): unknown;
export declare function getFinalWorkflowClosure(): unknown;
export declare function getFinalShipDecisionReport(): unknown;
export declare function runNetworkHTTPValidation(): Promise<unknown>;
export declare function getReliabilityClosureReport(): unknown;
export declare function runCleanStateVerification(): unknown;
export declare function getFinalGoVerificationReport(): unknown;
export declare function runLiveServerProof(): Promise<unknown>;
export declare function getValidationHarnessState(): unknown;
export declare function getGoAuthorizationDecision(): unknown;
export declare function getRouteMiddlewareCoverage(): unknown;
export declare function runFinalGoProof(): Promise<unknown>;
export declare function getUnconditionalGoReport(): unknown;
export declare function getRouteProtectionExpansionReport(): unknown;
export declare function getMutationProtectionReport(): unknown;
export declare function getDeepRedactionReport(): unknown;
export declare function getProtectionRegressionChecks(): {
    check_id: string;
    area: string;
    passed: boolean;
    detail: string;
}[];
export declare function getProductShellState(): unknown;
export declare function getOutputSurfacingReport(): unknown;
export declare function getTaskExperienceReport(): unknown;
export declare function getEngineCatalogSummary(): unknown;
export declare function getOutputContractReport(): unknown;
export declare function validateTaskAgainstOutputContract(taskId: string): unknown;
export declare function getMissionAcceptanceSummary(): unknown;
export declare function getBoardContractContext(engineId: string): unknown;
export declare function getDeliverable(taskId: string): unknown;
export declare function renderDeliverable(taskId: string): {
    deliverable: import("./types").StructuredDeliverable;
    model: import("./types").RenderModel;
    enforcement: import("./types").ContractEnforcementResult;
} | null;
export declare function validateDeliverableForTask(taskId: string): unknown;
export declare function getDeliverableStoreIndex(): unknown;
export declare function getStoredDeliverable(deliverableId: string, version?: number): unknown;
export declare function getDeliverableHistory(deliverableId: string): unknown;
export declare function migrateDeliverables(): unknown;
export declare function mergeDeliverableFragments(taskId: string, fragments: Array<{
    subtaskId: string;
    engine: string;
    content: Record<string, unknown>;
    stepType: string;
}>): import("./types").MergeResult | null;
export declare function validateMergedDeliverable(engineId: string, taskId: string): unknown;
export declare function diffDeliverableVersions(deliverableId: string, v1: number, v2: number): unknown;
export declare function attachDeliverableEvidence(deliverableId: string, version: number, refs: Array<{
    kind: string;
    ref: string;
    label?: string;
}>): unknown;
export declare function proposeDeliverable(deliverableId: string, version: number): unknown;
export declare function approveDeliverable(deliverableId: string, version: number, approver: string): unknown;
export declare function rejectDeliverable(deliverableId: string, version: number, reviewer: string, reason: string): unknown;
export declare function getDeliverableApprovalRequests(deliverableId?: string): unknown;
export declare function buildReleaseCandidate(project: string, channel: string): unknown;
export declare function getReleaseCandidates(project?: string, channel?: string): unknown;
export declare function getCurrentRelease(project: string, channel: string): unknown;
export declare function onRuntimeTaskStart(taskId: string, engineId: string): unknown;
export declare function onRuntimeSubtaskComplete(taskId: string, subtaskId: string, output: string, engineId: string): unknown;
export declare function onRuntimeTaskComplete(taskId: string, engineId: string): unknown;
export declare function getRuntimeDeliverableSummary(): unknown;
export declare function getStructuredIOStatus(taskId: string): unknown[];
export declare function getStructuredIOBriefSnippet(taskId: string): string | null;
export {};
//# sourceMappingURL=chief-of-staff.d.ts.map