/**
 * Header Component
 * Includes brand logo, navigation links, and independent preference controls for Region, Units, and Currency.
 */
export function renderHeader(tool, options = {}) {
  const currentUnit = options.unit || 'metric';
  const currentRegion = options.region || 'US';

  return `
  <!-- Navigation Header -->
  <header class="site-header" role="banner">
    <nav class="nav" aria-label="Main navigation">
      <div class="container nav-inner">
        <a href="/" class="nav-logo" aria-label="The Salon Suite Home">
          <div class="nav-logo-icon">✨</div>
          TheSalon<span>Suite</span>
        </a>

        <!-- Reusable Preference Controls (Independent Region, Unit, Currency) -->
        <div class="nav-controls">
          <div class="preference-bar" id="preference-bar" aria-label="Station Regional and Measurement Preferences">
            
            <!-- Region Selector -->
            <div class="pref-group" title="Select Operating Region">
              <span class="pref-label">Region:</span>
              <button type="button" class="pref-btn ${currentRegion === 'US' ? 'active' : ''}" data-pref="region" data-val="US" aria-label="United States Edition, prices in US dollars">🇺🇸 US ($)</button>
              <button type="button" class="pref-btn ${currentRegion === 'UK' ? 'active' : ''}" data-pref="region" data-val="UK" aria-label="United Kingdom Edition, prices in pounds sterling">🇬🇧 UK (£)</button>
            </div>

            <!-- Unit Selector -->
            <div class="pref-group" title="Select Measurement Units">
              <span class="pref-label">Units:</span>
              <button type="button" class="pref-btn ${currentUnit === 'metric' ? 'active' : ''}" data-pref="unit" data-val="metric" aria-label="Metric Units (g, ml)">Metric</button>
              <button type="button" class="pref-btn ${currentUnit === 'imperial' ? 'active' : ''}" data-pref="unit" data-val="imperial" aria-label="Imperial Units (oz, fl oz)">Imperial</button>
            </div>

          </div>

          <a href="/" class="nav-back-link" title="Return to directory">&larr; All Calculators</a>
        </div>
      </div>
    </nav>
  </header>`;
}
