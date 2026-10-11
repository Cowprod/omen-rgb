'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { ZONES } = require('./protocol');
const DEFAULT = { enabled: true, zones: Object.fromEntries(Object.keys(ZONES).map(k => [k, { color: 'FFFFFF', brightness: 100 }])) };
function validate(s) {
  if (!s || typeof s.enabled !== 'boolean' || !s.zones) throw new Error('Invalid saved state');
  const zones = {};
  for (const k of Object.keys(ZONES)) {
    const z = s.zones[k];
    if (!z || typeof z.color !== 'string' || !/^[0-9A-Fa-f]{6}$/.test(z.color) || !Number.isInteger(z.brightness) || z.brightness < 0 || z.brightness > 100) throw new Error('Invalid zone ' + k);
    zones[k] = { color: z.color.toUpperCase(), brightness: z.brightness };
  }
  return { enabled: s.enabled, zones };
}
function load(file) {
  try { return validate(JSON.parse(fs.readFileSync(file, 'utf8'))); }
  catch (e) { if (e.code === 'ENOENT') return structuredClone(DEFAULT); throw e; }
}
function save(file, state) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.' + process.pid + '.tmp';
  try { fs.writeFileSync(tmp, JSON.stringify(validate(state), null, 2) + '\n', { mode: 0o600 }); fs.renameSync(tmp, file); }
  finally { try { fs.unlinkSync(tmp); } catch (e) { if (e.code !== 'ENOENT') throw e; } }
}
module.exports = { DEFAULT, validate, load, save };
