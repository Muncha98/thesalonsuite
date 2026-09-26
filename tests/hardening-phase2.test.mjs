import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SalonMath from '../js/salonmath.js';

describe('Phase 2: Cross-Tool Hardening & Contract Validation', () => {

  describe('1. Shared Validation Kernel (_validateNumeric)', () => {
    test('rejects blank/null/undefined inputs', () => {
      const v1 = SalonMath._validateNumeric([['field', '', { positive: true }]]);
      assert.equal(v1.isValid, false);
      assert.match(v1.firstError, /required/i);

      const v2 = SalonMath._validateNumeric([['field', null]]);
      assert.equal(v2.isValid, false);

      const v3 = SalonMath._validateNumeric([['field', undefined]]);
      assert.equal(v3.isValid, false);
    });

    test('rejects NaN and Infinity', () => {
      const v1 = SalonMath._validateNumeric([['field', NaN]]);
      assert.equal(v1.isValid, false);
      assert.match(v1.firstError, /valid number/i);

      const v2 = SalonMath._validateNumeric([['field', Infinity]]);
      assert.equal(v2.isValid, false);
    });

    test('enforces positive constraint', () => {
      const v = SalonMath._validateNumeric([['amount', 0, { positive: true }]]);
      assert.equal(v.isValid, false);
      assert.match(v.firstError, /greater than zero/i);
    });

    test('enforces min constraint', () => {
      const v = SalonMath._validateNumeric([['pct', -5, { min: 0 }]]);
      assert.equal(v.isValid, false);
      assert.match(v.firstError, /at least 0/i);
    });

    test('passes valid inputs', () => {
      const v = SalonMath._validateNumeric([
        ['a', 10, { positive: true }],
        ['b', 0, { min: 0 }],
        ['c', 50]
      ]);
      assert.equal(v.isValid, true);
    });
  });

  describe('2. isValid Contract: All Tools Return isValid on Success', () => {
    const cases = [
      { name: 'Tool 1: calcDeveloperMixing', fn: () => SalonMath.calcDeveloperMixing(10, 30, 20, 60, false) },
      { name: 'Tool 2: calcBleachRatio', fn: () => SalonMath.calcBleachRatio(30, '1:2', false) },
      { name: 'Tool 3: calcHairLevel', fn: () => SalonMath.calcHairLevel(7) },
      { name: 'Tool 4: calcGreyCoverage', fn: () => SalonMath.calcGreyCoverage(50, 60, false) },
      { name: 'Tool 5: calcBalayagePricing', fn: () => SalonMath.calcBalayagePricing(3, 8.5, 2, 'no', 3.5, 65, '$') },
      { name: 'Tool 6: calcLashWeight', fn: () => SalonMath.calcLashWeight('healthy', '5D') },
      { name: 'Tool 7: calcLashMapping', fn: () => SalonMath.calcLashMapping('almond', 'cat_eye', 13) },
      { name: 'Tool 8: calcBoothRentVsComm', fn: () => SalonMath.calcBoothRentVsComm(1800, 50, 300, 150, '$') },
      { name: 'Tool 9: calcHourlyRate', fn: () => SalonMath.calcHourlyRate(65000, 18000, 30, 8, 48, '$') },
      { name: 'Tool 10: calcEssentialOilDilution', fn: () => SalonMath.calcEssentialOilDilution(30, 2, false) },
      { name: 'Tool 11: calcTonerRatio', fn: () => SalonMath.calcTonerRatio(30, '1:2', false) },
      { name: 'Tool 12: calcColorCorrection', fn: () => SalonMath.calcColorCorrection(3, 85, '$') },
      { name: 'Tool 13: calcFoilUsage', fn: () => SalonMath.calcFoilUsage('full') },
      { name: 'Tool 14: calcPermRod', fn: () => SalonMath.calcPermRod('beach') },
      { name: 'Tool 15: calcKeratinDosage', fn: () => SalonMath.calcKeratinDosage('medium', false) },
      { name: 'Tool 16: calcLashHumidity', fn: () => SalonMath.calcLashHumidity(50) },
      { name: 'Tool 17: calcBrowTint', fn: () => SalonMath.calcBrowTint(2, false) },
      { name: 'Tool 18: calcBrowLamination', fn: () => SalonMath.calcBrowLamination('medium') },
      { name: 'Tool 19: calcAcrylicMonomer', fn: () => SalonMath.calcAcrylicMonomer('medium') },
      { name: 'Tool 20: calcGelCure', fn: () => SalonMath.calcGelCure('48w') },
      { name: 'Tool 21: calcSprayTanDha', fn: () => SalonMath.calcSprayTanDha('type2') },
      { name: 'Tool 22: calcChemicalPeel', fn: () => SalonMath.calcChemicalPeel(30, 2.5) },
      { name: 'Tool 23: calcSuiteStartup', fn: () => SalonMath.calcSuiteStartup(1200, 1500, 800, 95, '$') },
      { name: 'Tool 24: calcSelfEmployedTax', fn: () => SalonMath.calcSelfEmployedTax(1500, 250, 400, '$') },
      { name: 'Tool 25: calcRetailMarkup', fn: () => SalonMath.calcRetailMarkup(14, 100, 10, '$') },
      { name: 'Tool 26: calcSoftwareCost', fn: () => SalonMath.calcSoftwareCost(6000, '$') },
      { name: 'Tool 27: calcProfitMargin', fn: () => SalonMath.calcProfitMargin(7500, 2800, '$') },
      { name: 'Tool 28: calcFadeGuards', fn: () => SalonMath.calcFadeGuards('mid_skin') },
      { name: 'Tool 29: calcBeardOil', fn: () => SalonMath.calcBeardOil(30, false) },
      { name: 'Tool 30: calcHotTowelShave', fn: () => SalonMath.calcHotTowelShave('coarse') },
      { name: 'Tool 31: calcMassageOilCost', fn: () => SalonMath.calcMassageOilCost('60', 24, '$') },
      { name: 'Tool 32: calcHotStone', fn: () => SalonMath.calcHotStone('back') },
    ];

    for (const { name, fn } of cases) {
      test(`${name} returns isValid: true`, () => {
        const res = fn();
        assert.equal(res.isValid, true, `${name} missing isValid: true`);
        assert.ok(res.main, `${name} missing main field`);
        assert.ok(res.details, `${name} missing details field`);
        assert.ok(res.rawFormula !== undefined, `${name} missing rawFormula field`);
      });
    }
  });

  describe('3. Input Defense: Numeric Calculators Reject Bad Input', () => {
    test('Tool 2: calcBleachRatio rejects NaN powder', () => {
      const res = SalonMath.calcBleachRatio('abc', '1:2', false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /valid number/i);
    });

    test('Tool 2: calcBleachRatio rejects zero powder', () => {
      const res = SalonMath.calcBleachRatio(0, '1:2', false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /greater than zero/i);
    });

    test('Tool 4: calcGreyCoverage rejects blank grey %', () => {
      const res = SalonMath.calcGreyCoverage('', 60, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /required/i);
    });

    test('Tool 4: calcGreyCoverage rejects negative grey %', () => {
      const res = SalonMath.calcGreyCoverage(-10, 60, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /at least/i);
    });

    test('Tool 4: calcGreyCoverage rejects zero total amount', () => {
      const res = SalonMath.calcGreyCoverage(50, 0, false);
      assert.equal(res.isValid, false);
      assert.match(res.error, /greater than zero/i);
    });

    test('Tool 22: calcChemicalPeel rejects NaN acid %', () => {
      const res = SalonMath.calcChemicalPeel('bad', 2.5);
      assert.equal(res.isValid, false);
      assert.match(res.error, /valid number/i);
    });

    test('Tool 22: calcChemicalPeel rejects negative pH', () => {
      const res = SalonMath.calcChemicalPeel(30, -1);
      assert.equal(res.isValid, false);
      assert.match(res.error, /at least/i);
    });
  });

  describe('4. Error Result Contract Consistency', () => {
    test('_errorResult returns correct shape', () => {
      const res = SalonMath._errorResult('test error message');
      assert.equal(res.isValid, false);
      assert.equal(res.error, 'test error message');
      assert.equal(res.main, 'Cannot Calculate');
      assert.equal(res.details, 'test error message');
      assert.equal(res.rawFormula, '');
    });
  });
});
