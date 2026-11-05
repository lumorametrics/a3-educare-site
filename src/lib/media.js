/**
 * { src, srcSet, alt } for a WordPress media record (or an ACF image array), or null when the value
 * is empty or still a bare attachment ID. The square-cropped thumbnail stays out of the srcset.
 */
export function getResponsiveImage(media, fallbackAlt = "") {
  if (!media || typeof media !== "object") return null;
  const sizes = media.media_details?.sizes || {};
  const src = sizes.large?.source_url || media.source_url || media.url;
  if (!src) return null;
  const widths = new Map();
  Object.entries(sizes).forEach(([name, size]) => {
    if (name !== "thumbnail" && size?.source_url && size.width) widths.set(size.width, size.source_url);
  });
  const srcSet = [...widths].sort(([a], [b]) => a - b).map(([width, url]) => `${url} ${width}w`).join(", ");
  return { src, srcSet: srcSet || undefined, alt: media.alt_text || media.alt || fallbackAlt };
}
