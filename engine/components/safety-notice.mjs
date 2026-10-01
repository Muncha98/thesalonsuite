/**
 * Safety Notice Component
 * Displays structured risk level, professional scope, manufacturer dependence,
 * and reviewer status — strictly from catalog data. Never defaults a reviewer
 * name or review date: a tool with no safety.reviewed_by/last_reviewed simply
 * doesn't show a review line, rather than falsely claiming Tracey (or anyone)
 * reviewed it.
 */
export function renderSafetyNotice(tool) {
  const safety = tool.safety || {};
  const riskLevel = safety.risk_level || 'Standard';
  const scope = safety.professional_scope || 'Licensed Beauty Professionals';
  const warnings = safety.warnings || [];
  const reviewedBy = safety.reviewed_by || null;
  const lastReviewed = safety.last_reviewed || null;
  const mfgNote = safety.manufacturer_note || null;
  const noticeTitle = safety.notice_title || 'Professional Safety Notice';

  const riskClass = riskLevel.toLowerCase();
  const hasReview = Boolean(reviewedBy && lastReviewed);

  return `
  <!-- Professional Safety & Regulatory Notice -->
  <aside class="safety-notice-card" aria-labelledby="safety-notice-title">
    <div class="safety-header">
      <div class="safety-header-left">
        <span class="safety-badge risk-${riskClass}" aria-label="Risk rating: ${riskLevel}">
          🛡️ Risk Rating: ${riskLevel}
        </span>
        <span class="safety-scope">Scope: ${scope}</span>
      </div>
      ${hasReview ? `
      <div class="safety-review-meta">
        <span class="reviewer-name">Reviewed by: <strong>${reviewedBy}</strong></span>
        <span class="review-date">Updated: <time datetime="${lastReviewed}">${lastReviewed}</time></span>
      </div>` : ''}
    </div>

    <div class="safety-body">
      <h3 id="safety-notice-title" class="safety-title">${noticeTitle}</h3>
      ${warnings.length ? `
      <ul class="safety-warning-list">
        ${warnings.map(w => `<li><strong>Caution:</strong> ${w}</li>`).join('\n        ')}
      </ul>` : ''}
      ${mfgNote ? `
      <div class="safety-manufacturer-callout">
        <strong>⚠️ Manufacturer Specification Rule:</strong> ${mfgNote} Mathematical calculations provide proportions, but manufacturer guidelines must always take precedence.
      </div>` : ''}
    </div>
  </aside>`;
}
