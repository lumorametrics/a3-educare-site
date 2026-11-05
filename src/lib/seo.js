import { useEffect } from "react";
import { truncateText } from "./text";

/**
 * Client-side head management (title, description, canonical, Open Graph/Twitter, robots,
 * JSON-LD). Search engines that execute JavaScript (Google, Bing) read these after render.
 *
 * Set VITE_SITE_URL to the public frontend origin (e.g. https://www.a3educarehub.in) so
 * canonical/og:url and the generated sitemap point at the right domain.
 */
export const SITE_NAME = "A3 EduCare Hub";
export const DEFAULT_DESCRIPTION = "A3 EduCare Hub — thoughtful education guidance for ambitious futures.";
// Social-share fallback image, on white: some apps show transparent PNGs on black, hiding the navy logo.
const DEFAULT_IMAGE = "/og-image.png";
const LOGO_IMAGE = "/a3-educare-logo.png";

export function siteUrl() {
  return (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, "");
}

function absolute(url) {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `${siteUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
}

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

/**
 * title:       page title without the site suffix
 * description: plain text or WordPress HTML (trimmed to ~160 chars)
 * image:       absolute or root-relative image URL
 * type:        og:type ("website" | "article")
 * noindex:     keep error / 404 / empty pages out of search results
 * jsonLd:      structured data object (or array) for this page
 */
export function applySeo({ title, description, image, type = "website", noindex = false, jsonLd } = {}) {
  const fullTitle = title ? `${truncateText(title, 70)} | ${SITE_NAME}` : `${SITE_NAME} | Find your next chapter`;
  const summary = truncateText(description || DEFAULT_DESCRIPTION, 160);
  const url = `${siteUrl()}${window.location.pathname}`;
  const ogImage = absolute(image || DEFAULT_IMAGE);

  document.title = fullTitle;
  upsertMeta("name", "description", summary);
  upsertMeta("name", "robots", noindex ? "noindex, follow" : "index, follow");
  upsertLink("canonical", url);
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:title", fullTitle);
  upsertMeta("property", "og:description", summary);
  upsertMeta("property", "og:type", type);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:image", ogImage);
  upsertMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
  upsertMeta("name", "twitter:title", fullTitle);
  upsertMeta("name", "twitter:description", summary);
  upsertMeta("name", "twitter:image", ogImage);

  document.head.querySelectorAll('script[data-page-jsonld]').forEach((node) => node.remove());
  if (jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.pageJsonld = "";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
}

/** Mark the current page noindex without touching its title (used by error / not-found screens). */
export function setNoindex() {
  upsertMeta("name", "robots", "noindex, follow");
}

/** Apply SEO once `meta` is ready (pass null while data is loading to keep the route defaults). */
export function useSeo(meta) {
  const key = meta ? JSON.stringify(meta) : "";
  useEffect(() => {
    if (meta) applySeo(meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures meta's contents
  }, [key]);
}

/** Structured data for a listing page: its breadcrumb trail and the colleges it lists. */
export function collegeListingJsonLd(breadcrumb, colleges, collegeHref) {
  const trail = {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumb.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absolute(item.href || window.location.pathname),
    })),
  };
  if (!colleges.length) return { "@context": "https://schema.org", ...trail };
  const list = {
    "@type": "ItemList",
    itemListElement: colleges.map((college, index) => ({ "@type": "ListItem", position: index + 1, url: absolute(collegeHref(college)) })),
  };
  return { "@context": "https://schema.org", "@graph": [trail, list] };
}

export function organizationRef() {
  return { "@type": "Organization", name: SITE_NAME, url: siteUrl(), logo: absolute(LOGO_IMAGE) };
}
