import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SalonMath from '../js/salonmath.js';

describe('calcBalayagePricing — validation & math correctness', () => {
  test('standard inputs produce correct quote', () => {
    const res = SalonMath.calcBalayagePricing(3, 8.5, 2, 'yes', 3.5, 65, '$');
    assert.equal(res.isValid, true);
    assert.equal(res.data.productCost, 52.5);
    assert.equal(res.data.laborCost, 227.5);
    assert.equal(res.data.recommendedPrice, 280);
  });

  test('no bond builder removes the $12 backbar add-on', () => {
    const res = SalonMath.calcBalayagePricing(3, 8.5, 2, 'no', 3.5, 65, '$');
    assert.equal(res.data.productCost, 40.5);
  });

  test('blank required field rejected', () => {
    const res = SalonMath.calcBalayagePricing('', 8.5, 2, 'yes', 3.5, 65, '$');
    assert.equal(res.isValid, false);
    assert.match(res.error, /required/i);
  });

  test('invalid bond builder selection rejected', () => {
    const res = SalonMath.calcBalayagePricing(3, 8.5, 2, 'maybe', 3.5, 65, '$');
    assert.equal(res.isValid, false);
  });

  test('appointment time beyond 24 hours rejected', () => {
    const res = SalonMath.calcBalayagePricing(3, 8.5, 2, 'yes', 30, 65, '$');
    assert.equal(res.isValid, false);
    assert.match(res.error, /24 hours/i);
  });

  test('negative value rejected', () => {
    const res = SalonMath.calcBalayagePricing(-1, 8.5, 2, 'yes', 3.5, 65, '$');
    assert.equal(res.isValid, false);
  });
});
