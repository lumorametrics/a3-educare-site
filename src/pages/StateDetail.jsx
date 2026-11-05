import { useEffect, useMemo, useState } from "react";
import { getColleges, getCourseCategories, getDistricts, getStateBySlug, getStates } from "../services/wordpress";
import SplashScreen from "../components/ui/SplashScreen";
import StateHero from "../components/state/StateHero";
import SectionHeading from "../components/ui/SectionHeading";
import FaqAccordion from "../components/ui/FaqAccordion";
import StatusMessage from "../components/ui/StatusMessage";
import CtaBand from "../components/ui/CtaBand";
import Reveal from "../components/ui/Reveal";
import { ArrowUpRight, Award, Book, Building, Globe, Graduation, MapPin, Shield, Sparkle } from "../components/ui/Icons";
import { toPlainText } from "../lib/text";
import { useSeo } from "../lib/seo";
import CollegeImage from "../components/college/CollegeImage";

import { parseCredit, resolveCollegeImage } from "../lib/collegeImage";
import { districtUrl, stateCategoryUrl } from "../lib/urls";

/** ACF text fields are plain text for most states and HTML for some: always return safe HTML. */
function asHtml(value) {
  const source = String(value || "").trim();
  if (!source) return "";
  if (/<[a-z][\s\S]*>/i.test(source)) return source;
  const escaped = source.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.split(/\n{2,}/).map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`).join("");
}

function getFaqs(fields) {
  return Object.keys(fields)
    .map((key) => key.match(/^faq_(\d+)_question$/)?.[1])
    .filter(Boolean)
    .sort((a, b) => a - b)
    .map((n) => ({ question: toPlainText(fields[`faq_${n}_question`]), answer: asHtml(fields[`faq_${n}_answer`]) }))
    .filter((faq) => faq.question && faq.answer);
}

// "Engineering and technology; medicine and allied health; …" -> course-directory categories.
const CATEGORY_KEYWORDS = [
  [/engineer|technolog|architect/i, "engineering", Building],
  [/medic|allied health|dental|mbbs/i, "medical", Shield],
  [/paramedic/i, "paramedical", Shield],
  [/pharm/i, "pharmacy", Sparkle],
  [/nurs/i, "nursing", Shield],
  [/manage|business|commerce/i, "management", Award],
  [/\blaw\b|legal/i, "law", Book],
  [/agricult/i, "agriculture", Globe],
  [/diploma|vocational|polytechnic|technical/i, "diploma", Graduation],
  [/science|arts|humanities|education|computer/i, "academic", Graduation],
];

function parseCourseAreas(value) {
  const text = toPlainText(value);
  if (!text.includes(";")) return [];
  return text
    .split(";")
    .map((item) => item.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .map((item) => {
      const match = CATEGORY_KEYWORDS.find(([pattern]) => pattern.test(item));
      return { label: item.charAt(0).toUpperCase() + item.slice(1), category: match?.[1], Icon: match?.[2] || Graduation };
    });
}

function getImage(value) {
  if (!value || /^\d+$/.test(String(value))) return null;
  if (typeof value === "string") return { url: value, alt: "", credit: "" };
  const url = value.sizes?.large?.source_url || value.media_details?.sizes?.large?.source_url || value.url || value.source_url;
  if (!url) return null;
  return { url, alt: value.alt || value.alt_text || "", credit: parseCredit(value) };
}

const sameState = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

export default function StateDetail({ slug }) {
  const [state, setState] = useState(null);
  const [status, setStatus] = useState("loading");
  // Related collections are nice-to-have: each section simply stays hidden if its request fails.
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAllDistricts, setShowAllDistricts] = useState(false);

  useEffect(() => {
    let active = true;
    const soft = (request, setter, what) => request
      .then((value) => active && setter(Array.isArray(value) ? value : []))
      .catch((requestError) => console.error(`Unable to load ${what}:`, requestError));
    soft(getStates(), setStates, "related states");
    soft(getDistricts(), setDistricts, "districts");
    soft(getColleges(), setColleges, "colleges");
    soft(getCourseCategories(), setCategories, "course categories");
    getStateBySlug(slug)
      .then((items) => {
        if (!active) return;
        setState(items[0] || null);
        setStatus(items[0] ? "ready" : "not-found");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load state details:", requestError);
        setStatus("error");
      });
    return () => { active = false; };
  }, [slug]);

  const fields = useMemo(() => state?.acf || {}, [state]);
  const title = toPlainText(state?.title?.rendered || "State");
  const faqs = useMemo(() => getFaqs(fields), [fields]);

  useSeo(state ? {
    title: `Higher Education in ${title}`,
    description: fields.state_short_introduction || `Explore education, colleges, courses and admission information for ${title}.`,
    image: getImage(fields.state_image)?.url,
    jsonLd: faqs.length ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: toPlainText(faq.answer) } })),
    } : undefined,
  } : null);

  if (status === "loading") return <SplashScreen label="Loading state details" />;
  if (status === "error") return <StatusMessage page tone="error" title="Something went wrong">State details could not be loaded from WordPress.</StatusMessage>;
  if (!state) return <StatusMessage page title="State not found" action={<a className="btn btn-dark mt-2" href="/states">All states</a>}>This state could not be found.</StatusMessage>;

  const image = getImage(fields.state_image);
  const facts = [
    ["Capital", fields.capital, MapPin],
    ["Type", fields.state_type, Building],
    ["Established", fields.established, Award],
  ].filter(([, value]) => value);
  const overview = asHtml(fields.state_overview);
  const stateDistricts = districts.filter((item) => sameState(item.acf?.state_name, title)).sort((a, b) => toPlainText(a.title?.rendered).localeCompare(toPlainText(b.title?.rendered)));
  const categorySlugs = new Set(categories.filter((item) => item.count > 0).map((item) => item.slug));
  const courseAreas = parseCourseAreas(fields.popular_courses);
  const stateColleges = colleges.filter((item) => sameState(item.acf?.state, title));
  const considerations = [
    ["Admissions", fields.admission_overview],
    ["Scholarships", fields.scholarships],
    ["Education resources", fields.state_education_resources],
  ].filter(([, value]) => value);
  const officialSource = /^https?:\/\//i.test(fields.official_source || "") ? fields.official_source : "";
  const related = states.filter((item) => item.slug !== state.slug).slice(0, 8);
  // Large states have dozens of districts (Uttar Pradesh: 75); show a first screenful, then the rest on request.
  const DISTRICT_PREVIEW = 24;
  const visibleDistricts = showAllDistricts ? stateDistricts : stateDistricts.slice(0, DISTRICT_PREVIEW);

  return (
    <main>
      <StateHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "States", href: "/states" }, { label: title }]}
        eyebrow={fields.state_type ? `${fields.state_type} education guide` : "State education guide"}
        title={<>Higher Education in <em>{title}</em></>}
        description={toPlainText(fields.state_short_introduction) || `Explore education, colleges, courses and admission information for ${title}.`}
        facts={facts.map(([label, value, Icon]) => [label, toPlainText(value), Icon])}
        image={image}
      />

      {overview && (
        <section className="section-y bg-white">
          <div className="shell">
            <SectionHeading eyebrow="Overview" title={<>Higher Education <em>Landscape</em></>} />
            <Reveal className="wp-content prose-lg" dangerouslySetInnerHTML={{ __html: overview }} />
          </div>
        </section>
      )}

      {stateDistricts.length > 0 && (
        <section className="shell section-y">
          <SectionHeading
            eyebrow="District guides"
            title={<>Districts in <em>{title}</em></>}
            description={`${stateDistricts.length} district guide${stateDistricts.length === 1 ? "" : "s"} with local colleges, courses and admission information.`}
          />
          <Reveal as="ul" id="state-districts" className="flex flex-wrap gap-2.5">
            {visibleDistricts.map((district) => (
              <li key={district.id}>
                <a className="chip gap-1.5 hover:border-brand-600 hover:text-brand-800" href={districtUrl(district, slug)}>
                  <MapPin className="size-3.5 text-brand-600" />
                  {toPlainText(district.title?.rendered)}
                </a>
              </li>
            ))}
          </Reveal>
          {stateDistricts.length > DISTRICT_PREVIEW && (
            <button
              type="button"
              className="btn btn-outline mt-6"
              aria-expanded={showAllDistricts}
              aria-controls="state-districts"
              onClick={() => setShowAllDistricts((value) => !value)}
            >
              {showAllDistricts ? "Show fewer districts" : `Show all ${stateDistricts.length} districts`}
            </button>
          )}
        </section>
      )}

      {courseAreas.length === 0 && fields.popular_courses && (
        <section className="section-y bg-white">
          <div className="shell">
            <SectionHeading eyebrow="Popular study areas" title={<>Explore by <em>Course Category</em></>} action={<a className="link-arrow" href="/courses">View all courses <ArrowUpRight /></a>} />
            <Reveal className="card p-6 sm:p-8">
              <div className="wp-content max-w-none" dangerouslySetInnerHTML={{ __html: asHtml(fields.popular_courses) }} />
            </Reveal>
          </div>
        </section>
      )}

      {courseAreas.length > 0 && (
        <section className="section-y bg-white">
          <div className="shell">
            <SectionHeading
              eyebrow="Popular study areas"
              title={<>Explore by <em>Course Category</em></>}
              description={`Programme areas students commonly pursue in ${title}.`}
              action={<a className="link-arrow" href="/courses">View all courses <ArrowUpRight /></a>}
            />
            <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courseAreas.map(({ label, category, Icon }, index) => {
                const linked = category && categorySlugs.has(category);
                const content = (
                  <>
                    <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white"><Icon className="size-5" /></span>
                    <span className="min-w-0 flex-1 font-semibold break-words text-ink-900">{label}</span>
                    {linked && <ArrowUpRight className="size-4 shrink-0 text-ink-300 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />}
                  </>
                );
                return (
                  <Reveal as="li" key={label} delay={(index % 4) * 50}>
                    {linked
                      ? <a className="group card-interactive flex h-full items-center gap-4 p-4 sm:p-5" href={stateCategoryUrl(slug, category)}>{content}</a>
                      : <div className="card flex h-full items-center gap-4 p-4 sm:p-5">{content}</div>}
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {(fields.colleges_universities || stateColleges.length > 0) && (
        <section className="shell section-y">
          <SectionHeading
            eyebrow="Institutions"
            title={<>Colleges &amp; <em>Universities</em></>}
            action={stateColleges.length > 0 ? <a className="link-arrow" href="/colleges">All college profiles <ArrowUpRight /></a> : null}
          />
          {fields.colleges_universities && (
            <Reveal className="card mb-8 p-6 sm:p-8">
              <p className="eyebrow mb-3">Prominent institutions</p>
              <div className="wp-content max-w-none" dangerouslySetInnerHTML={{ __html: asHtml(fields.colleges_universities) }} />
            </Reveal>
          )}
          {stateColleges.length > 0 && (
            <>
              <h3 className="mb-4 text-lg font-semibold">College profiles in {title} <span className="font-normal text-ink-400">({stateColleges.length})</span></h3>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stateColleges.map((college, index) => {
                  const location = toPlainText(college.acf?.college_location || college.acf?.location || college.acf?.city || "");
                  return (
                    <Reveal as="li" key={college.id} delay={(index % 3) * 50}>
                      <a className="group card-interactive flex h-full items-center justify-between gap-3 p-4 sm:p-5" href={`/colleges/${college.slug}`}>
                        <CollegeImage image={resolveCollegeImage(college.acf || {})} ratio={1} sizes="64px" className="size-14 shrink-0 rounded-xl sm:size-16" />
                        <span className="min-w-0 flex-1">
                          <strong className="block font-semibold break-words text-ink-900" dangerouslySetInnerHTML={{ __html: college.title?.rendered || "College" }} />
                          {location && <small className="mt-0.5 flex items-center gap-1 text-xs text-ink-400"><MapPin className="size-3.5 shrink-0" /><span className="truncate">{location}</span></small>}
                        </span>
                        <ArrowUpRight className="size-4 shrink-0 text-ink-300 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />
                      </a>
                    </Reveal>
                  );
                })}
              </ul>
              
            </>
          )}
        </section>
      )}

      {(considerations.length > 0 || officialSource) && (
        <section className="section-y bg-white">
          <div className="shell">
            <SectionHeading eyebrow="Before you apply" title={<>Student <em>Considerations</em></>} />
            <ul className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {considerations.map(([label, value], index) => (
                <Reveal as="li" key={label} delay={index * 70} className="card h-full p-6 sm:p-7">
                  <h3 className="flex items-center gap-2.5 text-lg font-semibold">
                    <span aria-hidden="true" className="size-2 rounded-full bg-brand-500" />
                    {label}
                  </h3>
                  <div className="wp-content mt-3 max-w-none" dangerouslySetInnerHTML={{ __html: asHtml(value) }} />
                </Reveal>
              ))}
            </ul>
            {officialSource && (
              <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-500">
                <Shield className="size-4 text-brand-700" />
                Official education portal:
                <a className="font-medium break-all text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-600" href={officialSource} target="_blank" rel="noopener noreferrer">
                  {officialSource.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              </p>
            )}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="shell section-y">
          <SectionHeading eyebrow="FAQ" title={<>Frequently Asked <em>Questions</em></>} />
          <FaqAccordion items={faqs} />
        </section>
      )}

      {related.length > 0 && (
        <section className="section-y bg-white">
          <div className="shell">
            <SectionHeading
              eyebrow="Explore more"
              title={<>Explore Other <em>States</em></>}
              action={<a className="link-arrow" href="/states">All states &amp; UTs <ArrowUpRight /></a>}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <a className="group card-interactive flex items-center justify-between gap-3 p-5" href={`/states/${item.slug}`} key={item.id}>
                  <span className="min-w-0">
                    <strong className="block font-semibold text-ink-900">{toPlainText(item.title?.rendered || "State")}</strong>
                    <small className="text-xs text-ink-400">{item.acf?.capital ? `Capital: ${toPlainText(item.acf.capital)}` : "View education guide"}</small>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-ink-300 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="pt-20 sm:pt-24">
        <CtaBand
          eyebrow="Need guidance?"
          title={toPlainText(fields.cta_heading) || <>Looking for colleges in <em>{title}?</em></>}
          description={toPlainText(fields.cta_description) || "Browse by district or course category above."}
          actionLabel="Apply Now"
          actionHref="/#contact"
        />
      </div>
    </main>
  );
}
