import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SalonMath from '../js/salonmath.js';

describe('calcLashWeight — validation', () => {
  test('valid combination', () => {
    const res = SalonMath.calcLashWeight('normal', '5D');
    assert.equal(res.isValid, true);
  });
  test('invalid lash condition rejected', () => {
    assert.equal(SalonMath.calcLashWeight('bogus', '5D').isValid, false);
  });
  test('invalid fan dimension rejected', () => {
    assert.equal(SalonMath.calcLashWeight('normal', '99D').isValid, false);
  });
});

describe('calcLashMapping — validation', () => {
  test('valid combination', () => {
    const res = SalonMath.calcLashMapping('Almond', 'cat_eye', 13);
    assert.equal(res.isValid, true);
  });
  test('invalid eye shape rejected', () => {
    assert.equal(SalonMath.calcLashMapping('bogus', 'cat_eye', 13).isValid, false);
  });
  test('max length out of range rejected', () => {
    assert.equal(SalonMath.calcLashMapping('Almond', 'cat_eye', 99).isValid, false);
  });
});

describe('calcLashHumidity — validation', () => {
  test('valid humidity', () => {
    assert.equal(SalonMath.calcLashHumidity(50).isValid, true);
  });
  test('out of range rejected', () => {
    assert.equal(SalonMath.calcLashHumidity(150).isValid, false);
  });
});

describe('calcBrowTint — validation & math', () => {
  test('2cm gives 10 drops', () => {
    const res = SalonMath.calcBrowTint(2, false);
    assert.equal(res.isValid, true);
    assert.match(res.main, /10 Drops/);
  });
  test('negative rejected', () => {
    assert.equal(SalonMath.calcBrowTint(-1, false).isValid, false);
  });
  test('excessive rejected', () => {
    assert.equal(SalonMath.calcBrowTint(50, false).isValid, false);
  });
});

describe('calcBrowLamination — validation', () => {
  test('valid hair type', () => {
    assert.equal(SalonMath.calcBrowLamination('medium').isValid, true);
  });
  test('invalid hair type rejected', () => {
    assert.equal(SalonMath.calcBrowLamination('bogus').isValid, false);
  });
});

describe('calcAcrylicMonomer — validation', () => {
  test('valid bead size', () => {
    assert.equal(SalonMath.calcAcrylicMonomer('medium').isValid, true);
  });
  test('invalid bead size rejected', () => {
    assert.equal(SalonMath.calcAcrylicMonomer('bogus').isValid, false);
  });
});

describe('calcGelCure — validation', () => {
  test('valid wattage', () => {
    assert.equal(SalonMath.calcGelCure('48w').isValid, true);
  });
  test('invalid wattage rejected', () => {
    assert.equal(SalonMath.calcGelCure('99w').isValid, false);
  });
});

describe('calcSprayTanDha — validation', () => {
  test('valid skin type', () => {
    assert.equal(SalonMath.calcSprayTanDha('type2').isValid, true);
  });
  test('invalid skin type rejected', () => {
    assert.equal(SalonMath.calcSprayTanDha('type9').isValid, false);
  });
});

describe('calcChemicalPeel — validation & math', () => {
  test('30% at pH 2.5 gives ~27.3% free acid', () => {
    const res = SalonMath.calcChemicalPeel(30, 2.5);
    assert.equal(res.isValid, true);
    assert.match(res.main, /27\.3%/);
  });
  test('pH out of range rejected', () => {
    assert.equal(SalonMath.calcChemicalPeel(30, 20).isValid, false);
  });
  test('acid percent out of range rejected', () => {
    assert.equal(SalonMath.calcChemicalPeel(150, 2.5).isValid, false);
  });
});
