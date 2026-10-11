'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { makeStaticReport, ZONES } = require('../src/protocol');

test('static report for interior red matches validated HID packet', () => {
  const data = makeStaticReport(ZONES.interior, 'FF0000');
  assert.equal(data.length, 58);
  assert.deepEqual([...data.subarray(11, 14)], [255, 0, 0]);
  assert.equal(data[2], 0x12);
  assert.equal(data[3], 0x01);
  assert.equal(data[4], 1);
  assert.equal(data[5], 1);
  assert.equal(data[48], 100);
  assert.equal(data[49], 0x02);
  assert.equal(data[54], 2);
  assert.equal(data[55], 1);
  assert.equal(data[8], 0);
});

test('each validated zone has its own RGB offset', () => {
  for (const zone of [1, 2, 3]) {
    const data = makeStaticReport(zone, '#123456', 50);
    assert.deepEqual([...data.subarray(8 + (zone - 1) * 3, 11 + (zone - 1) * 3)], [0x12, 0x34, 0x56]);
    assert.equal(data[48], 50);
    assert.equal(data[54], zone);
  }
});

test('rejects invalid zone, color and brightness', () => {
  assert.throws(() => makeStaticReport(0, 'FFFFFF'), RangeError);
  assert.throws(() => makeStaticReport(8, 'FFFFFF'), RangeError);
  assert.throws(() => makeStaticReport(1, 'not-rgb'), TypeError);
  assert.throws(() => makeStaticReport(1, 'FFFFFF', 101), RangeError);
});
