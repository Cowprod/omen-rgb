'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { WebSocketServer } = require('ws');
const { Lighting } = require('./lighting');
const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 3080);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
const lighting = new Lighting(process.env.STATE_FILE || path.join(__dirname, '..', 'data', 'state.json'));
const root = path.join(__dirname, '..', 'public');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = http.createServer((req, res) => {
  if (req.method !== 'GET') { res.writeHead(405); return res.end(); }
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  if (!['/index.html', '/app.js'].includes(pathname)) { res.writeHead(404); return res.end(); }
  const file = path.join(root, pathname.slice(1));
  fs.readFile(file, (error, content) => {
    if (error) { res.writeHead(500); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(content);
  });
});
const wss = new WebSocketServer({ server, maxPayload: 4096 });
lighting.subscribe(state => {
  const message = JSON.stringify({ type: 'state', state });
  for (const client of wss.clients) if (client.readyState === 1) client.send(message);
});
wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'state', state: lighting.snapshot() }));
  ws.on('message', async raw => {
    try {
      const data = JSON.parse(raw.toString());
      if (!data || data.type !== 'command') throw new Error('Expected command');
      await lighting.change(data.command);
    } catch (e) { if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'error', message: e.message })); }
  });
});
server.listen(port, host, () => console.log('omen-rgb http://' + host + ':' + port));
lighting.initialize();
