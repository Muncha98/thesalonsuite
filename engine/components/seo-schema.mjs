/**
 * SEO & Schema.org JSON-LD Generator Component
 * Generates verified structured data for WebApplication, FAQPage, BreadcrumbList, and Organization.
 */
export function renderSeoSchema(tool) {
  const faqs = tool.faq || [];
  const canonicalUrl = tool.seo?.canonical || `https://thesalonsuite.com/tools/${tool.slug || tool.id}/`;

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.name,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "description": tool.description,
    "url": canonicalUrl,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": tool.seo?.feature_list || [
      tool.formula_summary || `${tool.name} formula calculation`,
      "Metric and Imperial unit support",
      "Real-time station calculation",
      "1-click printable station formula sheet"
    ]
  };

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://thesalonsuite.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": tool.categoryName || "Tools",
        "item": `https://thesalonsuite.com/#${tool.category}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.name,
        "item": canonicalUrl
      }
    ]
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Salon Suite",
    "url": "https://thesalonsuite.com/",
    "logo": "https://thesalonsuite.com/assets/logo.png",
    "description": "Global professional utility platform and verified station calculators for working beauty professionals."
  };

  return `
  <!-- Schema.org JSON-LD Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(webAppSchema, null, 2)}
  </script>
  ${faqSchema ? `
  <script type="application/ld+json">
  ${JSON.stringify(faqSchema, null, 2)}
  </script>` : ''}
  <script type="application/ld+json">
  ${JSON.stringify(breadcrumbSchema, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(orgSchema, null, 2)}
  </script>`;
}
