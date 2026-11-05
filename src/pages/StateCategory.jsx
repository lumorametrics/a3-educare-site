import { useEffect, useState } from "react";
import { getCollegeIndex, getCourseCategories, getCourses, getStateBySlug, withCollegeListingDetails } from "../services/wordpress";
import CollegeCategoryPage from "../components/college/CollegeCategoryPage";
import SplashScreen from "../components/ui/SplashScreen";
import StatusMessage from "../components/ui/StatusMessage";
import { toPlainText } from "../lib/text";
import { collegeListingJsonLd, useSeo } from "../lib/seo";
import { collegeCategorySlugs, collegeUrl, sameName, stateCategoryUrl, stateUrl } from "../lib/urls";

/** /states/<state>/<category>-colleges: colleges of one state that belong to one course category. */
export default function StateCategory({ stateSlug, categorySlug }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    Promise.all([getStateBySlug(stateSlug), getCourseCategories(), getCollegeIndex(), getCourses().catch(() => [])])
      .then(async ([states, categories, colleges, courses]) => {
        const state = states[0];
        const category = categories.find((item) => item.slug === categorySlug);
        if (!state || !category) { if (active) setStatus("not-found"); return; }
        const name = toPlainText(state.title?.rendered);
        const inState = colleges.filter((college) => sameName(college.acf?.state, name));
        const counts = Object.fromEntries(categories.map((item) => [item.slug, inState.filter((college) => collegeCategorySlugs(college, categories).includes(item.slug)).length]));
        const local = inState.filter((college) => collegeCategorySlugs(college, categories).includes(categorySlug));
        // Only used when the state has none: the same category's colleges in other states, capped so the page stays light.
        const others = local.length ? [] : colleges.filter((college) => collegeCategorySlugs(college, categories).includes(categorySlug)).slice(0, 6);
        const [matching, elsewhere] = await Promise.all([withCollegeListingDetails(local), withCollegeListingDetails(others)]);
        if (!active) return;
        setData({ state, category, categories, counts, matching, elsewhere, courses });
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        console.error("Unable to load the state category page:", error);
        setStatus("error");
      });
    return () => { active = false; };
  }, [stateSlug, categorySlug]);

  const stateName = toPlainText(data?.state?.title?.rendered);
  const categoryName = toPlainText(data?.category?.name);
  const breadcrumb = [{ label: "Home", href: "/" }, { label: "States", href: "/states" }, { label: stateName, href: stateUrl(stateSlug) }, { label: `${categoryName} Colleges` }];
  const count = data?.matching?.length || 0;
  useSeo(data ? {
    title: `${categoryName} Colleges in ${stateName}`,
    description: count
      ? `Compare ${count} ${categoryName.toLowerCase()} ${count === 1 ? "college" : "colleges"} in ${stateName}: locations, admission routes, fee details and guidance from A3 EduCare Hub.`
      : `${categoryName} courses and admission guidance for students in ${stateName}, with options to explore from A3 EduCare Hub.`,
    jsonLd: collegeListingJsonLd(breadcrumb, data.matching, collegeUrl),
  } : null);

  if (status === "loading") return <SplashScreen label="Loading colleges" />;
  if (status === "error") return <StatusMessage page tone="error" title="Something went wrong">This page could not be loaded from WordPress.</StatusMessage>;
  if (status === "not-found") return <StatusMessage page title="Page not found" action={<a className="btn btn-dark mt-2" href="/states">All states</a>}>This state or course category could not be found.</StatusMessage>;

  const { state, category, categories, counts, matching, elsewhere, courses } = data;
  return (
    <CollegeCategoryPage
      breadcrumb={breadcrumb}
      eyebrow={`${stateName} · ${categoryName}`}
      title={<>{categoryName} Colleges in <em>{stateName}</em></>}
      description={`Explore ${categoryName.toLowerCase()} colleges and courses in ${stateName}, with admissions information and guidance.`}
      placeName={stateName}
      categoryName={categoryName}
      categorySlug={categorySlug}
      placeIntro={toPlainText(state.acf?.state_short_introduction)}
      image={state.acf?.state_image}
      imageAlt={stateName}
      colleges={matching}
      elsewhere={elsewhere}
      elsewhereTitle={<>{categoryName} colleges in <em>other states</em></>}
      elsewhereDescription={`These profiles are from other states, as there is no ${categoryName.toLowerCase()} college profile for ${stateName} yet.`}
      courses={courses.filter((course) => course.categorySlug === category.slug)}
      otherCategories={categories.filter((item) => item.slug !== categorySlug).map((item) => ({ label: `${toPlainText(item.name)} Colleges`, href: stateCategoryUrl(stateSlug, item.slug), count: counts[item.slug] }))}
      parentHref={stateUrl(stateSlug)}
      parentLabel={`${stateName} guide`}
    />
  );
}
