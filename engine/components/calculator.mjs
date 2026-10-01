/**
 * Calculator Input Form Component
 * Dynamically generated from tool inputs declared in catalog.json.
 */
export function renderCalculator(tool, options = {}) {
  const inputs = tool.inputs || [];
  const unit = options.unit || 'metric';
  const isImp = (unit === 'imperial');

  let formHtml = `
  <!-- Calculator Interactive Form Card -->
  <div class="calculator-card" id="calc-card">
    <div class="calc-card-header">
      <div class="calc-title-wrap">
        <span class="calc-icon">${tool.icon || '🧪'}</span>
        <div>
          <h2 class="calc-title">${tool.calc_title || 'Station Calculator &amp; Formulator'}</h2>
          <p class="calc-subtitle">${tool.calc_subtitle || 'Enter your values below for an instant, real-time result.'}</p>
        </div>
      </div>
      <div class="calc-station-badge">📱 Station Ready</div>
    </div>

    <!-- Active Input Fields -->
    <form id="tool-calc-form" class="calc-form" onsubmit="return false;" novalidate>
      <div class="form-grid">`;

  inputs.forEach(inp => {
    let defVal = isImp && inp.defaultImperial !== undefined ? inp.defaultImperial : inp.default;
    let unitLabel = isImp && inp.unitImperial ? inp.unitImperial : (inp.unitMetric || inp.unit || '');
    let label = inp.label;
    const type = inp.type || 'number';

    let fieldHtml;
    if (type === 'select') {
      fieldHtml = `
            <select class="form-control" id="inp-${inp.id}" name="${inp.id}" aria-describedby="err-${inp.id}">
              ${(inp.options || []).map(opt => `<option value="${opt.val}" ${String(opt.val) === String(defVal) ? 'selected' : ''}>${opt.text}</option>`).join('\n              ')}
            </select>`;
    } else if (type === 'range') {
      fieldHtml = `
            <div class="range-wrap">
              <input
                type="range"
                class="range-slider"
                id="inp-${inp.id}"
                name="${inp.id}"
                value="${defVal}"
                ${inp.min !== undefined ? `min="${inp.min}"` : ''}
                ${inp.max !== undefined ? `max="${inp.max}"` : ''}
                ${inp.step !== undefined ? `step="${inp.step}"` : 'step="1"'}
                aria-describedby="err-${inp.id}"
              >
              <span class="range-val" id="range-val-${inp.id}">${defVal}${unitLabel ? ' ' + unitLabel : ''}</span>
            </div>`;
    } else {
      fieldHtml = `
            <div class="input-wrap">
              <input
                type="${type}"
                class="form-control"
                id="inp-${inp.id}"
                name="${inp.id}"
                value="${defVal}"
                ${inp.min !== undefined ? `min="${inp.min}"` : ''}
                ${inp.max !== undefined ? `max="${inp.max}"` : ''}
                ${inp.step !== undefined ? `step="${inp.step}"` : 'step="any"'}
                inputmode="decimal"
                aria-describedby="err-${inp.id}"
                required
              >
            </div>`;
    }

    formHtml += `
        <div class="form-group" id="grp-${inp.id}">
          <label for="inp-${inp.id}" class="form-label">
            ${label}
            ${unitLabel && type !== 'range' ? `<span class="unit-tag" id="unit-tag-${inp.id}">${unitLabel}</span>` : ''}
          </label>${fieldHtml}
          <span class="field-error" id="err-${inp.id}" role="alert" aria-live="polite"></span>
        </div>`;
  });

  formHtml += `
      </div>
    </form>`;

  return formHtml;
}
