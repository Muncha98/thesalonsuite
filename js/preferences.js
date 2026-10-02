/**
 * TheSalonSuite.com — Independent Region, Currency & Unit Preferences
 * Decouples Region (US | UK), Currency (USD | GBP), and Measurement Units (metric | imperial).
 * Supports all 4 primary combinations:
 * - US + USD + Metric
 * - US + USD + Imperial
 * - UK + GBP + Metric
 * - UK + GBP + Imperial
 */

(function(root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.SalonPreferences = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  const STORAGE_KEY = 'salon_preferences';
  const LEGACY_UNIT_KEY = 'salon_unit';

  const DEFAULTS = {
    region: 'US',       // 'US' | 'UK'
    currency: 'USD',    // 'USD' | 'GBP'
    unit: 'metric'      // 'metric' | 'imperial'
  };

  let state = Object.assign({}, DEFAULTS);

  function loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          state.region = (parsed.region === 'UK') ? 'UK' : 'US';
          state.currency = (parsed.currency === 'GBP') ? 'GBP' : 'USD';
          state.unit = (parsed.unit === 'imperial') ? 'imperial' : 'metric';
        } else {
          // Check legacy salon_unit
          const legacyUnit = localStorage.getItem(LEGACY_UNIT_KEY);
          if (legacyUnit === 'imperial' || legacyUnit === 'metric') {
            state.unit = legacyUnit;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read salon_preferences from localStorage', e);
    }
  }

  function saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        localStorage.setItem(LEGACY_UNIT_KEY, state.unit);
      }
    } catch (e) {
      console.warn('Could not write salon_preferences to localStorage', e);
    }
  }

  function broadcast(changedKey) {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      const event = new CustomEvent('salon:preferences-changed', {
        detail: {
          region: state.region,
          currency: state.currency,
          unit: state.unit,
          changedKey: changedKey
        }
      });
      window.dispatchEvent(event);
    }
  }

  // Initial load
  loadState();

  const SalonPreferences = {
    get: function() {
      return {
        region: state.region,
        currency: state.currency,
        unit: state.unit
      };
    },

    set: function(newPrefs) {
      if (!newPrefs) return;
      let changed = false;

      if (newPrefs.region && (newPrefs.region === 'US' || newPrefs.region === 'UK')) {
        if (state.region !== newPrefs.region) {
          state.region = newPrefs.region;
          changed = true;
        }
      }

      if (newPrefs.currency && (newPrefs.currency === 'USD' || newPrefs.currency === 'GBP')) {
        if (state.currency !== newPrefs.currency) {
          state.currency = newPrefs.currency;
          changed = true;
        }
      }

      if (newPrefs.unit && (newPrefs.unit === 'metric' || newPrefs.unit === 'imperial')) {
        if (state.unit !== newPrefs.unit) {
          state.unit = newPrefs.unit;
          changed = true;
        }
      }

      if (changed) {
        saveState();
        broadcast('all');
      }
      return this.get();
    },

    // setRegion also updates currency to that region's default (US->USD,
    // UK->GBP), because that's what every real visitor expects a region
    // switch to do. Currency remains its own independent field — setCurrency
    // below can still override it directly later (e.g. a future "show USD
    // prices" control), it's just that switching region alone is enough for
    // the common case, instead of requiring two separate clicks that most
    // people won't know they need to make.
    setRegion: function(region) {
      region = String(region).toUpperCase();
      if (region === 'US' || region === 'UK') {
        state.region = region;
        state.currency = (region === 'UK') ? 'GBP' : 'USD';
        saveState();
        broadcast('region');
      }
      return this.get();
    },

    setCurrency: function(currency) {
      currency = String(currency).toUpperCase();
      if (currency === 'USD' || currency === 'GBP') {
        state.currency = currency;
        saveState();
        broadcast('currency');
      }
      return this.get();
    },

    setUnit: function(unit) {
      unit = String(unit).toLowerCase();
      if (unit === 'metric' || unit === 'imperial') {
        state.unit = unit;
        saveState();
        broadcast('unit');
      }
      return this.get();
    },

    isImperial: function() {
      return state.unit === 'imperial';
    },

    getCurrencySymbol: function() {
      return state.currency === 'GBP' ? '£' : '$';
    },

    getVolumeUnitLabel: function() {
      return state.unit === 'imperial' ? 'fl oz' : 'ml';
    },

    getWeightUnitLabel: function() {
      return state.unit === 'imperial' ? 'oz' : 'g';
    }
  };

  return SalonPreferences;
});
