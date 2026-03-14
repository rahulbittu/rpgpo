"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const QUEUE_FILE = path.resolve(__dirname, '..', '..', 'state', 'tasks.json');
const bus = new EventEmitter();
bus.setMaxListeners(50);
function ensureFile() {
    const dir = path.dirname(QUEUE_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(QUEUE_FILE))
        fs.writeFileSync(QUEUE_FILE, '[]');
}
function readQueue() {
    ensureFile();
    try {
        return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'));
    }
    catch {
        return [];
    }
}
function writeQueue(tasks) {
    ensureFile();
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(tasks, null, 2));
}
function addTask(type, label, meta = {}) {
    const tasks = readQueue();
    const task = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        type, label, status: 'queued', meta,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        output: null, error: null, filesWritten: [],
    };
    tasks.unshift(task);
    if (tasks.length > 100)
        tasks.length = 100;
    writeQueue(tasks);
    bus.emit('task', { event: 'task_added', task });
    return task;
}
function updateTask(id, updates) {
    const tasks = readQueue();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1)
        return null;
    Object.assign(tasks[idx], updates, { updatedAt: new Date().toISOString() });
    writeQueue(tasks);
    bus.emit('task', { event: 'task_updated', task: tasks[idx] });
    return tasks[idx];
}
function getTask(id) {
    return readQueue().find((t) => t.id === id) || null;
}
function getQueued() {
    return readQueue().filter((t) => t.status === 'queued');
}
function getAll() {
    return readQueue();
}
module.exports = { addTask, updateTask, getTask, getQueued, getAll, readQueue, bus };
//# sourceMappingURL=queue.js.map