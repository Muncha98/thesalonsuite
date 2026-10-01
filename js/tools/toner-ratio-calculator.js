/**
 * Hair Toner Ratio & Processing Timer — Client Controller
 * Number + select input, live result, unit syncing, analytics.
 */

(function() {
  'use strict';

  const TOOL_ID = 'toner-ratio-calculator';
  const TOOL_CATEGORY = 'hair-color';

  let hasStarted = false;
  let currentRawFormula = '';

  const elements = {
    toner: null,
    ratio: null,
    tonerUnitTag: null,
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
    elements.toner = document.getElementById('inp-toner_ml');
    elements.ratio = document.getElementById('inp-ratio');
    elements.tonerUnitTag = document.getElementById('unit-tag-toner_ml');
    elements.resMain = document.getElementById('res-main');
    elements.resDetails = document.getElementById('res-details');
    elements.errorBanner = document.getElementById('calc-error-banner');
    elements.copyToast = document.getElementById('copy-toast');
    elements.btnCopy = document.getElementById('btn-copy-formula');
    elements.btnPrint = document.getElementById('btn-print-formula');
    elements.prefBtns = Array.from(document.querySelectorAll('.pref-btn'));
  }

  function setupEventListeners() {
    [elements.toner, elements.ratio].forEach(input => {
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
    if (elements.tonerUnitTag) {
      elements.tonerUnitTag.innerText = prefs.unit === 'imperial' ? 'fl oz' : 'ml';
    }
  }

  function handleUnitConversion(newUnit) {
    if (!elements.toner) return;
    const currentVal = Number(elements.toner.value);
    if (newUnit === 'imperial' && currentVal === 30) {
      elements.toner.value = '1';
      elements.toner.step = '0.1';
    } else if (newUnit === 'metric' && currentVal === 1) {
      elements.toner.value = '30';
      elements.toner.step = 'any';
    }
  }

  function clearErrors() {
    ['toner_ml', 'ratio'].forEach(id => {
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

  function showError(message) {
    clearErrors();
    const inp = document.getElementById('inp-toner_ml');
    const err = document.getElementById('err-toner_ml');
    if (inp) inp.classList.add('is-invalid');
    if (err) { err.innerText = message; err.style.display = 'block'; }
    if (elements.errorBanner) {
      elements.errorBanner.innerText = `⚠️ ${message}`;
      elements.errorBanner.style.display = 'block';
    }
  }

  function runCalculation() {
    if (!elements.toner || !elements.ratio) return;

    const prefs = window.SalonPreferences ? SalonPreferences.get() : { unit: 'metric', region: 'US', currency: 'USD' };
    const isImp = (prefs.unit === 'imperial');

    const res = SalonMath.calcTonerRatio(elements.toner.value.trim(), elements.ratio.value, isImp);

    if (!res.isValid) {
      showError(res.error);
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
