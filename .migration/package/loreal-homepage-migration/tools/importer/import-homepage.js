/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import searchSimpleParser from './parsers/search-simple.js';
import cardsStoryParser from './parsers/cards-story.js';

// TRANSFORMER IMPORTS
import lorealCleanupTransformer from './transformers/loreal-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'search-simple': searchSimpleParser,
  'cards-story': cardsStoryParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  lorealCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: "L'Oréal Groupe corporate homepage with hero carousel, search box, and story cards",
  urls: [
    'https://www.loreal.com/en',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: [
        '#content > div.container.container--is-maxwidth > div.hero-carousel',
        'div.hero-carousel',
      ],
    },
    {
      name: 'search-simple',
      instances: [
        '#search-box-form',
      ],
    },
    {
      name: 'cards-story',
      instances: [
        '#content > div.container.container--is-maxwidth > div.container--large div.scroll-slider',
        'div.scroll-slider.scroll-slider--advanced',
      ],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates elements matched by multiple selectors.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
