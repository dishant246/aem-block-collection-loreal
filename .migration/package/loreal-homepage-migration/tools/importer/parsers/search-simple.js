/* eslint-disable */
/* global WebImporter */
/**
 * Parser for search-simple
 * Base block: search
 * Source: https://www.loreal.com/en (#search-box-form)
 * Generated: 2026-08-25
 *
 * Simple block. Model field `index` (text) → one content row holding the
 * absolute URL to the query index the search reads (block.js resolves the
 * source from an anchor's href). `classes` field is skipped per hinting rules.
 *
 * Per the Search library convention the block table holds ONLY the query-index
 * URL. The source UI text (label "Find out more about L'Oréal", the Search
 * button, and the "Enter 3 or more characters" error) has no model field and is
 * rendered by the block itself at runtime — intentionally not authored content.
 * Output matches the Search library convention exactly — index URL only.
 */
export default function parse(element, { document }) {
  // Source has no explicit index URL; the search block defaults to the site
  // query index. Emit an anchor to query-index.json so block.js can resolve it.
  const indexUrl = 'https://www.loreal.com/en/query-index.json';

  const link = document.createElement('a');
  link.href = indexUrl;
  link.textContent = indexUrl;

  const indexCell = document.createDocumentFragment();
  indexCell.appendChild(document.createComment(' field:index '));
  indexCell.appendChild(link);

  const cells = [
    ['search-simple'],
    [indexCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'search-simple', cells });
  element.replaceWith(block);
}
