// GPO Memory & Document Viewer
// Provides a clean, structured view of all operator memory, context,
// decisions, artifacts, reports, and mission statements.
// Not raw files — structured, categorized, and summarized.

import type {
  Domain, MemoryDocument, MemoryViewerData, MissionStatement,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const context = require('./context') as {
  getOperatorProfile(): import('./types').OperatorProfile;
  getMissionContext(d: Domain): import('./types').MissionContextRecord;
  getDecisions(d: Domain, limit?: number): import('./types').DecisionRecord[];
  getArtifacts(d: Domain): import('./types').ArtifactRef[];
};

const engines = require('./engines') as {
  getAllEngines(): import('./types').Engine[];
  getEngineContext(d: Domain): import('./types').EngineContext;
  getEngineDisplayName(d: Domain): string;
};

const projects = require('./projects') as {
  getAllProjects(): import('./types').Project[];
  getProjectContext(id: string): import('./types').ProjectContext | null;
};

const missionStatements = require('./mission-statements') as {
  getAllStatements(): MissionStatement[];
};

const REPORTS_DIR = path.resolve(__dirname, '..', '..', '..', '03-Operations', 'Reports');
const DECISIONS_DIR = path.resolve(__dirname, '..', '..', '..', '03-Operations', 'Logs', 'Decisions');
const DOCS_DIR = path.resolve(__dirname, '..', '..', 'docs');

function uid(): string {
  return 'mdoc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ═══════════════════════════════════════════
// Document Collectors
// ═══════════════════════════════════════════

/** Collect operator profile as a viewable document */
function collectOperatorDocs(): MemoryDocument[] {
  const profile = context.getOperatorProfile();
  return [{
    id: uid(),
    category: 'operator_profile',
    title: `${profile.name}'s Operator Profile`,
    summary: `Decision style: ${profile.decision_style} | Communication: ${profile.communication_style} | Risk tolerance: ${profile.risk_tolerance}`,
    content: [
      `Name: ${profile.name}`,
      `Decision Style: ${profile.decision_style}`,
      `Communication Style: ${profile.communication_style}`,
      `Risk Tolerance: ${profile.risk_tolerance}`,
      `Approval Threshold: ${profile.approval_threshold}`,
      `Preferred Providers: ${profile.preferred_providers?.join(', ') || 'claude, openai'}`,
      profile.recurring_priorities?.length
        ? `Recurring Priorities:\n${profile.recurring_priorities.map(p => `  - ${p}`).join('\n')}`
        : '',
      profile.custom_notes ? `Notes: ${profile.custom_notes}` : '',
    ].filter(Boolean).join('\n'),
    created_at: profile.updated_at || new Date().toISOString(),
  }];
}

/** Collect engine context documents */
function collectEngineDocs(): Record<Domain, MemoryDocument[]> {
  const result: Record<string, MemoryDocument[]> = {};
  const allEngines = engines.getAllEngines();

  for (const engine of allEngines) {
    const docs: MemoryDocument[] = [];
    const ctx = engines.getEngineContext(engine.domain);
    const missionCtx = context.getMissionContext(engine.domain);

    // Engine context doc
    docs.push({
      id: uid(),
      category: 'engine_context',
      title: `${engine.display_name} Engine Context`,
      domain: engine.domain,
      summary: ctx.context_summary || engine.description,
      content: [
        `Engine: ${engine.display_name}`,
        `Domain: ${engine.domain}`,
        `Long-term Objective: ${ctx.long_term_objective}`,
        ctx.recurring_themes?.length
          ? `Recurring Themes: ${ctx.recurring_themes.join(', ')}`
          : '',
        ctx.active_projects_summary
          ? `Active Projects: ${ctx.active_projects_summary}`
          : '',
        ctx.cross_project_decisions?.length
          ? `Cross-Project Decisions:\n${ctx.cross_project_decisions.slice(0, 5).map(d => `  - [${d.category}] ${d.decision}`).join('\n')}`
          : '',
      ].filter(Boolean).join('\n'),
      created_at: ctx.updated_at || new Date().toISOString(),
    });

    // Mission context doc
    if (missionCtx.objective || missionCtx.context_summary) {
      docs.push({
        id: uid(),
        category: 'engine_context',
        title: `${engine.display_name} Mission Memory`,
        domain: engine.domain,
        summary: missionCtx.context_summary || missionCtx.objective,
        content: [
          `Objective: ${missionCtx.objective}`,
          `Status: ${missionCtx.current_status}`,
          missionCtx.next_actions?.length
            ? `Next Actions:\n${missionCtx.next_actions.map(a => `  - ${a}`).join('\n')}`
            : '',
          missionCtx.known_issues?.length
            ? `Known Issues:\n${missionCtx.known_issues.map(i => `  - ${i}`).join('\n')}`
            : '',
        ].filter(Boolean).join('\n'),
        created_at: missionCtx.updated_at || new Date().toISOString(),
      });
    }

    result[engine.domain] = docs;
  }

  return result as Record<Domain, MemoryDocument[]>;
}

/** Collect project documents */
function collectProjectDocs(): MemoryDocument[] {
  const allProjects = projects.getAllProjects();
  const docs: MemoryDocument[] = [];

  for (const project of allProjects) {
    const ctx = projects.getProjectContext(project.project_id);
    docs.push({
      id: uid(),
      category: 'project_context',
      title: `${project.project_name}`,
      domain: project.domain,
      summary: project.objective || project.context_summary || '',
      content: [
        `Project: ${project.project_name}`,
        `Domain: ${project.domain}`,
        `Status: ${project.status}`,
        `Objective: ${project.objective}`,
        `Tasks completed: ${project.tasks_completed} | Failed: ${project.tasks_failed}`,
        project.known_issues?.length
          ? `Known Issues:\n${project.known_issues.map(i => `  - ${i}`).join('\n')}`
          : '',
        project.next_actions?.length
          ? `Next Actions:\n${project.next_actions.map(a => `  - ${a}`).join('\n')}`
          : '',
        ctx?.recent_decisions?.length
          ? `Recent Decisions:\n${ctx.recent_decisions.slice(0, 5).map(d => `  - [${d.category}] ${d.decision}`).join('\n')}`
          : '',
      ].filter(Boolean).join('\n'),
      created_at: project.updated_at,
    });
  }

  return docs;
}

/** Collect decision documents across all domains */
function collectDecisionDocs(): MemoryDocument[] {
  const docs: MemoryDocument[] = [];
  const allEngines = engines.getAllEngines();

  for (const engine of allEngines) {
    const decisions = context.getDecisions(engine.domain, 10);
    for (const d of decisions) {
      docs.push({
        id: uid(),
        category: 'decision',
        title: d.title,
        domain: d.domain,
        summary: d.decision,
        content: [
          `Category: ${d.category}`,
          `Decision: ${d.decision}`,
          `Domain: ${d.domain}`,
          d.task_id ? `Task: ${d.task_id}` : '',
          `Made at: ${d.made_at}`,
        ].filter(Boolean).join('\n'),
        created_at: d.made_at,
      });
    }
  }

  // Also collect from filesystem decisions
  try {
    if (fs.existsSync(DECISIONS_DIR)) {
      const files = fs.readdirSync(DECISIONS_DIR).filter((f: string) => f.endsWith('.md')).slice(0, 20);
      for (const file of files) {
        const filePath = path.join(DECISIONS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const firstLine = content.split('\n').find((l: string) => l.trim()) || file;
        docs.push({
          id: uid(),
          category: 'decision',
          title: firstLine.replace(/^#+\s*/, '').slice(0, 80),
          summary: content.slice(0, 200).replace(/\n/g, ' '),
          content: content.slice(0, 2000),
          source_path: filePath,
          created_at: fs.statSync(filePath).mtime.toISOString(),
        });
      }
    }
  } catch { /* skip filesystem decisions if not accessible */ }

  return docs;
}

/** Collect artifact documents across all domains */
function collectArtifactDocs(): MemoryDocument[] {
  const docs: MemoryDocument[] = [];
  const allEngines = engines.getAllEngines();

  for (const engine of allEngines) {
    const artifacts = context.getArtifacts(engine.domain);
    for (const a of artifacts.slice(0, 10)) {
      docs.push({
        id: uid(),
        category: 'artifact',
        title: a.title,
        domain: a.domain,
        summary: `[${a.type}] ${a.title}`,
        content: `Type: ${a.type}\nPath: ${a.path}\nDomain: ${a.domain}\nCreated: ${a.created_at}`,
        source_path: a.path,
        created_at: a.created_at,
      });
    }
  }

  return docs;
}

/** Collect report files */
function collectReportDocs(): MemoryDocument[] {
  const docs: MemoryDocument[] = [];

  try {
    if (fs.existsSync(REPORTS_DIR)) {
      const files = fs.readdirSync(REPORTS_DIR)
        .filter((f: string) => f.endsWith('.md'))
        .sort()
        .reverse()
        .slice(0, 30);

      for (const file of files) {
        const filePath = path.join(REPORTS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const firstLine = content.split('\n').find((l: string) => l.trim()) || file;

        // Detect domain from filename
        let domain: Domain | undefined;
        const lower = file.toLowerCase();
        if (lower.includes('topranker')) domain = 'topranker';
        else if (lower.includes('career')) domain = 'careeregine';

        docs.push({
          id: uid(),
          category: 'report',
          title: firstLine.replace(/^#+\s*/, '').slice(0, 80) || file,
          domain,
          summary: content.slice(0, 200).replace(/\n/g, ' '),
          content: content.slice(0, 3000),
          source_path: filePath,
          created_at: fs.statSync(filePath).mtime.toISOString(),
        });
      }
    }
  } catch { /* skip if not accessible */ }

  return docs;
}

/** Collect mission statement documents */
function collectMissionStatementDocs(): MemoryDocument[] {
  const statements = missionStatements.getAllStatements();
  return statements.map(s => ({
    id: uid(),
    category: 'mission_statement' as const,
    title: `${s.level} mission: ${s.scope_id}`,
    domain: s.level === 'engine' ? s.scope_id as Domain : undefined,
    summary: s.statement.slice(0, 100),
    content: [
      `Level: ${s.level}`,
      `Scope: ${s.scope_id}`,
      `Statement: ${s.statement}`,
      s.objectives.length ? `Objectives:\n${s.objectives.map(o => `  - ${o}`).join('\n')}` : '',
      s.values.length ? `Values:\n${s.values.map(v => `  - ${v}`).join('\n')}` : '',
      s.success_criteria.length ? `Success Criteria:\n${s.success_criteria.map(c => `  - ${c}`).join('\n')}` : '',
    ].filter(Boolean).join('\n'),
    created_at: s.updated_at,
  }));
}

// ═══════════════════════════════════════════
// Full Memory Viewer Data
// ═══════════════════════════════════════════

/** Collect provider governance artifacts */
function collectProviderDocs(): MemoryDocument[] {
  const docs: MemoryDocument[] = [];
  try {
    const pr = require('./provider-registry') as {
      getProviderProfiles(): Array<{ provider_id: string; display_name: string; strengths: string[]; best_roles: string[]; best_task_kinds: string[]; privacy_class: string }>;
      getAllFits(): Array<{ fit_id: string; provider_id: string; role: string; task_kind: string; scope_level: string; scope_id: string; fit_score: number; state: string; updated_at: string }>;
      getAllRecipes(): Array<{ recipe_id: string; provider_id: string; role: string; task_kind: string; title: string; state: string; uses: number; updated_at: string }>;
    };
    for (const p of pr.getProviderProfiles()) {
      docs.push({
        id: uid(), category: 'artifact', title: `Provider: ${p.display_name}`,
        summary: `Roles: ${p.best_roles.join(', ')} | Tasks: ${p.best_task_kinds.join(', ')} | Privacy: ${p.privacy_class}`,
        content: `Strengths: ${p.strengths.join(', ')}`,
        created_at: new Date().toISOString(),
      });
    }
    for (const f of pr.getAllFits().slice(0, 10)) {
      docs.push({
        id: uid(), category: 'artifact', title: `Fit: ${f.provider_id} as ${f.role} for ${f.task_kind}`,
        domain: f.scope_level === 'engine' ? f.scope_id as Domain : undefined,
        summary: `Score: ${f.fit_score} | State: ${f.state} | Scope: ${f.scope_level}:${f.scope_id}`,
        content: `Provider fit record`, created_at: f.updated_at,
      });
    }
    for (const r of pr.getAllRecipes().slice(0, 10)) {
      docs.push({
        id: uid(), category: 'artifact', title: `Recipe: ${r.title}`,
        summary: `${r.provider_id} as ${r.role} for ${r.task_kind} | Uses: ${r.uses} | State: ${r.state}`,
        content: `Prompt recipe`, created_at: r.updated_at,
      });
    }
  } catch { /* provider registry not loaded */ }
  return docs;
}

/** Collect governance artifacts (policies, budgets, escalation rules, doc requirements) */
function collectGovernanceDocs(): MemoryDocument[] {
  const docs: MemoryDocument[] = [];
  try {
    const op = require('./operator-policies') as { getAllPolicies(): Array<{ policy_id: string; area: string; value: string; scope_level: string; scope_id: string; enabled: boolean; updated_at: string }> };
    for (const p of op.getAllPolicies().slice(0, 10)) {
      docs.push({ id: uid(), category: 'artifact', title: `Policy: ${p.area}`, summary: `${p.value} (${p.scope_level}:${p.scope_id}) ${p.enabled ? '' : '[disabled]'}`, content: `Operator preference policy`, created_at: p.updated_at });
    }
  } catch { /* */ }
  try {
    const ab = require('./autonomy-budgets') as { getAllBudgets(): Array<{ budget_id: string; lane: string; scope_level: string; scope_id: string; max_retries: number; enabled: boolean; updated_at: string }> };
    for (const b of ab.getAllBudgets().slice(0, 10)) {
      docs.push({ id: uid(), category: 'artifact', title: `Budget: ${b.lane} lane`, summary: `${b.scope_level}:${b.scope_id} | retries: ${b.max_retries} ${b.enabled ? '' : '[disabled]'}`, content: `Autonomy budget`, created_at: b.updated_at });
    }
  } catch { /* */ }
  try {
    const eg = require('./escalation-governance') as { getAllRules(): Array<{ rule_id: string; trigger: string; action: string; enabled: boolean; description: string; updated_at: string }> };
    for (const r of eg.getAllRules().slice(0, 10)) {
      docs.push({ id: uid(), category: 'artifact', title: `Escalation: ${r.trigger}`, summary: `→ ${r.action} ${r.enabled ? '' : '[disabled]'}: ${r.description}`, content: `Escalation rule`, created_at: r.updated_at });
    }
  } catch { /* */ }
  try {
    const dg = require('./documentation-governance') as { getAllRequirements(): Array<{ req_id: string; title: string; scope_type: string; required_artifacts: string[]; updated_at: string }> };
    for (const d of dg.getAllRequirements()) {
      docs.push({ id: uid(), category: 'artifact', title: `Doc Req: ${d.title}`, summary: `${d.scope_type} — needs: ${d.required_artifacts.join(', ')}`, content: `Documentation requirement`, created_at: d.updated_at });
    }
  } catch { /* */ }
  try {
    const ps = require('./policy-simulation') as { getAllResults(): Array<{ result_id: string; related_type: string; related_id: string; lane: string; outcome: string; summary: string; created_at: string }> };
    for (const r of ps.getAllResults().slice(0, 5)) {
      docs.push({ id: uid(), category: 'artifact', title: `Simulation: ${r.outcome} (${r.lane})`, summary: r.summary, content: `Simulation result for ${r.related_type}:${r.related_id}`, created_at: r.created_at });
    }
  } catch { /* */ }
  try {
    const rr = require('./release-readiness') as { getAllScores(): Array<{ score_id: string; related_type: string; overall_score: number; recommendation: string; created_at: string }> };
    for (const s of rr.getAllScores().slice(0, 5)) {
      docs.push({ id: uid(), category: 'artifact', title: `Readiness: ${s.overall_score}% (${s.recommendation})`, summary: `${s.related_type} readiness score`, content: `Release readiness score`, created_at: s.created_at });
    }
  } catch { /* */ }
  try {
    const ee = require('./enforcement-engine') as { getDecisionsForEntity(rt: string, rid: string): Array<{ decision_id: string; action: string; level: string; created_at: string }> };
    // Show recent enforcement decisions (not entity-scoped in memory viewer, just recent)
    const ol = require('./override-ledger') as { getAllOverrides(): Array<{ override_id: string; override_type: string; status: string; reason: string; created_at: string }> };
    for (const o of ol.getAllOverrides().slice(0, 5)) {
      docs.push({ id: uid(), category: 'artifact', title: `Override: ${o.override_type} (${o.status})`, summary: o.reason, content: `Override entry`, created_at: o.created_at });
    }
  } catch { /* */ }
  try {
    const pt = require('./policy-tuning') as { getAllRecommendations(): Array<{ rec_id: string; title: string; action: string; target: string; status: string; risk: string; created_at: string }>; getHealthSnapshots(): Array<{ snapshot_id: string; health: string; summary: string; created_at: string }> };
    for (const r of pt.getAllRecommendations().slice(0, 5)) {
      docs.push({ id: uid(), category: 'artifact', title: `Tuning: ${r.title}`, summary: `${r.action} ${r.target} [${r.status}] risk:${r.risk}`, content: `Policy tuning recommendation`, created_at: r.created_at });
    }
    for (const h of pt.getHealthSnapshots().slice(0, 3)) {
      docs.push({ id: uid(), category: 'artifact', title: `Health: ${h.health}`, summary: h.summary, content: `Governance health snapshot`, created_at: h.created_at });
    }
  } catch { /* */ }
  try {
    const sdr = require('./scoped-drift-resolution') as { getAllResolutions(): Array<{ resolution_id: string; root_cause: string; status: string; risk: string; created_at: string }> };
    for (const r of sdr.getAllResolutions().slice(0, 5)) {
      docs.push({ id: uid(), category: 'artifact', title: `Drift Resolution: ${r.status}`, summary: r.root_cause.slice(0, 100), content: `Risk: ${r.risk}`, created_at: r.created_at });
    }
  } catch { /* */ }
  try {
    const ta = require('./tuning-application') as { getApplications(): Array<{ result_id: string; change_summary: string; applied: boolean; created_at: string }> };
    for (const a of ta.getApplications().slice(0, 5)) {
      docs.push({ id: uid(), category: 'artifact', title: `Tuning Applied: ${a.applied ? 'yes' : 'no'}`, summary: a.change_summary, content: `Tuning application result`, created_at: a.created_at });
    }
  } catch { /* */ }
  try {
    const re = require('./runtime-enforcement') as { getSummary(): { total_hooks: number; total_blocks: number; active_blocks: number; created_at: string }; getActiveBlocks(): Array<{ block_id: string; transition: string; reason: string; created_at: string }> };
    const summary = re.getSummary();
    if (summary.total_hooks > 0) docs.push({ id: uid(), category: 'artifact', title: `Runtime: ${summary.total_blocks} blocks, ${summary.active_blocks} active`, summary: `${summary.total_hooks} hooks evaluated`, content: 'Runtime enforcement summary', created_at: summary.created_at });
    for (const b of re.getActiveBlocks().slice(0, 3)) {
      docs.push({ id: uid(), category: 'artifact', title: `Block: ${b.transition}`, summary: b.reason, content: 'Active runtime block', created_at: b.created_at });
    }
  } catch { /* */ }
  try {
    const el = require('./exception-lifecycle') as { getOpenCases(): Array<{ case_id: string; title: string; severity: string; stage: string; created_at: string }> };
    for (const c of el.getOpenCases().slice(0, 5)) {
      docs.push({ id: uid(), category: 'artifact', title: `Exception: ${c.title}`, summary: `${c.severity} — ${c.stage}`, content: 'Exception case', created_at: c.created_at });
    }
  } catch { /* */ }
  try {
    const br = require('./block-resolution') as { getAllResolutions(): Array<{ resolution_id: string; outcome: string; notes: string; created_at: string }> };
    for (const r of br.getAllResolutions().slice(0, 3)) {
      docs.push({ id: uid(), category: 'artifact', title: `Block Resolution: ${r.outcome}`, summary: r.notes.slice(0, 80), content: 'Block resolution record', created_at: r.created_at });
    }
  } catch { /* */ }
  try {
    const pi = require('./project-isolation') as { getViolations(): Array<{ violation_id: string; source_project: string; target_project: string; artifact_type: string; created_at: string }> };
    for (const v of pi.getViolations().slice(0, 3)) {
      docs.push({ id: uid(), category: 'artifact', title: `Isolation Violation: ${v.artifact_type}`, summary: `${v.source_project} → ${v.target_project}`, content: 'Cross-project isolation violation', created_at: v.created_at });
    }
  } catch { /* */ }
  try {
    const pe = require('./pattern-exchange') as { getPatterns(): Array<{ pattern_id: string; title: string; scope: string; uses: number; state: string; created_at: string }> };
    for (const p of pe.getPatterns().slice(0, 5)) {
      docs.push({ id: uid(), category: 'artifact', title: `Shared Pattern: ${p.title}`, summary: `${p.scope} | ${p.uses} uses | ${p.state}`, content: 'Shared governance pattern', created_at: p.created_at });
    }
  } catch { /* */ }
  try {
    const pr = require('./provider-reliability') as { getAllIncidents(): Array<{ incident_id: string; provider_id: string; incident_type: string; severity: string; detail: string; created_at: string }> };
    for (const i of pr.getAllIncidents().slice(0, 3)) {
      docs.push({ id: uid(), category: 'artifact', title: `Incident: ${i.provider_id} ${i.incident_type}`, summary: `${i.severity}: ${i.detail.slice(0, 80)}`, content: 'Provider incident', created_at: i.created_at });
    }
  } catch { /* */ }
  try {
    const ar = require('./artifact-registry') as { getAll(): Array<{ artifact_id: string; type: string; title: string; created_at: string }> };
    const count = ar.getAll().length;
    if (count > 0) docs.push({ id: uid(), category: 'artifact', title: `Artifact Registry: ${count} registered`, summary: 'System artifact registry', content: `${count} artifacts tracked`, created_at: new Date().toISOString() });
  } catch { /* */ }
  try {
    const tl = require('./traceability-ledger') as { getAll(): Array<{ entry_id: string; action: string; target_type: string; created_at: string }> };
    const count = tl.getAll().length;
    if (count > 0) docs.push({ id: uid(), category: 'artifact', title: `Traceability Ledger: ${count} entries`, summary: 'Append-only audit trail', content: `${count} ledger entries`, created_at: new Date().toISOString() });
  } catch { /* */ }
  try {
    const ph = require('./policy-history') as { getAllChanges(): Array<{ change_id: string; target_type: string; target_id: string; actor: string; reason: string; created_at: string }> };
    for (const c of ph.getAllChanges().slice(0, 3)) {
      docs.push({ id: uid(), category: 'artifact', title: `Policy Change: ${c.target_type}`, summary: `${c.actor}: ${c.reason}`, content: 'Policy change record', created_at: c.created_at });
    }
  } catch { /* */ }
  try {
    const aw = require('./approval-workspace') as { getSummary(): { pending: number; overdue: number; total: number } };
    const s = aw.getSummary();
    if (s.total > 0) docs.push({ id: uid(), category: 'artifact', title: `Approvals: ${s.pending} pending, ${s.overdue} overdue`, summary: `${s.total} total`, content: 'Approval workspace', created_at: new Date().toISOString() });
  } catch { /* */ }
  try {
    const ei = require('./escalation-inbox') as { getNew(): Array<{ item_id: string; title: string }> };
    const items = ei.getNew();
    if (items.length > 0) docs.push({ id: uid(), category: 'artifact', title: `Escalation Inbox: ${items.length} new`, summary: items[0]?.title || '', content: 'Escalation inbox', created_at: new Date().toISOString() });
  } catch { /* */ }
  try {
    const ro = require('./release-orchestration') as { getPlans(): Array<{ plan_id: string; title: string; status: string; target_lane: string; created_at: string }> };
    for (const p of ro.getPlans().slice(0, 3)) {
      docs.push({ id: uid(), category: 'artifact', title: `Release: ${p.title}`, summary: `${p.status} → ${p.target_lane}`, content: 'Release plan', created_at: p.created_at });
    }
  } catch { /* */ }
  try {
    const cr = require('./collaboration-runtime') as { getSessions(): Array<{ session_id: string; protocol_type: string; status: string; participants: any[]; created_at: string }> };
    for (const s of cr.getSessions().slice(0, 3)) {
      docs.push({ id: uid(), category: 'artifact', title: `Collaboration: ${s.protocol_type}`, summary: `${s.status} | ${s.participants.length} agents`, content: 'Collaboration session', created_at: s.created_at });
    }
  } catch { /* */ }
  try {
    const ta = require('./tenant-admin') as { getAllTenants(): Array<{ tenant_id: string; name: string; plan: string; created_at: string }> };
    for (const t of ta.getAllTenants().slice(0, 2)) {
      docs.push({ id: uid(), category: 'artifact', title: `Tenant: ${t.name}`, summary: `Plan: ${t.plan}`, content: 'Tenant profile', created_at: t.created_at });
    }
  } catch { /* */ }
  try {
    const sh = require('./security-hardening') as { getReports(): Array<{ report_id: string; overall: string; created_at: string; findings: any[] }> };
    const reports = sh.getReports();
    if (reports.length > 0) docs.push({ id: uid(), category: 'artifact', title: `Security: ${reports[0].overall}`, summary: `${reports[0].findings?.length || 0} findings`, content: 'Security posture report', created_at: reports[0].created_at });
  } catch { /* */ }
  try {
    const rg = require('./reliability-governance') as { getServiceHealth(): { overall: string; active_incidents: number; created_at: string } };
    const h = rg.getServiceHealth();
    docs.push({ id: uid(), category: 'artifact', title: `Service Health: ${h.overall}`, summary: `${h.active_incidents} active incidents`, content: 'Service health view', created_at: h.created_at });
  } catch { /* */ }
  try {
    const sp = require('./skill-packs') as { getPacks(): Array<{ pack_id: string; name: string; state: string; version: number; created_at: string }> };
    for (const p of sp.getPacks().slice(0, 3)) docs.push({ id: uid(), category: 'artifact', title: `Skill Pack: ${p.name}`, summary: `v${p.version} (${p.state})`, content: 'Skill pack', created_at: p.created_at });
  } catch { /* */ }
  try {
    const et = require('./engine-templates') as { getTemplates(): Array<{ template_id: string; name: string; domain_type: string; created_at: string }> };
    for (const t of et.getTemplates().slice(0, 3)) docs.push({ id: uid(), category: 'artifact', title: `Template: ${t.name}`, summary: t.domain_type, content: 'Engine template', created_at: t.created_at });
  } catch { /* */ }
  try {
    const mp = require('./marketplace') as { getSummary(): { total: number; approved: number } };
    const s = mp.getSummary();
    if (s.total > 0) docs.push({ id: uid(), category: 'artifact', title: `Marketplace: ${s.total} listings`, summary: `${s.approved} approved`, content: 'Marketplace summary', created_at: new Date().toISOString() });
  } catch { /* */ }
  try {
    const ig = require('./integration-governance') as { getIntegrations(): Array<{ integration_id: string; name: string; category: string; enabled: boolean; created_at: string }> };
    for (const i of ig.getIntegrations().slice(0, 3)) docs.push({ id: uid(), category: 'artifact', title: `Integration: ${i.name}`, summary: `${i.category} | ${i.enabled ? 'enabled' : 'disabled'}`, content: 'Integration connector', created_at: i.created_at });
  } catch { /* */ }
  try {
    const ur = require('./ui-readiness') as { computeReadiness(): { overall_score: number; blocking_gaps: string[]; created_at: string } };
    const r = ur.computeReadiness();
    docs.push({ id: uid(), category: 'artifact', title: `UI Readiness: ${r.overall_score}%`, summary: `${r.blocking_gaps.length} blocking gaps`, content: 'UI readiness report', created_at: r.created_at });
  } catch { /* */ }
  try {
    const wa = require('./workflow-activation') as { getReport(): { activated: number; partial: number; blocked: number; total: number; created_at: string } };
    const r = wa.getReport();
    docs.push({ id: uid(), category: 'artifact', title: `Workflows: ${r.activated}/${r.total} activated`, summary: `${r.partial} partial, ${r.blocked} blocked`, content: 'Workflow activation report', created_at: r.created_at });
  } catch { /* */ }
  try {
    const rc = require('./runtime-enforcement-completion') as { getReport(): { fully_enforced: number; partially_enforced: number; advisory_only: number; total: number; created_at: string } };
    const r = rc.getReport();
    docs.push({ id: uid(), category: 'artifact', title: `Runtime: ${r.fully_enforced}/${r.total} enforced`, summary: `${r.partially_enforced} partial, ${r.advisory_only} advisory`, content: 'Runtime enforcement completion', created_at: r.created_at });
  } catch { /* */ }
  try {
    const ux = require('./ux-polish') as { getConsistencyReport(): { overall: string; journey_pass: number; journey_partial: number; created_at: string } };
    const r = ux.getConsistencyReport();
    docs.push({ id: uid(), category: 'artifact', title: `UX: ${r.overall}`, summary: `${r.journey_pass} pass, ${r.journey_partial} partial journeys`, content: 'UX consistency report', created_at: r.created_at });
  } catch { /* */ }
  try {
    const mr = require('./measured-reliability') as { computeReliability(): { overall_health: string; metrics: any[]; regressions: any[]; created_at: string } };
    const r = mr.computeReliability();
    docs.push({ id: uid(), category: 'artifact', title: `Reliability: ${r.overall_health}`, summary: `${r.metrics.filter(m => m.measured).length} measured metrics, ${r.regressions.length} regressions`, content: 'Measured reliability', created_at: r.created_at });
  } catch { /* */ }
  try {
    const be = require('./boundary-enforcement') as { getReport(): { protected_routes: number; enforced_routes: number; boundary_blocks: number; leak_risks: string[]; created_at: string } };
    const r = be.getReport();
    docs.push({ id: uid(), category: 'artifact', title: `Enforcement: ${r.enforced_routes}/${r.protected_routes} routes protected`, summary: `${r.boundary_blocks} blocks, ${r.leak_risks.length} risks`, content: 'Isolation enforcement report', created_at: r.created_at });
  } catch { /* */ }
  try {
    const rca = require('./runtime-capability-activation') as { getReport(): { activated: number; blocked: number; conflicts: number; created_at: string } };
    const r = rca.getReport();
    docs.push({ id: uid(), category: 'artifact', title: `Runtime: ${r.activated} activated, ${r.blocked} blocked`, summary: `${r.conflicts} conflicts`, content: 'Runtime activation report', created_at: r.created_at });
  } catch { /* */ }
  try {
    const prc = require('./production-readiness-closure') as { getShipDecision(): { decision: string; readiness_score: number; created_at: string } };
    const d = prc.getShipDecision();
    docs.push({ id: uid(), category: 'artifact', title: `Ship: ${d.decision} (${d.readiness_score}%)`, summary: `Ship readiness decision`, content: 'Production readiness', created_at: d.created_at });
  } catch { /* */ }
  try {
    const owc = require('./operator-workflow-completion') as { getCompletionReport(): { usable: number; partial: number; total: number; created_at: string } };
    const r = owc.getCompletionReport();
    docs.push({ id: uid(), category: 'artifact', title: `Workflows: ${r.usable}/${r.total} usable`, summary: `${r.partial} partial`, content: 'Workflow completion report', created_at: r.created_at });
  } catch { /* */ }
  try {
    const rr = require('./readiness-reconciliation') as { reconcile(): { reconciled_score: number; ship_decision: string; created_at: string } };
    const r = rr.reconcile();
    docs.push({ id: uid(), category: 'artifact', title: `Readiness: ${r.reconciled_score}% — ${r.ship_decision}`, summary: 'Final reconciled ship readiness', content: 'Readiness reconciliation report', created_at: r.created_at });
  } catch { /* */ }
  try {
    const lmw = require('./live-middleware-wiring') as { getTruthReport(): { truth_score: number; executed_and_verified: number; total_areas: number; created_at: string } };
    const t = lmw.getTruthReport();
    docs.push({ id: uid(), category: 'artifact', title: `Middleware Truth: ${t.truth_score}%`, summary: `${t.executed_and_verified}/${t.total_areas} verified`, content: 'Live middleware truth report', created_at: t.created_at });
  } catch { /* */ }
  try {
    const ppv = require('./protected-path-validation') as { getSummary(): { validated: number; total_paths: number; created_at: string } };
    const s = ppv.getSummary();
    docs.push({ id: uid(), category: 'artifact', title: `Protected Paths: ${s.validated}/${s.total_paths} validated`, summary: 'Protected path validation summary', content: 'End-to-end protected path validation', created_at: s.created_at });
  } catch { /* */ }
  try {
    const ee = require('./enforcement-evidence') as { getEvidenceSummary(): Array<{ area: string; count: number }> };
    const summary = ee.getEvidenceSummary();
    const total = summary.reduce((s, e) => s + e.count, 0);
    docs.push({ id: uid(), category: 'artifact', title: `Enforcement Evidence: ${total} records`, summary: `${summary.length} areas with evidence`, content: 'Durable enforcement evidence', created_at: new Date().toISOString() });
  } catch { /* */ }
  try {
    const hmv = require('./http-middleware-validation') as { getLatestRun(): { passed: number; total: number; created_at: string } | null };
    const run = hmv.getLatestRun();
    if (run) docs.push({ id: uid(), category: 'artifact', title: `HTTP Validation: ${run.passed}/${run.total} passed`, summary: 'HTTP middleware validation run', content: 'Route-level middleware validation', created_at: run.created_at });
  } catch { /* */ }
  try {
    const fsd = require('./final-ship-decision') as { computeDecision(): { decision: string; overall_score: number; created_at: string } };
    const d = fsd.computeDecision();
    docs.push({ id: uid(), category: 'artifact', title: `Final Ship: ${d.decision.toUpperCase()} (${d.overall_score}%)`, summary: 'Final evidence-backed ship decision', content: 'Final ship decision report', created_at: d.created_at });
  } catch { /* */ }
  try {
    const fbr = require('./final-blocker-reconciliation') as { reconcile(): { closed: number; total: number; stale_contradictions_resolved: number; created_at: string } };
    const r = fbr.reconcile();
    docs.push({ id: uid(), category: 'artifact', title: `Blockers: ${r.closed}/${r.total} closed`, summary: `${r.stale_contradictions_resolved} stale resolved`, content: 'Final blocker reconciliation', created_at: r.created_at });
  } catch { /* */ }
  try {
    const nhv = require('./network-http-validation') as { getLatestRun(): { passed: number; total: number; network_validated: number; created_at: string } | null };
    const run = nhv.getLatestRun();
    if (run) docs.push({ id: uid(), category: 'artifact', title: `Network Validation: ${run.passed}/${run.total} (${run.network_validated} network)`, summary: 'Network-level HTTP validation', content: 'True network-level route validation', created_at: run.created_at });
  } catch { /* */ }
  try {
    const rc = require('./reliability-closure') as { computeClosure(): { closure_score: number; proxy_only: number; created_at: string } };
    const r = rc.computeClosure();
    docs.push({ id: uid(), category: 'artifact', title: `Reliability: ${r.closure_score}% closed`, summary: `${r.proxy_only} proxy-only`, content: 'Reliability closure', created_at: r.created_at });
  } catch { /* */ }
  try {
    const csv = require('./clean-state-verification') as { computeFinalGoVerification(): { production_decision: { decision: string; overall_score: number }; created_at: string } };
    const r = csv.computeFinalGoVerification();
    docs.push({ id: uid(), category: 'artifact', title: `Go Verification: ${r.production_decision.decision.toUpperCase()} (${r.production_decision.overall_score}%)`, summary: 'Final production Go verification', content: 'Clean-state Go verification', created_at: r.created_at });
  } catch { /* */ }
  try {
    const lsp = require('./live-server-proof') as { getLatestRun(): { passed: number; total: number; live_proven: number; proof_complete: boolean; created_at: string } | null };
    const run = lsp.getLatestRun();
    if (run) docs.push({ id: uid(), category: 'artifact', title: `Live Proof: ${run.passed}/${run.total} (${run.live_proven} network)`, summary: run.proof_complete ? 'Fully proven' : 'Partially proven', content: 'Live server proof', created_at: run.created_at });
  } catch { /* */ }
  try {
    const fgp = require('./final-go-proof') as { getUnconditionalGoReport(): { decision: string; overall_score: number; confidence: { level: string }; created_at: string } };
    const r = fgp.getUnconditionalGoReport();
    docs.push({ id: uid(), category: 'artifact', title: `Route Proof: ${r.decision.toUpperCase()} (${r.overall_score}%)`, summary: `Confidence: ${r.confidence.level}`, content: 'Unconditional Go proof', created_at: r.created_at });
  } catch { /* */ }
  try {
    const rme = require('./route-middleware-enforcement') as { getCoverage(): { coverage_percent: number; total_enforced: number; total_protected: number; created_at: string } };
    const c = rme.getCoverage();
    docs.push({ id: uid(), category: 'artifact', title: `Route Guards: ${c.total_enforced}/${c.total_protected} enforced`, summary: `${c.coverage_percent}% coverage`, content: 'Inline route middleware coverage', created_at: c.created_at });
  } catch { /* */ }
  try {
    const rpe = require('./route-protection-expansion') as { getExpansionReport(): { fully_guarded: number; total: number; coverage_percent: number; created_at: string } };
    const r = rpe.getExpansionReport();
    docs.push({ id: uid(), category: 'artifact', title: `Route Protection: ${r.fully_guarded}/${r.total} guarded (${r.coverage_percent}%)`, summary: 'Expanded route protection coverage', content: 'Route protection expansion', created_at: r.created_at });
  } catch { /* */ }
  try {
    const mg = require('./mutation-route-guards') as { getReport(): { enforced: number; total: number; coverage_percent: number; created_at: string } };
    const r = mg.getReport();
    docs.push({ id: uid(), category: 'artifact', title: `Mutation Guards: ${r.enforced}/${r.total} enforced (${r.coverage_percent}%)`, summary: 'Mutation route protection', content: 'Mutation guard enforcement', created_at: r.created_at });
  } catch { /* */ }
  try {
    const dr = require('./deep-redaction') as { getReport(): { fields_stripped_total: number; fields_masked_total: number; created_at: string } };
    const r = dr.getReport();
    docs.push({ id: uid(), category: 'artifact', title: `Deep Redaction: ${r.fields_stripped_total} stripped, ${r.fields_masked_total} masked`, summary: 'Field-level redaction', content: 'Deep redaction report', created_at: r.created_at });
  } catch { /* */ }
  try {
    const ps = require('./product-shell') as { getConsolidationReport(): { shippable: number; total: number; created_at: string } };
    const r = ps.getConsolidationReport();
    docs.push({ id: uid(), category: 'artifact', title: `Product Shell: ${r.shippable}/${r.total} shippable`, summary: 'UX consolidation', content: 'Product shell state', created_at: r.created_at });
  } catch { /* */ }
  try {
    const fos = require('./final-output-surfacing') as { getSurfacingReport(): { with_final_answer: number; tasks_checked: number; surfacing_quality: string; created_at: string } };
    const r = fos.getSurfacingReport();
    docs.push({ id: uid(), category: 'artifact', title: `Output Surfacing: ${r.with_final_answer}/${r.tasks_checked} with answers`, summary: `Quality: ${r.surfacing_quality}`, content: 'Final output surfacing', created_at: r.created_at });
  } catch { /* */ }
  try {
    const ga = require('./go-authorization') as { computeAuthorization(): { decision: string; overall_score: number; confidence: { overall: string }; created_at: string } };
    const a = ga.computeAuthorization();
    docs.push({ id: uid(), category: 'artifact', title: `Authorization: ${a.decision.toUpperCase()} (${a.overall_score}%)`, summary: `Confidence: ${a.confidence.overall}`, content: 'Production Go authorization', created_at: a.created_at });
  } catch { /* */ }
  try {
    const ec = require('./engine-catalog') as { getCatalogSummary(): { total: number; acceptance_cases: number; created_at: string } };
    const r = ec.getCatalogSummary();
    docs.push({ id: uid(), category: 'artifact', title: `Engine Catalog: ${r.total} engines`, summary: `${r.acceptance_cases} acceptance cases`, content: 'Engine catalog', created_at: r.created_at });
  } catch { /* */ }
  try {
    const oc = require('./output-contracts') as { getVisibilityReport(): { visible: number; tasks_checked: number; created_at: string } };
    const r = oc.getVisibilityReport();
    docs.push({ id: uid(), category: 'artifact', title: `Deliverables: ${r.visible}/${r.tasks_checked} visible`, summary: 'Output contract compliance', content: 'Deliverable visibility', created_at: r.created_at });
  } catch { /* */ }
  try {
    const mas = require('./mission-acceptance-suite') as { getRunSummary(): { cases_total: number; cases_passed: number; created_at: string } };
    const r = mas.getRunSummary();
    docs.push({ id: uid(), category: 'artifact', title: `Acceptance Suite: ${r.cases_total} cases`, summary: `${r.cases_passed} passed`, content: 'Mission acceptance suite', created_at: r.created_at });
  } catch { /* */ }
  try {
    const sd = require('./structured-deliverables') as { getDeliverableSchema(id: string): { kind: string; fields: string[] } };
    const schemas = ['newsroom', 'shopping', 'startup', 'legal', 'research'].map(e => sd.getDeliverableSchema(e));
    docs.push({ id: uid(), category: 'artifact', title: `Deliverable Schemas: ${schemas.length} engine families`, summary: 'Structured deliverable types', content: 'Schemas for newsroom, shopping, code, document, recommendation', created_at: new Date().toISOString() });
  } catch { /* */ }
  try {
    const ds = require('./deliverable-store') as { getStoreIndex(): { totalDeliverables: number; totalVersions: number } };
    const idx = ds.getStoreIndex();
    docs.push({ id: uid(), category: 'artifact', title: `Deliverable Store: ${idx.totalDeliverables} deliverables, ${idx.totalVersions} versions`, summary: 'Versioned deliverable store', content: 'Append-only versioned store', created_at: new Date().toISOString() });
  } catch { /* */ }
  return docs;
}

/** Build complete memory viewer payload */
export function getMemoryViewerData(): MemoryViewerData {
  const operator = collectOperatorDocs();
  const engineDocs = collectEngineDocs();
  const projectDocs = collectProjectDocs();
  const decisions = collectDecisionDocs();
  const artifacts = collectArtifactDocs();
  const providerDocs = collectProviderDocs();
  const governanceDocs = collectGovernanceDocs();
  const allArtifacts = [...artifacts, ...providerDocs, ...governanceDocs];
  const reports = collectReportDocs();
  const missionStatementDocs = collectMissionStatementDocs();

  const totalCount = operator.length
    + Object.values(engineDocs).reduce((s, d) => s + d.length, 0)
    + projectDocs.length + decisions.length + allArtifacts.length
    + reports.length + missionStatementDocs.length;

  return {
    operator,
    engines: engineDocs,
    projects: projectDocs,
    decisions,
    artifacts: allArtifacts,
    reports,
    mission_statements: missionStatementDocs,
    total_count: totalCount,
  };
}

/** Get documents filtered by category */
export function getDocumentsByCategory(category: MemoryDocument['category']): MemoryDocument[] {
  const data = getMemoryViewerData();
  const all: MemoryDocument[] = [
    ...data.operator,
    ...Object.values(data.engines).flat(),
    ...data.projects,
    ...data.decisions,
    ...data.artifacts,
    ...data.reports,
    ...data.mission_statements,
  ];
  return all.filter(d => d.category === category);
}

/** Get documents filtered by domain */
export function getDocumentsByDomain(domain: Domain): MemoryDocument[] {
  const data = getMemoryViewerData();
  const engineDocs = data.engines[domain] || [];
  const all: MemoryDocument[] = [
    ...engineDocs,
    ...data.projects.filter(d => d.domain === domain),
    ...data.decisions.filter(d => d.domain === domain),
    ...data.artifacts.filter(d => d.domain === domain),
    ...data.reports.filter(d => d.domain === domain),
    ...data.mission_statements.filter(d => d.domain === domain),
  ];
  return all;
}

/** Search documents by keyword */
export function searchDocuments(query: string, limit: number = 20): MemoryDocument[] {
  const data = getMemoryViewerData();
  const all: MemoryDocument[] = [
    ...data.operator,
    ...Object.values(data.engines).flat(),
    ...data.projects,
    ...data.decisions,
    ...data.artifacts,
    ...data.reports,
    ...data.mission_statements,
  ];

  const lowerQuery = query.toLowerCase();
  return all
    .filter(d =>
      d.title.toLowerCase().includes(lowerQuery) ||
      d.summary.toLowerCase().includes(lowerQuery) ||
      d.content.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit);
}

module.exports = {
  getMemoryViewerData,
  getDocumentsByCategory,
  getDocumentsByDomain,
  searchDocuments,
};
