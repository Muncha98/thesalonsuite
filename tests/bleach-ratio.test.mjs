import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SalonMath from '../js/salonmath.js';

describe('calcBleachRatio — validation & math correctness', () => {
  test('1:2 ratio on 30g gives 60g developer, 90g total', () => {
    const res = SalonMath.calcBleachRatio(30, '1:2', false);
    assert.equal(res.isValid, true);
    assert.equal(res.data.devAmount, 60);
    assert.equal(res.data.totalWeight, 90);
  });

  test('1:1 ratio', () => {
    const res = SalonMath.calcBleachRatio(30, '1:1', false);
    assert.equal(res.data.devAmount, 30);
  });

  test('1:3 ratio', () => {
    const res = SalonMath.calcBleachRatio(20, '1:3', false);
    assert.equal(res.data.devAmount, 60);
  });

  test('blank powder amount rejected', () => {
    const res = SalonMath.calcBleachRatio('', '1:2', false);
    assert.equal(res.isValid, false);
    assert.match(res.error, /required/i);
  });

  test('zero/negative powder amount rejected', () => {
    const res = SalonMath.calcBleachRatio(-5, '1:2', false);
    assert.equal(res.isValid, false);
    assert.match(res.error, /greater than zero/i);
  });

  test('unrecognized ratio rejected (previously silently defaulted to 1:2)', () => {
    const res = SalonMath.calcBleachRatio(30, 'bogus', false);
    assert.equal(res.isValid, false);
    assert.match(res.error, /valid mixing ratio/i);
  });

  test('absurdly large powder amount rejected', () => {
    const res = SalonMath.calcBleachRatio(600, '1:2', false);
    assert.equal(res.isValid, false);
    assert.match(res.error, /cannot exceed 500g/i);
  });

  test('imperial unit ceiling is lower (17.5oz)', () => {
    const res = SalonMath.calcBleachRatio(20, '1:2', true);
    assert.equal(res.isValid, false);
    assert.match(res.error, /cannot exceed 17.5oz/i);
  });
});
