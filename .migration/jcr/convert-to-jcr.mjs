/* eslint-disable */
// Convert content/en.plain.html -> JCR XML using the project's component models.
// Usage: node convert-to-jcr.mjs <plainHtmlPath> <url> <outXmlPath> <projectRoot>
//
// The .plain.html is the DA/EDS runtime block format (div-based). The importer's
// md2jcr pipeline expects the WebImporter block-TABLE format, so we rebuild each
// top-level block <div class="name"> into a <table> whose header cell is the block's
// display name. Non-block sections/default content are passed through unchanged.
import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { md2jcr } from '@adobe/helix-importer';

const [, , plainHtmlPath, pageUrl, outXmlPath, projectRoot] = process.argv;

const models = JSON.parse(readFileSync(`${projectRoot}/component-models.json`, 'utf-8'));
const definition = JSON.parse(readFileSync(`${projectRoot}/component-definition.json`, 'utf-8'));
const filters = JSON.parse(readFileSync(`${projectRoot}/component-filters.json`, 'utf-8'));

// Map a block div's class name to the display name declared in component-definition.json.
// The definition template name is the source of truth (e.g. "carousel-hero" -> "Carousel Hero").
function collectDefNames(def) {
  const map = {};
  (function walk(group) {
    (group.components || []).forEach((c) => {
      const tmpl = c?.plugins?.xwalk?.page?.template;
      if (c.id && tmpl?.name) map[c.id] = tmpl.name;
    });
    (group.groups || []).forEach(walk);
  })(def);
  return map;
}
const defNames = collectDefNames(definition);

function blockDisplayName(classList) {
  for (const cls of classList) {
    if (defNames[cls]) return defNames[cls];
  }
  // fallback: Title Case the first class
  const cls = classList[0] || 'block';
  return cls.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const inner = readFileSync(plainHtmlPath, 'utf-8');
const html = `<!DOCTYPE html><html><head><title></title></head><body><main>${inner}</main></body></html>`;

const createDocumentFromString = (str) => new JSDOM(str).window.document;

// Build a WebImporter table from a set of row divs.
function buildTable(document, headerName, rowDivs, skipFirst) {
  const dataRows = skipFirst ? rowDivs.slice(1) : rowDivs;
  const table = document.createElement('table');

  let maxCols = 1;
  dataRows.forEach((r) => {
    const cells = [...r.children].filter((c) => c.tagName === 'DIV');
    maxCols = Math.max(maxCols, cells.length || 1);
  });

  const headerTr = document.createElement('tr');
  const th = document.createElement('th');
  if (maxCols > 1) th.setAttribute('colspan', String(maxCols));
  th.textContent = headerName;
  headerTr.appendChild(th);
  table.appendChild(headerTr);

  dataRows.forEach((r) => {
    const tr = document.createElement('tr');
    const cells = [...r.children].filter((c) => c.tagName === 'DIV');
    if (cells.length === 0) {
      const td = document.createElement('td');
      if (maxCols > 1) td.setAttribute('colspan', String(maxCols));
      while (r.firstChild) td.appendChild(r.firstChild);
      tr.appendChild(td);
    } else {
      cells.forEach((cell) => {
        const td = document.createElement('td');
        while (cell.firstChild) td.appendChild(cell.firstChild);
        tr.appendChild(td);
      });
    }
    table.appendChild(tr);
  });
  return table;
}

// Rebuild div-blocks into WebImporter tables.
function transformDOM({ document }) {
  const main = document.body.querySelector('main') || document.body;

  // Metadata block: <div class="metadata"> with no name-marker row. md2jcr promotes a
  // block literally named "Metadata" into cq:Page properties (jcr:title, etc.).
  main.querySelectorAll('div.metadata').forEach((mdDiv) => {
    const rowDivs = [...mdDiv.children].filter((c) => c.tagName === 'DIV');
    const table = buildTable(document, 'Metadata', rowDivs, false);
    mdDiv.replaceWith(table);
  });

  // A block is a direct child div of a section wrapper that carries a known block class.
  const blockDivs = [...main.querySelectorAll('div[class]')].filter((el) => {
    const classes = [...el.classList];
    return classes.some((c) => defNames[c]);
    });

  blockDivs.forEach((blockDiv) => {
    const name = blockDisplayName([...blockDiv.classList]);
    // The block's rows are its child divs. The first child div is the runtime block-name
    // marker (contains literal class text) — drop it; the header comes from the class.
    const rowDivs = [...blockDiv.children].filter((c) => c.tagName === 'DIV');
    const table = buildTable(document, name, rowDivs, true);
    blockDiv.replaceWith(table);
  });

  return main;
}

const transformCfg = {
  transformDOM,
  generateDocumentPath: () => new URL(pageUrl).pathname.replace(/\/$/, '') || '/index',
};

const config = { createDocumentFromString };
const params = { components: { models, definition, filters } };

const res = await md2jcr(pageUrl, html, transformCfg, config, params);
const out = Array.isArray(res) ? res[0] : res;
if (!out || !out.jcr) {
  console.error('No JCR produced. Keys:', Object.keys(out || {}));
  if (out && out.md) console.error('--- MD ---\n' + out.md.slice(0, 2000));
  process.exit(1);
}
writeFileSync(outXmlPath, out.jcr, 'utf-8');
if (out.md) writeFileSync(outXmlPath.replace(/\.xml$/, '.md'), out.md, 'utf-8');
console.log('WROTE', outXmlPath, out.jcr.length, 'bytes');
