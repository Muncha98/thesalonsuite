import { renderHeader } from '../components/header.mjs';
import { renderFooter } from '../components/footer.mjs';
import { renderBreadcrumbs } from '../components/breadcrumbs.mjs';
import { renderSafetyNotice } from '../components/safety-notice.mjs';
import { renderCalculator } from '../components/calculator.mjs';
import { renderResults } from '../components/results.mjs';
import { renderEducationalContent } from '../components/educational-content.mjs';
import { renderResourceCTA } from '../components/resource-cta.mjs';
import { renderContextualSponsor } from '../components/contextual-sponsor.mjs';
import { renderRelatedTools } from '../components/related-tools.mjs';
import { renderSeoSchema } from '../components/seo-schema.mjs';

/**
 * Master Tool Page Template
 * Compiles all modular components into a responsive, SEO-optimized, accessible static page.
 */
export function renderToolPage(tool, catalog = [], options = {}) {
  const seo = tool.seo || {};
  const canonicalUrl = seo.canonical || `https://thesalonsuite.com/tools/${tool.slug || tool.id}/`;
  const title = seo.title || `${tool.name} | The Salon Suite`;
  const description = seo.description || tool.description;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- PWA & Mobile Optimization -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#1A1715">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="SalonSuite">

  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="The Salon Suite">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">

  <!-- Typography & Core CSS -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/main.css">

  ${renderSeoSchema(tool)}
</head>
<body class="tool-page-body">

  ${renderHeader(tool, options)}

  ${renderBreadcrumbs(tool)}

  <!-- Hero Section -->
  <section class="tool-hero" aria-labelledby="tool-hero-title">
    <div class="container">
      <div class="tool-hero-badge">
        <span class="badge-cat">${tool.categoryName || 'Hair Color & Chemistry'}</span>
        <span class="badge-divider">&bull;</span>
        <span class="badge-status">Free Professional Tool</span>
      </div>
      <h1 id="tool-hero-title" class="tool-hero-title">${tool.name}</h1>
      <p class="tool-hero-lead">${tool.intro || tool.description}</p>
      <div class="tool-formula-pill">
        <span class="formula-icon">📐</span>
        <span class="formula-text">${tool.formula_summary || ''}</span>
      </div>
    </div>
  </section>

  <!-- Main Calculator & Content Grid -->
  <main class="container tool-main-content">
    <div class="tool-layout-grid">
      
      <!-- Primary Interactive Station Column -->
      <div class="tool-primary-col">
        ${renderCalculator(tool, options)}
        ${renderResults(tool)}
        ${renderSafetyNotice(tool)}
        ${renderEducationalContent(tool)}
      </div>

      <!-- Contextual Sidebar Column -->
      <aside class="tool-sidebar-col" aria-label="Station Resources & Gear">
        ${renderResourceCTA(tool)}
        ${renderContextualSponsor(tool)}
      </aside>

    </div>

    <!-- Related Tools Section (Bottom of Page) -->
    ${renderRelatedTools(tool, catalog)}
  </main>

  ${renderFooter(tool, options)}

  <!-- Core Scripts -->
  <script src="/js/salonmath.js"></script>
  <script src="/js/preferences.js"></script>
  <script src="/js/analytics.js"></script>
  <script src="/js/tools/${tool.slug || tool.id}.js"></script>
</body>
</html>`;
}
