'use strict';

const VENDOR_ID = '103c';
const PRODUCT_ID = '84fd';
const REPORT_SIZE = 58;
const ZONES = Object.freeze({ logo: 1, interior: 2, fans: 3 });

function makeStaticReport(zone, hex, brightness = 100) {
  if (!Number.isInteger(zone) || zone < 1 || zone > 7) {
    throw new RangeError('Zone must be an integer between 1 and 7');
  }
  if (typeof hex !== 'string' || !/^(?:#)?[0-9a-fA-F]{6}$/.test(hex)) {
    throw new TypeError('Color must be a six-digit hexadecimal RGB value');
  }
  if (!Number.isInteger(brightness) || brightness < 0 || brightness > 100) {
    throw new RangeError('Brightness must be an integer between 0 and 100');
  }

  const rgb = Buffer.from(hex.replace(/^#/, ''), 'hex');
  const report = Buffer.alloc(REPORT_SIZE);
  report[2] = 0x12;
  report[3] = 0x01; // static lighting mode
  report[4] = 0x01; // one color
  report[5] = 0x01; // first color
  rgb.copy(report, 8 + (zone - 1) * 3);
  report[48] = brightness;
  report[49] = 0x02; // static color payload
  report[54] = zone;
  report[55] = 0x01; // powered-on profile
  return report;
}

module.exports = { VENDOR_ID, PRODUCT_ID, REPORT_SIZE, ZONES, makeStaticReport };
