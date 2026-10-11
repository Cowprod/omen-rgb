'use strict';
const { ZONES } = require('./protocol');
const { findDevice, setColor } = require('./controller');
const storage = require('./state');
class Lighting {
  constructor(file, driver = { findDevice, setColor }) {
    this.file = file;
    this.driver = driver;
    this.state = storage.load(file);
    this.applied = null;
    this.error = null;
    this.listeners = new Set();
    this.queue = Promise.resolve();
  }
  snapshot() { return { ...structuredClone(this.state), applied: this.applied, error: this.error }; }
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { for (const fn of this.listeners) fn(this.snapshot()); }
  async apply() {
    try {
      const device = this.driver.findDevice();
      const zones = {};
      for (const [name, id] of Object.entries(ZONES)) {
        const desired = this.state.zones[name];
        const actual = this.state.enabled ? desired : { color: '000000', brightness: 100 };
        this.driver.setColor({ device, zone: id, ...actual });
        zones[name] = { ...actual };
      }
      this.applied = { enabled: this.state.enabled, zones, device };
      this.error = null;
    } catch (e) {
      this.applied = null;
      this.error = e.message;
    }
    this.emit();
  }
  enqueue(work) {
    const result = this.queue.then(work);
    this.queue = result.catch(() => {});
    return result;
  }
  initialize() { return this.enqueue(() => this.apply()); }
  change(command) {
    return this.enqueue(async () => {
      const next = structuredClone(this.state);
      if (!command || typeof command !== 'object' || Array.isArray(command)) throw new Error('Invalid command');
      if (command.type === 'power' && typeof command.enabled === 'boolean') next.enabled = command.enabled;
      else if (command.type === 'zone' && Object.hasOwn(ZONES, command.zone)) {
        const previous = next.zones[command.zone];
        const color = command.color === undefined ? previous.color : command.color;
        const brightness = command.brightness === undefined ? previous.brightness : command.brightness;
        if (typeof color !== 'string' || !/^[0-9a-fA-F]{6}$/.test(color) || !Number.isInteger(brightness) || brightness < 0 || brightness > 100) throw new Error('Invalid color or brightness');
        next.zones[command.zone] = { color: color.toUpperCase(), brightness };
      } else if (command.type === 'all' && typeof command.color === 'string' && /^[0-9a-fA-F]{6}$/.test(command.color)) {
        for (const name of Object.keys(ZONES)) next.zones[name].color = command.color.toUpperCase();
      } else throw new Error('Unsupported command');
      storage.save(this.file, next);
      this.state = next;
      await this.apply();
      return this.snapshot();
    });
  }
}
module.exports = { Lighting };
