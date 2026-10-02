/**
 * Footer Component
 * Brand information, directory navigation, professional disclaimer, and review attribution.
 */
export function renderFooter(tool, options = {}) {
  return `
  <!-- Site Footer -->
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      
      <!-- Professional Review & Disclaimer Banner -->
      <div class="footer-safety-notice">
        <div class="footer-safety-icon">⚠️</div>
        <div class="footer-safety-text">
          <strong>Professional Technical Notice:</strong> Calculations and mixing ratios on TheSalonSuite.com are designed as mathematical guidance for licensed cosmetology and beauty professionals. Manufacturer chemical formulations, buffering agents, and processing requirements vary across brands. Always perform mandatory 48-hour client allergy patch tests and follow manufacturer directions.
          <span class="footer-review-tag">Technically Reviewed by Tracey Thompson, Professional Education & Technical Reviewer.</span>
          <a href="/legal/disclaimer.html" class="footer-legal-link">Read Full Disclaimer &rarr;</a>
        </div>
      </div>

      <div class="footer-grid">
        <div class="footer-brand">
          <h4>TheSalon<span>Suite</span>.com</h4>
          <p class="footer-tagline">Professional tools for the people behind the chair.</p>
          <p class="footer-sub">Calculate. Learn. Create. Grow.</p>
        </div>

        <div class="footer-col">
          <h5>Hair Color & Chemistry</h5>
          <ul>
            <li><a href="/tools/developer-mixing-calculator/">Developer Mixing</a></li>
            <li><a href="/tools/bleach-developer-ratio-calculator/">Bleach Ratios</a></li>
            <li><a href="/tools/toner-ratio-calculator/">Toner & Glossing</a></li>
            <li><a href="/tools/grey-coverage-formula-calculator/">Grey Coverage</a></li>
            <li><a href="/tools/hair-level-undertone-chart/">Undertone Chart</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h5>Salon Business & Pricing</h5>
          <ul>
            <li><a href="/tools/chair-rental-profitability-calculator/">Booth Rent vs Commission</a></li>
            <li><a href="/tools/hairdresser-hourly-rate-calculator/">True Hourly Rate</a></li>
            <li><a href="/tools/salon-suite-startup-budget-calculator/">Suite Startup Costs</a></li>
            <li><a href="/tools/retail-product-markup-calculator/">Retail Product Markup</a></li>
            <li><a href="/tools/self-employed-beauty-tax-calculator/">Self-Employed Taxes</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h5>About & Standards</h5>
          <ul>
            <li><a href="/legal/disclaimer.html">Technical Review Policy</a></li>
            <li><a href="/legal/privacy.html">Privacy Policy</a></li>
            <li><a href="/legal/terms.html">Terms of Service</a></li>
            <li><a href="/legal/cookies.html">Cookie Policy</a></li>
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <span>&copy; 2026 TheSalonSuite.com &bull; Global Professional Utility Platform</span>
        <span>100% Free Tools For Working Stylists</span>
      </div>
    </div>
  </footer>`;
}
