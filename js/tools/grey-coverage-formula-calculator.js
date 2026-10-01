/**
 * Grey Hair Coverage Formulation Calculator — Client Controller
 * Range + number input, live result, unit syncing, analytics.
 */

(function() {
  'use strict';

  const TOOL_ID = 'grey-coverage-formula-calculator';
  const TOOL_CATEGORY = 'hair-color';

  let hasStarted = false;
  let currentRawFormula = '';

  const elements = {
    greyPct: null,
    greyPctRangeVal: null,
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
    elements.greyPct = document.getElementById('inp-grey_pct');
    elements.greyPctRangeVal = document.getElementById('range-val-grey_pct');
    elements.total = document.getElementById('inp-total_color_grams');
    elements.totalUnitTag = document.getElementById('unit-tag-total_color_grams');
    elements.resMain = document.getElementById('res-main');
    elements.resDetails = document.getElementById('res-details');
    elements.errorBanner = document.getElementById('calc-error-banner');
    elements.copyToast = document.getElementById('copy-toast');
    elements.btnCopy = document.getElementById('btn-copy-formula');
    elements.btnPrint = document.getElementById('btn-print-formula');
    elements.prefBtns = Array.from(document.querySelectorAll('.pref-btn'));
  }

  function setupEventListeners() {
    [elements.greyPct, elements.total].forEach(input => {
      if (!input) return;
      input.addEventListener('input', onInputChange);
      input.addEventListener('change', onInputChange);
    });

    if (elements.btnCopy) elements.btnCopy.addEventListener('click', copyRecipeToClipboard);
    if (elements.btnPrint) elements.btnPrint.addEventListener('click', () => window.print());

    elements.prefBtns.forEach(btn => btn.addEventListener('click', onPreferenceButtonClick));

    window.addEventListener('salon:preferences-changed', (e) => {
      syncUIWithPreferences();
      handleUnitConversion(e.detail.unit);
      runCalculation();
    });

    setupOutboundAnalytics();
  }

  function onInputChange() {
    if (elements.greyPct && elements.greyPctRangeVal) {
      elements.greyPctRangeVal.innerText = `${elements.greyPct.value}%`;
    }
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

    if (prefType === 'region' && current.region !== prefVal) {
      SalonPreferences.setRegion(prefVal);
      if (window.SalonAnalytics) SalonAnalytics.trackCountryChanged(current.region, prefVal);
    } else if (prefType === 'unit' && current.unit !== prefVal) {
      SalonPreferences.setUnit(prefVal);
      if (window.SalonAnalytics) SalonAnalytics.trackUnitToggled(current.unit, prefVal);
    }
  }

  function syncUIWithPreferences() {
    if (!window.SalonPreferences) return;
    const prefs = SalonPreferences.get();
    elements.prefBtns.forEach(btn => {
      const type = btn.getAttribute('data-pref');
      const val = btn.getAttribute('data-val');
      if (type === 'region') btn.classList.toggle('active', val === prefs.region);
      else if (type === 'unit') btn.classList.toggle('active', val === prefs.unit);
    });
    if (elements.totalUnitTag) {
      elements.totalUnitTag.innerText = prefs.unit === 'imperial' ? 'oz' : 'g';
    }
  }

  function handleUnitConversion(newUnit) {
    if (!elements.total) return;
    const currentVal = Number(elements.total.value);
    if (newUnit === 'imperial' && currentVal === 60) {
      elements.total.value = '2';
      elements.total.step = '0.1';
    } else if (newUnit === 'metric' && currentVal === 2) {
      elements.total.value = '60';
      elements.total.step = 'any';
    }
  }

  function clearErrors() {
    ['grey_pct', 'total_color_grams'].forEach(id => {
      const inp = document.getElementById(`inp-${id}`);
      const err = document.getElementById(`err-${id}`);
      if (inp) inp.classList.remove('is-invalid');
      if (err) { err.innerText = ''; err.style.display = 'none'; }
    });
    if (elements.errorBanner) {
      elements.errorBanner.style.display = 'none';
      elements.errorBanner.innerText = '';
    }
  }

  function showError(message, field) {
    clearErrors();
    const inp = document.getElementById(`inp-${field}`);
    const err = document.getElementById(`err-${field}`);
    if (inp) inp.classList.add('is-invalid');
    if (err) { err.innerText = message; err.style.display = 'block'; }
    if (elements.errorBanner) {
      elements.errorBanner.innerText = `⚠️ ${message}`;
      elements.errorBanner.style.display = 'block';
    }
  }

  function runCalculation() {
    if (!elements.greyPct || !elements.total) return;

    const prefs = window.SalonPreferences ? SalonPreferences.get() : { unit: 'metric', region: 'US', currency: 'USD' };
    const isImp = (prefs.unit === 'imperial');

    const res = SalonMath.calcGreyCoverage(elements.greyPct.value, elements.total.value.trim(), isImp);

    if (!res.isValid) {
      showError(res.error, res.error.toLowerCase().includes('grey') ? 'grey_pct' : 'total_color_grams');
      if (elements.resMain) elements.resMain.innerText = 'Cannot Calculate';
      if (elements.resDetails) elements.resDetails.innerText = res.details || '';
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
        if (window.SalonAnalytics) SalonAnalytics.trackResultCopied(TOOL_ID);
      }).catch(err => console.error('Clipboard copy failed:', err));
    }
  }

  function showCopyToast() {
    if (!elements.copyToast) return;
    elements.copyToast.style.display = 'block';
    setTimeout(() => { if (elements.copyToast) elements.copyToast.style.display = 'none'; }, 2500);
  }

  function setupOutboundAnalytics() {
    document.querySelectorAll('.related-tool-card').forEach(card => {
      card.addEventListener('click', () => {
        const toToolId = card.getAttribute('data-tool-id');
        if (window.SalonAnalytics) SalonAnalytics.trackRelatedToolClicked(TOOL_ID, toToolId);
      });
    });
    const resourceCta = document.getElementById('cta-download-resource');
    if (resourceCta) {
      resourceCta.addEventListener('click', () => {
        const slug = resourceCta.getAttribute('data-resource');
        if (window.SalonAnalytics) SalonAnalytics.trackResourceClicked(TOOL_ID, slug);
      });
    }
    const affiliateLink = document.getElementById('link-affiliate-sponsor');
    if (affiliateLink) {
      affiliateLink.addEventListener('click', () => {
        const sponsor = affiliateLink.getAttribute('data-sponsor');
        if (window.SalonAnalytics) SalonAnalytics.trackAffiliateClicked(TOOL_ID, sponsor, affiliateLink.href);
      });
    }
  }
})();
