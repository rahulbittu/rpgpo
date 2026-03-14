import type { QueueTask, QueueTaskType, QueueTaskStatus } from './types';

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const QUEUE_FILE: string = path.resolve(__dirname, '..', '..', 'state', 'tasks.json');
const bus: InstanceType<typeof EventEmitter> = new EventEmitter();
bus.setMaxListeners(50);

function ensureFile(): void {
  const dir: string = path.dirname(QUEUE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(QUEUE_FILE)) fs.writeFileSync(QUEUE_FILE, '[]');
}

function readQueue(): QueueTask[] {
  ensureFile();
  try { return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8')); } catch { return []; }
}

function writeQueue(tasks: QueueTask[]): void {
  ensureFile();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(tasks, null, 2));
}

function addTask(type: QueueTaskType, label: string, meta: Record<string, unknown> = {}): QueueTask {
  const tasks = readQueue();
  const task: QueueTask = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type, label, status: 'queued' as QueueTaskStatus, meta,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    output: null, error: null, filesWritten: [],
  };
  tasks.unshift(task);
  if (tasks.length > 100) tasks.length = 100;
  writeQueue(tasks);
  bus.emit('task', { event: 'task_added', task });
  return task;
}

function updateTask(id: string, updates: Partial<QueueTask>): QueueTask | null {
  const tasks = readQueue();
  const idx = tasks.findIndex((t: QueueTask) => t.id === id);
  if (idx === -1) return null;
  Object.assign(tasks[idx], updates, { updatedAt: new Date().toISOString() });
  writeQueue(tasks);
  bus.emit('task', { event: 'task_updated', task: tasks[idx] });
  return tasks[idx];
}

function getTask(id: string): QueueTask | null {
  return readQueue().find((t: QueueTask) => t.id === id) || null;
}

function getQueued(): QueueTask[] {
  return readQueue().filter((t: QueueTask) => t.status === 'queued');
}

function getAll(): QueueTask[] {
  return readQueue();
}

module.exports = { addTask, updateTask, getTask, getQueued, getAll, readQueue, bus };
