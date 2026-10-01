/**
 * Preferences test — covers the region/currency/unit independence and the
 * region->currency auto-link added after the Phase 1 QA found that currency
 * had no way to actually be set by a user (no UI control existed, and
 * setRegion didn't touch currency at all).
 *
 * preferences.js runs fine in plain Node: it guards every localStorage/window
 * access with a typeof check, so no DOM/jsdom shim is needed here.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import SalonPreferences from '../js/preferences.js';

describe('SalonPreferences — region/currency/unit', () => {
  test('default state is US + USD + metric', () => {
    const prefs = SalonPreferences.get();
    assert.equal(prefs.region, 'US');
    assert.equal(prefs.currency, 'USD');
    assert.equal(prefs.unit, 'metric');
  });

  test('setRegion("UK") auto-links currency to GBP', () => {
    SalonPreferences.setRegion('UK');
    const prefs = SalonPreferences.get();
    assert.equal(prefs.region, 'UK');
    assert.equal(prefs.currency, 'GBP');
  });

  test('setRegion("US") auto-links currency back to USD', () => {
    SalonPreferences.setRegion('US');
    const prefs = SalonPreferences.get();
    assert.equal(prefs.region, 'US');
    assert.equal(prefs.currency, 'USD');
  });

  test('setUnit does not change region or currency (unit is independent)', () => {
    SalonPreferences.setRegion('UK'); // currency -> GBP
    SalonPreferences.setUnit('imperial');
    const prefs = SalonPreferences.get();
    assert.equal(prefs.unit, 'imperial');
    assert.equal(prefs.region, 'UK');
    assert.equal(prefs.currency, 'GBP', 'switching units must not reset currency back to USD');
  });

  test('setCurrency can still override independently of region (future direct control)', () => {
    SalonPreferences.setRegion('US'); // currency -> USD
    SalonPreferences.setCurrency('GBP');
    const prefs = SalonPreferences.get();
    assert.equal(prefs.region, 'US');
    assert.equal(prefs.currency, 'GBP', 'an explicit setCurrency call should still be able to decouple from region');
  });

  test('getCurrencySymbol reflects currency, not unit', () => {
    SalonPreferences.set({ region: 'US', currency: 'GBP', unit: 'imperial' });
    assert.equal(SalonPreferences.getCurrencySymbol(), '£');
  });
});
