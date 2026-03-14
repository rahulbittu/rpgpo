// Tests: Runtime validation — malformed data is caught and patched
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  validateTask, validateSubtask, validateQueueTask, validateDeliberation,
  validateCostEntry, validateBudgetSettings, validateInstance,
  validateOperatorProfile, validateTaskArray, validateSubtaskArray,
  validateIntakeSubmission, validateRevisionPayload,
} = require('../lib/validate');

describe('validateTask', () => {
  it('accepts valid task', () => {
    const r = validateTask({ task_id: 't_1', title: 'Test', raw_request: 'Do it', status: 'intake', domain: 'general' });
    assert.ok(r.valid);
    assert.equal(r.errors.length, 0);
  });

  it('catches missing task_id', () => {
    const r = validateTask({ title: 'Test', raw_request: 'Do it', status: 'intake' });
    assert.ok(!r.valid);
    assert.ok(r.errors.some(e => e.includes('task_id')));
  });

  it('patches invalid status to intake', () => {
    const r = validateTask({ task_id: 't_1', title: 'Test', raw_request: 'X', status: 'bogus' });
    assert.equal(r.data.status, 'intake');
  });

  it('patches invalid domain to general', () => {
    const r = validateTask({ task_id: 't_1', title: 'Test', raw_request: 'X', status: 'intake', domain: 'nonexistent' });
    assert.equal(r.data.domain, 'general');
  });

  it('rejects non-object', () => {
    const r = validateTask('not an object');
    assert.ok(!r.valid);
  });

  it('rejects null', () => {
    const r = validateTask(null);
    assert.ok(!r.valid);
  });
});

describe('validateSubtask', () => {
  it('accepts valid subtask', () => {
    const r = validateSubtask({ subtask_id: 'st_1', parent_task_id: 't_1', title: 'Sub', status: 'proposed' });
    assert.ok(r.valid);
  });

  it('patches invalid status', () => {
    const r = validateSubtask({ subtask_id: 'st_1', parent_task_id: 't_1', title: 'Sub', status: 'invalid' });
    assert.equal(r.data.status, 'proposed');
  });

  it('defaults arrays when missing', () => {
    const r = validateSubtask({ subtask_id: 'st_1', parent_task_id: 't_1', title: 'Sub', status: 'proposed' });
    assert.ok(Array.isArray(r.data.files_to_read));
    assert.ok(Array.isArray(r.data.files_changed));
    assert.ok(Array.isArray(r.data.depends_on));
  });
});

describe('validateDeliberation', () => {
  it('accepts valid deliberation', () => {
    const r = validateDeliberation({
      interpreted_objective: 'Test', recommended_strategy: 'Do it',
      subtasks: [{ title: 'Step 1', stage: 'audit' }],
    });
    assert.ok(r.valid);
  });

  it('catches missing objective', () => {
    const r = validateDeliberation({ subtasks: [] });
    assert.ok(!r.valid);
    assert.ok(r.errors.some(e => e.includes('interpreted_objective')));
  });

  it('catches missing subtasks', () => {
    const r = validateDeliberation({ interpreted_objective: 'Test' });
    assert.ok(!r.valid);
  });

  it('patches subtask defaults', () => {
    const r = validateDeliberation({
      interpreted_objective: 'Test',
      subtasks: [{}],
    });
    assert.equal(r.data.subtasks[0].title, 'Subtask 1');
    assert.equal(r.data.subtasks[0].stage, 'audit');
    assert.ok(Array.isArray(r.data.subtasks[0].files_to_read));
  });
});

describe('validateCostEntry', () => {
  it('defaults numeric fields to 0', () => {
    const r = validateCostEntry({ provider: 'openai', model: 'gpt-4o' });
    assert.equal(r.data.inputTokens, 0);
    assert.equal(r.data.cost, 0);
  });

  it('defaults provider/model to unknown', () => {
    const r = validateCostEntry({});
    assert.equal(r.data.provider, 'unknown');
    assert.equal(r.data.model, 'unknown');
  });
});

describe('validateBudgetSettings', () => {
  it('provides safe defaults for non-object', () => {
    const r = validateBudgetSettings(null);
    assert.equal(r.data.geminiModel, 'gemini-2.5-flash-lite');
    assert.equal(r.data.builderTimeoutMinutes, 10);
  });
});

describe('validateTaskArray', () => {
  it('validates array of tasks', () => {
    const result = validateTaskArray([
      { task_id: 't_1', title: 'OK', raw_request: 'X', status: 'intake' },
      { task_id: 't_2', title: 'Bad', raw_request: 'X', status: 'bogus' },
    ]);
    assert.equal(result.length, 2);
    assert.equal(result[1].status, 'intake'); // patched
  });

  it('returns empty array for non-array', () => {
    assert.deepEqual(validateTaskArray('not array'), []);
    assert.deepEqual(validateTaskArray(null), []);
  });
});

describe('validateIntakeSubmission', () => {
  it('accepts valid submission', () => {
    const r = validateIntakeSubmission({ raw_request: 'Build feature X' });
    assert.ok(r.valid);
  });

  it('rejects empty raw_request', () => {
    const r = validateIntakeSubmission({ raw_request: '' });
    assert.ok(!r.valid);
  });

  it('rejects missing raw_request', () => {
    const r = validateIntakeSubmission({});
    assert.ok(!r.valid);
  });

  it('patches invalid domain', () => {
    const r = validateIntakeSubmission({ raw_request: 'Test', domain: 'fake' });
    assert.ok(r.valid);
    assert.equal(r.data.domain, undefined);
  });
});

describe('validateRevisionPayload', () => {
  it('accepts valid notes', () => {
    const r = validateRevisionPayload({ notes: 'Fix the alignment' });
    assert.ok(r.valid);
  });

  it('rejects empty notes', () => {
    const r = validateRevisionPayload({ notes: '' });
    assert.ok(!r.valid);
  });
});
