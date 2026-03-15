// GPO Recurring Task Scheduler — Cron-like scheduling with automatic execution

import type { RecurringSchedule } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');

const SCHEDULES_FILE = path.resolve(__dirname, '..', '..', 'state', 'recurring-schedules.json');

function readSchedules(): RecurringSchedule[] {
  try { if (fs.existsSync(SCHEDULES_FILE)) return JSON.parse(fs.readFileSync(SCHEDULES_FILE, 'utf-8')); } catch { /* */ }
  return [];
}

function writeSchedules(schedules: RecurringSchedule[]): void {
  const dir = path.dirname(SCHEDULES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
}

export function createSchedule(data: Partial<RecurringSchedule>): RecurringSchedule {
  const schedules = readSchedules();
  const schedule: RecurringSchedule = {
    id: 'sched_' + crypto.randomBytes(4).toString('hex'),
    name: data.name || 'Untitled Schedule',
    templateId: data.templateId || '',
    cron: data.cron || '0 8 * * *', // default: 8am daily
    timezone: data.timezone || 'LOCAL',
    enabled: data.enabled ?? true,
    misfire: data.misfire || 'skip',
    concurrency: data.concurrency || 'skip_if_running',
    maxCostPerRunUsd: data.maxCostPerRunUsd,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    runCount: 0,
    history: [],
  };
  schedule.nextRunAt = computeNextRun(schedule.cron);
  schedules.push(schedule);
  writeSchedules(schedules);
  return schedule;
}

export function getSchedule(id: string): RecurringSchedule | null {
  return readSchedules().find(s => s.id === id) || null;
}

export function listSchedules(): RecurringSchedule[] {
  return readSchedules().sort((a, b) => (a.nextRunAt || 0) - (b.nextRunAt || 0));
}

export function updateSchedule(id: string, updates: Partial<RecurringSchedule>): RecurringSchedule | null {
  const schedules = readSchedules();
  const idx = schedules.findIndex(s => s.id === id);
  if (idx < 0) return null;
  schedules[idx] = { ...schedules[idx], ...updates, updatedAt: Date.now() };
  if (updates.cron) schedules[idx].nextRunAt = computeNextRun(updates.cron);
  writeSchedules(schedules);
  return schedules[idx];
}

export function deleteSchedule(id: string): boolean {
  const schedules = readSchedules();
  const idx = schedules.findIndex(s => s.id === id);
  if (idx < 0) return false;
  schedules.splice(idx, 1);
  writeSchedules(schedules);
  return true;
}

export function recordRun(id: string, taskId: string, status: 'success' | 'failed' | 'skipped'): void {
  const schedules = readSchedules();
  const schedule = schedules.find(s => s.id === id);
  if (!schedule) return;
  schedule.lastRunAt = Date.now();
  schedule.nextRunAt = computeNextRun(schedule.cron);
  schedule.runCount++;
  schedule.history.push({ runAt: Date.now(), taskId, status });
  if (schedule.history.length > 50) schedule.history = schedule.history.slice(-30);
  writeSchedules(schedules);
}

export function getDueSchedules(): RecurringSchedule[] {
  const now = Date.now();
  return readSchedules().filter(s => s.enabled && s.nextRunAt && s.nextRunAt <= now);
}

/**
 * Simple cron next-run computation.
 * Supports: minute hour dom month dow (standard 5-field)
 * Returns next run timestamp in ms.
 */
function computeNextRun(cron: string): number {
  const parts = cron.split(/\s+/);
  if (parts.length < 5) return Date.now() + 3600000; // fallback: 1 hour

  const now = new Date();
  // Simple implementation: advance by 1 minute until match (max 48h lookahead)
  const check = new Date(now);
  check.setSeconds(0, 0);
  check.setMinutes(check.getMinutes() + 1);

  for (let i = 0; i < 2880; i++) { // 48 hours of minutes
    if (matchesCron(check, parts)) {
      return check.getTime();
    }
    check.setMinutes(check.getMinutes() + 1);
  }

  return Date.now() + 86400000; // fallback: 24 hours
}

function matchesCron(date: Date, parts: string[]): boolean {
  const [min, hour, dom, month, dow] = parts;
  return matchField(date.getMinutes(), min) &&
    matchField(date.getHours(), hour) &&
    matchField(date.getDate(), dom) &&
    matchField(date.getMonth() + 1, month) &&
    matchField(date.getDay(), dow);
}

function matchField(value: number, field: string): boolean {
  if (field === '*') return true;
  if (field.includes('/')) {
    const [, step] = field.split('/');
    return value % parseInt(step) === 0;
  }
  if (field.includes(',')) {
    return field.split(',').some(v => parseInt(v) === value);
  }
  if (field.includes('-')) {
    const [from, to] = field.split('-').map(Number);
    return value >= from && value <= to;
  }
  return parseInt(field) === value;
}

module.exports = { createSchedule, getSchedule, listSchedules, updateSchedule, deleteSchedule, recordRun, getDueSchedules };
