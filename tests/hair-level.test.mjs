/**
 * calcHairLevel validation suite — added as part of migrating tool #2
 * (hair-level-undertone-chart) through the fixed engine pipeline.
 *
 * Previously this function had NO input validation at all: any invalid
 * input (blank, non-numeric, NaN, out of range) silently fell back to
 * level 8 and returned a confidently wrong result. This mirrors the
 * rigor already applied to validateDeveloperMixing.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SalonMath from '../js/salonmath.js';

describe('calcHairLevel — validation & lookup correctness', () => {
  test('valid level returns correct undertone/neutralizer pair', () => {
    const res = SalonMath.calcHairLevel(7);
    assert.equal(res.isValid, true);
    assert.match(res.main, /Yellow-Orange/);
    assert.match(res.main, /Blue-Violet Ash/);
    assert.equal(res.data.level, 7);
  });

  test('boundary level 1 is valid', () => {
    const res = SalonMath.calcHairLevel(1);
    assert.equal(res.isValid, true);
    assert.match(res.main, /Red/);
  });

  test('boundary level 10 is valid', () => {
    const res = SalonMath.calcHairLevel(10);
    assert.equal(res.isValid, true);
    assert.match(res.main, /Pale Yellow/);
  });

  test('level 0 is rejected (previously silently fell back to level 8)', () => {
    const res = SalonMath.calcHairLevel(0);
    assert.equal(res.isValid, false);
    assert.match(res.error, /between 1.*10/i);
  });

  test('level 11 is rejected', () => {
    const res = SalonMath.calcHairLevel(11);
    assert.equal(res.isValid, false);
    assert.match(res.error, /between 1.*10/i);
  });

  test('blank input is rejected', () => {
    const res = SalonMath.calcHairLevel('');
    assert.equal(res.isValid, false);
    assert.match(res.error, /required/i);
  });

  test('non-numeric input is rejected', () => {
    const res = SalonMath.calcHairLevel('abc');
    assert.equal(res.isValid, false);
    assert.match(res.error, /valid number/i);
  });

  test('NaN is rejected', () => {
    const res = SalonMath.calcHairLevel(NaN);
    assert.equal(res.isValid, false);
  });

  test('non-integer level (5.5) is rejected rather than rounded silently', () => {
    const res = SalonMath.calcHairLevel(5.5);
    assert.equal(res.isValid, false);
    assert.match(res.error, /whole number/i);
  });

  test('string-numeric input from a slider ("8") is accepted', () => {
    const res = SalonMath.calcHairLevel('8');
    assert.equal(res.isValid, true);
    assert.equal(res.data.level, 8);
  });
});
