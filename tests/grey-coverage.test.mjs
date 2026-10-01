import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SalonMath from '../js/salonmath.js';

describe('calcGreyCoverage — validation & math correctness', () => {
  test('50% grey on 60g batch splits 30/30', () => {
    const res = SalonMath.calcGreyCoverage(50, 60, false);
    assert.equal(res.isValid, true);
    assert.equal(res.data.baseAmount, 30);
    assert.equal(res.data.fashionAmount, 30);
  });

  test('25% grey uses 25% base ratio', () => {
    const res = SalonMath.calcGreyCoverage(25, 60, false);
    assert.equal(res.data.baseAmount, 15);
  });

  test('100% grey uses 75% base ratio', () => {
    const res = SalonMath.calcGreyCoverage(100, 60, false);
    assert.equal(res.data.baseAmount, 45);
  });

  test('grey percentage out of range rejected', () => {
    const res = SalonMath.calcGreyCoverage(150, 60, false);
    assert.equal(res.isValid, false);
  });

  test('blank total amount rejected', () => {
    const res = SalonMath.calcGreyCoverage(50, '', false);
    assert.equal(res.isValid, false);
    assert.match(res.error, /required/i);
  });

  test('zero total amount rejected', () => {
    const res = SalonMath.calcGreyCoverage(50, 0, false);
    assert.equal(res.isValid, false);
  });
});
