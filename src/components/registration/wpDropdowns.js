import { getCourses, getDistricts, getStates } from "../../services/wordpress";
import { toPlainText } from "../../lib/text";

export const DISTRICT_NOT_LISTED = "My district isn't listed";
const DISTRICT_PLACEHOLDER = "Select Your District";

const normalise = (name) => name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();

/** Display names without case/"&" variants: WordPress records stay as they are, only the options are de-duplicated. */
function uniqueNames(names) {
  const seen = new Map();
  // Code-unit order puts "Uttar Pradesh" ahead of "Uttar pradesh", so the properly cased spelling wins.
  names.filter(Boolean).sort().forEach((name) => {
    const key = normalise(name);
    if (!seen.has(key)) seen.set(key, name);
  });
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/** States, districts grouped by state, and courses from WordPress. Rejects if any of them cannot be loaded. */
export async function loadRegistrationData() {
  const [states, districts, courses] = await Promise.all([getStates(), getDistricts(), getCourses()]);
  const districtsByState = new Map();
  districts.forEach((district) => {
    const key = normalise(toPlainText(district.acf?.state_name));
    if (!districtsByState.has(key)) districtsByState.set(key, []);
    districtsByState.get(key).push(toPlainText(district.title?.rendered));
  });
  return {
    states: uniqueNames(states.map((state) => toPlainText(state.title?.rendered))),
    districtsFor: (state) => uniqueNames(districtsByState.get(normalise(state)) || []),
    courses: uniqueNames(courses.map((course) => toPlainText(course.title?.rendered))),
  };
}

/** Replaces a Fluent Forms text input with a dropdown that submits under the same field name. */
function toSelect(input, options, placeholder) {
  const select = document.createElement("select");
  select.name = input.name;
  select.id = input.id;
  select.className = input.className;
  select.setAttribute("aria-required", input.getAttribute("aria-required") || "false");
  setOptions(select, options, placeholder);
  input.replaceWith(select);
  return select;
}

function setOptions(select, options, placeholder) {
  select.replaceChildren(new Option(placeholder, ""), ...options.map((name) => new Option(name, name)));
}

/**
 * Free Fluent Forms has no WordPress-powered or dependent dropdowns, so State, District and Course
 * are text fields there and become live dropdowns here. If WordPress data fails to load, the page
 * skips this step and the plain text fields still work. Fluent Forms decides on the server whether
 * "Enter Your District" is required, from its own conditional rule on the District value.
 */
export function enhanceRegistrationForm(form, data) {
  const mobile = form.querySelector('[name="mobile_number"]');
  if (mobile) {
    mobile.pattern = "[6-9][0-9]{9}";
    mobile.title = "Enter a valid 10-digit mobile number";
    mobile.maxLength = 10;
    mobile.inputMode = "numeric";
  }

  ["interested_course", "course_degree"].forEach((name) => {
    const input = form.querySelector(`input[name="${name}"]`);
    if (input) toSelect(input, [...data.courses, "Other"], "- Select a course -");
  });

  const stateInput = form.querySelector('input[name="state"]');
  const districtInput = form.querySelector('input[name="district"]');
  if (!stateInput || !districtInput) return;

  const state = toSelect(stateInput, data.states, "- Select state -");
  const district = toSelect(districtInput, [], DISTRICT_PLACEHOLDER);
  district.disabled = true;

  const other = form.querySelector('[name="district_other"]');
  const otherGroup = other?.closest(".ff-el-group");
  otherGroup?.classList.remove("has-conditions", "ff_excluded");

  const syncOther = () => {
    if (!otherGroup) return;
    const show = district.value === DISTRICT_NOT_LISTED;
    otherGroup.hidden = !show;
    if (!show) other.value = "";
  };
  state.addEventListener("change", () => {
    district.disabled = !state.value;
    setOptions(district, state.value ? [...data.districtsFor(state.value), DISTRICT_NOT_LISTED] : [], DISTRICT_PLACEHOLDER);
    syncOther();
  });
  district.addEventListener("change", syncOther);
  syncOther();
}
