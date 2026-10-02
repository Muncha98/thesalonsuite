import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SalonMath from '../js/salonmath.js';

describe('calcTonerRatio — validation & math correctness', () => {
  test('1:1 ratio', () => {
    const res = SalonMath.calcTonerRatio(30, '1:1', false);
    assert.equal(res.isValid, true);
    assert.equal(res.data.developer, 30);
    assert.equal(res.data.total, 60);
  });

  test('1:2 ratio', () => {
    const res = SalonMath.calcTonerRatio(30, '1:2', false);
    assert.equal(res.data.developer, 60);
  });

  test('blank toner amount rejected', () => {
    const res = SalonMath.calcTonerRatio('', '1:1', false);
    assert.equal(res.isValid, false);
    assert.match(res.error, /required/i);
  });

  test('invalid ratio rejected', () => {
    const res = SalonMath.calcTonerRatio(30, 'bad', false);
    assert.equal(res.isValid, false);
  });

  test('negative amount rejected', () => {
    const res = SalonMath.calcTonerRatio(-5, '1:1', false);
    assert.equal(res.isValid, false);
  });

  test('excessive amount rejected', () => {
    const res = SalonMath.calcTonerRatio(600, '1:1', false);
    assert.equal(res.isValid, false);
  });
});
