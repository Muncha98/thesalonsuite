/**
 * Reference implementation of OLD calcDeveloperMixing from git commit 1f8c66e
 * Used strictly for automated regression testing against new architecture.
 */
export const OldSalonMath = {
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
  }
};
