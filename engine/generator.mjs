import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderToolPage } from './templates/tool-page.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const catalogPath = path.join(ROOT_DIR, 'js', 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

export function buildTool(toolId, options = {}) {
  const tool = catalog.find(t => t.id === toolId || t.slug === toolId);
  if (!tool) {
    throw new Error(`Tool not found in catalog.json: ${toolId}`);
  }

  const html = renderToolPage(tool, catalog, options);
  const outDir = path.join(ROOT_DIR, 'tools', tool.slug || tool.id);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFilePath = path.join(outDir, 'index.html');
  fs.writeFileSync(outFilePath, html, 'utf8');

  console.log(`[Engine] Successfully built ${tool.id} -> ${outFilePath} (${html.length} bytes)`);
  return { tool, outFilePath, size: html.length };
}

// CLI usage: node engine/generator.mjs [tool-id]
const targetId = process.argv[2] || 'developer-mixing-calculator';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`[Engine] Running generator for target: ${targetId}`);
  buildTool(targetId);
}
