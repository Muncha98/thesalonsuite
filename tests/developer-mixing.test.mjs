import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { OldSalonMath } from './old-salonmath-reference.mjs';
import SalonMath from '../js/salonmath.js';

describe('Phase 1: Developer Mixing Calculator Regression & Validation Suite', () => {

  describe('1. Regression: OLD vs NEW Output Parity on Valid Inputs', () => {
    test('standard 10 Vol + 30 Vol -> 20 Vol @ 60ml Metric', () => {
      const oldRes = OldSalonMath.calcDeveloperMixing(10, 30, 20, 60, false);
      const newRes = SalonMath.calcDeveloperMixing(10, 30, 20, 60, { unit: 'metric' });

      assert.equal(newRes.isValid, true);
      assert.equal(newRes.main, oldRes.main);
      assert.equal(newRes.details, oldRes.details);
      assert.equal(newRes.rawFormula, oldRes.rawFormula);
      assert.equal(newRes.main, '30ml 10 Vol + 30ml 30 Vol');
      assert.equal(newRes.data.ratioString, '10:10');
      assert.equal(newRes.data.amountLow, 30);
      assert.equal(newRes.data.amountHigh, 30);
    });

    test('asymmetric 10 Vol + 30 Vol -> 15 Vol @ 60ml Metric', () => {
      const oldRes = OldSalonMath.calcDeveloperMixing(10, 30, 15, 60, false);
      const newRes = SalonMath.calcDeveloperMixing(10, 30, 15, 60, false);

      assert.equal(newRes.isValid, true);
      assert.equal(newRes.main, oldRes.main);
      assert.equal(newRes.details, oldRes.details);
      assert.equal(newRes.rawFormula, oldRes.rawFormula);
      // 30 - 15 = 15 parts low; 15 - 10 = 5 parts high. Total = 20.
      // Low: 15/20 * 60 = 45ml. High: 5/20 * 60 = 15ml.
      assert.equal(newRes.main, '45ml 10 Vol + 15ml 30 Vol');
    });

    test('imperial 10 Vol + 40 Vol -> 20 Vol @ 2.0 fl oz Imperial', () => {
      const oldRes = OldSalonMath.calcDeveloperMixing(10, 40, 20, 2.0, true);
      const newRes = SalonMath.calcDeveloperMixing(10, 40, 20, 2.0, { unit: 'imperial' });

      assert.equal(newRes.isValid, true);
      assert.equal(newRes.main, oldRes.main);
      assert.equal(newRes.details, oldRes.details);
      assert.equal(newRes.rawFormula, oldRes.rawFormula);
      // 40 - 20 = 20 parts low; 20 - 10 = 10 parts high. Total = 30.
      // Low: 20/30 * 2 = 1.3 fl oz. High: 0.7 fl oz.
      assert.equal(newRes.main, '1.3fl oz 10 Vol + 0.7fl oz 40 Vol');
    });
  });

  describe('2. Boundary & Boundary Equality Cases', () => {
    test('target equal to lower developer (10 Vol = 10 Vol)', () => {
      const oldRes = OldSalonMath.calcDeveloperMixing(10, 30, 10, 60, false);
      const newRes = SalonMath.calcDeveloperMixing(10, 30, 10, 60, { unit: 'metric' });

      assert.equal(newRes.isValid, true);
      assert.equal(newRes.main, oldRes.main);
      assert.equal(newRes.main, '100% 10 Vol');
      assert.equal(newRes.data.amountLow, 60);
      assert.equal(newRes.data.amountHigh, 0);
    });

    test('target equal to higher developer (30 Vol = 30 Vol)', () => {
      const oldRes = OldSalonMath.calcDeveloperMixing(10, 30, 30, 60, false);
      const newRes = SalonMath.calcDeveloperMixing(10, 30, 30, 60, { unit: 'metric' });

      assert.equal(newRes.isValid, true);
      assert.equal(newRes.main, oldRes.main);
      assert.equal(newRes.main, '100% 30 Vol');
      assert.equal(newRes.data.amountLow, 0);
      assert.equal(newRes.data.amountHigh, 60);
    });
  });

  describe('3. Decimal Quantities', () => {
    test('decimal batch quantity: 45.5ml', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 20, 45.5, { unit: 'metric' });
      assert.equal(res.isValid, true);
      // Math.round(10/20 * 45.5) = Math.round(22.75) = 23ml
      assert.equal(res.main, '23ml 10 Vol + 22.5ml 30 Vol');
    });

    test('decimal target: 25.5 Vol in Imperial', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 25.5, 3.5, { unit: 'imperial' });
      assert.equal(res.isValid, true);
      // Parts Low = 30 - 25.5 = 4.5; Parts High = 25.5 - 10 = 15.5; Total = 20
      // Low = 4.5/20 * 3.5 = 0.7875 -> 0.8 fl oz. High = 3.5 - 0.8 = 2.7 fl oz.
      assert.equal(res.main, '0.8fl oz 10 Vol + 2.7fl oz 30 Vol');
    });
  });

  describe('4. Defensive Validation & Error Handling', () => {
    test('target outside available range (lower than d1: target 5 with d1 10)', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 5, 60, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /cannot be lower than your lowest developer/i);
      assert.equal(res.main, 'Cannot Calculate');
    });

    test('target outside available range (higher than d2: target 45 with d2 30)', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 45, 60, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /cannot exceed your highest developer/i);
    });

    test('low developer >= high developer (d1=30, d2=10)', () => {
      const res = SalonMath.calcDeveloperMixing(30, 10, 20, 60, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /must be strictly less than high developer/i);
    });

    test('low developer == high developer (d1=20, d2=20)', () => {
      const res = SalonMath.calcDeveloperMixing(20, 20, 20, 60, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /must be strictly less than high developer/i);
    });

    test('zero total quantity (totalAmount = 0)', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 20, 0, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /must be greater than zero/i);
    });

    test('negative total quantity (totalAmount = -50)', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 20, -50, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /must be greater than zero/i);
    });

    test('blank input (empty string d1)', () => {
      const res = SalonMath.calcDeveloperMixing('', 30, 20, 60, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /required/i);
    });

    test('non-numeric input (d2 = "abc")', () => {
      const res = SalonMath.calcDeveloperMixing(10, 'abc', 20, 60, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /valid number/i);
    });

    test('NaN and Infinity defense', () => {
      const resNaN = SalonMath.calcDeveloperMixing(NaN, 30, 20, 60, false);
      assert.equal(resNaN.isValid, false);

      const resInf = SalonMath.calcDeveloperMixing(10, Infinity, 20, 60, false);
      assert.equal(resInf.isValid, false);
    });
  });

  describe('5. Decoupled Region, Currency, and Unit Combinations', () => {
    test('US + USD + Metric (unit=metric, currency=USD, region=US)', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 20, 100, {
        unit: 'metric',
        currency: 'USD',
        region: 'US'
      });
      assert.equal(res.isValid, true);
      assert.equal(res.main, '50ml 10 Vol + 50ml 30 Vol');
      assert.equal(res.data.unitLabel, 'ml');
    });

    test('US + USD + Imperial (unit=imperial, currency=USD, region=US)', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 20, 4.0, {
        unit: 'imperial',
        currency: 'USD',
        region: 'US'
      });
      assert.equal(res.isValid, true);
      assert.equal(res.main, '2fl oz 10 Vol + 2fl oz 30 Vol');
      assert.equal(res.data.unitLabel, 'fl oz');
    });

    test('UK + GBP + Metric (unit=metric, currency=GBP, region=UK)', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 20, 60, {
        unit: 'metric',
        currency: 'GBP',
        region: 'UK'
      });
      assert.equal(res.isValid, true);
      assert.equal(res.main, '30ml 10 Vol + 30ml 30 Vol');
      assert.equal(res.data.unitLabel, 'ml');
    });

    test('UK + GBP + Imperial (unit=imperial, currency=GBP, region=UK)', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 20, 2.0, {
        unit: 'imperial',
        currency: 'GBP',
        region: 'UK'
      });
      assert.equal(res.isValid, true);
      assert.equal(res.main, '1fl oz 10 Vol + 1fl oz 30 Vol');
      assert.equal(res.data.unitLabel, 'fl oz');
    });
  });

  describe('6. Upper-bound sanity ceilings (added after Phase 1 QA found these were missing)', () => {
    test('total_ml far beyond catalog max:1000 is rejected, not rendered in scientific notation', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 20, 1e25, { unit: 'metric' });
      assert.equal(res.isValid, false);
      assert.match(res.error, /cannot exceed 1000/i);
    });

    test('total_ml exactly at the catalog max (1000) is still valid', () => {
      const res = SalonMath.calcDeveloperMixing(10, 30, 20, 1000, { unit: 'metric' });
      assert.equal(res.isValid, true);
    });

    test('dev1 beyond catalog max:50 is rejected', () => {
      const res = SalonMath.calcDeveloperMixing(51, 60, 55, 60, { unit: 'metric' });
      assert.equal(res.isValid, false);
      assert.match(res.error, /cannot exceed 50/i);
    });

    test('dev2 beyond catalog max:60 is rejected', () => {
      const res = SalonMath.calcDeveloperMixing(10, 61, 20, 60, { unit: 'metric' });
      assert.equal(res.isValid, false);
      assert.match(res.error, /cannot exceed 60/i);
    });
  });
});
