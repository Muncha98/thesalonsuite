import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SalonMath from '../js/salonmath.js';

describe('calcBoothRentVsComm — validation & math', () => {
  test('valid inputs', () => {
    const res = SalonMath.calcBoothRentVsComm(1800, 50, 300, 150, '$');
    assert.equal(res.isValid, true);
    assert.match(res.main, /Booth Rent Yields/);
  });
  test('blank weekly sales rejected', () => {
    assert.equal(SalonMath.calcBoothRentVsComm('', 50, 300, 150, '$').isValid, false);
  });
  test('commission split out of range rejected', () => {
    assert.equal(SalonMath.calcBoothRentVsComm(1800, 150, 300, 150, '$').isValid, false);
  });
  test('negative booth rent rejected', () => {
    assert.equal(SalonMath.calcBoothRentVsComm(1800, 50, -10, 150, '$').isValid, false);
  });
});

describe('calcHourlyRate — validation & math', () => {
  test('valid inputs', () => {
    const res = SalonMath.calcHourlyRate(65000, 18000, 30, 8, 48, '$');
    assert.equal(res.isValid, true);
    assert.match(res.main, /True Net Rate/);
  });
  test('weeks worked beyond 52 rejected', () => {
    assert.equal(SalonMath.calcHourlyRate(65000, 18000, 30, 8, 99, '$').isValid, false);
  });
  test('zero weeks worked rejected', () => {
    assert.equal(SalonMath.calcHourlyRate(65000, 18000, 30, 8, 0, '$').isValid, false);
  });
  test('combined hours exceeding 168/week rejected', () => {
    assert.equal(SalonMath.calcHourlyRate(65000, 18000, 100, 100, 48, '$').isValid, false);
  });
});

describe('calcSuiteStartup — validation & math', () => {
  test('valid inputs', () => {
    const res = SalonMath.calcSuiteStartup(1200, 1500, 800, 95, '$');
    assert.equal(res.isValid, true);
    assert.match(res.main, /Startup Total/);
  });
  test('zero average ticket rejected', () => {
    assert.equal(SalonMath.calcSuiteStartup(1200, 1500, 800, 0, '$').isValid, false);
  });
  test('negative stock budget rejected', () => {
    assert.equal(SalonMath.calcSuiteStartup(1200, 1500, -10, 95, '$').isValid, false);
  });
});

describe('calcSelfEmployedTax — validation & math', () => {
  test('valid inputs', () => {
    const res = SalonMath.calcSelfEmployedTax(1500, 250, 400, '$');
    assert.equal(res.isValid, true);
    assert.match(res.main, /Set Aside/);
  });
  test('negative gross rejected', () => {
    assert.equal(SalonMath.calcSelfEmployedTax(-1, 250, 400, '$').isValid, false);
  });
  test('blank expenses rejected', () => {
    assert.equal(SalonMath.calcSelfEmployedTax(1500, 250, '', '$').isValid, false);
  });
});

describe('calcRetailMarkup — validation & math', () => {
  test('valid inputs', () => {
    const res = SalonMath.calcRetailMarkup(14, 100, 10, '$');
    assert.equal(res.isValid, true);
    assert.match(res.main, /Retail/);
  });
  test('zero wholesale cost rejected', () => {
    assert.equal(SalonMath.calcRetailMarkup(0, 100, 10, '$').isValid, false);
  });
  test('negative markup rejected', () => {
    assert.equal(SalonMath.calcRetailMarkup(14, -5, 10, '$').isValid, false);
  });
});

describe('calcSoftwareCost — validation', () => {
  test('valid volume', () => {
    const res = SalonMath.calcSoftwareCost(6000, '$');
    assert.equal(res.isValid, true);
  });
  test('blank volume rejected', () => {
    assert.equal(SalonMath.calcSoftwareCost('', '$').isValid, false);
  });
  test('negative volume rejected', () => {
    assert.equal(SalonMath.calcSoftwareCost(-500, '$').isValid, false);
  });
});

describe('calcProfitMargin — validation & math', () => {
  test('valid inputs', () => {
    const res = SalonMath.calcProfitMargin(7500, 2800, '$');
    assert.equal(res.isValid, true);
    assert.match(res.main, /Healthy/);
  });
  test('zero revenue rejected', () => {
    assert.equal(SalonMath.calcProfitMargin(0, 2800, '$').isValid, false);
  });
  test('negative cost rejected', () => {
    assert.equal(SalonMath.calcProfitMargin(7500, -1, '$').isValid, false);
  });
});

describe('calcFadeGuards — validation', () => {
  test('valid fade type', () => {
    assert.equal(SalonMath.calcFadeGuards('high_drop').isValid, true);
  });
  test('invalid fade type rejected (previously silently defaulted to mid_skin)', () => {
    assert.equal(SalonMath.calcFadeGuards('bogus').isValid, false);
  });
});

describe('calcBeardOil — validation & math', () => {
  test('30ml bottle gives 18ml jojoba', () => {
    const res = SalonMath.calcBeardOil(30, false);
    assert.equal(res.isValid, true);
    assert.match(res.main, /18ml Jojoba/);
  });
  test('negative bottle size rejected', () => {
    assert.equal(SalonMath.calcBeardOil(-5, false).isValid, false);
  });
  test('excessive bottle size rejected', () => {
    assert.equal(SalonMath.calcBeardOil(5000, false).isValid, false);
  });
});

describe('calcHotTowelShave — validation', () => {
  test('valid beard density', () => {
    assert.equal(SalonMath.calcHotTowelShave('light').isValid, true);
  });
  test('invalid beard density rejected (previously silently defaulted to coarse)', () => {
    assert.equal(SalonMath.calcHotTowelShave('bogus').isValid, false);
  });
});

describe('calcMassageOilCost — validation & math', () => {
  test('90-minute session uses 40ml', () => {
    const res = SalonMath.calcMassageOilCost('90', 24, '$');
    assert.equal(res.isValid, true);
    assert.match(res.main, /40ml/);
  });
  test('invalid session length rejected', () => {
    assert.equal(SalonMath.calcMassageOilCost('45', 24, '$').isValid, false);
  });
  test('zero oil cost rejected', () => {
    assert.equal(SalonMath.calcMassageOilCost('60', 0, '$').isValid, false);
  });
});

describe('calcHotStone — validation', () => {
  test('valid stone type', () => {
    assert.equal(SalonMath.calcHotStone('toes').isValid, true);
  });
  test('invalid stone type rejected (previously silently defaulted to back)', () => {
    assert.equal(SalonMath.calcHotStone('bogus').isValid, false);
  });
});

describe('calcEssentialOilDilution — validation & math', () => {
  test('30ml at 2% gives 12 drops', () => {
    const res = SalonMath.calcEssentialOilDilution(30, '2', false);
    assert.equal(res.isValid, true);
    assert.match(res.main, /12 Drops/);
  });
  test('invalid dilution percentage rejected', () => {
    assert.equal(SalonMath.calcEssentialOilDilution(30, '7', false).isValid, false);
  });
  test('zero carrier amount rejected', () => {
    assert.equal(SalonMath.calcEssentialOilDilution(0, '2', false).isValid, false);
  });
});
