// GPO Projects — First-class project layer inside missions
// Mission → Project → Task hierarchy. Every task belongs to a project.
// Project-scoped context provides sharper working memory than mission-level.

import type {
  Domain, Project, ProjectContext, ProjectSummary,
  CreateProjectRequest, ArtifactRef, DecisionRecord, OpenQuestion, ConstraintRecord,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const PROJECTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'projects.json');

function uid(): string { return 'prj_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function readProjects(): Project[] {
  try { return fs.existsSync(PROJECTS_FILE) ? JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8')) : []; }
  catch { return []; }
}

function writeProjects(projects: Project[]): void {
  const dir = path.dirname(PROJECTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
}

// ═══════════════════════════════════════════
// Default Projects — one per mission, auto-created
// ═══════════════════════════════════════════

const DEFAULT_PROJECTS: Record<string, { name: string; objective: string; repo?: string }> = {
  topranker: { name: 'TopRanker App', objective: 'Community-ranked local business leaderboard', repo: '02-Projects/TopRanker/source-repo' },
  careeregine: { name: 'Career Engine', objective: 'AI-assisted career development' },
  founder2founder: { name: 'F2F Community', objective: 'Founder community platform' },
  wealthresearch: { name: 'Wealth Research', objective: 'Investment research and analysis' },
  newsroom: { name: 'Newsroom', objective: 'News aggregation and analysis' },
  screenwriting: { name: 'Screenwriting', objective: 'Screenplay development' },
  music: { name: 'Music Production', objective: 'Music composition and production' },
  personalops: { name: 'Personal Ops', objective: 'Personal operations management' },
  general: { name: 'General', objective: 'General-purpose tasks' },
};

function ensureDefaultProjects(): void {
  const projects = readProjects();
  let changed = false;

  for (const [domain, def] of Object.entries(DEFAULT_PROJECTS)) {
    if (!projects.some(p => p.domain === domain && p.status === 'active')) {
      projects.push(createProjectRecord(domain as Domain, def.name, def.objective, def.repo));
      changed = true;
    }
  }

  if (changed) writeProjects(projects);
}

function createProjectRecord(domain: Domain, name: string, objective: string, repo?: string): Project {
  return {
    project_id: uid(), domain, project_name: name,
    status: 'active', objective, summary: '',
    repo_mappings: repo ? [repo] : [],
    artifacts: [], decisions: [], open_questions: [], constraints: [],
    next_actions: [], known_issues: [], context_summary: '',
    tasks_completed: 0, tasks_failed: 0,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
}

// Initialize defaults on load
ensureDefaultProjects();

// ═══════════════════════════════════════════
// Project CRUD
// ═══════════════════════════════════════════

/** Create a new project */
export function createProject(req: CreateProjectRequest): Project {
  const projects = readProjects();
  const project = createProjectRecord(
    req.domain, req.project_name, req.objective || '', req.repo_path
  );
  projects.unshift(project);
  writeProjects(projects);
  return project;
}

/** Get a project by ID */
export function getProject(projectId: string): Project | null {
  return readProjects().find(p => p.project_id === projectId) || null;
}

/** Get all projects for a mission */
export function getProjectsForMission(domain: Domain): Project[] {
  return readProjects().filter(p => p.domain === domain);
}

/** Get the active/default project for a mission */
export function getDefaultProject(domain: Domain): Project | null {
  const projects = readProjects().filter(p => p.domain === domain && p.status === 'active');
  return projects[0] || null;
}

/** Get all projects */
export function getAllProjects(): Project[] {
  return readProjects();
}

/** Update a project */
export function updateProject(projectId: string, updates: Partial<Project>): Project | null {
  const projects = readProjects();
  const idx = projects.findIndex(p => p.project_id === projectId);
  if (idx === -1) return null;
  Object.assign(projects[idx], updates, { updated_at: new Date().toISOString() });
  writeProjects(projects);
  return projects[idx];
}

/** Archive a project */
export function archiveProject(projectId: string): Project | null {
  return updateProject(projectId, { status: 'archived' });
}

/** Get project summaries for a mission */
export function getProjectSummaries(domain: Domain): ProjectSummary[] {
  return readProjects()
    .filter(p => p.domain === domain)
    .map(p => ({
      project_id: p.project_id,
      domain: p.domain,
      project_name: p.project_name,
      status: p.status,
      objective: p.objective,
      tasks_completed: p.tasks_completed,
      has_blockers: p.open_questions.some(q => !q.resolved_at) || p.known_issues.length > 0,
      updated_at: p.updated_at,
    }));
}

// ═══════════════════════════════════════════
// Project Context — sharper than mission-level
// ═══════════════════════════════════════════

/** Get project context for board/inception use */
export function getProjectContext(projectId: string): ProjectContext | null {
  const project = getProject(projectId);
  if (!project) return null;

  return {
    project_id: project.project_id,
    domain: project.domain,
    objective: project.objective,
    recent_decisions: project.decisions.slice(0, 10),
    open_questions: project.open_questions.filter(q => !q.resolved_at),
    constraints: project.constraints.filter(c => c.active),
    key_artifacts: project.artifacts.slice(0, 10),
    known_issues: project.known_issues,
    next_actions: project.next_actions,
    recent_completions: [],
    context_summary: project.context_summary || project.objective,
    updated_at: project.updated_at,
  };
}

/** Build a compact context prompt block for a project */
export function buildProjectContextBlock(projectId: string): string {
  const ctx = getProjectContext(projectId);
  if (!ctx) return '';

  const sections: string[] = [];
  sections.push(`## Project: ${ctx.objective || ctx.project_id}`);

  if (ctx.recent_decisions.length > 0) {
    sections.push(`Prior decisions:\n${ctx.recent_decisions.slice(0, 3).map(d => `- [${d.category}] ${d.decision}`).join('\n')}`);
  }
  if (ctx.open_questions.length > 0) {
    sections.push(`Open questions:\n${ctx.open_questions.slice(0, 3).map(q => `- ${q.question}`).join('\n')}`);
  }
  if (ctx.constraints.length > 0) {
    sections.push(`Constraints:\n${ctx.constraints.slice(0, 3).map(c => `- ${c.constraint}`).join('\n')}`);
  }
  if (ctx.known_issues.length > 0) {
    sections.push(`Known issues:\n${ctx.known_issues.slice(0, 3).map(i => `- ${i}`).join('\n')}`);
  }

  return sections.join('\n');
}

// ═══════════════════════════════════════════
// Project Context Updates — called from context-updater
// ═══════════════════════════════════════════

/** Record a decision in a project */
export function addProjectDecision(projectId: string, decision: Omit<DecisionRecord, 'id' | 'made_at'>): void {
  const project = getProject(projectId);
  if (!project) return;
  const record: DecisionRecord = {
    ...decision, id: 'ctx_' + Date.now().toString(36), made_at: new Date().toISOString(),
  };
  project.decisions.unshift(record);
  if (project.decisions.length > 30) project.decisions.length = 30;
  updateProject(projectId, { decisions: project.decisions });
}

/** Add an artifact to a project */
export function addProjectArtifact(projectId: string, artifact: Omit<ArtifactRef, 'id' | 'created_at'>): void {
  const project = getProject(projectId);
  if (!project) return;
  const record: ArtifactRef = {
    ...artifact, id: 'ctx_' + Date.now().toString(36), created_at: new Date().toISOString(),
  };
  project.artifacts.unshift(record);
  if (project.artifacts.length > 50) project.artifacts.length = 50;
  updateProject(projectId, { artifacts: project.artifacts });
}

/** Record task completion in project */
export function recordProjectCompletion(projectId: string, success: boolean): void {
  const project = getProject(projectId);
  if (!project) return;
  if (success) project.tasks_completed++;
  else project.tasks_failed++;
  updateProject(projectId, { tasks_completed: project.tasks_completed, tasks_failed: project.tasks_failed });
}

// ═══════════════════════════════════════════
// Migration — backfill project_id for existing tasks
// ═══════════════════════════════════════════

/** Get or create a project_id for a task's domain */
export function resolveProjectId(domain: Domain, projectId?: string): string {
  // If project_id is already set, use it
  if (projectId) {
    const existing = getProject(projectId);
    if (existing) return projectId;
  }

  // Otherwise, use the default project for the domain
  const defaultProject = getDefaultProject(domain);
  if (defaultProject) return defaultProject.project_id;

  // Create a default project if none exists
  const created = createProject({ domain, project_name: `${domain} default`, objective: '' });
  return created.project_id;
}

module.exports = {
  createProject, getProject, getProjectsForMission, getDefaultProject,
  getAllProjects, updateProject, archiveProject, getProjectSummaries,
  getProjectContext, buildProjectContextBlock,
  addProjectDecision, addProjectArtifact, recordProjectCompletion,
  resolveProjectId,
};
