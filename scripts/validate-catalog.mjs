/**
 * validate-catalog.mjs — Catalog integrity checker.
 *
 * Run with: node scripts/validate-catalog.mjs
 *
 * This replaces the old update-catalog.mjs, which was a hardcoded,
 * single-tool script that silently overwrote catalog.json on every run.
 * This script never writes anything — it only reads catalog.json and
 * reports problems, so it's safe to run at any time, including in CI.
 *
 * It exists to catch exactly the class of bug found in the Phase 1
 * QA pass: a category value used in catalog.json that doesn't match
 * any key the breadcrumb/taxonomy components know about, a related_tools
 * reference to a tool id that doesn't exist, etc.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const catalogPath = path.join(ROOT_DIR, 'js', 'catalog.json');

// Keep this in sync with engine/components/breadcrumbs.mjs's categorySlugMap
// and js/directory.js's CATEGORIES_ORDER. Validating against the same list
// here is what would have caught the business-rental/salon-business bug.
const KNOWN_CATEGORIES = [
  'hair-color',
  'lashes-brows',
  'nails',
  'barbering',
  'spa-massage',
  'business-rental'
];

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const idsSeen = new Set(catalog.map(t => t.id));
let errors = 0;
let warnings = 0;

function err(toolId, msg) {
  console.error(`  ERROR [${toolId}]: ${msg}`);
  errors++;
}
function warn(toolId, msg) {
  console.warn(`  WARN  [${toolId}]: ${msg}`);
  warnings++;
}

console.log(`Validating ${catalog.length} catalog entries...\n`);

for (const tool of catalog) {
  const id = tool.id || '(missing id)';

  if (!tool.id) err(id, 'missing "id"');
  if (!tool.slug) warn(id, 'missing "slug" — will fall back to id for URLs and script paths');
  if (!tool.name) err(id, 'missing "name"');
  if (!tool.category) {
    err(id, 'missing "category"');
  } else if (!KNOWN_CATEGORIES.includes(tool.category)) {
    err(id, `category "${tool.category}" is not in KNOWN_CATEGORIES (${KNOWN_CATEGORIES.join(', ')}) — breadcrumb link will silently fall back to #directory`);
  }
  if (!Array.isArray(tool.inputs) || tool.inputs.length === 0) {
    warn(id, 'no "inputs" declared');
  }

  if (Array.isArray(tool.related_tools)) {
    for (const relId of tool.related_tools) {
      if (!idsSeen.has(relId)) {
        err(id, `related_tools references "${relId}", which does not exist in catalog.json`);
      }
    }
  }

  if (tool.calculation_function && !tool.slug) {
    warn(id, 'has calculation_function but no slug — controller script path convention is /js/tools/<slug>.js');
  }

  if (tool.safety && tool.safety.reviewed_by && !tool.safety.last_reviewed) {
    warn(id, 'safety.reviewed_by is set without safety.last_reviewed');
  }

  // Catch exactly the "this tool only has stub fields" situation so it's
  // visible before generating, not discovered after.
  const richFields = ['faq', 'safety', 'seo', 'education', 'related_tools'];
  const missingRich = richFields.filter(f => !tool[f]);
  if (missingRich.length === richFields.length) {
    warn(id, `stub entry — has none of: ${richFields.join(', ')}. Not ready to generate a full page yet.`);
  }
}

console.log(`\n${errors} error(s), ${warnings} warning(s).`);
if (errors > 0) {
  process.exitCode = 1;
}
