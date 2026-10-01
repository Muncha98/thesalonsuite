/**
 * Developer Volume Mixing Calculator — Client Controller
 * Reactive validation, live calculation, unit/currency syncing, analytics, and station print/copy actions.
 */

(function() {
  'use strict';

  const TOOL_ID = 'developer-mixing-calculator';
  const TOOL_CATEGORY = 'hair-color';

  let hasStarted = false;
  let currentRawFormula = '';

  const elements = {
    form: null,
    dev1: null,
    dev2: null,
    target: null,
    total: null,
    totalUnitTag: null,
    resMain: null,
    resDetails: null,
    errorBanner: null,
    copyToast: null,
    btnCopy: null,
    btnPrint: null,
    prefBtns: []
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheDOMElements();
    setupEventListeners();
    syncUIWithPreferences();
    runCalculation();
  }

  function cacheDOMElements() {
    elements.form = document.getElementById('tool-calc-form');
    elements.dev1 = document.getElementById('inp-dev1');
    elements.dev2 = document.getElementById('inp-dev2');
    elements.target = document.getElementById('inp-target_vol');
    elements.total = document.getElementById('inp-total_ml');
    elements.totalUnitTag = document.getElementById('unit-tag-total_ml');
    elements.resMain = document.getElementById('res-main');
    elements.resDetails = document.getElementById('res-details');
    elements.errorBanner = document.getElementById('calc-error-banner');
    elements.copyToast = document.getElementById('copy-toast');
    elements.btnCopy = document.getElementById('btn-copy-formula');
    elements.btnPrint = document.getElementById('btn-print-formula');
    elements.prefBtns = Array.from(document.querySelectorAll('.pref-btn'));
  }

  function setupEventListeners() {
    const inputs = [elements.dev1, elements.dev2, elements.target, elements.total];

    inputs.forEach(input => {
      if (!input) return;
      input.addEventListener('input', onInputChange);
      input.addEventListener('change', onInputChange);
    });

    if (elements.btnCopy) {
      elements.btnCopy.addEventListener('click', copyRecipeToClipboard);
    }

    if (elements.btnPrint) {
      elements.btnPrint.addEventListener('click', () => window.print());
    }

    // Preference buttons
    elements.prefBtns.forEach(btn => {
      btn.addEventListener('click', onPreferenceButtonClick);
    });

    // Custom event broadcast by SalonPreferences
    window.addEventListener('salon:preferences-changed', (e) => {
      syncUIWithPreferences();
      handleUnitConversion(e.detail.unit);
      runCalculation();
    });

    // Track related tools and resource clicks
    setupOutboundAnalytics();
  }

  function onInputChange() {
    if (!hasStarted && window.SalonAnalytics) {
      SalonAnalytics.trackToolStarted(TOOL_ID, TOOL_CATEGORY);
      hasStarted = true;
    }
    runCalculation();
  }

  function onPreferenceButtonClick(e) {
    const btn = e.currentTarget;
    const prefType = btn.getAttribute('data-pref');
    const prefVal = btn.getAttribute('data-val');

    if (!window.SalonPreferences) return;

    const current = SalonPreferences.get();

    if (prefType === 'region') {
      if (current.region !== prefVal) {
        SalonPreferences.setRegion(prefVal);
        if (window.SalonAnalytics) {
          SalonAnalytics.trackCountryChanged(current.region, prefVal);
        }
      }
    } else if (prefType === 'unit') {
      if (current.unit !== prefVal) {
        SalonPreferences.setUnit(prefVal);
        if (window.SalonAnalytics) {
          SalonAnalytics.trackUnitToggled(current.unit, prefVal);
        }
      }
    }
  }

  function syncUIWithPreferences() {
    if (!window.SalonPreferences) return;
    const prefs = SalonPreferences.get();

    // Sync button states
    elements.prefBtns.forEach(btn => {
      const type = btn.getAttribute('data-pref');
      const val = btn.getAttribute('data-val');
      if (type === 'region') {
        btn.classList.toggle('active', val === prefs.region);
      } else if (type === 'unit') {
        btn.classList.toggle('active', val === prefs.unit);
      }
    });

    // Sync Unit tag label
    if (elements.totalUnitTag) {
      elements.totalUnitTag.innerText = prefs.unit === 'imperial' ? 'fl oz' : 'ml';
    }
  }

  function handleUnitConversion(newUnit) {
    if (!elements.total) return;
    const currentVal = Number(elements.total.value);

    // If total matches default Metric (60) or Imperial (2), smoothly switch defaults
    if (newUnit === 'imperial' && currentVal === 60) {
      elements.total.value = '2';
      elements.total.step = '0.5';
    } else if (newUnit === 'metric' && currentVal === 2) {
      elements.total.value = '60';
      elements.total.step = '1';
    }
  }

  function clearErrors() {
    ['dev1', 'dev2', 'target_vol', 'total_ml'].forEach(id => {
      const inp = document.getElementById(`inp-${id}`);
      const err = document.getElementById(`err-${id}`);
      if (inp) inp.classList.remove('is-invalid');
      if (err) {
        err.innerText = '';
        err.style.display = 'none';
      }
    });
    if (elements.errorBanner) {
      elements.errorBanner.style.display = 'none';
      elements.errorBanner.innerText = '';
    }
  }

  function showErrors(errors, firstError) {
    clearErrors();
    if (errors) {
      Object.keys(errors).forEach(key => {
        const inp = document.getElementById(`inp-${key}`);
        const err = document.getElementById(`err-${key}`);
        if (inp) inp.classList.add('is-invalid');
        if (err) {
          err.innerText = errors[key];
          err.style.display = 'block';
        }
      });
    }
    if (elements.errorBanner && firstError) {
      elements.errorBanner.innerText = `⚠️ ${firstError}`;
      elements.errorBanner.style.display = 'block';
    }
  }

  function runCalculation() {
    if (!elements.dev1 || !elements.dev2 || !elements.target || !elements.total) return;

    const valD1 = elements.dev1.value.trim();
    const valD2 = elements.dev2.value.trim();
    const valTarget = elements.target.value.trim();
    const valTotal = elements.total.value.trim();

    const prefs = window.SalonPreferences ? SalonPreferences.get() : { unit: 'metric', region: 'US', currency: 'USD' };
    const isImp = (prefs.unit === 'imperial');

    // Run calculation via SalonMath
    const res = SalonMath.calcDeveloperMixing(valD1, valD2, valTarget, valTotal, {
      unit: prefs.unit,
      region: prefs.region,
      currency: prefs.currency
    });

    if (!res.isValid) {
      showErrors(res.errors, res.error);
      if (elements.resMain) elements.resMain.innerText = 'Cannot Calculate';
      if (elements.resDetails) elements.resDetails.innerText = res.details;
      currentRawFormula = '';
      return;
    }

    clearErrors();
    currentRawFormula = res.rawFormula;

    if (elements.resMain) elements.resMain.innerText = res.main;
    if (elements.resDetails) elements.resDetails.innerText = res.details;

    if (window.SalonAnalytics) {
      SalonAnalytics.trackResultGenerated(TOOL_ID, prefs.unit, prefs.region, prefs.currency);
    }
  }

  function copyRecipeToClipboard() {
    if (!currentRawFormula) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentRawFormula).then(() => {
        showCopyToast();
        if (window.SalonAnalytics) {
          SalonAnalytics.trackResultCopied(TOOL_ID);
        }
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
      });
    }
  }

  function showCopyToast() {
    if (!elements.copyToast) return;
    elements.copyToast.style.display = 'block';
    setTimeout(() => {
      if (elements.copyToast) elements.copyToast.style.display = 'none';
    }, 2500);
  }

  function setupOutboundAnalytics() {
    // Related tools tracking
    const relatedLinks = document.querySelectorAll('.related-tool-card');
    relatedLinks.forEach(card => {
      card.addEventListener('click', () => {
        const toToolId = card.getAttribute('data-tool-id');
        if (window.SalonAnalytics) {
          SalonAnalytics.trackRelatedToolClicked(TOOL_ID, toToolId);
        }
      });
    });

    // Resource CTA tracking
    const resourceCta = document.getElementById('cta-download-resource');
    if (resourceCta) {
      resourceCta.addEventListener('click', (e) => {
        const slug = resourceCta.getAttribute('data-resource');
        if (window.SalonAnalytics) {
          SalonAnalytics.trackResourceClicked(TOOL_ID, slug);
        }
        alert('Free Download: The Developer Volume Blending Station Card PDF is ready for printing at your station!');
      });
    }

    // Affiliate sponsor tracking
    const affiliateLink = document.getElementById('link-affiliate-sponsor');
    if (affiliateLink) {
      affiliateLink.addEventListener('click', () => {
        const sponsor = affiliateLink.getAttribute('data-sponsor');
        if (window.SalonAnalytics) {
          SalonAnalytics.trackAffiliateClicked(TOOL_ID, sponsor, affiliateLink.href);
        }
      });
    }
  }
})();
