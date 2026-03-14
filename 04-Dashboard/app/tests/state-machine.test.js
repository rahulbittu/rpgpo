// Tests: State machine transitions
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  isValidTaskTransition, isValidSubtaskTransition,
  TASK_TERMINAL, SUBTASK_TERMINAL, SUBTASK_STOPPING, SUBTASK_APPROVABLE,
  isApprovable, isTerminal, isActive, hasBuilderResult, taskNeedsHuman,
} = require('../lib/state-machine');

describe('Task State Machine', () => {
  it('allows intake → deliberating', () => {
    assert.ok(isValidTaskTransition('intake', 'deliberating'));
  });

  it('allows deliberating → planned', () => {
    assert.ok(isValidTaskTransition('deliberating', 'planned'));
  });

  it('allows planned → executing', () => {
    assert.ok(isValidTaskTransition('planned', 'executing'));
  });

  it('allows executing → waiting_approval', () => {
    assert.ok(isValidTaskTransition('executing', 'waiting_approval'));
  });

  it('allows executing → done', () => {
    assert.ok(isValidTaskTransition('executing', 'done'));
  });

  it('blocks done → executing (terminal)', () => {
    assert.ok(!isValidTaskTransition('done', 'executing'));
  });

  it('blocks intake → done (skipping stages)', () => {
    assert.ok(!isValidTaskTransition('intake', 'done'));
  });

  it('blocks arbitrary transitions', () => {
    assert.ok(!isValidTaskTransition('planned', 'deliberating'));
    assert.ok(!isValidTaskTransition('canceled', 'executing'));
  });

  it('identifies terminal states', () => {
    assert.ok(TASK_TERMINAL.has('done'));
    assert.ok(TASK_TERMINAL.has('failed'));
    assert.ok(TASK_TERMINAL.has('canceled'));
    assert.ok(!TASK_TERMINAL.has('executing'));
  });

  it('identifies human-needed states', () => {
    assert.ok(taskNeedsHuman('waiting_approval'));
    assert.ok(taskNeedsHuman('planned'));
    assert.ok(taskNeedsHuman('intake'));
    assert.ok(!taskNeedsHuman('executing'));
    assert.ok(!taskNeedsHuman('done'));
  });
});

describe('Subtask State Machine', () => {
  it('allows proposed → queued', () => {
    assert.ok(isValidSubtaskTransition('proposed', 'queued'));
  });

  it('allows queued → running', () => {
    assert.ok(isValidSubtaskTransition('queued', 'running'));
  });

  it('allows queued → builder_running', () => {
    assert.ok(isValidSubtaskTransition('queued', 'builder_running'));
  });

  it('allows builder_running → waiting_approval', () => {
    assert.ok(isValidSubtaskTransition('builder_running', 'waiting_approval'));
  });

  it('allows waiting_approval → done (approval granted)', () => {
    assert.ok(isValidSubtaskTransition('waiting_approval', 'done'));
  });

  it('allows waiting_approval → queued (re-run)', () => {
    assert.ok(isValidSubtaskTransition('waiting_approval', 'queued'));
  });

  it('blocks done → running (terminal)', () => {
    assert.ok(!isValidSubtaskTransition('done', 'running'));
  });

  it('blocks proposed → done (skipping execution)', () => {
    assert.ok(!isValidSubtaskTransition('proposed', 'done'));
  });

  it('identifies terminal subtask states', () => {
    assert.ok(SUBTASK_TERMINAL.has('done'));
    assert.ok(SUBTASK_TERMINAL.has('failed'));
    assert.ok(SUBTASK_TERMINAL.has('blocked'));
    assert.ok(!SUBTASK_TERMINAL.has('running'));
  });

  it('identifies stopping states', () => {
    assert.ok(SUBTASK_STOPPING.has('waiting_approval'));
    assert.ok(SUBTASK_STOPPING.has('builder_fallback'));
    assert.ok(SUBTASK_STOPPING.has('builder_running'));
    assert.ok(!SUBTASK_STOPPING.has('done'));
  });

  it('identifies approvable states', () => {
    assert.ok(isApprovable('waiting_approval'));
    assert.ok(isApprovable('builder_fallback'));
    assert.ok(!isApprovable('running'));
    assert.ok(!isApprovable('done'));
  });

  it('helper functions work correctly', () => {
    assert.ok(isTerminal('done'));
    assert.ok(!isTerminal('running'));
    assert.ok(isActive('running'));
    assert.ok(isActive('queued'));
    assert.ok(!isActive('done'));
    assert.ok(hasBuilderResult('waiting_approval'));
    assert.ok(hasBuilderResult('builder_fallback'));
    assert.ok(!hasBuilderResult('running'));
  });
});
