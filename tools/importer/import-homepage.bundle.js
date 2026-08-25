/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const slides = Array.from(element.querySelectorAll("li.slider__slide, li.brand-slider__slide"));
    const cells = [["carousel-hero"]];
    slides.forEach((slide) => {
      const img = slide.querySelector(".responsive-image__media img, .hero__image img, img");
      const imageCell = document.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document.createComment(" field:media_image "));
        imageCell.appendChild(img);
      }
      const heading = slide.querySelector('.hero-carousel__title, h1, h2, [class*="title"]');
      const ctaAnchor = slide.querySelector("a.hero__btn, a.btn, .hero-carousel__content a");
      const contentCell = document.createDocumentFragment();
      contentCell.appendChild(document.createComment(" field:content_text "));
      if (heading) contentCell.appendChild(heading);
      if (ctaAnchor) {
        const label = ctaAnchor.textContent.trim();
        const link = document.createElement("a");
        link.href = ctaAnchor.getAttribute("href") || "";
        link.textContent = label;
        contentCell.appendChild(link);
      }
      cells.push([imageCell, contentCell]);
    });
    if (cells.length === 1) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/search-simple.js
  function parse2(element, { document }) {
    const indexUrl = "https://www.loreal.com/en/query-index.json";
    const link = document.createElement("a");
    link.href = indexUrl;
    link.textContent = indexUrl;
    const indexCell = document.createDocumentFragment();
    indexCell.appendChild(document.createComment(" field:index "));
    indexCell.appendChild(link);
    const cells = [
      ["search-simple"],
      [indexCell]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "search-simple", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-story.js
  function parse3(element, { document }) {
    const slides = Array.from(element.querySelectorAll(".scroll-slider__slide, .card"));
    const cardEls = [];
    const seen = /* @__PURE__ */ new Set();
    slides.forEach((el) => {
      const card = el.classList.contains("card") ? el : el.querySelector(".card");
      if (card && !seen.has(card)) {
        seen.add(card);
        cardEls.push(card);
      }
    });
    const cells = [["cards-story"]];
    const sideHeading = element.querySelector(".scroll-slider__heading");
    const sideCopy = element.querySelector(".scroll-slider__copy");
    if (sideHeading || sideCopy) {
      const introImageCell = document.createDocumentFragment();
      const introTextCell = document.createDocumentFragment();
      introTextCell.appendChild(document.createComment(" field:text "));
      if (sideHeading) {
        const h2 = document.createElement("h2");
        h2.textContent = sideHeading.textContent.replace(/\s+/g, " ").trim();
        introTextCell.appendChild(h2);
      }
      if (sideCopy) {
        const p = document.createElement("p");
        p.textContent = sideCopy.textContent.replace(/\s+/g, " ").trim();
        introTextCell.appendChild(p);
      }
      cells.push([introImageCell, introTextCell]);
    }
    cardEls.forEach((card) => {
      const img = card.querySelector(".responsive-image__media img, .image--slideCard img, img");
      const imageCell = document.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const title = card.querySelector('.card__title, [class*="title"]');
      const cta = card.querySelector("a.ghost-link, a[href]");
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (title) {
        const heading = document.createElement("h3");
        heading.textContent = title.textContent.trim();
        textCell.appendChild(heading);
      }
      if (cta) {
        const link = document.createElement("a");
        link.href = cta.getAttribute("href") || "";
        const label = (cta.textContent || "").trim() || (title ? title.textContent.trim() : link.href);
        link.textContent = label;
        textCell.appendChild(link);
      }
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 1) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-story", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/loreal-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#main-container > ul",
        "header.header",
        "div.footer.container",
        "#main > div.container--large",
        "body > div:first-of-type",
        "iframe",
        "link",
        "meta",
        "noscript"
      ]);
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-hero": parse,
    "search-simple": parse2,
    "cards-story": parse3
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "L'Or\xE9al Groupe corporate homepage with hero carousel, search box, and story cards",
    urls: [
      "https://www.loreal.com/en"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [
          "#content > div.container.container--is-maxwidth > div.hero-carousel",
          "div.hero-carousel"
        ]
      },
      {
        name: "search-simple",
        instances: [
          "#search-box-form"
        ]
      },
      {
        name: "cards-story",
        instances: [
          "#content > div.container.container--is-maxwidth > div.container--large div.scroll-slider",
          "div.scroll-slider.scroll-slider--advanced"
        ]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
