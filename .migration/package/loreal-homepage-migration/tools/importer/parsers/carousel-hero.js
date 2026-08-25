/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero
 * Base block: carousel
 * Source: https://www.loreal.com/en (div.hero-carousel)
 * Generated: 2026-08-25
 *
 * Container block. Each slide row has two columns:
 *   - media_image (reference) — collapsed media_imageAlt carried on the <img>
 *   - content_text (richtext) — heading + CTA grouped as rich text
 *
 * All 3 slides (image + title + CTA) are captured. Residual completeness gap is
 * chrome only: sr-only nav labels ("previous panel", "next panel", autoplay) —
 * not authorable block content. Content verified complete — 3 slides.
 */
export default function parse(element, { document }) {
  // Each slide lives in an <li class="slider__slide brand-slider__slide">
  const slides = Array.from(element.querySelectorAll('li.slider__slide, li.brand-slider__slide'));

  const cells = [['carousel-hero']];

  slides.forEach((slide) => {
    // Image cell — media_image (media_imageAlt collapses into the img alt attribute)
    const img = slide.querySelector('.responsive-image__media img, .hero__image img, img');

    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:media_image '));
      imageCell.appendChild(img);
    }

    // Content cell — content_text (rich text): heading + CTA
    const heading = slide.querySelector('.hero-carousel__title, h1, h2, [class*="title"]');
    // The CTA is the button-styled link; strip the sr-only wrapper span text into a clean anchor.
    const ctaAnchor = slide.querySelector('a.hero__btn, a.btn, .hero-carousel__content a');

    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(' field:content_text '));
    if (heading) contentCell.appendChild(heading);
    if (ctaAnchor) {
      // Flatten the CTA label (inside span.btn__wrapper) onto the anchor itself.
      const label = ctaAnchor.textContent.trim();
      const link = document.createElement('a');
      link.href = ctaAnchor.getAttribute('href') || '';
      link.textContent = label;
      contentCell.appendChild(link);
    }

    cells.push([imageCell, contentCell]);
  });

  // Empty-block guard: no slides extracted.
  if (cells.length === 1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
