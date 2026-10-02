/**
 * Educational Content & In-Depth Guide Component
 * Fully data-driven from tool.education in catalog.json. Renders nothing
 * (beyond FAQ, if present) for a tool that hasn't had its education content
 * written yet, rather than falling back to another tool's copy.
 */
export function renderEducationalContent(tool) {
  const edu = tool.education || {};
  const faqs = tool.faq || [];

  const heading = edu.heading || '';
  const intro = Array.isArray(edu.intro) ? edu.intro : [];
  const walkthrough = edu.walkthrough || null;
  const table = edu.reference_table || null;
  const rules = Array.isArray(edu.rules) ? edu.rules : [];

  const hasAnyEducation = heading || intro.length || walkthrough || table || rules.length;

  if (!hasAnyEducation && faqs.length === 0) {
    // Nothing to show yet for this tool. Don't fabricate content.
    return '';
  }

  return `
  <!-- Educational Guide & Formulation Protocol -->
  <article class="educational-guide" aria-labelledby="guide-heading">
    ${heading ? `<h2 id="guide-heading" class="guide-title">${heading}</h2>` : ''}

    ${intro.map(p => `<p class="guide-lead">${p}</p>`).join('\n    ')}

    ${walkthrough ? `
    <!-- Worked Formula Walkthrough Box -->
    <div class="formula-walkthrough-box">
      <h3 class="walkthrough-title">${walkthrough.icon || '📐'} ${walkthrough.title || 'Formula Walkthrough'}</h3>
      ${walkthrough.steps && walkthrough.steps.length ? `
      <ol class="walkthrough-steps">
        ${walkthrough.steps.map(s => `<li>${s}</li>`).join('\n        ')}
      </ol>` : ''}
      ${walkthrough.example ? `
      <div class="walkthrough-example">
        ${walkthrough.example}
      </div>` : ''}
    </div>` : ''}

    ${table ? `
    <!-- Quick Reference Table -->
    ${table.title ? `<h3 class="section-subheading">${table.title}</h3>` : ''}
    <div class="table-responsive">
      <table class="reference-table">
        <thead>
          <tr>
            ${(table.columns || []).map(c => `<th scope="col">${c}</th>`).join('\n            ')}
          </tr>
        </thead>
        <tbody>
          ${(table.rows || []).map(row => `
          <tr>
            ${row.map((cell, i) => i === 0 ? `<td><strong>${cell}</strong></td>` : `<td>${cell}</td>`).join('\n            ')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}

    ${rules.length ? `
    <!-- Critical Rules -->
    <h3 class="section-subheading">${edu.rules_heading || 'Critical Station Rules'}</h3>
    <ul class="station-rules-list">
      ${rules.map((r, i) => `
      <li>
        <strong>${i + 1}. ${r.title}:</strong>
        ${r.body}
      </li>`).join('')}
    </ul>` : ''}

    <!-- FAQ Section -->
    ${faqs.length > 0 ? `
    <section class="faq-section" aria-labelledby="faq-section-title">
      <h3 id="faq-section-title" class="section-subheading">Frequently Asked Questions</h3>
      <div class="faq-list">
        ${faqs.map((faq) => `
          <div class="faq-item">
            <h4 class="faq-question">${faq.question}</h4>
            <p class="faq-answer">${faq.answer}</p>
          </div>
        `).join('')}
      </div>
    </section>` : ''}
  </article>`;
}
