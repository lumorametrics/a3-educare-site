import { getResponsiveImage } from "./media";
import { toPlainText } from "./text";
import { CREDIT_OVERRIDES } from "./imageCreditOverrides";

// featured_image is the image chosen for the college; college_image is the older field kept as a fallback.
const IMAGE_KEYS = ["featured_image", "college_image"];

const LICENSE_URLS = [
  [/^CC0/i, () => "https://creativecommons.org/publicdomain/zero/1.0/"],
  [/^FAL/i, () => "https://artlibre.org/licence/lal/en/"],
  [/^Pexels/i, () => "https://www.pexels.com/license/"],
  [/^CC[- ]BY[- ]SA[- ](\d\.\d)/i, (match) => `https://creativecommons.org/licenses/by-sa/${match[1]}/`],
  [/^CC[- ]BY[- ](\d\.\d)/i, (match) => `https://creativecommons.org/licenses/by/${match[1]}/`],
];

/** WordPress displays a double hyphen in saved text as a dash, which breaks Commons file links such as Meerut's. */
function commonsLink(url) {
  return url.replace(/\u2013/g, "--");
}

function licenseUrl(license) {
  for (const [pattern, build] of LICENSE_URLS) {
    const match = license.match(pattern);
    if (match) return build(match);
  }
  return "";
}

/** Media captions can hold a photo credit; credits live on /image-credits, so such a caption is not shown on pages. */
export function withoutPhotoCredit(caption = "") {
  return /photo\s*:|photo by|pexels|wikimedia|\bcc[- ]by\b|\bcc0\b|creative commons/i.test(caption) ? "" : caption;
}

/**
 * Credit for state, course and district photos: the caption reads "Photo: <author>, <licence>, via Wikimedia
 * Commons" and the description "Source: <Commons page>".
 */
function parseCaptionCredit(media, description) {
  const source = description.match(/Source:\s*(https?:\/\/\S+)/i);
  const caption = toPlainText(media?.caption?.rendered ?? media?.caption ?? "");
  const parts = caption.match(/^Photo:\s*(.+?),\s*(CC0|Public domain|CC[- ]BY(?:[- ]SA)?[- ]\d\.\d)\s*,\s*via\b/i);
  if (!source || !parts) return null;
  const license = /public/i.test(parts[2]) ? "Public domain" : parts[2].replace(/[- ]+/g, " ").replace(/^CC BY SA/i, "CC BY-SA").trim();
  return { author: parts[1].trim(), license, licenseUrl: licenseUrl(license), sourceUrl: commonsLink(source[1]), note: "" };
}

/**
 * Photo credit from the media record that WordPress holds: the description reads
 * "Source: <url> | License: <licence> | Author: <name>", and the caption starts with a note such as
 * "Representative image." when the photo is not of the college itself. Null when there is no credit.
 */
export function parseCredit(media) {
  const override = CREDIT_OVERRIDES[media?.id];
  if (override) return { ...override, licenseUrl: licenseUrl(override.license), note: "" };
  const description = toPlainText(media?.description?.rendered ?? media?.description ?? "");
  const match = description.match(/Source:\s*(https?:\/\/\S+?)\s*\|\s*License:\s*([^|]+?)\s*(?:\|\s*Author:\s*(.*))?$/i);
  if (!match) {
    const pexels = description.match(/Photo by (.+?) on Pexels\b[^:]*:\s*(https?:\/\/\S+)/i);
    if (pexels) return { author: pexels[1].trim(), license: "Pexels License", licenseUrl: licenseUrl("Pexels License"), sourceUrl: pexels[2], sourceName: "Pexels", note: "" };
    return parseCaptionCredit(media, description);
  }
  const license = match[2].trim();
  const caption = toPlainText(media?.caption?.rendered ?? media?.caption ?? "");
  const [lead, rest] = caption.split(/\s*Photo:/);
  const note = rest !== undefined && /Representative image/i.test(lead) ? lead.trim() : "";
  return {
    author: (match[3] || "").trim() || "Wikimedia Commons contributor",
    license,
    licenseUrl: licenseUrl(license),
    sourceUrl: commonsLink(match[1]),
    // "Representative image." or, for a sister campus, "SRM University, Amaravati campus, same SRM group. Representative image."
    note,
  };
}

/**
 * The image to show for a college: featured_image, else college_image, else null (callers show the
 * placeholder). { src, srcSet, alt, width, height, credit }. Values that are still bare attachment IDs
 * (the media request failed) or empty are skipped.
 */
export function resolveCollegeImage(fields = {}, fallbackAlt = "") {
  for (const key of IMAGE_KEYS) {
    const value = fields[key];
    if (typeof value === "string" && /^https?:\/\//.test(value)) return { src: value, alt: fallbackAlt, credit: null };
    if (!value || typeof value !== "object") continue;
    const image = getResponsiveImage(value, fallbackAlt);
    if (!image) continue;
    return {
      ...image,
      width: value.media_details?.width || value.width || undefined,
      height: value.media_details?.height || value.height || undefined,
      credit: parseCredit(value),
    };
  }
  return null;
}
