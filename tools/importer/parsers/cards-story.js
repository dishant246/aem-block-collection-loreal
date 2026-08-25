/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-story
 * Base block: cards
 * Source: https://www.loreal.com/en (div.scroll-slider.scroll-slider--advanced)
 * Generated: 2026-08-25
 *
 * Container block. Each card row has two columns:
 *   - image (reference) — imageAlt collapses onto the <img>
 *   - text (richtext) — title heading + CTA link
 *
 * The scroll-slider wrapper also holds a side-content intro (heading + copy)
 * captured as a leading text-only card (empty image cell allowed by the
 * library) so no real source text is lost.
 *
 * Residual completeness gap is chrome only: large base64 SVG arrow icons, the
 * hidden video modal, off-screen duplicate labels, and SEO-comment img markup —
 * none of which is authorable block content. All 5 cards + intro are captured.
 */
export default function parse(element, { document }) {
  const slides = Array.from(element.querySelectorAll('.scroll-slider__slide, .card'));

  // De-duplicate: prefer the .card node inside each slide.
  const cardEls = [];
  const seen = new Set();
  slides.forEach((el) => {
    const card = el.classList.contains('card') ? el : el.querySelector('.card');
    if (card && !seen.has(card)) {
      seen.add(card);
      cardEls.push(card);
    }
  });

  const cells = [['cards-story']];

  // Intro side-content (heading + copy) → leading text-only card.
  // The cards library permits an empty image cell, so the intro text is kept
  // inside the block rather than lost. imageAlt collapses so the empty image
  // cell needs no field comment.
  const sideHeading = element.querySelector('.scroll-slider__heading');
  const sideCopy = element.querySelector('.scroll-slider__copy');
  if (sideHeading || sideCopy) {
    const introImageCell = document.createDocumentFragment(); // empty image cell
    const introTextCell = document.createDocumentFragment();
    introTextCell.appendChild(document.createComment(' field:text '));
    if (sideHeading) {
      const h2 = document.createElement('h2');
      h2.textContent = sideHeading.textContent.replace(/\s+/g, ' ').trim();
      introTextCell.appendChild(h2);
    }
    if (sideCopy) {
      const p = document.createElement('p');
      p.textContent = sideCopy.textContent.replace(/\s+/g, ' ').trim();
      introTextCell.appendChild(p);
    }
    cells.push([introImageCell, introTextCell]);
  }

  cardEls.forEach((card) => {
    // Image cell — image (imageAlt collapses onto the img alt attribute)
    const img = card.querySelector('.responsive-image__media img, .image--slideCard img, img');
    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // Text cell — text (rich text): title + CTA link
    const title = card.querySelector('.card__title, [class*="title"]');
    const cta = card.querySelector('a.ghost-link, a[href]');

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (title) {
      const heading = document.createElement('h3');
      heading.textContent = title.textContent.trim();
      textCell.appendChild(heading);
    }
    if (cta) {
      const link = document.createElement('a');
      link.href = cta.getAttribute('href') || '';
      // ghost-link label lives in an off-screen div; fall back to title text.
      const label = (cta.textContent || '').trim() || (title ? title.textContent.trim() : link.href);
      link.textContent = label;
      textCell.appendChild(link);
    }

    cells.push([imageCell, textCell]);
  });

  // Empty-block guard: no cards extracted.
  if (cells.length === 1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-story', cells });
  element.replaceWith(block);
}
