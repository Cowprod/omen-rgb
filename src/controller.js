'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { makeStaticReport } = require('./protocol');

const HID_ID = /^HID_ID=[0-9A-Fa-f]+:0000103C:000084FD$/mi;

function findDevice(sysPath = '/sys/class/hidraw') {
  const matches = [];
  for (const name of fs.readdirSync(sysPath)) {
    if (!/^hidraw\d+$/.test(name)) continue;
    let info;
    try {
      info = fs.readFileSync(path.join(sysPath, name, 'device', 'uevent'), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (HID_ID.test(info)) matches.push('/dev/' + name);
  }
  if (matches.length === 0) throw new Error('HP TracerLED (103c:84fd) not found');
  if (matches.length > 1) throw new Error('Multiple HP TracerLED devices found; specify --device');
  return matches[0];
}

function setColor({ device = findDevice(), zone, color, brightness = 100 }) {
  const report = makeStaticReport(zone, color, brightness);
  const fd = fs.openSync(device, 'w');
  try {
    const written = fs.writeSync(fd, report);
    if (written !== report.length) throw new Error('Incomplete HID report write');
  } finally {
    fs.closeSync(fd);
  }
  return device;
}

module.exports = { findDevice, setColor };
