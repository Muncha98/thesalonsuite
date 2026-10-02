/**
 * Hair Level & Undertone Neutralizer Guide — Client Controller
 * Single range-slider input, live result, live slider value display, unit syncing, analytics.
 */

(function() {
  'use strict';

  const TOOL_ID = 'hair-level-undertone-chart';
  const TOOL_CATEGORY = 'hair-color';

  let hasStarted = false;
  let currentRawFormula = '';

  const elements = {
    level: null,
    levelRangeVal: null,
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
    elements.level = document.getElementById('inp-current_level');
    elements.levelRangeVal = document.getElementById('range-val-current_level');
    elements.resMain = document.getElementById('res-main');
    elements.resDetails = document.getElementById('res-details');
    elements.errorBanner = document.getElementById('calc-error-banner');
    elements.copyToast = document.getElementById('copy-toast');
    elements.btnCopy = document.getElementById('btn-copy-formula');
    elements.btnPrint = document.getElementById('btn-print-formula');
    elements.prefBtns = Array.from(document.querySelectorAll('.pref-btn'));
  }

  function setupEventListeners() {
    if (elements.level) {
      elements.level.addEventListener('input', onInputChange);
      elements.level.addEventListener('change', onInputChange);
    }

    if (elements.btnCopy) {
      elements.btnCopy.addEventListener('click', copyRecipeToClipboard);
    }

    if (elements.btnPrint) {
      elements.btnPrint.addEventListener('click', () => window.print());
    }

    elements.prefBtns.forEach(btn => {
      btn.addEventListener('click', onPreferenceButtonClick);
    });

    window.addEventListener('salon:preferences-changed', () => {
      syncUIWithPreferences();
      runCalculation();
    });

    setupOutboundAnalytics();
  }

  function onInputChange() {
    if (elements.level && elements.levelRangeVal) {
      elements.levelRangeVal.innerText = `${elements.level.value} Level`;
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

    elements.prefBtns.forEach(btn => {
      const type = btn.getAttribute('data-pref');
      const val = btn.getAttribute('data-val');
      if (type === 'region') {
        btn.classList.toggle('active', val === prefs.region);
      } else if (type === 'unit') {
        btn.classList.toggle('active', val === prefs.unit);
      }
    });

    // This tool has no metric/imperial-sensitive quantity (the input is a
    // whole-number level, not a volume or weight), so unit changes don't
    // affect the slider value — only the result wording (handled in
    // SalonMath) and other region-aware UI.
  }

  function clearErrors() {
    const inp = document.getElementById('inp-current_level');
    const err = document.getElementById('err-current_level');
    if (inp) inp.classList.remove('is-invalid');
    if (err) {
      err.innerText = '';
      err.style.display = 'none';
    }
    if (elements.errorBanner) {
      elements.errorBanner.style.display = 'none';
      elements.errorBanner.innerText = '';
    }
  }

  function showError(message) {
    clearErrors();
    const inp = document.getElementById('inp-current_level');
    const err = document.getElementById('err-current_level');
    if (inp) inp.classList.add('is-invalid');
    if (err) {
      err.innerText = message;
      err.style.display = 'block';
    }
    if (elements.errorBanner) {
      elements.errorBanner.innerText = `⚠️ ${message}`;
      elements.errorBanner.style.display = 'block';
    }
  }

  function runCalculation() {
    if (!elements.level) return;

    const valLevel = elements.level.value;
    const res = SalonMath.calcHairLevel(valLevel);

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
      const prefs = window.SalonPreferences ? SalonPreferences.get() : { unit: 'metric', region: 'US', currency: 'USD' };
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
    const relatedLinks = document.querySelectorAll('.related-tool-card');
    relatedLinks.forEach(card => {
      card.addEventListener('click', () => {
        const toToolId = card.getAttribute('data-tool-id');
        if (window.SalonAnalytics) {
          SalonAnalytics.trackRelatedToolClicked(TOOL_ID, toToolId);
        }
      });
    });

    const resourceCta = document.getElementById('cta-download-resource');
    if (resourceCta) {
      resourceCta.addEventListener('click', () => {
        const slug = resourceCta.getAttribute('data-resource');
        if (window.SalonAnalytics) {
          SalonAnalytics.trackResourceClicked(TOOL_ID, slug);
        }
      });
    }

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
