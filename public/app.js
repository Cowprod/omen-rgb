'use strict';
(() => {
  const names = { logo: 'Logo', interior: 'Intérieur', fans: 'Ventilateurs avant' };
  const root = document.getElementById('zones');
  const inputs = {};
  for (const [name, label] of Object.entries(names)) {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = '<section class="card h-100"><div class="card-body"><h2 class="h5"></h2><div class="input-group mb-3"><span class="input-group-text">Couleur</span><input type="color" class="form-control form-control-color color" aria-label="Couleur"></div><label class="form-label">Luminosité <output class="level">100%</output></label><input type="range" class="form-range brightness" min="0" max="100" step="1" value="100"></div></section>';
    col.querySelector('h2').textContent = label;
    root.append(col);
    const color = col.querySelector('.color'), brightness = col.querySelector('.brightness'), level = col.querySelector('.level');
    inputs[name] = { color, brightness, level };
    color.addEventListener('change', () => send({ type: 'zone', zone: name, color: color.value.slice(1), brightness: Number(brightness.value) }));
    brightness.addEventListener('input', () => { level.textContent = brightness.value + '%'; });
    brightness.addEventListener('change', () => send({ type: 'zone', zone: name, color: color.value.slice(1), brightness: Number(brightness.value) }));
  }
  let socket, retry = 500;
  const status = document.getElementById('connection');
  const message = document.getElementById('message');
  function send(command) {
    if (!socket || socket.readyState !== WebSocket.OPEN) { message.textContent = 'Connexion indisponible'; return; }
    socket.send(JSON.stringify({ type: 'command', command }));
  }
  document.getElementById('enabled').addEventListener('change', e => send({ type: 'power', enabled: e.target.checked }));
  document.getElementById('applyAll').addEventListener('click', () => send({ type: 'all', color: document.getElementById('allColor').value.slice(1) }));
  function connect() {
    socket = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
    socket.addEventListener('open', () => { status.textContent = 'Connecté'; status.className = 'badge bg-success'; retry = 500; });
    socket.addEventListener('message', e => {
      let data; try { data = JSON.parse(e.data); } catch { return; }
      if (data.type === 'error') { message.textContent = data.message; return; }
      if (data.type !== 'state') return;
      const s = data.state;
      document.getElementById('enabled').checked = s.enabled;
      for (const [name, z] of Object.entries(s.zones)) {
        const ui = inputs[name]; if (!ui) continue;
        if (document.activeElement !== ui.color) ui.color.value = '#' + z.color;
        if (document.activeElement !== ui.brightness) { ui.brightness.value = z.brightness; ui.level.textContent = z.brightness + '%'; }
      }
      document.getElementById('hardware').textContent = s.error ? 'Erreur HID : ' + s.error : (s.applied ? 'Commande appliquée via ' + s.applied.device : 'Contrôleur non initialisé');
      message.textContent = s.enabled ? 'Éclairage actif' : 'Mode OFF : réglages mémorisés sans allumage';
    });
    socket.addEventListener('close', () => { status.textContent = 'Déconnecté — reconnexion…'; status.className = 'badge bg-warning'; setTimeout(connect, retry); retry = Math.min(retry * 2, 10000); });
    socket.addEventListener('error', () => socket.close());
  }
  connect();
})();
