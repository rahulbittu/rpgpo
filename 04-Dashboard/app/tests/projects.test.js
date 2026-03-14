// Tests: Project layer inside missions
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const projects = require('../lib/projects');

describe('Projects: defaults', () => {
  it('has default projects for all missions', () => {
    const all = projects.getAllProjects();
    assert.ok(all.length >= 9); // one per default mission
  });

  it('topranker has a default project', () => {
    const trProjects = projects.getProjectsForMission('topranker');
    assert.ok(trProjects.length >= 1);
    assert.equal(trProjects[0].domain, 'topranker');
    assert.equal(trProjects[0].status, 'active');
  });

  it('general has a default project', () => {
    const genProjects = projects.getProjectsForMission('general');
    assert.ok(genProjects.length >= 1);
  });
});

describe('Projects: CRUD', () => {
  it('creates a new project', () => {
    const p = projects.createProject({
      domain: 'topranker',
      project_name: 'TopRanker v2 Redesign',
      objective: 'Complete mobile redesign',
    });
    assert.ok(p.project_id);
    assert.equal(p.domain, 'topranker');
    assert.equal(p.project_name, 'TopRanker v2 Redesign');
    assert.equal(p.status, 'active');
  });

  it('gets project by ID', () => {
    const all = projects.getAllProjects();
    const first = all[0];
    const found = projects.getProject(first.project_id);
    assert.ok(found);
    assert.equal(found.project_id, first.project_id);
  });

  it('updates a project', () => {
    const all = projects.getAllProjects();
    const p = all[0];
    const updated = projects.updateProject(p.project_id, { objective: 'Updated objective' });
    assert.ok(updated);
    assert.equal(updated.objective, 'Updated objective');
  });

  it('returns null for missing project', () => {
    assert.equal(projects.getProject('nonexistent'), null);
  });
});

describe('Projects: default project resolution', () => {
  it('resolves to default project for a domain', () => {
    const pid = projects.resolveProjectId('topranker');
    assert.ok(pid);
    assert.ok(pid.startsWith('prj_'));
  });

  it('resolves with explicit project_id if valid', () => {
    const all = projects.getProjectsForMission('topranker');
    const explicit = all[0].project_id;
    const pid = projects.resolveProjectId('topranker', explicit);
    assert.equal(pid, explicit);
  });

  it('falls back to default if explicit id is invalid', () => {
    const pid = projects.resolveProjectId('topranker', 'bogus_id');
    assert.ok(pid);
    assert.ok(pid !== 'bogus_id');
  });
});

describe('Projects: context', () => {
  it('returns project context', () => {
    const all = projects.getProjectsForMission('topranker');
    const ctx = projects.getProjectContext(all[0].project_id);
    assert.ok(ctx);
    assert.equal(ctx.domain, 'topranker');
    assert.ok(Array.isArray(ctx.recent_decisions));
    assert.ok(Array.isArray(ctx.open_questions));
    assert.ok(Array.isArray(ctx.next_actions));
  });

  it('builds context block string', () => {
    const all = projects.getProjectsForMission('topranker');
    const block = projects.buildProjectContextBlock(all[0].project_id);
    assert.ok(typeof block === 'string');
    assert.ok(block.includes('Project:'));
  });

  it('returns null for missing project context', () => {
    assert.equal(projects.getProjectContext('nonexistent'), null);
  });
});

describe('Projects: summaries', () => {
  it('returns project summaries for a mission', () => {
    const summaries = projects.getProjectSummaries('topranker');
    assert.ok(summaries.length >= 1);
    assert.ok(summaries[0].project_id);
    assert.ok(summaries[0].project_name);
    assert.ok(typeof summaries[0].has_blockers === 'boolean');
  });
});
