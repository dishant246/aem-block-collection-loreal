# L'Oréal Homepage Migration Package

Migration output for **https://www.loreal.com/en** → AEM Edge Delivery Services (xwalk project).

## Contents

### `content/`
- `en.plain.html` — the imported homepage content, ready to upload to Document Authoring
  at path `/en`. Contains three blocks: carousel-hero, search-simple, cards-story.

### `blocks/`
New block variants created for this page (drop into your project's `blocks/` folder):
- `carousel-hero/` — hero carousel variant (JS, CSS, xwalk model `_carousel-hero.json`)
- `cards-story/` — story cards variant (JS, CSS, xwalk model `_cards-story.json`)
- `search-simple/` — simple search variant (JS, CSS, xwalk model `_search-simple.json`)

### `tools/importer/`
The import infrastructure used to generate the content (for re-running or tuning):
- `page-templates.json` — template + block mappings
- `parsers/` — per-block parsers
- `transformers/loreal-cleanup.js` — site-wide DOM cleanup
- `import-homepage.js` — orchestration script
- `reports/` — import report (xlsx + json)

### `migration-work/`
- `images/` — downloaded source images
- `migration-plan.md` — migration summary

## How to use

1. Copy `blocks/*` into your EDS project's `blocks/` directory and commit.
2. Upload `content/en.plain.html` to Document Authoring at path `/en`
   (or paste the content into a new `/en` document).
3. Preview at `https://main--aem-block-collection-loreal--dishant246.aem.page/en`.

## Notes
- Content completeness scored 88.2%. The gap is non-authorable UI chrome only
  (carousel autoplay label, search widget label, and validation hint that the blocks
  render at runtime). All authorable content imported correctly.
- Design/styling has not yet been applied — blocks will render unstyled until the
  design migration step is run.
