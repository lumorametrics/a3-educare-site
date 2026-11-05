import { useEffect, useState } from "react";
import { getCollegeIndex, getCourseCategories, getCourses, getDistrictBySlug, getStateBySlug, withCollegeListingDetails } from "../services/wordpress";
import CollegeCategoryPage from "../components/college/CollegeCategoryPage";
import SplashScreen from "../components/ui/SplashScreen";
import StatusMessage from "../components/ui/StatusMessage";
import { toPlainText } from "../lib/text";
import { collegeListingJsonLd, useSeo } from "../lib/seo";
import { collegeCategorySlugs, collegeInDistrict, collegeUrl, districtCategoryUrl, districtUrl, sameName, stateCategoryUrl, stateUrl } from "../lib/urls";

/** /states/<state>/<district>/<category>: colleges in one district that belong to one course category. */
export default function DistrictCategory({ stateSlug, districtSlug, categorySlug }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    Promise.all([getDistrictBySlug(districtSlug), getStateBySlug(stateSlug), getCourseCategories(), getCollegeIndex(), getCourses().catch(() => [])])
      .then(async ([districts, states, categories, colleges, courses]) => {
        const district = districts[0], state = states[0];
        const category = categories.find((item) => item.slug === categorySlug);
        // The district must belong to the state in the URL, otherwise the URL is not a real page.
        if (!district || !state || !category || district.stateSlug !== stateSlug) { if (active) setStatus("not-found"); return; }
        const inDistrict = colleges.filter((college) => collegeInDistrict(college, district));
        const counts = Object.fromEntries(categories.map((item) => [item.slug, inDistrict.filter((college) => collegeCategorySlugs(college, categories).includes(item.slug)).length]));
        const local = inDistrict.filter((college) => collegeCategorySlugs(college, categories).includes(categorySlug));
        const localIds = new Set(local.map((college) => college.id));
        const stateName = toPlainText(state.title?.rendered);
        const inState = colleges.filter((college) => sameName(college.acf?.state, stateName) && !localIds.has(college.id) && collegeCategorySlugs(college, categories).includes(categorySlug));
        const [matching, elsewhere] = await Promise.all([withCollegeListingDetails(local), withCollegeListingDetails(inState.slice(0, 6))]);
        if (!active) return;
        setData({ district, state, category, categories, counts, matching, elsewhere, stateTotal: inState.length, courses });
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        console.error("Unable to load the district category page:", error);
        setStatus("error");
      });
    return () => { active = false; };
  }, [stateSlug, districtSlug, categorySlug]);

  const districtName = toPlainText(data?.district?.title?.rendered);
  const stateName = toPlainText(data?.state?.title?.rendered);
  const categoryName = toPlainText(data?.category?.name);
  const lower = categoryName.toLowerCase();
  const count = data?.matching?.length || 0;
  const breadcrumb = [
    { label: "Home", href: "/" }, { label: "States", href: "/states" },
    { label: stateName, href: stateUrl(stateSlug) },
    { label: districtName, href: data ? districtUrl(data.district, stateSlug) : "" },
    { label: `${categoryName} Colleges` },
  ];
  useSeo(data ? {
    title: `${categoryName} Colleges in ${districtName}${districtName === stateName ? " District" : ""}`,
    description: count
      ? `Compare ${count} ${lower} ${count === 1 ? "college" : "colleges"} in ${districtName}, ${stateName}: locations, admission routes, fee details and guidance from A3 EduCare Hub.`
      : `${categoryName} courses and admission guidance for students in ${districtName}, ${stateName}, with colleges elsewhere in the state from A3 EduCare Hub.`,
    jsonLd: collegeListingJsonLd(breadcrumb, data.matching, collegeUrl),
  } : null);

  if (status === "loading") return <SplashScreen label="Loading colleges" />;
  if (status === "error") return <StatusMessage page tone="error" title="Something went wrong">This page could not be loaded from WordPress.</StatusMessage>;
  if (status === "not-found") return <StatusMessage page title="Page not found" action={<a className="btn btn-dark mt-2" href="/states">All states</a>}>This district or course category could not be found.</StatusMessage>;

  const { district, state, category, categories, counts, matching, elsewhere, stateTotal, courses } = data;
  const fields = district.acf || {};
  const hasOwnImage = fields.district_image && typeof fields.district_image === "object";
  return (
    <CollegeCategoryPage
      breadcrumb={breadcrumb}
      eyebrow={`${districtName} · ${stateName} · ${categoryName}`}
      title={<>{categoryName} Colleges in <em>{districtName}</em></>}
      description={`Explore ${lower} colleges and courses in ${districtName}, ${stateName}, with admissions information and guidance.`}
      placeName={districtName}
      categoryName={categoryName}
      categorySlug={categorySlug}
      placeIntro={toPlainText(fields.district_summary) || toPlainText(fields.district_short_introduction)}
      image={hasOwnImage ? fields.district_image : state.acf?.state_image}
      imageAlt={hasOwnImage ? districtName : stateName}
      colleges={matching}
      elsewhere={elsewhere}
      elsewhereTitle={<>{categoryName} colleges elsewhere in <em>{stateName}</em></>}
      elsewhereDescription={stateTotal > elsewhere.length ? `Showing ${elsewhere.length} of ${stateTotal}. See the state page for the full list.` : `These profiles are in ${stateName}, outside ${districtName}.`}
      elsewhereHref={{ href: stateCategoryUrl(stateSlug, categorySlug), label: `${categoryName} colleges in ${stateName}` }}
      courses={courses.filter((course) => course.categorySlug === category.slug)}
      otherCategories={categories.filter((item) => item.slug !== categorySlug).map((item) => ({ label: `${toPlainText(item.name)} Colleges`, href: districtCategoryUrl(stateSlug, districtSlug, item.slug), count: counts[item.slug] }))}
      parentHref={districtUrl(district, stateSlug)}
      parentLabel={`${districtName} guide`}
    />
  );
}
