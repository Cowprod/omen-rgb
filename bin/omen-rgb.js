#!/usr/bin/env node
'use strict';

const { ZONES } = require('../src/protocol');
const { findDevice, setColor } = require('../src/controller');

function usage() {
  console.error('Usage: omen-rgb set <logo|interior|fans|all> <RRGGBB> [--brightness 0-100] [--device /dev/hidrawN]');
  console.error('       omen-rgb detect');
  process.exitCode = 2;
}

function main(args) {
  if (args.length === 1 && args[0] === 'detect') {
    console.log(findDevice());
    return;
  }
  if (args[0] !== 'set' || args.length < 3) return usage();
  const [, name, color, ...options] = args;
  if (name !== 'all' && !Object.hasOwn(ZONES, name)) return usage();
  let brightness = 100;
  let device;
  for (let i = 0; i < options.length; i += 2) {
    if (i + 1 >= options.length) return usage();
    const [flag, value] = [options[i], options[i + 1]];
    if (flag === '--brightness' && /^\d+$/.test(value)) brightness = Number(value);
    else if (flag === '--device' && /^\/dev\/hidraw\d+$/.test(value)) device = value;
    else return usage();
  }
  const target = device || findDevice();
  const zones = name === 'all' ? Object.values(ZONES) : [ZONES[name]];
  for (const zone of zones) {
    setColor({ device: target, zone, color, brightness });
    console.log('Zone ' + zone + ' -> #' + color.replace(/^#/, '').toUpperCase() + ' (' + target + ')');
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error('omen-rgb: ' + error.message);
  process.exitCode = 1;
}
