/**
 * TheSalonSuite.com — Core Calculation & Formula Engine
 * Precision formulas for hair chemistry, lash physics, salon business & spa
 * Full support for Metric (g/ml/£) and Imperial (oz/fl oz/$)
 */

const SalonMath = {
  currentRegion: 'US',   // 'US' | 'UK'
  currentCurrency: 'USD', // 'USD' | 'GBP'
  currentUnit: 'metric', // 'metric' | 'imperial'

  setPreferences: function(prefs) {
    if (!prefs) return;
    if (prefs.region) this.currentRegion = String(prefs.region).toUpperCase();
    if (prefs.currency) this.currentCurrency = String(prefs.currency).toUpperCase();
    if (prefs.unit) this.currentUnit = String(prefs.unit).toLowerCase();
  },

  setUnit: function(unit) {
    this.currentUnit = String(unit).toLowerCase();
  },

  setCurrency: function(curr) {
    this.currentCurrency = String(curr).toUpperCase();
  },

  setRegion: function(reg) {
    this.currentRegion = String(reg).toUpperCase();
  },

  // Validation Layer for Developer Mixing
  validateDeveloperMixing: function(d1, d2, target, totalAmount) {
    const errors = {};

    // 1. Blank, null or undefined checks
    if (d1 === '' || d1 === null || d1 === undefined) errors.dev1 = 'Low developer volume is required.';
    if (d2 === '' || d2 === null || d2 === undefined) errors.dev2 = 'High developer volume is required.';
    if (target === '' || target === null || target === undefined) errors.target_vol = 'Target developer volume is required.';
    if (totalAmount === '' || totalAmount === null || totalAmount === undefined) errors.total_ml = 'Total batch quantity is required.';

    if (Object.keys(errors).length > 0) {
      return { isValid: false, errors, firstError: Object.values(errors)[0] };
    }

    // 2. Numeric and finiteness checks
    const nD1 = Number(d1);
    const nD2 = Number(d2);
    const nTarget = Number(target);
    const nTotal = Number(totalAmount);

    if (isNaN(nD1) || !isFinite(nD1)) errors.dev1 = 'Low developer volume must be a valid number.';
    if (isNaN(nD2) || !isFinite(nD2)) errors.dev2 = 'High developer volume must be a valid number.';
    if (isNaN(nTarget) || !isFinite(nTarget)) errors.target_vol = 'Target developer volume must be a valid number.';
    if (isNaN(nTotal) || !isFinite(nTotal)) errors.total_ml = 'Total batch quantity must be a valid number.';

    if (Object.keys(errors).length > 0) {
      return { isValid: false, errors, firstError: Object.values(errors)[0] };
    }

    // 3. Positivity & non-negative bounds
    if (nD1 < 0) errors.dev1 = 'Low developer volume cannot be negative.';
    if (nD2 <= 0) errors.dev2 = 'High developer volume must be greater than zero.';
    if (nTarget <= 0) errors.target_vol = 'Target developer volume must be greater than zero.';
    if (nTotal <= 0) errors.total_ml = 'Total batch quantity must be greater than zero.';

    if (Object.keys(errors).length > 0) {
      return { isValid: false, errors, firstError: Object.values(errors)[0] };
    }

    // 3b. Sanity ceilings. These mirror this tool's input bounds declared in
    // catalog.json (dev1 max:50, dev2 max:60, target_vol max:50, total_ml max:1000).
    // HTML min/max attributes alone are not enforcement — a user can type past
    // them, paste a value, or submit without JS — so the real check lives here.
    // If catalog.json's bounds for this tool ever change, update these too.
    if (nD1 > 50) errors.dev1 = 'Low developer volume cannot exceed 50 Vol.';
    if (nD2 > 60) errors.dev2 = 'High developer volume cannot exceed 60 Vol.';
    if (nTarget > 50) errors.target_vol = 'Target developer volume cannot exceed 50 Vol.';
    if (nTotal > 1000) errors.total_ml = 'Total batch quantity cannot exceed 1000 (this calculator is for single-service station use).';

    if (Object.keys(errors).length > 0) {
      return { isValid: false, errors, firstError: Object.values(errors)[0] };
    }

    // 4. Low developer must be strictly less than high developer
    if (nD1 >= nD2) {
      errors.dev1 = `Low developer (${nD1} Vol) must be strictly less than high developer (${nD2} Vol).`;
      return { isValid: false, errors, firstError: errors.dev1 };
    }

    // 5. Target developer must be within the span [nD1, nD2]
    if (nTarget < nD1) {
      errors.target_vol = `Target volume (${nTarget} Vol) cannot be lower than your lowest developer (${nD1} Vol).`;
      return { isValid: false, errors, firstError: errors.target_vol };
    }
    if (nTarget > nD2) {
      errors.target_vol = `Target volume (${nTarget} Vol) cannot exceed your highest developer (${nD2} Vol).`;
      return { isValid: false, errors, firstError: errors.target_vol };
    }

    return {
      isValid: true,
      values: { d1: nD1, d2: nD2, target: nTarget, totalAmount: nTotal }
    };
  },

  // 1. Developer Volume Mixing
  calcDeveloperMixing: function(d1, d2, target, totalAmount, options) {
    let isImperial = false;
    let unitLabel = 'ml';

    if (typeof options === 'boolean') {
      isImperial = options;
      unitLabel = isImperial ? 'fl oz' : 'ml';
    } else if (options && typeof options === 'object') {
      isImperial = options.unit === 'imperial' || options.isImperial === true;
      unitLabel = options.unitLabel || (isImperial ? 'fl oz' : 'ml');
    } else {
      isImperial = (this.currentUnit === 'imperial');
      unitLabel = isImperial ? 'fl oz' : 'ml';
    }

    // Defensive input validation
    const validation = this.validateDeveloperMixing(d1, d2, target, totalAmount);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.firstError,
        errors: validation.errors,
        main: "Cannot Calculate",
        details: validation.firstError,
        rawFormula: ""
      };
    }

    const { d1: nD1, d2: nD2, target: nTarget, totalAmount: nTotal } = validation.values;

    // Edge case: target equals lowest developer
    if (nTarget === nD1) {
      return {
        isValid: true,
        main: `100% ${nD1} Vol`,
        details: `Use ${nTotal}${unitLabel} of ${nD1} Volume developer alone (no mixing required).`,
        rawFormula: `${nTotal}${unitLabel} of ${nD1} Vol Developer`,
        data: {
          d1: nD1,
          d2: nD2,
          target: nTarget,
          totalAmount: nTotal,
          unitLabel: unitLabel,
          amountLow: nTotal,
          amountHigh: 0,
          partsLow: 1,
          partsHigh: 0,
          ratioString: "100% Low"
        }
      };
    }

    // Edge case: target equals highest developer
    if (nTarget === nD2) {
      return {
        isValid: true,
        main: `100% ${nD2} Vol`,
        details: `Use ${nTotal}${unitLabel} of ${nD2} Volume developer alone (no mixing required).`,
        rawFormula: `${nTotal}${unitLabel} of ${nD2} Vol Developer`,
        data: {
          d1: nD1,
          d2: nD2,
          target: nTarget,
          totalAmount: nTotal,
          unitLabel: unitLabel,
          amountLow: 0,
          amountHigh: nTotal,
          partsLow: 0,
          partsHigh: 1,
          ratioString: "100% High"
        }
      };
    }

    // Pearson's Alligation Alternate formula
    const partsLow = nD2 - nTarget;
    const partsHigh = nTarget - nD1;
    const totalParts = partsLow + partsHigh;

    let amountLow, amountHigh;
    if (isImperial) {
      amountLow = Number(((partsLow / totalParts) * nTotal).toFixed(1));
      amountHigh = Number((nTotal - amountLow).toFixed(1));
    } else {
      amountLow = Math.round((partsLow / totalParts) * nTotal);
      amountHigh = nTotal - amountLow;
    }

    return {
      isValid: true,
      main: `${amountLow}${unitLabel} ${nD1} Vol + ${amountHigh}${unitLabel} ${nD2} Vol`,
      details: `Mixing ${amountLow}${unitLabel} of ${nD1} Vol and ${amountHigh}${unitLabel} of ${nD2} Vol produces exactly ${nTotal}${unitLabel} of ${nTarget} Vol developer.`,
      rawFormula: `Formula: ${amountLow}${unitLabel} ${nD1} Vol + ${amountHigh}${unitLabel} ${nD2} Vol = ${nTotal}${unitLabel} ${nTarget} Vol Developer`,
      data: {
        d1: nD1,
        d2: nD2,
        target: nTarget,
        totalAmount: nTotal,
        unitLabel: unitLabel,
        amountLow: amountLow,
        amountHigh: amountHigh,
        partsLow: partsLow,
        partsHigh: partsHigh,
        totalParts: totalParts,
        ratioString: `${partsLow}:${partsHigh}`
      }
    };
  },

  // 2. Bleach to Developer Ratio
  calcBleachRatio: function(powderAmount, ratioStr, isImperial) {
    const unitLabel = isImperial ? 'oz' : 'g';

    // Defensive validation — previously any unrecognized ratio silently
    // fell back to 1:2, and powderAmount silently fell back to a default
    // instead of being rejected. Mirrors the rigor applied to the other
    // calculators after the Phase 1 QA review.
    const RATIOS = { '1:1': 1, '1:1.5': 1.5, '1:2': 2, '1:3': 3 };

    if (powderAmount === '' || powderAmount === null || powderAmount === undefined) {
      return { isValid: false, error: 'Powder lightener amount is required.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const nPowder = Number(powderAmount);
    if (!Number.isFinite(nPowder)) {
      return { isValid: false, error: 'Powder lightener amount must be a valid number.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    if (nPowder <= 0) {
      return { isValid: false, error: 'Powder lightener amount must be greater than zero.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const maxPowder = isImperial ? 17.5 : 500; // generous single-station ceiling (~500g / ~1lb tub)
    if (nPowder > maxPowder) {
      return { isValid: false, error: `Powder lightener amount cannot exceed ${maxPowder}${unitLabel} (this calculator is for single-station use).`, main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    if (!Object.prototype.hasOwnProperty.call(RATIOS, ratioStr)) {
      return { isValid: false, error: 'Please select a valid mixing ratio.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }

    const multiplier = RATIOS[ratioStr];

    let devAmount, totalWeight;
    if (isImperial) {
      devAmount = (nPowder * multiplier).toFixed(1);
      totalWeight = (nPowder + Number(devAmount)).toFixed(1);
    } else {
      devAmount = Math.round(nPowder * multiplier);
      totalWeight = Math.round(nPowder) + devAmount;
    }

    return {
      isValid: true,
      main: `${devAmount}${unitLabel} Developer (${nPowder}${unitLabel} Powder)`,
      details: `Total bowl weight: ${totalWeight}${unitLabel}. For a ${ratioStr} ratio, tare your digital scale and pour developer until scale reaches ${totalWeight}${unitLabel}.`,
      rawFormula: `Bleach Formula (${ratioStr}): ${nPowder}${unitLabel} Powder + ${devAmount}${unitLabel} Developer = ${totalWeight}${unitLabel} Total`,
      data: { powderAmount: nPowder, ratio: ratioStr, devAmount: Number(devAmount), totalWeight: Number(totalWeight), unitLabel }
    };
  },

  // 3. Hair Level & Undertone Chart
  calcHairLevel: function(level) {
    const data = {
      1: { undertone: "Red", neutralizer: "Green Tone", toneExample: ".7 (Matte / Green Ash)" },
      2: { undertone: "Red", neutralizer: "Green Tone", toneExample: ".7 (Matte / Green Ash)" },
      3: { undertone: "Red-Orange", neutralizer: "Blue-Green", toneExample: ".17 (Blue-Ash Green)" },
      4: { undertone: "Red-Orange", neutralizer: "Blue-Green", toneExample: ".17 (Blue-Ash Green)" },
      5: { undertone: "Orange-Red", neutralizer: "Ash-Blue", toneExample: ".1 (Ash / Blue)" },
      6: { undertone: "Orange", neutralizer: "Blue Ash", toneExample: ".1 / .11 (Intense Blue Ash)" },
      7: { undertone: "Yellow-Orange (Gold-Copper)", neutralizer: "Blue-Violet Ash", toneExample: ".12 / .21 (Ash Violet / Pearl)" },
      8: { undertone: "Yellow (Gold)", neutralizer: "Violet / Pearl", toneExample: ".2 / .21 (Violet Pearl / Irisé)" },
      9: { undertone: "Pale Yellow", neutralizer: "Soft Violet / Platinum", toneExample: ".02 / .2 (Sheer Violet)" },
      10: { undertone: "Pale Yellow / White", neutralizer: "Ultra-Pale Silver / Clear Pearl", toneExample: "Clear + .2 / 10P" }
    };

    // Defensive validation — previously this function silently fell back to
    // level 8 for any unrecognized input (blank, non-numeric, NaN, out of
    // range), which meant a broken slider or bad input would render a
    // confidently wrong, invented result. This mirrors the rigor applied to
    // validateDeveloperMixing after the Phase 1 QA review.
    if (level === '' || level === null || level === undefined) {
      return { isValid: false, error: 'Hair level is required.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const n = Number(level);
    if (!Number.isFinite(n)) {
      return { isValid: false, error: 'Hair level must be a valid number.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const rounded = Math.round(n);
    if (rounded !== n) {
      return { isValid: false, error: 'Hair level must be a whole number between 1 and 10.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    if (rounded < 1 || rounded > 10) {
      return { isValid: false, error: 'Hair level must be between 1 (Black) and 10 (Lightest Blonde).', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }

    const info = data[rounded];
    return {
      isValid: true,
      main: `Exposed: ${info.undertone} ➔ Neutralize with: ${info.neutralizer}`,
      details: `Target Neutralizing Pigment: ${info.toneExample}. Use with 5–10 Vol developer on damp, towel-dried hair for 10–20 minutes.`,
      rawFormula: `Level ${rounded} Exposed Pigment: ${info.undertone} | Neutralizer: ${info.neutralizer} (${info.toneExample})`,
      data: { level: rounded, undertone: info.undertone, neutralizer: info.neutralizer, toneExample: info.toneExample }
    };
  },

  // 4. Grey Coverage Formulation
  calcGreyCoverage: function(greyPct, totalAmount, isImperial) {
    const unitLabel = isImperial ? 'oz' : 'g';

    if (greyPct === '' || greyPct === null || greyPct === undefined) {
      return { isValid: false, error: 'Client grey percentage is required.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const nGrey = Number(greyPct);
    if (!Number.isFinite(nGrey)) {
      return { isValid: false, error: 'Grey percentage must be a valid number.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    if (nGrey < 0 || nGrey > 100) {
      return { isValid: false, error: 'Grey percentage must be between 0 and 100.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }

    if (totalAmount === '' || totalAmount === null || totalAmount === undefined) {
      return { isValid: false, error: 'Total color batch amount is required.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const nTotal = Number(totalAmount);
    if (!Number.isFinite(nTotal)) {
      return { isValid: false, error: 'Total color batch amount must be a valid number.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    if (nTotal <= 0) {
      return { isValid: false, error: 'Total color batch amount must be greater than zero.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const maxTotal = isImperial ? 17.5 : 500;
    if (nTotal > maxTotal) {
      return { isValid: false, error: `Total color batch amount cannot exceed ${maxTotal}${unitLabel} (this calculator is for single-station use).`, main: 'Cannot Calculate', details: '', rawFormula: '' };
    }

    let basePct = 0;
    if (nGrey <= 25) basePct = 0.25;
    else if (nGrey <= 50) basePct = 0.50;
    else if (nGrey <= 75) basePct = 0.66;
    else basePct = 0.75;

    let baseAmount, fashionAmount;
    if (isImperial) {
      baseAmount = (nTotal * basePct).toFixed(1);
      fashionAmount = (nTotal - baseAmount).toFixed(1);
    } else {
      baseAmount = Math.round(nTotal * basePct);
      fashionAmount = nTotal - baseAmount;
    }

    return {
      isValid: true,
      main: `${baseAmount}${unitLabel} Base (N) + ${fashionAmount}${unitLabel} Fashion Shade`,
      details: `For ${nGrey}% grey hair, use 20 Volume (6%) developer at 1:1 or 1:1.5 ratio. Process for a full 45 minutes for resistant cuticles.`,
      rawFormula: `Grey Formula (${nGrey}% grey): ${baseAmount}${unitLabel} Natural Base (N) + ${fashionAmount}${unitLabel} Fashion Target Shade`,
      data: { greyPct: nGrey, totalAmount: nTotal, baseAmount: Number(baseAmount), fashionAmount: Number(fashionAmount), unitLabel }
    };
  },

  // 5. Balayage Pricing & Cost
  calcBalayagePricing: function(bleachBowls, costPerBowl, tonerBowls, bondBuilder, hours, hourlyRate, currency) {
    const curr = currency || '$';

    const fields = [
      ['bleachBowls', bleachBowls, 'Bowls of lightener/clay'],
      ['costPerBowl', costPerBowl, 'Product cost per bowl'],
      ['tonerBowls', tonerBowls, 'Glosser/toner bowls'],
      ['hours', hours, 'Total appointment time'],
      ['hourlyRate', hourlyRate, 'Target net hourly labor rate']
    ];

    const parsed = {};
    for (const [key, val, label] of fields) {
      if (val === '' || val === null || val === undefined) {
        return { isValid: false, errors: { [key === 'bleachBowls' ? 'bowls_bleach' : key === 'costPerBowl' ? 'cost_per_bowl' : key === 'tonerBowls' ? 'toner_bowls' : key === 'hours' ? 'service_hours' : 'target_hourly']: `${label} is required.` }, error: `${label} is required.`, main: 'Cannot Calculate', details: '', rawFormula: '' };
      }
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0) {
        return { isValid: false, error: `${label} must be a valid, non-negative number.`, main: 'Cannot Calculate', details: '', rawFormula: '' };
      }
      parsed[key] = n;
    }

    if (parsed.hours > 24) {
      return { isValid: false, error: 'Total appointment time cannot exceed 24 hours.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    if (bondBuilder !== 'yes' && bondBuilder !== 'no') {
      return { isValid: false, error: 'Please select whether to include a bond builder.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }

    const productCost = (parsed.bleachBowls * parsed.costPerBowl) + (parsed.tonerBowls * 7.5) + (bondBuilder === 'yes' ? 12 : 0);
    const laborCost = parsed.hours * parsed.hourlyRate;
    const recommendedPrice = Math.round(productCost + laborCost);

    if (recommendedPrice <= 0) {
      return { isValid: false, error: 'Calculated quote must be greater than zero — check your inputs.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }

    return {
      isValid: true,
      main: `Recommended Quote: ${curr}${recommendedPrice}`,
      details: `Product Backbar Cost: ${curr}${productCost.toFixed(2)} | Labor (${parsed.hours}h @ ${curr}${parsed.hourlyRate}/h): ${curr}${laborCost.toFixed(2)}. Profit Margin: ~${Math.round((laborCost/recommendedPrice)*100)}%.`,
      rawFormula: `Balayage Quote: ${curr}${recommendedPrice} (${parsed.hours}h service + ${curr}${productCost.toFixed(2)} backbar stock)`,
      data: { productCost, laborCost, recommendedPrice }
    };
  },

  // 6. Lash Weight & Safe-Load
  calcLashWeight: function(naturalLash, fanDimension) {
    const weights = {
      "1D": { safeDia: "0.15mm – 0.18mm", note: "Classic single extension." },
      "3D": { safeDia: "0.07mm – 0.085mm", note: "Light volume. Featherlight natural effect." },
      "5D": { safeDia: "0.05mm – 0.06mm", note: "Standard volume fan. Full fluffy look." },
      "7D": { safeDia: "0.04mm – 0.05mm", note: "Mega volume fan. Lightweight base." },
      "10D": { safeDia: "0.03mm Ultra-Fine", note: "Super mega volume. Must use 0.03mm only to protect lash follicle." }
    };

    const conf = weights[fanDimension] || weights["5D"];
    return {
      main: `Safe Fan Diameter: ${conf.safeDia}`,
      details: `${conf.note} Natural lash condition: ${naturalLash}. Never apply fan weights that exceed the natural lash load limit.`,
      rawFormula: `Safe Lash Fan: ${fanDimension} using ${conf.safeDia} diameter for ${naturalLash} lash`
    };
  },

  // 7. Lash Mapping Blueprint
  calcLashMapping: function(eyeShape, style, maxLen) {
    maxLen = Number(maxLen) || 13;
    const maps = {
      "cat_eye": `8mm ➔ 9mm ➔ 10mm ➔ 11mm ➔ 12mm ➔ ${maxLen}mm ➔ ${maxLen-1}mm at outer tip`,
      "doll_eye": `8mm ➔ 10mm ➔ 12mm ➔ ${maxLen}mm (center) ➔ 12mm ➔ 10mm ➔ 8mm`,
      "squirrel": `8mm ➔ 9mm ➔ 11mm ➔ 12mm ➔ ${maxLen}mm (arch peak) ➔ 11mm ➔ 10mm`,
      "natural": `7mm ➔ 8mm ➔ 9mm ➔ 10mm ➔ ${maxLen}mm ➔ 11mm ➔ 9mm`
    };

    return {
      main: `${style.replace('_', ' ').toUpperCase()}: ${maps[style] || maps.squirrel}`,
      details: `Ideal for ${eyeShape} eyes. Inner corners: keep lengths 7–8mm to prevent eyelid irritation and premature shedding.`,
      rawFormula: `Lash Map (${style} on ${eyeShape} eyes): ${maps[style] || maps.squirrel}`
    };
  },

  // 8. Booth Rent vs Commission
  calcBoothRentVsComm: function(weeklySales, commSplit, boothRent, supplies, currency) {
    weeklySales = Number(weeklySales) || 1800;
    commSplit = Number(commSplit) || 50;
    boothRent = Number(boothRent) || 300;
    supplies = Number(supplies) || 150;
    const curr = currency || '$';

    const commTakeHome = weeklySales * (commSplit / 100);
    const boothTakeHome = weeklySales - boothRent - supplies;
    const diff = boothTakeHome - commTakeHome;

    return {
      main: diff >= 0 ? `Booth Rent Yields +${curr}${Math.round(diff)}/week More Take-Home` : `Commission Yields +${curr}${Math.round(Math.abs(diff))}/week More`,
      details: `Suite Rental Net: ${curr}${Math.round(boothTakeHome)}/wk (${curr}${Math.round(boothTakeHome*4.33)}/mo) vs. Commission Net: ${curr}${Math.round(commTakeHome)}/wk (${curr}${Math.round(commTakeHome*4.33)}/mo). Annual Difference: ${curr}${Math.round(diff * 50)}/year.`,
      rawFormula: `Booth Rent Net: ${curr}${Math.round(boothTakeHome)}/wk vs Commission Net: ${curr}${Math.round(commTakeHome)}/wk (Annual Difference: ${curr}${Math.round(diff * 50)}/yr)`
    };
  },

  // 9. True Hourly Rate
  calcHourlyRate: function(annualRev, annualExp, clientHours, adminHours, weeksWorked, currency) {
    annualRev = Number(annualRev) || 65000;
    annualExp = Number(annualExp) || 18000;
    clientHours = Number(clientHours) || 30;
    adminHours = Number(adminHours) || 8;
    weeksWorked = Number(weeksWorked) || 48;
    const curr = currency || '$';

    const netIncome = annualRev - annualExp;
    const totalHoursPerYear = (clientHours + adminHours) * weeksWorked;
    const clientHoursPerYear = clientHours * weeksWorked;

    const realHourly = netIncome / totalHoursPerYear;
    const chairHourly = netIncome / clientHoursPerYear;

    return {
      main: `True Net Rate: ${curr}${realHourly.toFixed(2)} / hr (All working time)`,
      details: `Chair-Only Rate: ${curr}${chairHourly.toFixed(2)}/hr. Annual Net Profit: ${curr}${Math.round(netIncome)}. Total hours worked per year: ${totalHoursPerYear} hours.`,
      rawFormula: `True Hourly Net Rate: ${curr}${realHourly.toFixed(2)}/hr (${totalHoursPerYear} hrs/yr on ${curr}${Math.round(netIncome)} net profit)`
    };
  },

  // 10. Essential Oil Dilution
  calcEssentialOilDilution: function(carrierAmount, pct, isImperial) {
    carrierAmount = Number(carrierAmount) || (isImperial ? 1.0 : 30);
    pct = Number(pct) || 2.0;

    // 1 ml ≈ 20 drops | 1 fl oz ≈ 600 drops (30ml * 20)
    const totalDropsInCarrier = isImperial ? (carrierAmount * 600) : (carrierAmount * 20);
    const essentialDrops = Math.round(totalDropsInCarrier * (pct / 100));
    const unitLabel = isImperial ? 'fl oz' : 'ml';

    return {
      main: `${essentialDrops} Drops of Essential Oil for ${carrierAmount}${unitLabel}`,
      details: `For a ${pct}% dilution in ${carrierAmount}${unitLabel} of carrier oil (Jojoba/Sweet Almond), add exactly ${essentialDrops} drops of essential oil.`,
      rawFormula: `Essential Oil Dilution (${pct}%): Add ${essentialDrops} drops to ${carrierAmount}${unitLabel} carrier oil`
    };
  },
// 11. Toner Ratio & Processing Timer
  calcTonerRatio: function(tonerMl, ratioStr, isImperial) {
    const unitLabel = isImperial ? 'fl oz' : 'ml';
    const RATIOS = { '1:1': 1, '1:2': 2 };

    if (tonerMl === '' || tonerMl === null || tonerMl === undefined) {
      return { isValid: false, error: 'Toner color amount is required.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const nToner = Number(tonerMl);
    if (!Number.isFinite(nToner)) {
      return { isValid: false, error: 'Toner color amount must be a valid number.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    if (nToner <= 0) {
      return { isValid: false, error: 'Toner color amount must be greater than zero.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const maxToner = isImperial ? 17 : 500;
    if (nToner > maxToner) {
      return { isValid: false, error: `Toner color amount cannot exceed ${maxToner}${unitLabel} (this calculator is for single-station use).`, main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    if (!Object.prototype.hasOwnProperty.call(RATIOS, ratioStr)) {
      return { isValid: false, error: 'Please select a valid developer ratio.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }

    const multiplier = RATIOS[ratioStr];

    let developer, total;
    if (isImperial) {
      developer = (nToner * multiplier).toFixed(1);
      total = (nToner + Number(developer)).toFixed(1);
    } else {
      developer = Math.round(nToner * multiplier);
      total = Math.round(nToner) + developer;
    }
    const processNote = multiplier === 2
      ? 'Sheer gloss: check every 5 minutes, max 15–20 minutes on damp hair.'
      : 'Standard demi: visual check at 5 and 10 minutes, process up to 20 minutes.';

    return {
      isValid: true,
      main: `${nToner}${unitLabel} Toner + ${developer}${unitLabel} Developer (${ratioStr})`,
      details: `Total mix: ${total}${unitLabel}. Use 5–10 Vol dedicated toner developer. ${processNote}`,
      rawFormula: `Toner (${ratioStr}): ${nToner}${unitLabel} color + ${developer}${unitLabel} developer = ${total}${unitLabel}`,
      data: { tonerMl: nToner, ratio: ratioStr, developer: Number(developer), total: Number(total), unitLabel }
    };
  },

  // 12. Color Correction Time & Quote
  calcColorCorrection: function(stages, hourlyRate, currency) {
    const curr = currency || '$';

    if (stages === '' || stages === null || stages === undefined) {
      return { isValid: false, errors: { stages: 'Estimated correction stages is required.' }, error: 'Estimated correction stages is required.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const nStages = Number(stages);
    if (!Number.isFinite(nStages) || nStages <= 0) {
      return { isValid: false, errors: { stages: 'Stages must be a positive whole number.' }, error: 'Stages must be a positive whole number.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    if (nStages > 12) {
      return { isValid: false, errors: { stages: 'Stages cannot exceed 12 (consider splitting into multiple appointments).' }, error: 'Stages cannot exceed 12 (consider splitting into multiple appointments).', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }

    if (hourlyRate === '' || hourlyRate === null || hourlyRate === undefined) {
      return { isValid: false, errors: { target_hourly: 'Hourly rate is required.' }, error: 'Hourly rate is required.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const nRate = Number(hourlyRate);
    if (!Number.isFinite(nRate) || nRate <= 0) {
      return { isValid: false, errors: { target_hourly: 'Hourly rate must be a positive number.' }, error: 'Hourly rate must be a positive number.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }

    const hoursPerStage = 1.25;
    const totalHours = nStages * hoursPerStage;
    const labor = totalHours * nRate;
    const backbar = nStages * 25;
    const quote = Math.round(labor + backbar);

    return {
      isValid: true,
      main: `Quote: ${curr}${quote} (~${totalHours.toFixed(1)} hrs)`,
      details: `${nStages} stage(s) × ${hoursPerStage}h = ${totalHours.toFixed(1)}h labor @ ${curr}${nRate}/h (${curr}${Math.round(labor)}) + ~${curr}${backbar} backbar buffer.`,
      rawFormula: `Color Correction: ${nStages} stages × ${hoursPerStage}h × ${curr}${nRate} + ${curr}${backbar} backbar = ${curr}${quote}`,
      data: { stages: nStages, totalHours, labor, backbar, quote }
    };
  },

  // 13. Foil Usage & Placement
  calcFoilUsage: function(serviceType) {
    const map = {
      partial: { foils: '35–45', note: 'Partial highlight / face-frame + crown. Include 8–12 money-piece foils if requested.' },
      full: { foils: '70–90', note: 'Full-head foils. Pre-cut sheets; allow ~10% spare for weaving adjustments.' },
      platinum: { foils: '110–140', note: 'Platinum card / dense weave. Expect longer process time and higher lightener usage.' }
    };
    if (!Object.prototype.hasOwnProperty.call(map, serviceType)) {
      return { isValid: false, error: 'Please select a valid service placement.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const conf = map[serviceType];
    return {
      isValid: true,
      main: `Estimated Foils: ${conf.foils}`,
      details: conf.note,
      rawFormula: `Foil Placement (${serviceType}): ${conf.foils} foils`
    };
  },

  // 14. Perm Rod Size & Curl Guide
  calcPermRod: function(curlType) {
    const map = {
      spiral: { rods: 'Red / Yellow (4–5mm)', process: 'Process 10–15 min (check early on fine hair)', note: 'Tight spiral. End papers essential; wrap evenly for consistent diameter.' },
      standard: { rods: 'Blue / Pink (9mm)', process: 'Process 12–18 min per manufacturer', note: 'Medium volume curl — most common salon rod size.' },
      beach: { rods: 'Purple / Orange (14–16mm)', process: 'Process 8–12 min for soft wave', note: 'Soft beach wave. Avoid over-processing or waves will tighten.' }
    };
    if (!Object.prototype.hasOwnProperty.call(map, curlType)) {
      return { isValid: false, error: 'Please select a valid wave pattern.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const conf = map[curlType];
    return {
      isValid: true,
      main: `Rod Choice: ${conf.rods}`,
      details: `${conf.note} Timing: ${conf.process}. Always perform a test curl before neutralizing.`,
      rawFormula: `Perm Rod (${curlType}): ${conf.rods} | ${conf.process}`
    };
  },

  // 15. Keratin Dosage Guide
  calcKeratinDosage: function(hairLength, isImperial) {
    const map = {
      short: { ml: 35, range: '30–40ml', passes: '2–3 iron passes', temp: '380–400°F (193–204°C)' },
      medium: { ml: 52, range: '45–60ml', passes: '4–6 iron passes', temp: '400–430°F (204–221°C)' },
      long: { ml: 82, range: '75–90ml', passes: '6–8 iron passes', temp: '420–450°F (216–232°C)' }
    };
    if (!Object.prototype.hasOwnProperty.call(map, hairLength)) {
      return { isValid: false, error: 'Please select a valid hair length & density.', main: 'Cannot Calculate', details: '', rawFormula: '' };
    }
    const conf = map[hairLength];
    const unitLabel = isImperial ? 'fl oz' : 'ml';
    const amount = isImperial ? (conf.ml / 30).toFixed(1) : conf.ml;
    const rangeLabel = isImperial
      ? conf.range.replace(/(\d+)–(\d+)ml/, (_, a, b) => `${(Number(a)/30).toFixed(1)}–${(Number(b)/30).toFixed(1)} fl oz`)
      : conf.range;

    return {
      isValid: true,
      main: `Dose: ~${amount}${unitLabel} (${rangeLabel})`,
      details: `Apply thin even layers mid-lengths to ends, then roots last. Flat iron: ${conf.passes} at ${conf.temp}. Follow brand-specific wash wait time.`,
      rawFormula: `Keratin Dosage (${hairLength}): ${rangeLabel} | ${conf.passes} @ ${conf.temp}`
    };
  },

  // 16. Lash Adhesive Humidity Adjuster
  calcLashHumidity: function(humidityPct) {
    humidityPct = Number(humidityPct) || 50;
    let glue, tip, cure;
    if (humidityPct < 40) {
      glue = 'Fast adhesive (0.5–1s) + humidity booster / nebulizer';
      tip = 'Room is dry — glue cures too slowly without boost. Aim for 45–55% RH.';
      cure = '1–2s with booster';
    } else if (humidityPct <= 60) {
      glue = 'Standard 1–2s adhesive (ideal zone)';
      tip = 'Ideal humidity band (45–60% RH). Maintain with hygrometer.';
      cure = '1–2s';
    } else if (humidityPct <= 70) {
      glue = 'Medium / slower adhesive (2–3s)';
      tip = 'Slightly high RH — glue may flash-cure. Switch to slower formula.';
      cure = '2–3s';
    } else {
      glue = 'Slow adhesive (3–5s) + dehumidifier';
      tip = 'High humidity (>70%) causes instant curing and poor retention. Dehumidify first.';
      cure = '3–5s';
    }
    return {
      main: `${humidityPct}% RH → ${glue}`,
      details: `Expected cure: ${cure}. ${tip}`,
      rawFormula: `Lash Adhesive @ ${humidityPct}% RH: ${glue} (cure ~${cure})`
    };
  },

  // 17. Brow Tint Developer Ratio
  calcBrowTint: function(tintCm, isImperial) {
    tintCm = Number(tintCm) || 2;
    // 2cm tint cream ≈ 10 drops of 3% (10 Vol) liquid developer
    const drops = Math.round((tintCm / 2) * 10);
    const creamOxidant = isImperial
      ? `${(tintCm * 0.03).toFixed(2)} fl oz cream oxidant (1:1)`
      : `${Math.round(tintCm * 0.5)}ml cream oxidant (approx 1:1 by volume)`;

    return {
      main: `${tintCm}cm Tint → ${drops} Drops of 10 Vol (3%) Developer`,
      details: `Liquid oxidant: ${drops} drops. Or use cream oxidant ~${creamOxidant}. Process 5–10 minutes; patch-test first.`,
      rawFormula: `Brow Tint: ${tintCm}cm cream + ${drops} drops 10 Vol developer`
    };
  },

  // 18. Brow Lamination Processing Timer
  calcBrowLamination: function(hairType) {
    const map = {
      fine: { step1: '4–5 min', step2: '4–5 min', note: 'Fine / thin brows process fastest — check at 3 minutes.' },
      medium: { step1: '6–7 min', step2: '6–7 min', note: 'Medium texture: standard lamination window.' },
      coarse: { step1: '8–10 min', step2: '8–10 min', note: 'Coarse / stubborn hairs need full Step 1 window; do not exceed brand max.' }
    };
    const conf = map[hairType] || map.medium;
    return {
      main: `Step 1 (Lift): ${conf.step1} → Step 2 (Set): ${conf.step2}`,
      details: `${conf.note} Neutralize for equal time to Step 1. Finish with nourishing oil after full process.`,
      rawFormula: `Brow Lamination (${hairType}): Step1 ${conf.step1} | Step2 ${conf.step2}`
    };
  },

  // 19. Acrylic Monomer Ratio
  calcAcrylicMonomer: function(beadSize) {
    const map = {
      small: { ratio: '~1:1 liquid:powder (drier bead)', zone: 'Cuticle Zone 1', note: 'Small dry bead for thin cuticle application — avoid flooding the proximal fold.' },
      medium: { ratio: '~1.5:1 liquid:powder', zone: 'Apex Zone 2', note: 'Medium structural bead. Surface should satin-smooth within ~3 seconds of powder pickup.' },
      large: { ratio: '~2:1 liquid:powder (wetter bead)', zone: 'Free Edge Zone 3', note: 'Large wetter bead for extension / sculpting free edge before shaping.' }
    };
    const conf = map[beadSize] || map.medium;
    return {
      main: `${conf.zone}: ${conf.ratio}`,
      details: conf.note,
      rawFormula: `Acrylic Bead (${beadSize} / ${conf.zone}): ${conf.ratio}`
    };
  },

  // 20. Gel Nail Cure Lamp
  calcGelCure: function(lampWattage) {
    const map = {
      '24w': { color: '60–90s', builder: '90–120s', note: 'Compact 24W LED — double-check sticky inhibition layer; some builders need full 120s.' },
      '48w': { color: '30–60s', builder: '60s', note: '48W pro LED/UV — standard salon cure times for most gel systems.' },
      '54w': { color: '30–45s', builder: '30–60s', note: '54W heavy-duty — follow brand max to avoid overcure heat spikes.' }
    };
    const conf = map[lampWattage] || map['48w'];
    return {
      main: `Color Gel: ${conf.color} | Builder: ${conf.builder}`,
      details: `${conf.note} Always match lamp wavelength to gel brand recommendations.`,
      rawFormula: `Gel Cure (${lampWattage}): color ${conf.color}, builder ${conf.builder}`
    };
  },

  // 21. Spray Tan DHA Development
  calcSprayTanDha: function(skinType) {
    const map = {
      type1: { dha: '8% DHA', rinse: '6–8 hrs (or 2–4 hrs rapid)', note: 'Very fair / burns easily — start sheer; avoid high-DHA solutions.' },
      type2: { dha: '9%–10% DHA', rinse: '8 hrs (or 2–4 hrs rapid)', note: 'Fair / light — most common retail solution band.' },
      type3: { dha: '11%–12% DHA', rinse: '8–10 hrs', note: 'Medium / olive — deeper develop; moisturize after rinse.' },
      type4: { dha: '14% DHA', rinse: '8–12 hrs', note: 'Dark / deep — high DHA; patch-test for evenness.' }
    };
    const conf = map[skinType] || map.type2;
    return {
      main: `Solution: ${conf.dha}`,
      details: `Rinse window: ${conf.rinse}. ${conf.note}`,
      rawFormula: `Spray Tan (${skinType}): ${conf.dha}, rinse ${conf.rinse}`
    };
  },

  // 22. Chemical Peel Acid Strength (simplified free-acid estimate)
  calcChemicalPeel: function(acidPct, phLevel) {
    acidPct = Number(acidPct) || 30;
    phLevel = Number(phLevel) || 2.5;
    // Approximate free acid using Henderson–Hasselbalch with typical AHA pKa ≈ 3.5
    const pKa = 3.5;
    const freeFrac = 1 / (1 + Math.pow(10, phLevel - pKa));
    const freeAcid = acidPct * freeFrac;
    let strength;
    if (freeAcid < 10) strength = 'Mild / Lunchtime';
    else if (freeAcid < 20) strength = 'Moderate';
    else if (freeAcid < 30) strength = 'Active / Professional';
    else strength = 'Aggressive — advanced use only';

    return {
      main: `~${freeAcid.toFixed(1)}% Free Acid (${strength})`,
      details: `Nominal ${acidPct}% at pH ${phLevel} (pKa≈${pKa}) → free acid ≈ ${freeAcid.toFixed(1)}%. Lower pH increases bioavailability. Patch-test; follow brand protocols.`,
      rawFormula: `Peel Free Acid ≈ ${acidPct}% × 1/(1+10^(${phLevel}-${pKa})) = ${freeAcid.toFixed(1)}%`
    };
  },

  // 23. Salon Suite Startup / Break-Even
  calcSuiteStartup: function(firstLastRent, decorEquipment, initialStock, avgTicket, currency) {
    firstLastRent = Number(firstLastRent) || 1200;
    decorEquipment = Number(decorEquipment) || 1500;
    initialStock = Number(initialStock) || 800;
    avgTicket = Number(avgTicket) || 95;
    const curr = currency || '$';
    const startupTotal = firstLastRent + decorEquipment + initialStock;
    // Assume firstLastRent covers ~2 months rent equivalent for monthly fixed estimate
    const monthlyFixed = Math.round(firstLastRent / 2 + 80 + 50); // rent + software + insurance rough
    const clientsToBreakEvenMonth = Math.ceil(monthlyFixed / avgTicket);
    const clientsToRecoupStartup = Math.ceil(startupTotal / avgTicket);

    return {
      main: `Startup Total: ${curr}${startupTotal.toLocaleString()} | Break-even ≈ ${clientsToBreakEvenMonth} clients/mo`,
      details: `Deposit/rent block ${curr}${firstLastRent} + build-out ${curr}${decorEquipment} + stock ${curr}${initialStock}. Est. monthly fixed ~${curr}${monthlyFixed}. Clients to recoup startup: ~${clientsToRecoupStartup} @ ${curr}${avgTicket}/ticket.`,
      rawFormula: `Suite Startup: ${curr}${startupTotal}; monthly BE ≈ ${clientsToBreakEvenMonth} clients @ ${curr}${avgTicket}`
    };
  },

  // 24. Self-Employed Tax & Tip Estimator
  calcSelfEmployedTax: function(weeklyGross, weeklyTips, weeklyExpenses, currency) {
    weeklyGross = Number(weeklyGross) || 1500;
    weeklyTips = Number(weeklyTips) || 250;
    weeklyExpenses = Number(weeklyExpenses) || 400;
    const curr = currency || '$';
    const weeklyNet = weeklyGross + weeklyTips - weeklyExpenses;
    const annualNet = weeklyNet * 52;
    const setAsidePct = 0.28;
    const weeklySetAside = weeklyNet * setAsidePct;
    const annualSetAside = weeklySetAside * 52;

    return {
      main: `Set Aside ~${curr}${Math.round(weeklySetAside)}/wk (28% of net)`,
      details: `Weekly taxable net: ${curr}${Math.round(weeklyNet)} (gross ${curr}${weeklyGross} + tips ${curr}${weeklyTips} − expenses ${curr}${weeklyExpenses}). Annual net ≈ ${curr}${Math.round(annualNet)}; annual tax reserve ≈ ${curr}${Math.round(annualSetAside)}. Confirm with a tax professional.`,
      rawFormula: `Tax Reserve: 28% × ${curr}${Math.round(weeklyNet)}/wk = ${curr}${Math.round(weeklySetAside)}/wk`
    };
  },

  // 25. Retail Product Markup
  calcRetailMarkup: function(wholesaleCost, markupPct, bottlesWeek, currency) {
    wholesaleCost = Number(wholesaleCost) || 14;
    markupPct = Number(markupPct) || 100;
    bottlesWeek = Number(bottlesWeek) || 10;
    const curr = currency || '$';
    const retail = wholesaleCost * (1 + markupPct / 100);
    const profitPerBottle = retail - wholesaleCost;
    const marginPct = retail > 0 ? (profitPerBottle / retail) * 100 : 0;
    const weeklyProfit = profitPerBottle * bottlesWeek;

    return {
      main: `Retail ${curr}${retail.toFixed(2)} | Margin ${marginPct.toFixed(0)}% | ${curr}${weeklyProfit.toFixed(0)}/wk profit`,
      details: `Wholesale ${curr}${wholesaleCost.toFixed(2)} + ${markupPct}% markup → ${curr}${retail.toFixed(2)}. Profit/bottle ${curr}${profitPerBottle.toFixed(2)}. At ${bottlesWeek}/wk ≈ ${curr}${weeklyProfit.toFixed(2)} weekly retail profit.`,
      rawFormula: `Retail = ${curr}${wholesaleCost} × (1+${markupPct}/100) = ${curr}${retail.toFixed(2)}`
    };
  },

  // 26. Salon Software Cost Comparison
  calcSoftwareCost: function(monthlyCardVol, currency) {
    monthlyCardVol = Number(monthlyCardVol) || 6000;
    const curr = currency || '$';
    // Typical illustrative fee stacks (not endorsements)
    const plans = [
      { name: 'Square-style', monthly: 0, pct: 2.6, flat: 0.10 },
      { name: 'Salon-software + payments', monthly: 89, pct: 2.3, flat: 0 },
      { name: 'Premium all-in-one', monthly: 149, pct: 2.0, flat: 0 }
    ];
    const lines = plans.map(p => {
      // approximate transactions as volume/avg ticket 80
      const tx = Math.max(1, Math.round(monthlyCardVol / 80));
      const processing = monthlyCardVol * (p.pct / 100) + tx * p.flat;
      const annual = (p.monthly + processing) * 12;
      return `${p.name}: ~${curr}${Math.round(p.monthly + processing)}/mo (~${curr}${Math.round(annual)}/yr)`;
    });
    return {
      main: `At ${curr}${monthlyCardVol.toLocaleString()}/mo card volume`,
      details: lines.join(' · ') + '. Compare your contract’s monthly SaaS fee + card %; cancel unused seats.',
      rawFormula: `Software Cost ≈ (Monthly SaaS × 12) + (Card Volume × fee%)`
    };
  },

  // 27. Salon Profit Margin
  calcProfitMargin: function(totalRev, totalCost, currency) {
    totalRev = Number(totalRev) || 7500;
    totalCost = Number(totalCost) || 2800;
    const curr = currency || '$';
    const net = totalRev - totalCost;
    const margin = totalRev > 0 ? (net / totalRev) * 100 : 0;
    let band = 'Watch closely';
    if (margin >= 20) band = 'Healthy';
    else if (margin >= 10) band = 'Acceptable';
    else if (margin >= 0) band = 'Thin';
    else band = 'Loss';

    return {
      main: `Net Margin: ${margin.toFixed(1)}% (${band}) — ${curr}${Math.round(net)}`,
      details: `Revenue ${curr}${Math.round(totalRev)} − expenses ${curr}${Math.round(totalCost)} = ${curr}${Math.round(net)} net. Target 15–25%+ after backbar and owner pay.`,
      rawFormula: `Net Margin = (${curr}${Math.round(totalRev)} − ${curr}${Math.round(totalCost)}) / ${curr}${Math.round(totalRev)} × 100 = ${margin.toFixed(1)}%`
    };
  },

  // 28. Fade Clipper Guard Guide
  calcFadeGuards: function(fadeType) {
    const map = {
      low_taper: {
        main: 'Closed 0 → Open 0 → #0.5 → #1 → blend into length',
        details: 'Low taper: keep skin/low work below occipital. Soften with #0.5/#1 before guard into scissor length.'
      },
      mid_skin: {
        main: '#00000 / closed 0 → open 0 → #0.5 → #1 → #1.5 → #2',
        details: 'Mid skin fade: bald/skin at mid-side. Progression: closed blade (0.5mm) → open (1.2mm) → #0.5 open (~2.4mm) → #1 closed (3mm) → #1.5 (4.5mm) → #2 (6mm).'
      },
      high_drop: {
        main: 'Skin high → drop arch → #0.5 → #1 → #1.5 → #2 / scissors',
        details: 'High drop fade: elevate bald line toward parietal ridge, drop behind ear, then stretch guards into length.'
      }
    };
    const conf = map[fadeType] || map.mid_skin;
    return {
      main: conf.main,
      details: conf.details + ' Stretch each band; detail with trimmer/shader.',
      rawFormula: `Fade Guards (${fadeType}): ${conf.main}`
    };
  },

  // 29. Beard Oil Carrier Ratio
  calcBeardOil: function(bottleSizeMl, isImperial) {
    bottleSizeMl = Number(bottleSizeMl) || (isImperial ? 1.0 : 30);
    // Treat imperial input as fl oz → convert to ml for ratio math
    const ml = isImperial ? bottleSizeMl * 30 : bottleSizeMl;
    const jojoba = ml * 0.60;
    const argan = ml * 0.30;
    const castor = ml * 0.10;
    const eoDrops = Math.round(ml * 0.2); // ~1% fragrance load (~6 drops per 30ml)
    const unit = isImperial ? 'fl oz' : 'ml';
    const fmt = (v) => isImperial ? (v / 30).toFixed(2) : String(Math.round(v));

    return {
      main: `${fmt(jojoba)}${unit} Jojoba + ${fmt(argan)}${unit} Argan + ${fmt(castor)}${unit} Castor + ${eoDrops} EO drops`,
      details: `60/30/10 carrier split for ${isImperial ? bottleSizeMl + ' fl oz' : ml + 'ml'} bottle with ~1% essential-oil load (${eoDrops} drops). Shake before use.`,
      rawFormula: `Beard Oil ${isImperial ? bottleSizeMl + 'fl oz' : ml + 'ml'}: 60% jojoba / 30% argan / 10% castor + ${eoDrops} EO drops`
    };
  },

  // 30. Hot Towel Shave Protocol
  calcHotTowelShave: function(beardDensity) {
    const map = {
      light: { steam: '2 min', note: 'Light stubble — shorter steam; one with-grain pass may suffice.' },
      coarse: { steam: '3–4 min', note: 'Coarse / thick beard — full steam cycle; expect second towel before against-grain.' }
    };
    const conf = map[beardDensity] || map.coarse;
    return {
      main: `Steam ${conf.steam} @ ~130°F / 54°C`,
      details: `Protocol: 2 min pre-shave oil → hot towel (${conf.steam}) → first pass with grain → 2 min second towel → against-grain / cross-grain as tolerated. ${conf.note}`,
      rawFormula: `Hot Towel Shave (${beardDensity}): steam ${conf.steam}; oil → towel → with-grain → towel → against-grain`
    };
  },

  // 31. Massage Oil Coverage Cost
  calcMassageOilCost: function(sessionLen, oilBottleCost, currency) {
    sessionLen = String(sessionLen || '60');
    oilBottleCost = Number(oilBottleCost) || 24;
    const curr = currency || '$';
    const mlUsed = sessionLen === '90' ? 40 : 25;
    const costPerMl = oilBottleCost / 1000;
    const cost = costPerMl * mlUsed;

    return {
      main: `${mlUsed}ml used → ${curr}${cost.toFixed(2)} backbar / session`,
      details: `1 L bottle @ ${curr}${oilBottleCost.toFixed(2)} → ${curr}${costPerMl.toFixed(4)}/ml. ${sessionLen}-minute session uses ~${mlUsed}ml (~${(mlUsed/30).toFixed(2)} fl oz).`,
      rawFormula: `Massage Oil Cost: ${mlUsed}ml × (${curr}${oilBottleCost}/1000ml) = ${curr}${cost.toFixed(2)}`
    };
  },

  // 32. Hot Stone Temp & Placement
  calcHotStone: function(stoneType) {
    const map = {
      back: { tempF: '125°F (52°C)', tempC: '49–54°C bath', place: 'Paraspinal & sacral', note: 'Never place directly on spine. Test on therapist inner forearm first.' },
      toes: { tempF: '115°F (46°C)', tempC: 'lower end of bath', place: 'Interdigital toes & palms', note: 'Extremities run cooler — use lower temp stones; watch client feedback.' }
    };
    const conf = map[stoneType] || map.back;
    return {
      main: `${conf.place}: ${conf.tempF}`,
      details: `Heater bath target 120–130°F (49–54°C). Placement temp: ${conf.tempF} (${conf.tempC}). ${conf.note}`,
      rawFormula: `Hot Stone (${stoneType}): ${conf.place} @ ${conf.tempF}`
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SalonMath;
}
if (typeof window !== 'undefined') {
  window.SalonMath = SalonMath;
}

