import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SalonMath from '../js/salonmath.js';

describe('calcColorCorrection — validation & math correctness', () => {
  test('3 stages at $85/hr', () => {
    const res = SalonMath.calcColorCorrection(3, 85, '$');
    assert.equal(res.isValid, true);
    assert.equal(res.data.quote, 394);
  });
  test('stages beyond 12 rejected', () => {
    const res = SalonMath.calcColorCorrection(20, 85, '$');
    assert.equal(res.isValid, false);
  });
  test('blank stages rejected', () => {
    const res = SalonMath.calcColorCorrection('', 85, '$');
    assert.equal(res.isValid, false);
  });
  test('zero hourly rate rejected', () => {
    const res = SalonMath.calcColorCorrection(3, 0, '$');
    assert.equal(res.isValid, false);
  });
});

describe('calcFoilUsage — validation', () => {
  test('valid service type', () => {
    const res = SalonMath.calcFoilUsage('full');
    assert.equal(res.isValid, true);
    assert.match(res.main, /70–90/);
  });
  test('invalid service type rejected (previously silently defaulted to full)', () => {
    const res = SalonMath.calcFoilUsage('bogus');
    assert.equal(res.isValid, false);
  });
});

describe('calcPermRod — validation', () => {
  test('valid curl type', () => {
    const res = SalonMath.calcPermRod('spiral');
    assert.equal(res.isValid, true);
    assert.match(res.main, /Red \/ Yellow/);
  });
  test('invalid curl type rejected (previously silently defaulted to beach)', () => {
    const res = SalonMath.calcPermRod('bogus');
    assert.equal(res.isValid, false);
  });
});

describe('calcKeratinDosage — validation', () => {
  test('valid hair length', () => {
    const res = SalonMath.calcKeratinDosage('long', false);
    assert.equal(res.isValid, true);
    assert.match(res.main, /75–90ml/);
  });
  test('invalid hair length rejected (previously silently defaulted to medium)', () => {
    const res = SalonMath.calcKeratinDosage('bogus', false);
    assert.equal(res.isValid, false);
  });
  test('imperial unit conversion', () => {
    const res = SalonMath.calcKeratinDosage('medium', true);
    assert.equal(res.isValid, true);
    assert.match(res.main, /fl oz/);
  });
});
