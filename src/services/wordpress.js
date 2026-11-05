import { toPlainText } from "../lib/text";
import { withoutPhotoCredit } from "../lib/collegeImage";

const API_BASE = import.meta.env.VITE_WORDPRESS_API ||
  (import.meta.env.DEV ? "/wp-api" : "https://staging.a3educarehub.in/wp-json/wp/v2");
// Origin of the WordPress install (plugin assets, admin-ajax), independent of the dev API proxy.
export const WP_ORIGIN = new URL(import.meta.env.VITE_WORDPRESS_API || "https://staging.a3educarehub.in/wp-json/wp/v2").origin;
// Fluent Forms submits through admin-ajax.php, which sends no CORS headers. In development the
// Vite proxy (/wp-ajax) makes it same-origin; in production set VITE_WP_AJAX_URL to a same-origin
// proxy path, or allow the frontend origin on admin-ajax in WordPress.
export const WP_AJAX_URL = import.meta.env.VITE_WP_AJAX_URL ||
  (import.meta.env.DEV ? "/wp-ajax" : `${WP_ORIGIN}/wp-admin/admin-ajax.php`);
const STUDY_ABROAD_ENDPOINT = "study-abroad";
const STUDY_ABROAD_ENDPOINT_ALIASES = ["study_abroad"];
const responseCache = new Map();
// WordPress answers every request uncached (Cache-Control: no-store) with 0.7-4 s TTFB, so
// responses are kept for a few minutes: in memory across client-side navigations, and in
// sessionStorage so a reload or a new tab in the same session renders without waiting.
// Only public, unauthenticated REST data is stored. Content edits show up within CACHE_TTL.
const CACHE_TTL = 5 * 60 * 1000;
const STORAGE_PREFIX = "wp-cache:";

function readStored(key) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_PREFIX + key));
    if (stored?.expiresAt > Date.now()) return stored;
    if (stored) sessionStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Storage unavailable (privacy mode) or corrupt entry: fall through to the network.
  }
  return null;
}

function writeStored(key, entry) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage disabled: the in-memory cache still works.
  }
}
// A stalled request must surface as an error instead of an endless loading screen.
const REQUEST_TIMEOUT = 15 * 1000;

async function fetchJson(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal: controller.signal });
    // WordPress occasionally answers 500 under load; one quiet retry saves the visitor an error page.
    if (response.status >= 500 && attempt < 2) {
      await new Promise((resolve) => { setTimeout(resolve, 700); });
      return fetchJson(url, attempt + 1);
    }
    if (!response.ok) throw new Error(`WordPress request failed: ${response.status} (${response.url})`);
    return {
      data: await response.json(),
      totalPages: Number(response.headers.get("X-WP-TotalPages")) || 1,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`WordPress request timed out after ${REQUEST_TIMEOUT / 1000}s (${url})`, { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET a REST collection (cached for CACHE_TTL, concurrent calls share one request).
 * With `{ all: true }` every page is fetched (WordPress caps per_page at 100) and concatenated.
 */
async function getCollection(endpoint, params = {}, { all = false } = {}) {
  const search = new URLSearchParams({ per_page: "100", ...params });
  const url = `${API_BASE}/${endpoint}?${search}`;
  const cacheKey = all ? `${url}#all` : url;
  const cached = responseCache.get(cacheKey);
  if (cached?.promise) return cached.promise;
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  const stored = readStored(cacheKey);
  if (stored) {
    responseCache.set(cacheKey, stored);
    return stored.data;
  }

  const promise = fetchJson(url)
    .then(async ({ data, totalPages }) => {
      if (!all || totalPages <= 1 || !Array.isArray(data)) return data;
      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) => {
          search.set("page", String(index + 2));
          return fetchJson(`${API_BASE}/${endpoint}?${search}`).then((page) => page.data);
        }),
      );
      return data.concat(...rest);
    })
    .then((data) => {
      const entry = { data, expiresAt: Date.now() + CACHE_TTL };
      responseCache.set(cacheKey, entry);
      writeStored(cacheKey, entry);
      return data;
    })
    .catch((error) => {
      responseCache.delete(cacheKey);
      throw error;
    });
  responseCache.set(cacheKey, { promise, expiresAt: Date.now() + CACHE_TTL });
  return promise;
}

let studyAbroadEndpoint;

/**
 * Runs `request(restBase)` against the Study Abroad CPT route. The known route is tried
 * directly (no separate probe request in front of the real one); aliases and the type
 * registry are only consulted when it answers 404.
 */
async function withStudyAbroadEndpoint(request) {
  if (studyAbroadEndpoint) return request(studyAbroadEndpoint);
  for (const candidate of [STUDY_ABROAD_ENDPOINT, ...STUDY_ABROAD_ENDPOINT_ALIASES]) {
    try {
      const result = await request(candidate);
      studyAbroadEndpoint = candidate;
      return result;
    } catch (error) {
      if (!error.message.includes("404")) throw error;
    }
  }
  studyAbroadEndpoint = await findStudyAbroadRestBase();
  return request(studyAbroadEndpoint);
}

async function findStudyAbroadRestBase() {
  const candidates = [STUDY_ABROAD_ENDPOINT, ...STUDY_ABROAD_ENDPOINT_ALIASES];

  let types;
  try {
    types = await getCollection("types");
  } catch (error) {
    throw new Error(
      `Study Abroad routes returned 404 and the WordPress type registry could not be read: ${error.message}`,
      { cause: error },
    );
  }
  const match = Object.values(types).find((type) => {
    const text = [type.slug, type.name, type.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replace(/[_-]+/g, " ");
    return text.includes("study abroad");
  });
  if (!match?.rest_base) {
    throw new Error(
      `Study Abroad routes not found (${candidates.join(", ")}). ` +
      "WordPress has no registered Study Abroad REST route. Enable show_in_rest and set a URL-safe rest_base.",
    );
  }
  return match.rest_base;
}

export function getBySlug(endpoint, slug, params = {}) {
  return getCollection(endpoint, { slug, per_page: "1", ...params });
}

// Listing pages only need card data; full records are ~9x larger (88 KB vs 10 KB for 75 courses).
const COURSE_CARD_FIELDS = [
  "id", "slug", "title", "excerpt", "course_category",
  "acf.course_short_introduction", "acf.course_overview", "acf.duration", "acf.course_duration",
  "acf.fees_information", "acf.course_fee", "acf.course_price",
].join(",");
const COLLEGE_CARD_FIELDS = [
  "id", "slug", "title",
  "acf.college_location", "acf.location", "acf.city", "acf.state", "acf.college_type", "acf.college_short_introduction",
  "acf.featured_image", "acf.college_image", "acf.course_categories", "acf.college_district",
].join(",");
const DISTRICT_CARD_FIELDS = [
  "id", "slug", "title", "district_category", "acf.state_name", "acf.headquarters", "acf.district_short_introduction", "acf.district_overview",
].join(",");

/** Adds `categorySlug` (first course_category term) so a course can build its /courses/<category>/<course> URL. */
async function withCourseCategorySlug(items) {
  const categories = await getCourseCategories().catch(() => []);
  const byId = new Map(categories.map((category) => [String(category.id), category.slug]));
  return items.map((item) => ({
    ...item,
    categorySlug: [].concat(item.course_category || []).map((id) => byId.get(String(id))).find(Boolean) || "",
  }));
}

export function getCourses(params = {}) {
  return getCollection("courses", { _fields: COURSE_CARD_FIELDS, ...params }, { all: true }).then(withCourseCategorySlug);
}

export function getCourseBySlug(slug) {
  // wp:term gives the course_category names without a second request.
  return getBySlug("courses", slug, { _embed: "wp:featuredmedia,wp:term" })
    .then(async (items) => (items[0] ? [await hydrateMediaFields(items[0], /image|photo|banner|thumbnail|cover/i)] : items))
    .then(withCourseCategorySlug);
}

/**
 * ACF image fields that return an attachment ID are swapped for the media object.
 * All IDs go out in one batched `include=` request (previously one request per image), and
 * the featured image reuses the `_embed` copy instead of being fetched again. Missing or
 * failed media keep the original value, as before.
 */
async function hydrateMediaFields(item, keyPattern) {
  const fields = item.acf || {};
  const imageEntries = Object.entries(fields).filter(([key, value]) => keyPattern.test(key) && /^\d+$/.test(String(value)));
  const featuredId = /^\d+$/.test(String(item.featured_media || "")) && Number(item.featured_media) > 0 ? item.featured_media : null;
  const embeddedFeatured = item._embedded?.["wp:featuredmedia"]?.[0];
  const featured = embeddedFeatured && !embeddedFeatured.code ? embeddedFeatured : null;
  if (featuredId && !featured) imageEntries.push(["featured_media", featuredId]);
  if (!imageEntries.length && !featured) return item;

  const ids = [...new Set(imageEntries.map(([, value]) => String(value)))];
  const media = ids.length
    ? await getCollection("media", { include: ids.join(","), per_page: String(ids.length) }).catch(() => [])
    : [];
  const byId = new Map(media.map((entry) => [String(entry.id), entry]));
  const nextFields = { ...fields };
  imageEntries.forEach(([key, value]) => {
    nextFields[key] = byId.get(String(value)) || nextFields[key];
  });
  if (featured) nextFields.featured_media = featured;
  return { ...item, acf: nextFields };
}

export function getCourseCategories() {
  return getCollection("course_category");
}
// The state CPT's REST base is "States". The lowercase "states" route resolves to the same posts,
// but WordPress omits their ACF fields there, so state pages had none of their content.
const STATE_ENDPOINT = "States";
// Lists (directory, home cards, "other states") only need these; the full records are ~290 KB.
const STATE_CARD_FIELDS = ["id", "slug", "title", "acf.state_short_introduction", "acf.capital", "acf.state_type"].join(",");

export function getStates() {
  return getCollection(STATE_ENDPOINT, { _fields: STATE_CARD_FIELDS }, { all: true });
}

export function getStateBySlug(slug) {
  return getBySlug(STATE_ENDPOINT, slug)
    .then(async (items) => (items[0] ? [await hydrateMediaFields(items[0], /image/i)] : items));
}

/**
 * Adds `stateSlug` to districts so they can build /states/<state>/<district>. The State post whose title
 * matches the district's state wins; the district_category (state) term slug is the fallback.
 */
async function withDistrictState(items) {
  const [states, terms] = await Promise.all([getStates().catch(() => []), getCollection("district_category").catch(() => [])]);
  // A State whose slug is its own title (uttar-pradesh) wins over a stray duplicate with the same title.
  const nameKey = (state) => toPlainText(state.title?.rendered).trim().toLowerCase();
  const stateByName = new Map();
  [...states].sort((a, b) => Number(b.slug === nameKey(b).replace(/[^a-z0-9]+/g, "-")) - Number(a.slug === nameKey(a).replace(/[^a-z0-9]+/g, "-")))
    .forEach((state) => { if (!stateByName.has(nameKey(state))) stateByName.set(nameKey(state), state.slug); });
  const termById = new Map(terms.map((term) => [String(term.id), term.slug]));
  return items.map((item) => ({
    ...item,
    stateSlug: stateByName.get(String(item.acf?.state_name || "").trim().toLowerCase())
      || [].concat(item.district_category || []).map((id) => termById.get(String(id))).find(Boolean) || "",
  }));
}

export function getDistricts() {
  return getCollection("Districts", { _fields: DISTRICT_CARD_FIELDS }, { all: true }).then(withDistrictState);
}

export function getDistrictBySlug(slug) {
  return getBySlug("Districts", slug)
    .then(withDistrictState)
    .then(async (items) => (items[0] ? [await hydrateMediaFields(items[0], /image/i), ...items.slice(1)] : items));
}

// Card images: featured_image first, college_image as the fallback (see lib/collegeImage.js).
const COLLEGE_IMAGE_KEYS = ["featured_image", "college_image"];
// Description and caption carry the photo credit; only the sizes the cards use are requested.
const COLLEGE_MEDIA_FIELDS = "id,source_url,alt_text,caption,description,media_details.width,media_details.height,media_details.sizes";

/** Swaps the ACF image IDs of these colleges for their media records (batched, cached). A failure keeps the IDs. */
async function withCollegeImages(items) {
  const ids = [...new Set(items.flatMap((item) => COLLEGE_IMAGE_KEYS.map((key) => item.acf?.[key])).filter((value) => /^\d+$/.test(String(value))).map(String))];
  if (!ids.length) return items;
  const chunks = Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => ids.slice(index * 100, index * 100 + 100));
  const media = (await Promise.all(chunks.map((chunk) => getCollection("media", {
    include: chunk.join(","), per_page: String(chunk.length), _fields: COLLEGE_MEDIA_FIELDS,
  }).catch(() => [])))).flat();
  const byId = new Map(media.map((entry) => [String(entry.id), entry]));
  return items.map((item) => {
    const acf = { ...item.acf };
    COLLEGE_IMAGE_KEYS.forEach((key) => { acf[key] = byId.get(String(acf[key])) || acf[key]; });
    return { ...item, acf };
  });
}

// Just enough to work out which colleges a listing page shows; the cards themselves are fetched by ID.
const COLLEGE_INDEX_FIELDS = "id,acf.state,acf.city,acf.location,acf.college_location,acf.course_categories,acf.college_district";

export function getCollegeIndex() {
  return getCollection("college", { _fields: COLLEGE_INDEX_FIELDS }, { all: true });
}

export function getColleges() {
  return getCollection("college", { _fields: COLLEGE_CARD_FIELDS }, { all: true }).then(withCollegeImages);
}

const COLLEGE_LISTING_FIELDS = `${COLLEGE_CARD_FIELDS},acf.established,acf.entrance_exams,acf.fees_information`;

/** Full card data and images for only the colleges on a page. */
export async function withCollegeListingDetails(items) {
  if (!items.length) return items;
  const ids = items.map((item) => item.id);
  const chunks = Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => ids.slice(index * 100, index * 100 + 100));
  const cards = await Promise.all(chunks.map((chunk) => getCollection("college", {
    include: chunk.join(","), per_page: String(chunk.length), _fields: COLLEGE_LISTING_FIELDS,
  })));
  return withCollegeImages(cards.flat());
}

export function getCollegeBySlug(slug) {
  return getBySlug("college", slug, { _embed: "wp:featuredmedia" })
    .then(async (items) => (items[0] ? [await hydrateMediaFields(items[0], /image|photo|banner|thumbnail|logo/i)] : items));
}

// Only the featured image is read from study-abroad embeds (not author/replies).
const STUDY_ABROAD_EMBEDS = "wp:featuredmedia";
const STUDY_ABROAD_MEDIA_KEYS = /image|photo|banner|thumbnail|logo/i;

export function getStudyAbroad() {
  return withStudyAbroadEndpoint((endpoint) => getCollection(endpoint, { _embed: STUDY_ABROAD_EMBEDS }, { all: true }));
}

export async function getStudyAbroadBySlug(slug) {
  const reference = decodeURIComponent(String(slug || "")).trim();
  if (!reference) return null;

  const matches = await withStudyAbroadEndpoint((endpoint) => getCollection(endpoint, {
    ...(Number.isInteger(Number(reference)) ? { include: reference } : { slug: reference }),
    per_page: "1",
    _embed: STUDY_ABROAD_EMBEDS,
  }));
  if (matches[0]) return hydrateMediaFields(matches[0], STUDY_ABROAD_MEDIA_KEYS);

  const publishedItems = await getStudyAbroad();
  const match = publishedItems.find((candidate) =>
    String(candidate.id) === reference ||
    candidate.slug === reference ||
    candidate.title?.rendered?.toLowerCase() === reference.toLowerCase(),
  );
  return match ? hydrateMediaFields(match, STUDY_ABROAD_MEDIA_KEYS) : null;
}

export async function getHeaderMenuData() {
  const sources = [
    ["courses", getCourses()],
    ["states", getStates()],
    ["districts", getDistricts()],
    ["studyAbroad", getStudyAbroad()],
    ["colleges", getColleges()],
  ];
  const results = await Promise.allSettled(sources.map(([, request]) => request));
  const data = {};
  const errors = {};

  results.forEach((result, index) => {
    const [key] = sources[index];
    if (result.status === "fulfilled") data[key] = result.value;
    else errors[key] = result.reason.message;
  });

  return { data, errors };
}

export function getPages() {
  return getCollection("pages", {}, { all: true });
}

/**
 * First published page matching `slugs`, in that order of preference. All candidates go out in
 * one request (`slug=a,b,c`) instead of one slow round-trip per slug.
 */
async function getPageBySlugs(slugs) {
  const matches = await getCollection("pages", { slug: slugs.join(","), per_page: String(slugs.length) });
  return slugs.map((slug) => matches.find((page) => page.slug === slug)).find(Boolean) || null;
}

export async function getPrivacyPolicyPage() {
  // WordPress auto-creates a draft "privacy-policy" page, so a published copy is often "privacy-policy-2".
  const match = await getPageBySlugs(["privacy-policy", "privacy-policy-2"]);
  if (match) return match;

  const pages = await getPages();
  return pages.find((page) => page.title?.rendered?.trim().toLowerCase() === "privacy policy") || null;
}

/**
 * The WordPress page that holds the contact form shortcode ([fluentform id="1"]). WordPress runs
 * the shortcode when it renders the page, so its `content.rendered` contains the real form markup.
 * Null when no such page is published.
 */
export function getContactFormPage() {
  return getPageBySlugs(["contact", "contact-us"]);
}

/** The WordPress page that holds the Apply Now form shortcode ([fluentform id="3"]). Null when not published. */
export function getApplyFormPage() {
  return getPageBySlugs(["apply-now", "apply-now-2"]);
}

/** The WordPress page whose shortcodes hold the four registration forms. Null when not published. */
export function getRegistrationPage() {
  return getPageBySlugs(["registration"]);
}

/** Media-library records (dimensions, resized versions, alt text, caption) for attachment IDs, in one request. */
export function getMediaByIds(ids) {
  if (!ids.length) return Promise.resolve([]);
  return getCollection("media", {
    include: ids.join(","),
    per_page: String(Math.min(ids.length, 100)),
    _fields: "id,source_url,alt_text,caption,media_details",
  });
}

// The scholarships CPT's REST base is "Scholarships": like States, the lowercase route omits ACF fields.
const SCHOLARSHIP_ENDPOINT = "Scholarships";
const SCHOLARSHIP_CARD_FIELDS = [
  "id", "slug", "title", "acf.category_heading", "acf.category_intro", "acf.category_image", "acf.featured_image",
].join(",");
const SCHOLARSHIP_IMAGE_FIELDS = ["category_image", "featured_image"];

/** Swaps the ACF image IDs of these scholarships for their media records, in one request. A failure keeps the IDs. */
async function withScholarshipImages(items) {
  const ids = items.flatMap((item) => SCHOLARSHIP_IMAGE_FIELDS.map((key) => item.acf?.[key])).filter((value) => /^\d+$/.test(String(value)));
  const media = await getMediaByIds([...new Set(ids)]).catch(() => []);
  const byId = new Map(media.map((entry) => [String(entry.id), entry]));
  return items.map((item) => {
    const acf = { ...item.acf };
    SCHOLARSHIP_IMAGE_FIELDS.forEach((key) => { acf[key] = byId.get(String(acf[key])) || acf[key]; });
    return { ...item, acf };
  });
}

/** Scholarship categories, oldest first: the order they were published in WordPress. */
export function getScholarships() {
  return getCollection(SCHOLARSHIP_ENDPOINT, { _fields: SCHOLARSHIP_CARD_FIELDS, orderby: "date", order: "asc" }, { all: true })
    .then(withScholarshipImages);
}

export function getScholarshipBySlug(slug) {
  return getBySlug(SCHOLARSHIP_ENDPOINT, slug).then(withScholarshipImages);
}

export async function getGalleryPage() {
  const matches = await getBySlug("pages", "gallery", { _embed: "wp:featuredmedia" });
  if (matches[0]) return matches[0];

  const pages = await getPages();
  return pages.find((page) => page.slug === "gallery" || page.title?.rendered?.trim().toLowerCase() === "gallery") || null;
}

export async function getTermsOfUsePage() {
  const match = await getPageBySlugs(["terms-of-use", "terms-and-conditions", "terms"]);
  if (match) return match;

  const pages = await getPages();
  return pages.find((page) => {
    const title = page.title?.rendered?.trim().toLowerCase();
    return title === "terms of use" || title === "terms and conditions";
  }) || null;
}

// Embed only what the cards and sidebar use (featured image + categories/tags), not authors/replies.
const POST_EMBEDS = "wp:featuredmedia,wp:term";

export function getPosts() {
  return getCollection("posts", { _embed: POST_EMBEDS }, { all: true });
}

export function getPostBySlug(slug) {
  return getCollection("posts", { slug, per_page: "1", _embed: POST_EMBEDS });
}

/**
 * Featured image of an embedded post: { url, alt, caption } or null.
 * Prefers a mid-size rendition for cards; falls back to the original upload,
 * then to ACF image fields. Private/deleted media embeds come back as an error
 * object (with `code`) and are ignored.
 */
export function getPostFeaturedImage(post, size = "medium_large") {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  if (media && !media.code) {
    const sizes = media.media_details?.sizes || {};
    const url = sizes[size]?.source_url || sizes.large?.source_url || media.source_url;
    if (url) {
      return {
        url,
        alt: media.alt_text || toPlainText(post.title?.rendered),
        caption: withoutPhotoCredit(media.caption?.rendered || ""),
      };
    }
  }
  const acfImage = post?.acf?.featured_image || post?.acf?.blog_image;
  // ACF can return an attachment ID instead of a URL/object depending on the field's return format.
  const acfUrl = typeof acfImage === "string" && !/^\d+$/.test(acfImage) ? acfImage : acfImage?.url || acfImage?.sizes?.large;
  return acfUrl ? { url: acfUrl, alt: acfImage?.alt || "", caption: "" } : null;
}

/** Embedded categories and tags of a post. */
export function getPostTerms(post) {
  const terms = (post?._embedded?.["wp:term"] || []).flat().filter((term) => term && !term.code);
  return {
    categories: terms.filter((term) => term.taxonomy === "category"),
    tags: terms.filter((term) => term.taxonomy === "post_tag"),
  };
}

/** Every media record with the fields the Image Credits page needs. Only that page requests this. */
export function getCreditedMedia() {
  return getCollection("media", { _fields: "id,source_url,alt_text,title,caption,description,media_details.sizes.thumbnail" }, { all: true });
}
