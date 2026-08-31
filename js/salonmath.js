/**
 * TheSalonSuite.com — Core Calculation & Formula Engine
 * Precision formulas for hair chemistry, lash physics, salon business & spa
 * Full support for Metric (g/ml/£) and Imperial (oz/fl oz/$)
 */

const SalonMath = {
  currentUnit: 'metric', // 'metric' | 'imperial'
  currentCurrency: '$',  // '$' | '£'

  setUnit: function(unit) {
    this.currentUnit = unit;
    this.currentCurrency = (unit === 'metric') ? '£' : '$';
  },

  // 1. Developer Volume Mixing
  calcDeveloperMixing: function(d1, d2, target, totalAmount, isImperial) {
    d1 = Number(d1);
    d2 = Number(d2);
    target = Number(target);
    totalAmount = Number(totalAmount) || (isImperial ? 2.0 : 60);

    const unitLabel = isImperial ? 'fl oz' : 'ml';

    if (target <= d1) {
      return {
        main: `100% ${d1} Vol`,
        details: `Use ${totalAmount}${unitLabel} of ${d1} Volume developer alone (no mixing required).`,
        rawFormula: `${totalAmount}${unitLabel} of ${d1} Vol Developer`
      };
    }
    if (target >= d2) {
      return {
        main: `100% ${d2} Vol`,
        details: `Use ${totalAmount}${unitLabel} of ${d2} Volume developer alone (no mixing required).`,
        rawFormula: `${totalAmount}${unitLabel} of ${d2} Vol Developer`
      };
    }

    const partsLow = d2 - target;
    const partsHigh = target - d1;
    const totalParts = partsLow + partsHigh;

    let amountLow, amountHigh;
    if (isImperial) {
      amountLow = ((partsLow / totalParts) * totalAmount).toFixed(1);
      amountHigh = (totalAmount - amountLow).toFixed(1);
    } else {
      amountLow = Math.round((partsLow / totalParts) * totalAmount);
      amountHigh = totalAmount - amountLow;
    }

    return {
      main: `${amountLow}${unitLabel} ${d1} Vol + ${amountHigh}${unitLabel} ${d2} Vol`,
      details: `Mixing ${amountLow}${unitLabel} of ${d1} Vol and ${amountHigh}${unitLabel} of ${d2} Vol produces exactly ${totalAmount}${unitLabel} of ${target} Vol developer.`,
      rawFormula: `Formula: ${amountLow}${unitLabel} ${d1} Vol + ${amountHigh}${unitLabel} ${d2} Vol = ${totalAmount}${unitLabel} ${target} Vol Developer`
    };
  },

  // 2. Bleach to Developer Ratio
  calcBleachRatio: function(powderAmount, ratioStr, isImperial) {
    const unitLabel = isImperial ? 'oz' : 'g';
    powderAmount = Number(powderAmount) || (isImperial ? 1.0 : 30);
    
    let multiplier = 2;
    if (ratioStr === '1:1') multiplier = 1;
    else if (ratioStr === '1:1.5') multiplier = 1.5;
    else if (ratioStr === '1:2') multiplier = 2;
    else if (ratioStr === '1:3') multiplier = 3;

    let devAmount, totalWeight;
    if (isImperial) {
      devAmount = (powderAmount * multiplier).toFixed(1);
      totalWeight = (Number(powderAmount) + Number(devAmount)).toFixed(1);
    } else {
      devAmount = Math.round(powderAmount * multiplier);
      totalWeight = powderAmount + devAmount;
    }

    return {
      main: `${devAmount}${unitLabel} Developer (${powderAmount}${unitLabel} Powder)`,
      details: `Total bowl weight: ${totalWeight}${unitLabel}. For a ${ratioStr} ratio, tare your digital scale and pour developer until scale reaches ${totalWeight}${unitLabel}.`,
      rawFormula: `Bleach Formula (${ratioStr}): ${powderAmount}${unitLabel} Powder + ${devAmount}${unitLabel} Developer = ${totalWeight}${unitLabel} Total`
    };
  },

  // 3. Hair Level & Undertone Chart
  calcHairLevel: function(level) {
    level = Number(level);
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

    const info = data[level] || data[8];
    return {
      main: `Exposed: ${info.undertone} ➔ Neutralize with: ${info.neutralizer}`,
      details: `Target Neutralizing Pigment: ${info.toneExample}. Use with 5–10 Vol developer on damp, towel-dried hair for 10–20 minutes.`,
      rawFormula: `Level ${level} Exposed Pigment: ${info.undertone} | Neutralizer: ${info.neutralizer} (${info.toneExample})`
    };
  },

  // 4. Grey Coverage Formulation
  calcGreyCoverage: function(greyPct, totalAmount, isImperial) {
    greyPct = Number(greyPct);
    const unitLabel = isImperial ? 'oz' : 'g';
    totalAmount = Number(totalAmount) || (isImperial ? 2.0 : 60);

    let basePct = 0;
    if (greyPct <= 25) basePct = 0.25;
    else if (greyPct <= 50) basePct = 0.50;
    else if (greyPct <= 75) basePct = 0.66;
    else basePct = 0.75;

    let baseAmount, fashionAmount;
    if (isImperial) {
      baseAmount = (totalAmount * basePct).toFixed(1);
      fashionAmount = (totalAmount - baseAmount).toFixed(1);
    } else {
      baseAmount = Math.round(totalAmount * basePct);
      fashionAmount = totalAmount - baseAmount;
    }

    return {
      main: `${baseAmount}${unitLabel} Base (N) + ${fashionAmount}${unitLabel} Fashion Shade`,
      details: `For ${greyPct}% grey hair, use 20 Volume (6%) developer at 1:1 or 1:1.5 ratio. Process for a full 45 minutes for resistant cuticles.`,
      rawFormula: `Grey Formula (${greyPct}% grey): ${baseAmount}${unitLabel} Natural Base (N) + ${fashionAmount}${unitLabel} Fashion Target Shade`
    };
  },

  // 5. Balayage Pricing & Cost
  calcBalayagePricing: function(bleachBowls, costPerBowl, tonerBowls, bondBuilder, hours, hourlyRate, currency) {
    bleachBowls = Number(bleachBowls) || 3;
    costPerBowl = Number(costPerBowl) || 8.5;
    tonerBowls = Number(tonerBowls) || 2;
    hours = Number(hours) || 3.5;
    hourlyRate = Number(hourlyRate) || 65;
    const curr = currency || '$';

    const productCost = (bleachBowls * costPerBowl) + (tonerBowls * 7.5) + (bondBuilder === 'yes' ? 12 : 0);
    const laborCost = hours * hourlyRate;
    const recommendedPrice = Math.round(productCost + laborCost);

    return {
      main: `Recommended Quote: ${curr}${recommendedPrice}`,
      details: `Product Backbar Cost: ${curr}${productCost.toFixed(2)} | Labor (${hours}h @ ${curr}${hourlyRate}/h): ${curr}${laborCost.toFixed(2)}. Profit Margin: ~${Math.round((laborCost/recommendedPrice)*100)}%.`,
      rawFormula: `Balayage Quote: ${curr}${recommendedPrice} (${hours}h service + ${curr}${productCost.toFixed(2)} backbar stock)`
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
  }
};
