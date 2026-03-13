// RPGPO Server-Sent Events hub
// Shared between server and worker via file-based signaling

const { EventEmitter } = require('events');

const hub = new EventEmitter();
hub.setMaxListeners(50);

// Clients connected via SSE
const clients = new Set();

function addClient(res) {
  clients.add(res);
  res.on('close', () => clients.delete(res));
}

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try { client.write(msg); } catch {}
  }
  hub.emit(event, data);
}

function emit(event, data) {
  broadcast(event, data);
}

module.exports = { addClient, broadcast, emit, hub, clients };
