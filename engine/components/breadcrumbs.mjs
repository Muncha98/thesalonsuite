/**
 * Breadcrumbs Component
 * Accessible semantic navigation trail with microdata.
 */
export function renderBreadcrumbs(tool) {
  const categorySlugMap = {
    'hair-color': '#hair-color',
    'lashes-brows': '#lashes-brows',
    'nails': '#nails',
    'barbering': '#barbering',
    'spa-massage': '#spa-massage',
    'business-rental': '#business-rental'
  };

  const catHref = categorySlugMap[tool.category] || '#directory';

  return `
  <!-- Semantic Breadcrumbs -->
  <nav class="breadcrumb-nav" aria-label="Breadcrumbs">
    <div class="container">
      <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a href="/" itemprop="item"><span itemprop="name">Home</span></a>
          <meta itemprop="position" content="1" />
        </li>
        <li class="breadcrumb-separator" aria-hidden="true">&rsaquo;</li>
        <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
          <a href="/${catHref}" itemprop="item"><span itemprop="name">${tool.categoryName || 'Tools'}</span></a>
          <meta itemprop="position" content="2" />
        </li>
        <li class="breadcrumb-separator" aria-hidden="true">&rsaquo;</li>
        <li class="breadcrumb-item current" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" aria-current="page">
          <span itemprop="name">${tool.name}</span>
          <meta itemprop="position" content="3" />
        </li>
      </ol>
    </div>
  </nav>`;
}
