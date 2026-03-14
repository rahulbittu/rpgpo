// Tests: Background enrichment scheduler
const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const scheduler = require('../lib/scheduler');

afterEach(() => {
  scheduler.stop(); // cleanup after each test
});

describe('Scheduler: control', () => {
  it('starts and reports running', () => {
    scheduler.start();
    const status = scheduler.getStatus();
    assert.ok(status.running);
    assert.ok(!status.paused);
    scheduler.stop();
  });

  it('stops and reports not running', () => {
    scheduler.start();
    scheduler.stop();
    const status = scheduler.getStatus();
    assert.ok(!status.running);
  });

  it('pauses and resumes', () => {
    scheduler.start();
    scheduler.pause();
    assert.ok(scheduler.getStatus().paused);
    scheduler.resume();
    assert.ok(!scheduler.getStatus().paused);
    scheduler.stop();
  });

  it('reports status fields', () => {
    const status = scheduler.getStatus();
    assert.ok(typeof status.running === 'boolean');
    assert.ok(typeof status.paused === 'boolean');
    assert.ok(typeof status.total_runs === 'number');
    assert.ok(typeof status.total_errors === 'number');
    assert.ok(typeof status.interval_ms === 'number');
  });

  it('does not double-start', () => {
    scheduler.start();
    scheduler.start(); // should not create second interval
    const status = scheduler.getStatus();
    assert.ok(status.running);
    scheduler.stop();
  });
});
