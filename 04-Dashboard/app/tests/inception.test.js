// Tests: Board-first task inception
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const inception = require('../lib/inception');

function makeTask(raw_request, domain = 'topranker', urgency = 'normal') {
  return {
    task_id: 't_test', title: raw_request.slice(0, 60), raw_request,
    domain, urgency, desired_outcome: '', status: 'intake',
  };
}

describe('Inception: routing', () => {
  it('routes code tasks to builder_heavy', () => {
    const task = makeTask('Implement a new search endpoint in TopRanker API');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    assert.equal(routing.route, 'builder_heavy');
    assert.ok(routing.agents_recommended.some(a => a.includes('Claude')));
    assert.ok(routing.auto_deliberate);
  });

  it('routes research tasks to research_heavy', () => {
    const task = makeTask('Research competitor leaderboard apps and analyze their features');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    assert.equal(routing.route, 'research_heavy');
    assert.ok(routing.agents_recommended.some(a => a.includes('Perplexity')));
  });

  it('routes review tasks to review_report', () => {
    const task = makeTask('Review the latest daily brief and summarize findings');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    assert.equal(routing.route, 'review_report');
  });

  it('routes strategy tasks to board_deliberation', () => {
    const task = makeTask('Decide the best approach for the TopRanker roadmap');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    assert.equal(routing.route, 'board_deliberation');
  });

  it('routes short simple requests to direct_answer', () => {
    const task = makeTask('What time is the meeting?');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    assert.equal(routing.route, 'direct_answer');
    assert.ok(!routing.auto_deliberate);
  });

  it('defaults to board_deliberation for general tasks', () => {
    const task = makeTask('Create a comprehensive plan for improving our onboarding flow and user retention metrics across all platforms');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    assert.equal(routing.route, 'board_deliberation');
  });
});

describe('Inception: context fusion', () => {
  it('builds inception context with operator summary', () => {
    const task = makeTask('Test task');
    const ctx = inception.buildInceptionContext(task);
    assert.ok(typeof ctx.operator_summary === 'string');
    assert.ok(ctx.operator_summary.length > 0);
    assert.ok(typeof ctx.mission_summary === 'string');
    assert.ok(typeof ctx.budget_status === 'string');
    assert.ok(Array.isArray(ctx.agent_availability));
    assert.ok(Array.isArray(ctx.privacy_restrictions));
  });

  it('includes agent availability', () => {
    const task = makeTask('Test task');
    const ctx = inception.buildInceptionContext(task);
    assert.ok(ctx.agent_availability.length > 0);
    assert.ok(ctx.agent_availability.some(a => a.agent.includes('Claude')));
  });
});

describe('Inception: capability matching', () => {
  it('matches coding capability for builder tasks', () => {
    const task = makeTask('Implement feature X');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    const caps = inception.matchCapabilities(task, routing);
    assert.ok(caps.some(c => c.capability_id === 'coding' && c.relevance === 'primary'));
  });

  it('matches research capability for research tasks', () => {
    const task = makeTask('Research competitor analysis');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    const caps = inception.matchCapabilities(task, routing);
    assert.ok(caps.some(c => c.capability_id === 'research'));
  });
});

describe('Inception: value derivation', () => {
  it('derives code-specific value for builder tasks', () => {
    const task = makeTask('Implement search feature');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    const value = inception.deriveValue(task, ctx, routing);
    assert.ok(value.high_value_answer.includes('code'));
    assert.ok(value.low_value_answer.includes('Vague'));
  });

  it('derives research-specific value for research tasks', () => {
    const task = makeTask('Research market trends');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    const value = inception.deriveValue(task, ctx, routing);
    assert.ok(value.high_value_answer.includes('findings') || value.high_value_answer.includes('Actionable'));
  });
});

describe('Inception: risk assessment', () => {
  it('identifies technical risk for builder tasks', () => {
    const task = makeTask('Build new API endpoint');
    const ctx = inception.buildInceptionContext(task);
    const routing = inception.determineRoute(task, ctx);
    const risks = inception.assessRisks(task, ctx, routing);
    assert.ok(risks.some(r => r.type === 'technical'));
  });
});

describe('Inception: full inception', () => {
  it('produces complete inception object', () => {
    const task = makeTask('Audit TopRanker startup performance and propose optimization');
    const result = inception.runInception(task);
    assert.ok(result.task_id);
    assert.ok(result.inception_context);
    assert.ok(result.recommendation);
    assert.ok(result.routing);
    assert.ok(Array.isArray(result.capability_match));
    assert.ok(result.value_summary);
    assert.ok(Array.isArray(result.risks));
    assert.ok(result.created_at);
    assert.ok(['direct_answer', 'board_deliberation', 'research_heavy', 'builder_heavy', 'review_report', 'clarification_needed', 'blocked'].includes(result.routing.route));
  });

  it('includes recommendation with confidence', () => {
    const task = makeTask('Implement new feature');
    const result = inception.runInception(task);
    assert.ok(['low', 'medium', 'high'].includes(result.recommendation.confidence));
    assert.ok(result.recommendation.interpretation.length > 0);
    assert.ok(result.recommendation.expected_value.length > 0);
  });
});
