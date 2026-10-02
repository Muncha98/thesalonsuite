/**
 * Free Resource / Lead Magnet CTA Component
 * Contextual station cheatsheet download callout for high-intent visitors.
 */
export function renderResourceCTA(tool) {
  const resource = tool.free_resource;
  if (!resource) return '';

  return `
  <!-- Free Resource Download Box -->
  <aside class="resource-cta-box" aria-labelledby="resource-cta-title">
    <div class="resource-cta-content">
      <span class="resource-badge">${resource.badge || 'Free Station Download'}</span>
      <h3 id="resource-cta-title" class="resource-title">${resource.title}</h3>
      <p class="resource-desc">${resource.description}</p>
    </div>
    <div class="resource-cta-action">
      <a href="#resource-modal" class="btn-resource-download" id="cta-download-resource" data-resource="${resource.slug || 'station-card'}">
        📥 ${resource.cta_text || 'Download Free PDF'}
      </a>
      <span class="resource-subtext">Instant Access &bull; 100% Free For Stylists</span>
    </div>
  </aside>`;
}
