/**
 * Related Tools Component
 * Contextual cross-linking to related calculators to support topical cluster authority.
 */
export function renderRelatedTools(tool, catalog = []) {
  const relatedIds = tool.related_tools || [];
  if (relatedIds.length === 0) return '';

  const relatedTools = catalog.filter(t => relatedIds.includes(t.id));
  if (relatedTools.length === 0) return '';

  return `
  <!-- Related Station Tools Cluster -->
  <section class="related-tools-section" aria-labelledby="related-tools-heading">
    <div class="section-title-wrap">
      <span class="section-kicker">Cross-Service Formulas</span>
      <h3 id="related-tools-heading" class="section-title">Related Color &amp; Station Calculators</h3>
    </div>
    <div class="related-tools-grid">
      ${relatedTools.map(rt => `
        <a href="/tools/${rt.id}/" class="related-tool-card" data-tool-id="${rt.id}">
          <div class="card-icon-badge">
            <span class="tool-icon">${rt.icon || '🎨'}</span>
            <span class="tool-badge">${rt.badge || 'Tool'}</span>
          </div>
          <h4 class="tool-name">${rt.name}</h4>
          <p class="tool-desc">${rt.description}</p>
          <span class="card-link-cta">Open Calculator &rarr;</span>
        </a>
      `).join('')}
    </div>
  </section>`;
}
