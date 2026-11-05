/**
 * WordPress returns titles/excerpts as HTML (`title.rendered`), with entities such as
 * `&#038;`, `&#8211;` and `&nbsp;`. These helpers turn them into plain display text.
 *
 * Only ever render the result as a React text node — never pass decoded text back into
 * dangerouslySetInnerHTML, since decoding `&lt;script&gt;` produces real markup.
 */
export function toPlainText(html = "") {
  if (html === null || html === undefined) return "";
  const source = String(html);
  if (!/[<&]/.test(source)) return source.trim();
  // DOMParser builds an inert document: no scripts run and no resources load.
  return new DOMParser().parseFromString(source, "text/html").body.textContent.replace(/\s+/g, " ").trim();
}

/** Plain text trimmed to `max` characters on a word boundary. */
export function truncateText(html, max = 160) {
  const text = toPlainText(html);
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
