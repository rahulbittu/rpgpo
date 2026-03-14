import type { SSEEventType } from './types';
import type { ServerResponse } from 'http';

const { EventEmitter } = require('events');

const hub: InstanceType<typeof EventEmitter> = new EventEmitter();
hub.setMaxListeners(50);

const clients: Set<ServerResponse> = new Set();

function addClient(res: ServerResponse): void {
  clients.add(res);
  res.on('close', () => clients.delete(res));
}

function broadcast(event: SSEEventType, data: unknown): void {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try { client.write(msg); } catch {}
  }
  hub.emit(event, data);
}

function emit(event: SSEEventType, data: unknown): void {
  broadcast(event, data);
}

module.exports = { addClient, broadcast, emit, hub, clients };
