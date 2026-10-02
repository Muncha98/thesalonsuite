/**
 * Contextual Affiliate / Sponsor Component
 * Targeted recommendation for relevant station gear (e.g. 0.1g digital scale).
 */
export function renderContextualSponsor(tool) {
  const aff = tool.contextual_affiliate;
  if (!aff) return '';

  return `
  <!-- Contextual Station Gear Recommendation -->
  <aside class="contextual-gear-card" aria-label="Recommended Station Gear">
    <div class="gear-card-inner">
      <div class="gear-badge-wrap">
        <span class="gear-badge">${aff.sponsor_badge || 'Recommended Station Tool'}</span>
      </div>
      <h3 class="gear-headline">${aff.headline}</h3>
      <p class="gear-description">${aff.description}</p>
      <a href="${aff.url}" target="_blank" rel="noopener sponsored" class="btn-gear-link" id="link-affiliate-sponsor" data-sponsor="${aff.sponsor_name || 'Affiliate'}">
        ${aff.cta_text || 'View Recommended Gear'} &rarr;
      </a>
      <span class="gear-disclosure">Independent editorial recommendation. May contain affiliate links.</span>
    </div>
  </aside>`;
}
