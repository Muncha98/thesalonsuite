/**
 * TheSalonSuite.com — Directory & Interactive Modal Handler
 * Full Metric & Imperial Unit Toggle + 1-Tap Copy Formula
 */

let allTools = [];
let currentFilter = 'all';

const CATEGORIES_ORDER = [
  { id: 'hair-color', name: '🎨 Hair Color & Chemistry' },
  { id: 'lashes-brows', name: '👁️ Lashes, Brows & Nails' },
  { id: 'business-rental', name: '💼 Suite Rent & Pricing' },
  { id: 'barbering', name: '💈 Barbering & Grooming' },
  { id: 'spa-massage', name: '🧖 Spa & Aromatherapy' }
];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/js/catalog.json');
    allTools = await res.json();
    allTools.sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    console.error("Could not load catalog.json", e);
  }

  // Homepage now shares the same SalonPreferences state as every tool page,
  // instead of keeping its own separate unit variable and deriving currency
  // from it. This is what makes a Region/Unit choice made here (or on any
  // tool page) consistent everywhere else on the site.
  syncMathWithPreferences();
  updatePreferenceButtonsUI();
  renderDirectory(allTools);
  setupFilters();
  setupSearch();
  setupModal();
  setupHeaderNavLinks();
  setupPreferenceButtons();

  window.addEventListener('salon:preferences-changed', () => {
    syncMathWithPreferences();
    updatePreferenceButtonsUI();
    renderDirectory(allTools);
  });
});

function syncMathWithPreferences() {
  if (!window.SalonPreferences || !window.SalonMath) return;
  const prefs = SalonPreferences.get();
  SalonMath.setPreferences(prefs);
}

function setupPreferenceButtons() {
  const btns = document.querySelectorAll('.pref-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!window.SalonPreferences) return;
      const prefType = btn.getAttribute('data-pref');
      const prefVal = btn.getAttribute('data-val');
      if (prefType === 'region') {
        SalonPreferences.setRegion(prefVal);
      } else if (prefType === 'unit') {
        SalonPreferences.setUnit(prefVal);
      }
    });
  });
}

function updatePreferenceButtonsUI() {
  if (!window.SalonPreferences) return;
  const prefs = SalonPreferences.get();
  const btns = document.querySelectorAll('.pref-btn');
  btns.forEach(btn => {
    const type = btn.getAttribute('data-pref');
    const val = btn.getAttribute('data-val');
    if (type === 'region') {
      btn.classList.toggle('active', val === prefs.region);
    } else if (type === 'unit') {
      btn.classList.toggle('active', val === prefs.unit);
    }
  });
}

function renderDirectory(tools) {
  const container = document.getElementById('tools-container');
  const countEl = document.getElementById('tool-count');
  if (!container) return;

  container.innerHTML = '';
  const prefs = window.SalonPreferences ? SalonPreferences.get() : { unit: 'metric', region: 'US', currency: 'USD' };
  const unitLabel = prefs.unit === 'imperial' ? 'Imperial (oz/fl oz)' : 'Metric (g/ml)';
  const unitBadge = `${unitLabel} • ${prefs.region} (${prefs.currency === 'GBP' ? '£' : '$'})`;
  if (countEl) countEl.innerText = `${tools.length} Tools Available (A–Z) • ${unitBadge}`;

  if (currentFilter === 'all') {
    CATEGORIES_ORDER.forEach(cat => {
      const catTools = tools.filter(t => t.category === cat.id);
      catTools.sort((a, b) => a.name.localeCompare(b.name));

      if (catTools.length > 0) {
        const secWrap = document.createElement('section');
        secWrap.className = 'category-section-block';
        secWrap.id = cat.id;

        secWrap.innerHTML = `
          <div class="category-header-row">
            <h3 class="category-header-title">${cat.name}</h3>
            <span class="category-header-badge">${catTools.length} Tools (A–Z)</span>
          </div>
          <div class="tools-grid"></div>
        `;

        const subGrid = secWrap.querySelector('.tools-grid');
        catTools.forEach(tool => subGrid.appendChild(createToolCard(tool)));
        container.appendChild(secWrap);
      }
    });
  } else {
    const filteredTools = tools.filter(t => t.category === currentFilter);
    filteredTools.sort((a, b) => a.name.localeCompare(b.name));

    const singleGrid = document.createElement('div');
    singleGrid.className = 'tools-grid';
    filteredTools.forEach(tool => singleGrid.appendChild(createToolCard(tool)));
    container.appendChild(singleGrid);
  }
}

function createToolCard(tool) {
  const card = document.createElement('a');
  card.href = `/tools/${tool.id}/`;
  card.className = 'tool-card';
  card.setAttribute('data-id', tool.id);
  card.setAttribute('data-category', tool.category);

  const badgeClass = tool.badge === 'Popular' || tool.badge === 'Top Tool' ? 'card-badge popular' : 'card-badge';

  card.innerHTML = `
    <div class="card-top">
      <div class="card-icon">${tool.icon}</div>
      <span class="${badgeClass}">${tool.badge || 'Tool'}</span>
    </div>
    <h3 class="card-title">${tool.name}</h3>
    <p class="card-desc">${tool.description}</p>
    <div class="card-footer">
      <span style="display:inline-flex; align-items:center; gap:4px;">Open ${tool.name}</span>
      <span class="arrow">&rarr;</span>
    </div>
  `;

  // Allow middle click / new tab or normal click to navigate directly, or click to open modal
  card.addEventListener('click', (e) => {
    // If not holding ctrl/cmd/shift, open interactive modal for instant station math
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      openToolModal(tool);
      // Update browser history so URL is shareable
      history.pushState(null, '', `/tools/${tool.id}/`);
    }
  });

  return card;
}

function setupFilters() {
  const buttons = document.querySelectorAll('.pill-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      applyFilters();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('hero-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    applyFilters(e.target.value.toLowerCase().trim());
  });
}

function applyFilters(searchQuery = '') {
  const searchInput = document.getElementById('hero-search');
  const query = searchQuery || (searchInput ? searchInput.value.toLowerCase().trim() : '');

  const filtered = allTools.filter(tool => {
    const matchesCategory = currentFilter === 'all' || tool.category === currentFilter;
    const matchesSearch = !query || 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      (tool.keywords && tool.keywords.some(k => k.toLowerCase().includes(query)));

    return matchesCategory && matchesSearch;
  });

  filtered.sort((a, b) => a.name.localeCompare(b.name));
  renderDirectory(filtered);
}

function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  }
}

let lastCalculatedResult = null;

function openToolModal(tool) {
  const overlay = document.getElementById('modal-overlay');
  const iconEl = document.getElementById('modal-icon');
  const titleEl = document.getElementById('modal-title');
  const catEl = document.getElementById('modal-cat');
  const bodyEl = document.getElementById('modal-form-body');

  if (!overlay || !bodyEl) return;

  iconEl.innerText = tool.icon;
  titleEl.innerText = tool.name;
  const prefs = window.SalonPreferences ? SalonPreferences.get() : { unit: 'metric', region: 'US', currency: 'USD' };
  catEl.innerText = `${tool.categoryName} • ${prefs.unit === 'imperial' ? 'Imperial' : 'Metric'}`;

  const isImp = (prefs.unit === 'imperial');

  let formHtml = '';
  tool.inputs.forEach(inp => {
    let label = inp.label;
    let defVal = inp.default;
    let unit = inp.unit || '';

    // Convert unit labels & defaults for Imperial. Currency symbol comes
    // from the user's actual currency preference, not from the unit system —
    // a US colorist can work in metric grams while still pricing in USD.
    if (isImp) {
      if (unit === 'ml') { unit = 'fl oz'; if (defVal === 60) defVal = 2.0; if (defVal === 30) defVal = 1.0; }
      else if (unit === 'grams') { unit = 'oz'; if (defVal === 30) defVal = 1.0; if (defVal === 60) defVal = 2.0; }
    }
    if (unit === '$/£') { unit = currency; }

    formHtml += `<div class="form-group">`;
    formHtml += `<label for="inp-${inp.id}">${label}</label>`;

    if (inp.type === 'select') {
      formHtml += `<select class="form-control" id="inp-${inp.id}">`;
      inp.options.forEach(opt => {
        const sel = opt.val === String(inp.default) ? 'selected' : '';
        formHtml += `<option value="${opt.val}" ${sel}>${opt.text}</option>`;
      });
      formHtml += `</select>`;
    } else if (inp.type === 'range') {
      formHtml += `
        <div class="range-wrap">
          <input type="range" class="range-slider" id="inp-${inp.id}" min="${inp.min}" max="${inp.max}" step="${inp.step}" value="${defVal}">
          <span class="range-val" id="val-${inp.id}">${defVal} ${unit}</span>
        </div>
      `;
    } else {
      formHtml += `<input type="number" step="any" class="form-control" id="inp-${inp.id}" value="${defVal}">`;
    }

    formHtml += `</div>`;
  });

  formHtml += `
    <div class="results-box" id="calc-results-box">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div class="results-header" style="margin-bottom:0;">Calculation Result</div>
        <button id="btn-copy-formula" class="btn-copy-recipe" onclick="copyFormulaToClipboard()">📋 Copy Recipe</button>
      </div>
      <div class="results-main-val" id="res-main">Calculating...</div>
      <div class="results-details" id="res-details"></div>
      <div id="copy-toast" class="copy-toast" style="display:none;">✓ Copied to clipboard!</div>
    </div>
  `;

  bodyEl.innerHTML = formHtml;

  tool.inputs.forEach(inp => {
    const el = document.getElementById(`inp-${inp.id}`);
    if (!el) return;

    el.addEventListener('input', () => {
      if (inp.type === 'range') {
        const valSpan = document.getElementById(`val-${inp.id}`);
        let unit = inp.unit || '';
        if (isImp && unit === 'ml') unit = 'fl oz';
        if (isImp && unit === 'grams') unit = 'oz';
        if (valSpan) valSpan.innerText = `${el.value} ${unit}`;
      }
      runCalculation(tool);
    });
  });

  overlay.classList.add('active');
  runCalculation(tool);
}

function runCalculation(tool) {
  const prefs = window.SalonPreferences ? SalonPreferences.get() : { unit: 'metric', region: 'US', currency: 'USD' };
  const isImp = (prefs.unit === 'imperial');
  const currency = prefs.currency === 'GBP' ? '£' : '$';
  const vals = {};
  tool.inputs.forEach(inp => {
    const el = document.getElementById(`inp-${inp.id}`);
    if (el) vals[inp.id] = el.value;
  });

  let res = { main: "Ready", details: "", rawFormula: "" };

  if (tool.id === 'developer-mixing-calculator') {
    res = SalonMath.calcDeveloperMixing(vals.dev1, vals.dev2, vals.target_vol, vals.total_ml, isImp);
  } else if (tool.id === 'bleach-developer-ratio-calculator') {
    res = SalonMath.calcBleachRatio(vals.powder_grams, vals.ratio, isImp);
  } else if (tool.id === 'hair-level-undertone-chart') {
    res = SalonMath.calcHairLevel(vals.current_level);
  } else if (tool.id === 'grey-coverage-formula-calculator') {
    res = SalonMath.calcGreyCoverage(vals.grey_pct, vals.total_color_grams, isImp);
  } else if (tool.id === 'balayage-pricing-product-calculator') {
    res = SalonMath.calcBalayagePricing(vals.bowls_bleach, vals.cost_per_bowl, vals.toner_bowls, vals.bond_builder, vals.service_hours, vals.target_hourly, currency);
  } else if (tool.id === 'toner-ratio-calculator') {
    res = SalonMath.calcTonerRatio(vals.toner_ml, vals.ratio, isImp);
  } else if (tool.id === 'color-correction-time-estimator') {
    res = SalonMath.calcColorCorrection(vals.stages, vals.target_hourly, currency);
  } else if (tool.id === 'foil-usage-placement-calculator') {
    res = SalonMath.calcFoilUsage(vals.service_type);
  } else if (tool.id === 'perm-rod-timing-calculator') {
    res = SalonMath.calcPermRod(vals.curl_type);
  } else if (tool.id === 'keratin-treatment-dosage-guide') {
    res = SalonMath.calcKeratinDosage(vals.hair_length, isImp);
  } else if (tool.id === 'lash-weight-safety-calculator') {
    res = SalonMath.calcLashWeight(vals.natural_lash, vals.fan_dimension);
  } else if (tool.id === 'lash-mapping-blueprint-generator') {
    res = SalonMath.calcLashMapping(vals.eye_shape, vals.style, vals.max_length);
  } else if (tool.id === 'lash-adhesive-humidity-adjuster') {
    res = SalonMath.calcLashHumidity(vals.humidity_pct);
  } else if (tool.id === 'brow-tint-developer-ratio') {
    res = SalonMath.calcBrowTint(vals.tint_cm, isImp);
  } else if (tool.id === 'brow-lamination-processing-timer') {
    res = SalonMath.calcBrowLamination(vals.hair_type);
  } else if (tool.id === 'acrylic-monomer-ratio-calculator') {
    res = SalonMath.calcAcrylicMonomer(vals.bead_size);
  } else if (tool.id === 'gel-nail-cure-lamp-wattage-calculator') {
    res = SalonMath.calcGelCure(vals.lamp_wattage);
  } else if (tool.id === 'spray-tan-dha-development-calculator') {
    res = SalonMath.calcSprayTanDha(vals.skin_type);
  } else if (tool.id === 'chemical-peel-acid-calculator') {
    res = SalonMath.calcChemicalPeel(vals.acid_pct, vals.ph_level);
  } else if (tool.id === 'chair-rental-profitability-calculator') {
    res = SalonMath.calcBoothRentVsComm(vals.weekly_sales, vals.comm_split, vals.booth_rent, vals.weekly_supplies, currency);
  } else if (tool.id === 'hairdresser-hourly-rate-calculator') {
    res = SalonMath.calcHourlyRate(vals.annual_revenue, vals.annual_expenses, vals.client_hours_week, vals.admin_hours_week, vals.weeks_worked, currency);
  } else if (tool.id === 'salon-suite-startup-budget-calculator') {
    res = SalonMath.calcSuiteStartup(vals.first_last_rent, vals.decor_equipment, vals.initial_stock, vals.avg_ticket, currency);
  } else if (tool.id === 'self-employed-beauty-tax-calculator') {
    res = SalonMath.calcSelfEmployedTax(vals.weekly_gross, vals.weekly_tips, vals.weekly_expenses, currency);
  } else if (tool.id === 'retail-product-markup-calculator') {
    res = SalonMath.calcRetailMarkup(vals.wholesale_cost, vals.markup_pct, vals.bottles_week, currency);
  } else if (tool.id === 'salon-software-cost-comparison') {
    res = SalonMath.calcSoftwareCost(vals.monthly_card_vol, currency);
  } else if (tool.id === 'salon-profit-margin-calculator') {
    res = SalonMath.calcProfitMargin(vals.total_rev, vals.total_cost, currency);
  } else if (tool.id === 'fade-clipper-guard-guide') {
    res = SalonMath.calcFadeGuards(vals.fade_type);
  } else if (tool.id === 'beard-oil-carrier-ratio-calculator') {
    res = SalonMath.calcBeardOil(vals.bottle_size_ml, isImp);
  } else if (tool.id === 'hot-towel-shave-protocol-timer') {
    res = SalonMath.calcHotTowelShave(vals.beard_density);
  } else if (tool.id === 'essential-oil-dilution-calculator') {
    res = SalonMath.calcEssentialOilDilution(vals.carrier_ml, vals.dilution_pct, isImp);
  } else if (tool.id === 'massage-oil-coverage-cost-calculator') {
    res = SalonMath.calcMassageOilCost(vals.session_len, vals.oil_bottle_cost, currency);
  } else if (tool.id === 'hot-stone-temp-placement-guide') {
    res = SalonMath.calcHotStone(vals.stone_type);
  } else {
    res = {
      main: "Unable to calculate",
      details: "This tool is not wired to SalonMath. Please report this ID: " + tool.id,
      rawFormula: ""
    };
  }

  lastCalculatedResult = res;

  const mainEl = document.getElementById('res-main');
  const detEl = document.getElementById('res-details');
  if (mainEl) mainEl.innerText = res.main;
  if (detEl) detEl.innerText = res.details;
}

function copyFormulaToClipboard() {
  if (!lastCalculatedResult || !lastCalculatedResult.rawFormula) return;
  
  navigator.clipboard.writeText(lastCalculatedResult.rawFormula).then(() => {
    const toast = document.getElementById('copy-toast');
    if (toast) {
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 2500);
    }
  }).catch(err => {
    console.error('Could not copy formula', err);
  });
}


function setupHeaderNavLinks() {
  const navCatLinks = document.querySelectorAll('.nav-cat-link');
  navCatLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const cat = link.getAttribute('data-cat');
      if (cat) {
        // Activate matching pill
        const pills = document.querySelectorAll('.pill-btn');
        pills.forEach(p => {
          if (p.getAttribute('data-filter') === cat) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });

        currentFilter = cat;
        renderDirectory(allTools);

        // Smooth scroll to target
        const targetId = cat === 'all' ? 'directory' : cat;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}
