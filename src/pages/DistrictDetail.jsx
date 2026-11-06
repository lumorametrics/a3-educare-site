import { useEffect, useState } from "react";
import { getCourseCategories, getDistrictBySlug, getDistricts, getStateBySlug, getStates } from "../services/wordpress";
import { toPlainText } from "../lib/text";
import SplashScreen from "../components/ui/SplashScreen";
import PlaceHero from "../components/state/PlaceHero";
import FaqAccordion from "../components/ui/FaqAccordion";
import StatusMessage from "../components/ui/StatusMessage";
import CtaBand from "../components/ui/CtaBand";
import Reveal from "../components/ui/Reveal";
import { ArrowUpRight, Building, Check, MapPin } from "../components/ui/Icons";
import { useSeo } from "../lib/seo";
import { districtCategoryUrl, districtUrl, stateUrl } from "../lib/urls";
import { getHeroImage } from "../lib/collegeImage";


// Text sections in display order: [ACF key, heading]
const SECTIONS = [
  ["district_overview", "Overview"],
  ["education_overview", "Education landscape"],
  ["technical_institutions", "Technical & vocational education"],
  ["admission_overview", "Admissions"],
  ["scholarships", "Scholarships"],
  ["education_resources", "Official resources"],
];

function splitList(value, separator) {
  return toPlainText(value).split(separator).map((item) => item.trim()).filter(Boolean);
}

function slugify(value = "") {
  return toPlainText(value).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getFaqs(fields) {
  const items = [];
  for (let index = 1; index <= 10; index += 1) {
    const question = fields[`faq_${index}_question`];
    const answer = fields[`faq_${index}_answer`];
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

/** `stateSlug` is the state in the URL (/states/<state>/<district>); a district under another state is not found. */
export default function DistrictDetail({ slug, stateSlug: urlStateSlug }) {
  const [district, setDistrict] = useState(null);
  const [status, setStatus] = useState("loading");
  const [nearby, setNearby] = useState([]);
  const [stateSlug, setStateSlug] = useState("");
  const [categories, setCategories] = useState([]);
  const [stateImage, setStateImage] = useState(null);

  useEffect(() => {
    let active = true;
    getDistrictBySlug(slug)
      .then((items) => {
        if (!active) return;
        const found = items[0] && (!urlStateSlug || items[0].stateSlug === urlStateSlug) ? items[0] : null;
        // Old /districts/<district> links move to /states/<state>/<district>.
        if (found && !urlStateSlug && found.stateSlug) window.history.replaceState(null, "", districtUrl(found));
        setDistrict(found);
        setStatus(found ? "ready" : "not-found");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load district details:", requestError);
        setStatus("error");
      });
    return () => { active = false; };
  }, [slug, urlStateSlug]);

  useEffect(() => {
    let active = true;
    getCourseCategories().then((items) => active && setCategories(items)).catch(() => {});
    return () => { active = false; };
  }, []);

  // Secondary data (other districts in the state, link to the state guide) never blocks the page.
  const stateName = district?.acf?.state_name || "";
  useEffect(() => {
    if (!stateName) return undefined;
    let active = true;
    Promise.allSettled([getDistricts(), getStates()]).then(([districts, states]) => {
      if (!active) return;
      if (districts.status === "fulfilled") {
        setNearby(districts.value.filter((item) => item.acf?.state_name === stateName && item.slug !== slug).slice(0, 12));
      }
      if (states.status === "fulfilled") {
        const wanted = slugify(stateName);
        setStateSlug(states.value.find((item) => item.slug === wanted || slugify(item.title?.rendered) === wanted)?.slug || "");
      }
    });
    return () => { active = false; };
  }, [stateName, slug]);

  // A district without its own photo uses its state's, as the district category pages do.
  const needsStateImage = status === "ready" && !(district?.acf?.district_image && typeof district.acf.district_image === "object");
  const stateForImage = district?.stateSlug || stateSlug;
  useEffect(() => {
    if (!needsStateImage || !stateForImage) return undefined;
    let active = true;
    getStateBySlug(stateForImage).then((items) => active && setStateImage(items[0]?.acf?.state_image || null)).catch(() => {});
    return () => { active = false; };
  }, [needsStateImage, stateForImage]);

  useSeo(district ? {
    title: `${toPlainText(district.title?.rendered)} education guide`,
    description: district.acf?.district_short_introduction,
  } : null);

  if (status === "loading") return <SplashScreen label="Loading district guide" />;
  if (status === "error") return <StatusMessage page tone="error" title="Something went wrong">District details could not be loaded from WordPress.</StatusMessage>;
  if (!district) return <StatusMessage page title="District not found" action={<a className="btn btn-dark mt-2" href="/states">All states</a>}>This district could not be found.</StatusMessage>;

  const resolvedState = district.stateSlug || stateSlug;
  const fields = district.acf || {};
  const title = toPlainText(district.title?.rendered) || "District";
  const intro = toPlainText(fields.district_short_introduction);
  const courses = splitList(fields.popular_courses, /,|;/);
  const colleges = splitList(fields.colleges_universities, ";");
  const sections = SECTIONS.map(([key, heading]) => [heading, toPlainText(fields[key])]).filter(([, text]) => text);
  const faqs = getFaqs(fields);
  const heroImage = getHeroImage(fields.district_image, title) || getHeroImage(stateImage, stateName || title);
  const officialSource = /^https?:\/\//i.test(fields.official_source || "") ? fields.official_source : "";
  const facts = [
    ["State", fields.state_name, MapPin],
    ["Type", fields.district_type, Building],
    ["Headquarters", fields.headquarters, MapPin],
  ].filter(([, value]) => value);

  return (
    <main>
      <PlaceHero
        cardsBelow={facts.length > 0}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "States", href: "/states" }, ...(stateName && resolvedState ? [{ label: stateName, href: stateUrl(resolvedState) }] : []), { label: title }]}
        eyebrow={stateName ? `${stateName} · District education guide` : "District education guide"}
        title={title}
        description={intro}
        image={heroImage}
        actions={(
          <>
            <a className="btn bg-accent text-ink-950 hover:-translate-y-0.5 hover:brightness-110" href="/#contact">Get guidance <ArrowUpRight /></a>
            {officialSource && <a className="btn btn-ghost-light" href={officialSource} target="_blank" rel="noreferrer">Official source <ArrowUpRight /></a>}
          </>
        )}
      />

      {facts.length > 0 && (
        <section className="shell relative -mt-14 sm:-mt-16">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {facts.map(([label, value, Icon], index) => (
              <Reveal key={label} delay={index * 60} className="card min-w-0 p-5 sm:p-6">
                <dt className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium tracking-wide text-ink-500 uppercase">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-4" /></span>
                  {label}
                </dt>
                <dd className="mt-2 min-w-0">
                  {label === "State" && resolvedState
                    ? <a className="font-semibold text-ink-900 underline decoration-brand-200 underline-offset-4 hover:text-brand-700" href={stateUrl(resolvedState)}>{value}</a>
                    : <span className="block truncate font-semibold text-ink-900">{value}</span>}
                </dd>
              </Reveal>
            ))}
          </dl>
        </section>
      )}

      <section className="shell section-y grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
        <div className="flex min-w-0 flex-col gap-5">
          {sections.map(([heading, text], index) => (
            <Reveal as="section" className="card p-6 sm:p-8" key={heading}>
              <div className="mb-4 flex items-center gap-3">
                <span className="font-display text-sm text-brand-700">{String(index + 1).padStart(2, "0")}</span>
                <span className="h-px w-8 bg-brand-200" />
                <h2 className="font-display text-xl font-semibold sm:text-2xl">{heading}</h2>
              </div>
              <p className="text-ink-600">{text}</p>
            </Reveal>
          ))}
        </div>
        <aside className="flex flex-col gap-5">
          {courses.length > 0 && (
            <Reveal as="section" className="card p-6">
              <h2 className="mb-4 font-display text-xl font-semibold">Popular courses</h2>
              <ul className="flex flex-wrap gap-2">
                {courses.map((course) => <li className="chip px-3 py-1.5 text-xs capitalize" key={course}>{course}</li>)}
              </ul>
              <a className="link-arrow mt-5" href="/courses">Explore courses <ArrowUpRight /></a>
            </Reveal>
          )}
          {colleges.length > 0 && (
            <Reveal as="section" className="card p-6">
              <h2 className="mb-4 font-display text-xl font-semibold">Colleges &amp; universities</h2>
              <ul className="flex flex-col gap-2.5 text-sm text-ink-700">
                {colleges.map((college) => <li className="flex gap-2.5" key={college}><Check className="mt-0.5 size-4 shrink-0 text-brand-600" />{college}</li>)}
              </ul>
            </Reveal>
          )}
        </aside>
      </section>

      {resolvedState && categories.length > 0 && (
        <section className="shell pb-4">
          <h2 className="mb-4 font-display text-xl font-semibold sm:text-2xl">Colleges in {title} by <em>category</em></h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}><a className="chip hover:border-brand-600 hover:text-brand-700" href={districtCategoryUrl(resolvedState, district.slug, category.slug)}>{toPlainText(category.name)}</a></li>
            ))}
          </ul>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="section-y bg-white">
          <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="eyebrow mb-3">Need to know</p>
              <h2 className="heading-display text-3xl sm:text-4xl">Frequently Asked <em>Questions</em></h2>
            </div>
            <FaqAccordion items={faqs} />
          </div>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="shell section-y">
          <div className="mb-10">
            <p className="eyebrow mb-3">Explore more</p>
            <h2 className="heading-display text-3xl sm:text-4xl">More districts in <em>{stateName}</em></h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.map((item) => (
              <a className="group card-interactive flex items-center justify-between gap-3 p-5" href={districtUrl(item)} key={item.id}>
                <span>
                  <strong className="block font-semibold text-ink-900">{toPlainText(item.title?.rendered)}</strong>
                  <small className="text-xs text-ink-500">View district guide</small>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />
              </a>
            ))}
          </div>
        </section>
      )}

      <div className={faqs.length > 0 && !nearby.length ? "pt-20 sm:pt-24" : ""}>
        <CtaBand
          eyebrow="Need guidance?"
          title={toPlainText(fields.cta_heading) || <>Looking for colleges <em>in {title}?</em></>}
          description={toPlainText(fields.cta_description) || "Explore colleges, courses and admission information with A3 Educare Hub."}
        />
      </div>
    </main>
  );
}
