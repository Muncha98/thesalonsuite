/**
 * Calculation Results Component
 * Displays computed formula, ratio breakdown, station copy action, and printable sheet trigger.
 */
export function renderResults(tool) {
  return `
    <!-- Output Results Display Box -->
    <div class="results-box" id="calc-results-box" aria-live="polite" aria-atomic="true">
      <div class="results-box-header">
        <div class="results-heading">
          <span class="results-badge">Formula Output</span>
          <span class="results-verified-tick">✓ Mathematically Verified</span>
        </div>
        <div class="results-actions">
          <button type="button" id="btn-copy-formula" class="btn-action btn-copy" aria-label="Copy recipe to clipboard">
            📋 Copy Recipe
          </button>
          <button type="button" id="btn-print-formula" class="btn-action btn-print" aria-label="Print station recipe sheet">
            🖨️ Print Sheet
          </button>
        </div>
      </div>

      <div class="results-main-display" id="res-main">Ready</div>
      <div class="results-sub-details" id="res-details">Enter values above to calculate.</div>

      <!-- Station Feedback Toast -->
      <div id="copy-toast" class="copy-toast" style="display:none;" role="status">✓ Recipe copied to clipboard!</div>
      <div id="calc-error-banner" class="calc-error-banner" style="display:none;" role="alert"></div>
    </div>
  </div>`;
}
