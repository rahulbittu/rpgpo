"use strict";
// GPO Product Shell — Define product sections, entry points, and shippable surface state
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSections = getSections;
exports.getEntryPoints = getEntryPoints;
exports.getPrimaryWorkflow = getPrimaryWorkflow;
exports.getClutterIssues = getClutterIssues;
exports.getConsolidationReport = getConsolidationReport;
function uid() { return 'ps_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
/** Define all product shell sections with their role and state */
function getSections() {
    return [
        { id: 'home', name: 'Command Center', role: 'primary', tab: 'home', has_content: true, state: 'shippable', detail: 'Status, CoS brief, current task, approvals, mission health' },
        { id: 'tasks', name: 'Task Stream', role: 'primary', tab: 'tasks', has_content: true, state: 'shippable', detail: 'All tasks with filters, running task hero, timeline' },
        { id: 'intake', name: 'Task Intake', role: 'primary', tab: 'intake', has_content: true, state: 'shippable', detail: 'Submit tasks, board deliberation, execution flow' },
        { id: 'channels', name: 'AI Channels', role: 'advanced', tab: 'channels', has_content: true, state: 'usable_but_noisy', detail: 'Direct model interaction — advanced users only' },
        { id: 'missions', name: 'Missions', role: 'primary', tab: 'missions', has_content: true, state: 'shippable', detail: 'Mission domains, health, statements' },
        { id: 'memory', name: 'Memory & Docs', role: 'advanced', tab: 'memory', has_content: true, state: 'shippable', detail: 'Operator memory, artifacts, reports' },
        { id: 'dossiers', name: 'Dossiers', role: 'operator_only', tab: 'dossiers', has_content: false, state: 'incomplete', detail: 'Promotion dossiers — needs data loader' },
        { id: 'providers', name: 'Providers', role: 'advanced', tab: 'providers', has_content: true, state: 'shippable', detail: 'Provider capabilities, health, governance' },
        { id: 'governance', name: 'Governance', role: 'operator_only', tab: 'governance', has_content: true, state: 'shippable', detail: 'Policies, enforcement, middleware truth, protection' },
        { id: 'audit', name: 'Audit Hub', role: 'operator_only', tab: 'audit', has_content: true, state: 'shippable', detail: 'Audit timeline, approvals, escalations, policy history' },
        { id: 'releases', name: 'Releases', role: 'operator_only', tab: 'releases', has_content: true, state: 'shippable', detail: 'Release plans, ship readiness, go authorization' },
        { id: 'admin', name: 'Admin', role: 'operator_only', tab: 'admin', has_content: true, state: 'usable_but_noisy', detail: 'Tenant admin, deployment, security' },
        { id: 'topranker', name: 'TopRanker', role: 'primary', tab: 'topranker', has_content: true, state: 'shippable', detail: 'Flagship mission command' },
        { id: 'approvals', name: 'Approvals', role: 'primary', tab: 'approvals', has_content: true, state: 'shippable', detail: 'Pending approval packets' },
        { id: 'costs', name: 'Costs', role: 'advanced', tab: 'costs', has_content: true, state: 'shippable', detail: 'AI spend tracking' },
        { id: 'logs', name: 'Logs', role: 'advanced', tab: 'logs', has_content: true, state: 'shippable', detail: 'System events, agent runs, decisions' },
        { id: 'controls', name: 'Controls', role: 'operator_only', tab: 'controls', has_content: true, state: 'usable_but_noisy', detail: 'Operations surface — overlaps with Intake' },
        { id: 'settings', name: 'Settings', role: 'advanced', tab: 'settings', has_content: true, state: 'shippable', detail: 'Provider status, system info' },
    ];
}
/** Define entry points with classification */
function getEntryPoints() {
    return [
        { name: 'Task Intake', tab: 'intake', role: 'primary', description: 'Submit any task through Board of AI deliberation' },
        { name: 'AI Channels', tab: 'channels', role: 'advanced', description: 'Direct model interaction without board governance' },
        { name: 'Controls', tab: 'controls', role: 'operator_only', description: 'Quick dispatch for operating loops and system tasks' },
        { name: 'Home quick actions', tab: 'home', role: 'primary', description: 'Refresh, Board Run, Intake shortcuts on home' },
    ];
}
/** Define the primary workflow */
function getPrimaryWorkflow() {
    return [
        { step: 1, name: 'Choose domain/project', surface: 'Intake tab — domain selector', description: 'Select which engine/project the task belongs to' },
        { step: 2, name: 'Submit task', surface: 'Intake tab — submit form', description: 'Describe the task and desired outcome' },
        { step: 3, name: 'Board deliberates', surface: 'Intake tab — deliberation panel', description: 'Board of AI produces interpretation, strategy, subtask plan' },
        { step: 4, name: 'Approve if needed', surface: 'Approvals tab / Intake hero', description: 'Review and approve board plan or code changes' },
        { step: 5, name: 'Execution', surface: 'Task Stream / Intake timeline', description: 'Subtasks execute through governed agents' },
        { step: 6, name: 'See final result', surface: 'Task detail / Home current task', description: 'Final answer, report, changed files, artifacts' },
    ];
}
/** Identify clutter issues */
function getClutterIssues() {
    return [
        { tab: 'home', issue: 'Too many status strips for first-time users', severity: 'medium', fix: 'Collapse status into expandable section' },
        { tab: 'controls', issue: 'Duplicates Intake task submission', severity: 'high', fix: 'Mark as operator-only, add label' },
        { tab: 'channels', issue: 'Multiple entry point confusion', severity: 'medium', fix: 'Label as advanced/direct model access' },
        { tab: 'dossiers', issue: 'Renders as blank page', severity: 'high', fix: 'Add empty state with explanation' },
    ];
}
/** Get full UX consolidation report */
function getConsolidationReport() {
    const sections = getSections();
    const shippable = sections.filter(s => s.state === 'shippable').length;
    return {
        report_id: uid(), sections, entry_points: getEntryPoints(),
        primary_workflow: getPrimaryWorkflow(), clutter_issues: getClutterIssues(),
        shippable, total: sections.length, created_at: new Date().toISOString(),
    };
}
module.exports = { getSections, getEntryPoints, getPrimaryWorkflow, getClutterIssues, getConsolidationReport };
//# sourceMappingURL=product-shell.js.map