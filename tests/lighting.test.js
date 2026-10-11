'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Lighting } = require('../src/lighting');
function setup(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'omen-rgb-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const writes = [];
  const file = path.join(dir, 'state.json');
  const light = new Lighting(file, { findDevice: () => '/dev/fake', setColor: p => writes.push(p) });
  return { light, writes, file };
}
test('OFF persists and never emits nonblack colors on later zone changes', async t => {
  const { light, writes, file } = setup(t);
  await light.change({ type: 'power', enabled: false });
  await light.change({ type: 'zone', zone: 'fans', color: 'FF0000', brightness: 70 });
  assert.equal(light.state.enabled, false);
  assert.equal(light.state.zones.fans.color, 'FF0000');
  assert.ok(writes.every(w => w.color === '000000'));
  assert.equal(JSON.parse(fs.readFileSync(file)).enabled, false);
  const restarted = new Lighting(file, { findDevice: () => '/dev/fake', setColor: p => writes.push(p) });
  await restarted.initialize();
  assert.equal(restarted.state.enabled, false);
  assert.ok(writes.every(w => w.color === '000000'));
  await restarted.change({ type: 'power', enabled: true });
  assert.equal(writes.at(-1).color, 'FF0000');
});
test('invalid commands do not modify persistent state', async t => {
  const { light, file } = setup(t);
  await light.change({ type: 'power', enabled: false });
  const previous = fs.readFileSync(file, 'utf8');
  await assert.rejects(light.change({ type: 'zone', zone: 'fans', color: 'oops' }));
  assert.equal(fs.readFileSync(file, 'utf8'), previous);
});
test('HID failure is reflected in snapshot without losing desired state', async t => {
  const { file } = setup(t);
  const light = new Lighting(file, { findDevice: () => { throw new Error('USB disconnected'); } });
  await light.change({ type: 'power', enabled: false });
  assert.equal(light.snapshot().error, 'USB disconnected');
  assert.equal(light.snapshot().applied, null);
  assert.equal(light.state.enabled, false);
});
