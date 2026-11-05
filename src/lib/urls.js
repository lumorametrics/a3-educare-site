// Public URL structure (matches the A3 EduCare Hub sitemap):
//   /courses, /courses/<category>, /courses/<category>/<course>
//   /colleges, /colleges/<college>
//   /states, /states/<state>, /states/<state>/<district>
//   /states/<state>/<category>-colleges, /states/<state>/<district>/<category>
// Slugs come straight from WordPress; nothing here invents a slug.
import { toPlainText } from "./text";

export const COURSES_URL = "/courses";
export const courseCategoryUrl = (categorySlug) => `/courses/${categorySlug}`;
export const courseUrl = (course) => (course?.categorySlug ? `/courses/${course.categorySlug}/${course.slug}` : `/courses/${course?.slug || course?.id}`);
export const collegeUrl = (college) => `/colleges/${college?.slug || college?.id}`;
export const stateUrl = (stateOrSlug) => `/states/${stateOrSlug?.slug || stateOrSlug}`;
export const districtUrl = (district, stateSlug = district?.stateSlug) => (stateSlug ? `/states/${stateSlug}/${district.slug}` : `/districts/${district?.slug || district?.id}`);
export const stateCategoryUrl = (stateSlug, categorySlug) => `/states/${stateSlug}/${categorySlug}-colleges`;
export const districtCategoryUrl = (stateSlug, districtSlug, categorySlug) => `/states/${stateSlug}/${districtSlug}/${categorySlug}`;

export const slugify = (value = "") => toPlainText(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const normalise = (value) => toPlainText(value || "").trim().toLowerCase().replace(/\s*&\s*/g, " and ");
export const sameName = (a, b) => normalise(a) === normalise(b);

/** Spelling variants seen in college locations; mapped onto the spelling WordPress districts use. */
const PLACE_ALIASES = { sonepat: "sonipat", bengaluru: "bangalore", gurgaon: "gurugram", vizag: "visakhapatnam", mysuru: "mysore" };
// Spaces at both ends let a place be matched as whole words: "Visakhapatnam" must not match "Patna".
const placeText = (value) => ` ${normalise(value).replace(/[^a-z0-9]+/g, " ").replace(/\b(sonepat|bengaluru|gurgaon|vizag|mysuru)\b/g, (word) => PLACE_ALIASES[word]).trim()} `;

/** A college's address without its state, country or PIN, so "Srinagar, Jammu and Kashmir" does not name Jammu. */
function localAddress(location, stateName) {
  return toPlainText(location || "").split(",")
    .map((part) => part.replace(/\d+/g, "").trim())
    .filter((part) => part && !sameName(part, stateName) && !sameName(part, "India"))
    .join(" ");
}

/** Whether a college belongs to this district: same state, and linked in WordPress or named as whole words in its city or address. */
export function collegeInDistrict(college, district) {
  const fields = college?.acf || {};
  const stateName = district?.acf?.state_name;
  if (stateName && !sameName(fields.state, stateName)) return false;
  if ([].concat(fields.college_district || []).map(Number).includes(Number(district?.id))) return true;
  const where = placeText(`${fields.city || ""} ${localAddress(fields.location || fields.college_location, stateName)}`);
  if (!where.trim()) return false;
  const names = [toPlainText(district?.title?.rendered), district?.acf?.headquarters, String(district?.slug || "").replace(/-/g, " ")]
    .map(placeText)
    .filter((name) => name.trim().length > 2 && name.trim() !== "city");
  return names.some((name) => where.includes(name));
}

/**
 * Course-category slugs of a college, from its `course_categories` ACF taxonomy field. Handles term IDs,
 * term objects or slugs, whichever return format the field is configured with.
 */
export function collegeCategorySlugs(college, categories = []) {
  const raw = college?.acf?.course_categories;
  if (!raw) return [];
  const byId = new Map(categories.map((category) => [String(category.id), category.slug]));
  return [].concat(raw).map((entry) => {
    if (entry && typeof entry === "object") return entry.slug || byId.get(String(entry.term_id ?? entry.id)) || "";
    return byId.get(String(entry)) || String(entry);
  }).filter(Boolean);
}
