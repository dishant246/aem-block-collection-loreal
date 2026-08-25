/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: L'Oréal site-wide cleanup.
 * Removes non-authorable global chrome so the import contains only page-level
 * authorable content (hero carousel, search box, story cards) inside #content.
 * All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent banner + preference center (verified: <div id="onetrust-consent-sdk">, line 1101).
    // Removed before parsing so it can't interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (verified against cleaned.html):
    //  - #main-container > ul       : utility / skip-to links (line 26)
    //  - header.header              : site header + mega-menu nav (line 39)
    //  - div.footer.container       : site footer wrapper (line 1019)
    //  - #main > div.container--large : empty trailing structural container (line 1017)
    //  - body > div:first-of-type   : empty leading structural container (line 2)
    //  - iframe / link / meta / noscript : non-authorable / safe leftovers
    WebImporter.DOMUtils.remove(element, [
      '#main-container > ul',
      'header.header',
      'div.footer.container',
      '#main > div.container--large',
      'body > div:first-of-type',
      'iframe',
      'link',
      'meta',
      'noscript',
    ]);
  }
}
