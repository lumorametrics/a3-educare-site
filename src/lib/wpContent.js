/**
 * Small presentation fixes for WordPress article HTML before it is rendered. Text is never
 * changed. DOMParser does not run scripts, and the result is rendered exactly like before.
 */
export function enhanceArticleHtml(html) {
  if (!html || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Empty paragraphs (e.g. "<p><!-- University Partners --></p>" from pasted HTML) add stray gaps.
  doc.body.querySelectorAll("p").forEach((paragraph) => {
    if (!paragraph.textContent.trim() && !paragraph.querySelector("img, iframe, video, a, br")) paragraph.remove();
  });

  // Pasted HTML often hard-codes a font (e.g. Arial); drop only that, so articles use the site font.
  doc.body.querySelectorAll('[style*="font-family"]').forEach((element) => {
    element.style.removeProperty("font-family");
    if (!element.getAttribute("style")?.trim()) element.removeAttribute("style");
  });

  // A 10-digit tel: link has no country code and fails from abroad; these are Indian numbers.
  doc.body.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    const digits = link.getAttribute("href").slice(4).replace(/[^\d+]/g, "");
    if (/^\d{10}$/.test(digits)) link.setAttribute("href", `tel:+91${digits}`);
  });

  // "Get in touch" call-to-action boxes: drop their inline styles (which hid the labels on the dark
  // background) and mark them up for the site's contact card design (.wp-contact-card in index.css).
  doc.body.querySelectorAll("h2, h3").forEach((heading) => {
    if (!/get in touch/i.test(heading.textContent)) return;
    const card = heading.closest("section, aside") || heading.parentElement;
    if (!card || card === doc.body || card.classList.contains("wp-contact-card")) return;
    card.classList.add("wp-contact-card");
    [card, ...card.querySelectorAll("*")].forEach((element) => element.removeAttribute("style"));
    heading.classList.add("wp-contact-card__title");
    const rows = [...card.querySelectorAll("p")].filter((paragraph) => paragraph.querySelector('a[href^="tel:"], a[href^="mailto:"]'));
    card.querySelectorAll("p").forEach((paragraph) => {
      if (!rows.includes(paragraph)) paragraph.classList.add("wp-contact-card__lead");
    });
    if (!rows.length) return;
    const list = doc.createElement("div");
    list.className = "wp-contact-card__items";
    rows[0].before(list);
    rows.forEach((row) => {
      row.classList.add("wp-contact-card__item", row.querySelector('a[href^="tel:"]') ? "is-phone" : "is-email");
      row.querySelector("strong, b")?.classList.add("wp-contact-card__label");
      list.appendChild(row);
    });
  });

  return doc.body.innerHTML;
}
