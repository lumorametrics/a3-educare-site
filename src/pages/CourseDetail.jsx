import { useEffect, useState } from "react";
import { getCourseBySlug } from "../services/wordpress";
import SplashScreen from "../components/ui/SplashScreen";
import Breadcrumb from "../components/ui/Breadcrumb";
import FaqAccordion from "../components/ui/FaqAccordion";
import StatusMessage from "../components/ui/StatusMessage";
import CtaBand from "../components/ui/CtaBand";
import Reveal from "../components/ui/Reveal";
import FadeImage from "../components/ui/FadeImage";
import { ArrowUpRight, Book, Check, Clock, Graduation, Wallet } from "../components/ui/Icons";
import { toPlainText, truncateText } from "../lib/text";
import { organizationRef, useSeo } from "../lib/seo";
import { courseCategoryUrl, courseUrl } from "../lib/urls";
import { parseCredit } from "../lib/collegeImage";


function stripMarkup(value = "") {
  return toPlainText(value);
}

function valueFrom(fields, keys, fallback = "") {
  return keys.map((key) => fields[key]).find(Boolean) || fallback;
}

function getImageUrl(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value.url || value.source_url || value.sizes?.large?.source_url || "";
  return "";
}

function getCourseImage(course, fields) {
  return getImageUrl(valueFrom(fields, [
    "course_image", "course_banner", "course_cover", "hero_image", "featured_image", "image", "thumbnail",
  ]) || course._embedded?.["wp:featuredmedia"]?.[0] || course.featured_media_url);
}

function formatLabel(key) {
  return key
    .replace(/^(course_|acf_)/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderValue(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "object" ? Object.values(item).join(" — ") : item))
      .filter(Boolean)
      .join("<br />");
  }
  if (value && typeof value === "object") return Object.values(value).filter(Boolean).join(" — ");
  return "";
}

function isHtml(value) {
  return typeof value === "string" && /<\/?[a-z][\s\S]*>/i.test(value);
}

function collectApiFields(course, fields) {
  const excluded = new Set([
    "id", "date", "date_gmt", "modified", "modified_gmt", "slug", "status",
    "type", "link", "template", "guid", "title", "content", "excerpt",
    "author", "featured_media", "parent", "menu_order", "comment_status",
    "ping_status", "sticky", "format", "acf", "class_list", "_links", "_embedded",
    "category", "course_category", "categories",
  ]);
  return [
    ...Object.entries(course)
      .filter(([key, value]) => !excluded.has(key) && value !== null && value !== "" && value !== false)
      .map(([key, value]) => ({ key, label: formatLabel(key), value })),
    ...Object.entries(fields)
      .filter(([_key, value]) => value !== null && value !== "" && value !== false)
      .map(([key, value]) => ({ key: `acf-${key}`, label: formatLabel(key), value })),
  ];
}

function InfoSection({ title, children, index }) {
  return (
    <Reveal as="section" className="card p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-display text-sm text-brand-600">{String(index + 1).padStart(2, "0")}</span>
        <span className="h-px w-8 bg-brand-200" />
        <h3 className="font-display text-xl font-semibold sm:text-2xl">{title}</h3>
      </div>
      {children}
    </Reveal>
  );
}

function ApiField({ item, index }) {
  const value = item.value;
  const displayValue = renderValue(value);
  if (!displayValue) return null;

  return (
    <InfoSection title={item.label} index={index}>
      {isHtml(displayValue) ? (
        <div className="wp-content" dangerouslySetInnerHTML={{ __html: displayValue }} />
      ) : (
        <p className="text-ink-600">{displayValue.split("<br />").map((line, lineIndex) => <span key={`${item.key}-${lineIndex}`}>{line}{lineIndex < displayValue.split("<br />").length - 1 && <br />}</span>)}</p>
      )}
    </InfoSection>
  );
}

function getSections(fields) {
  const source = fields.sections || fields.course_sections || fields.course_information;
  if (Array.isArray(source)) return source
    .map((section) => ({
      title: section.title || section.heading || section.section_title,
      content: section.content || section.description || section.text,
    }))
    .filter((section) => section.title && section.content);
  const grouped = [
    ["Admissions & Eligibility", ["admission_process", "eligibility", "entrance_exams"]],
    ["Career Opportunities", ["career_options", "career_opportunities", "job_opportunities"]],
    ["Fees & Financial Information", ["fees_information", "fee_structure", "course_fee", "course_price"]],
  ];
  return grouped.map(([title, keys]) => ({
    title,
    content: keys.map((key) => fields[key]).filter(Boolean).map((value) => renderValue(value)).join(""),
  })).filter((section) => section.content);
}

function getFaqs(fields) {
  const source = fields.faqs || fields.faq || fields.course_faqs;
  if (Array.isArray(source)) {
    return source
      .map((faq) => ({
        question: faq.question || faq.faq_question || faq.title,
        answer: faq.answer || faq.faq_answer || faq.content,
      }))
      .filter((faq) => faq.question && faq.answer);
  }
  const items = [];
  for (let index = 1; index <= 10; index += 1) {
    const question = fields[`faq_${index}_question`] || fields[`faq_q${index}`] || fields[`faq_question_${index}`];
    const answer = fields[`faq_${index}_answer`] || fields[`faq_a${index}`] || fields[`faq_answer_${index}`];
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

function getAdditionalFields(fields) {
  const excluded = new Set([
    "course_overview", "course_short_introduction", "overview",
    "course_category_name", "category", "duration", "course_duration",
    "fees_information", "course_fee", "course_price", "eligibility",
    "eligibility_criteria", "course_eligibility", "sections",
    "course_sections", "course_information", "faqs", "faq", "course_faqs",
    "course_image", "course_banner", "course_cover", "hero_image", "featured_image", "image", "thumbnail",
    "admission_process", "entrance_exams", "career_options", "career_opportunities",
    "job_opportunities", "fee_structure", "official_source", "official_website",
    "website", "cta_heading", "cta_description",
  ]);
  return Object.entries(fields)
    .filter(([key, value]) => !excluded.has(key) && !/^faq(?:_|$)/i.test(key) && value !== null && value !== "" && value !== false)
    .map(([key, value]) => ({ label: formatLabel(key), value: renderValue(value) }))
    .filter((item) => item.value);
}

/** `category` is the category in the URL (/courses/<category>/<course>); a course under another category is not found. */
export default function CourseDetail({ slug, category: urlCategory }) {
  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    getCourseBySlug(slug)
      .then((items) => {
        if (!active) return;
        const found = items[0] && (!urlCategory || items[0].categorySlug === urlCategory) ? items[0] : null;
        if (found && !urlCategory && found.categorySlug) window.history.replaceState(null, "", courseUrl(found));
        setCourse(found);
        setStatus(found ? "ready" : "not-found");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load course details:", requestError);
        setStatus("error");
      });
    return () => { active = false; };
  }, [slug, urlCategory]);

  useSeo(course ? {
    title: toPlainText(course.title?.rendered),
    description: course.acf?.course_short_introduction || course.acf?.course_overview,
    image: getCourseImage(course, course.acf || {}) || undefined,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Course",
      name: toPlainText(course.title?.rendered),
      description: truncateText(course.acf?.course_short_introduction || course.acf?.course_overview, 300),
      provider: organizationRef(),
    },
  } : null);

  if (status === "loading") return <SplashScreen label="Loading course details" />;
  if (status === "error") return <StatusMessage page tone="error" title="Something went wrong">Course details could not be loaded from WordPress.</StatusMessage>;
  if (!course) return <StatusMessage page title="Course not found" action={<a className="btn btn-dark mt-2" href="/courses">Browse courses</a>}>This course could not be found.</StatusMessage>;

  const fields = course.acf || {};
  const title = course.title?.rendered || "Course";
  const image = getCourseImage(course, fields);
  const heroField = typeof fields.hero_image === "object" ? fields.hero_image : null;
  const credit = heroField ? parseCredit(heroField) : null;
  const heroAlt = heroField?.alt || "";
  const overview = valueFrom(fields, ["course_overview", "course_short_introduction", "overview"], course.excerpt?.rendered || "");
  const sections = getSections(fields);
  const faqs = getFaqs(fields);
  // course_category terms arrive via _embed=wp:term; ACF/legacy names remain as fallbacks.
  const categoryTerm = (course._embedded?.["wp:term"] || []).flat().find((term) => term?.taxonomy === "course_category");
  const category = valueFrom(fields, ["course_category_name", "category"], categoryTerm?.name || course.course_category_name || "Course guide");
  const duration = valueFrom(fields, ["duration", "course_duration"], "Not published");
  const fees = valueFrom(fields, ["fees_information", "course_fee", "course_price"], "Not published");
  const eligibility = valueFrom(fields, ["eligibility", "eligibility_criteria", "course_eligibility"], "");
  const additionalFields = getAdditionalFields(fields);
  const displayedFieldKeys = new Set([
    "course_overview", "course_short_introduction", "overview",
    "course_category_name", "category", "duration", "course_duration",
    "fees_information", "course_fee", "course_price", "eligibility",
    "eligibility_criteria", "course_eligibility", "sections",
    "course_sections", "course_information", "faqs", "faq", "course_faqs",
    "admission_process", "entrance_exams", "career_options", "career_opportunities",
    "job_opportunities", "fee_structure", "official_source", "official_website",
    "website", "cta_heading", "cta_description",
    "course_image", "course_banner", "course_cover", "hero_image", "featured_image", "image", "thumbnail", "featured_media",
  ]);
  const apiFields = collectApiFields(course, fields).filter((item) => {
    const fieldKey = item.key.replace(/^acf-/, "");
    return !displayedFieldKeys.has(fieldKey) &&
      !/^faq(?:_|$)/i.test(fieldKey) &&
      !additionalFields.some((field) => field.label === item.label);
  });
  const postContent = course.content?.rendered || "";
  const officialSource = valueFrom(fields, ["official_source", "official_website", "website"]);

  const facts = [
    ["Category", category, Book],
    ["Duration", duration, Clock],
    ["Fees", stripMarkup(String(fees)), Wallet],
    ["Eligibility", stripMarkup(eligibility) || "Check current admission notice", Graduation],
  ];
  let sectionIndex = 0;
  const nextIndex = () => sectionIndex++;

  return (
    <main>
      <section className="relative overflow-hidden bg-linear-to-br from-brand-50 via-sand-50 to-gold-100/40">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full bg-brand-200/40 blur-3xl" />
        <div className="shell relative pt-8 pb-24 sm:pb-28">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Courses", href: "/courses" }, ...(category && course.categorySlug ? [{ label: category, href: courseCategoryUrl(course.categorySlug) }] : []), { label: title }]} />
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="motion-safe:animate-fade-up">
              <p className="eyebrow mb-4">{category}</p>
              <h1 className="heading-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl" dangerouslySetInnerHTML={{ __html: title }} />
              <p className="mt-6 max-w-2xl text-lg text-ink-500">{stripMarkup(overview) || "Explore course details, eligibility, admissions and career opportunities."}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="btn btn-dark" href="/#contact">Get guidance <ArrowUpRight /></a>
                {officialSource ? <a className="btn btn-outline" href={officialSource} target="_blank" rel="noreferrer">Official source <ArrowUpRight /></a> : <a className="btn btn-outline" href="/courses">Browse courses <ArrowUpRight /></a>}
              </div>
            </div>
            {image ? (
              <figure className="relative motion-safe:animate-fade-up [animation-delay:120ms]">
                <FadeImage className="aspect-[4/3] w-full rounded-[2rem] shadow-lift" src={image} alt={heroAlt || stripMarkup(title)} fetchPriority="high" />
                {credit?.note && <figcaption className="mt-3 text-xs text-ink-500">{credit.note}</figcaption>}
              </figure>
            ) : (
              <div className="relative hidden aspect-[4/3] overflow-hidden rounded-[2rem] bg-ink-900 p-10 shadow-lift motion-safe:animate-fade-up [animation-delay:120ms] lg:flex lg:items-end">
                <div aria-hidden="true" className="absolute -top-16 -right-16 size-64 rounded-full bg-brand-500/40 blur-3xl" />
                <Graduation className="absolute top-10 right-10 size-20 text-white/15" strokeWidth={1.2} />
                <p className="relative font-display text-3xl leading-tight text-white">A3 Educare Hub &amp;<br /><em className="text-gold-400">Research Academy</em></p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="shell relative -mt-14 sm:-mt-16">
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {facts.map(([label, value, Icon], index) => (
            <Reveal key={label} delay={index * 60} className="card flex min-w-0 flex-col p-5 sm:p-6">
              <dt className="flex flex-col items-start gap-3 text-xs font-medium tracking-wide text-ink-500 uppercase">
                <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span>
                {label}
              </dt>
              <dd className="mt-1 line-clamp-3 font-semibold text-ink-900">{value}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      <section className="shell section-y grid grid-cols-1 gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
        <div className="min-w-0">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow mb-3">Your course roadmap</p>
            <h2 className="heading-display text-3xl sm:text-4xl">Everything you need to <em>move forward.</em></h2>
            <p className="mt-4 text-ink-500">Understand the course, plan your admission and explore where it can take you.</p>
          </div>
          <article className="flex flex-col gap-5">
            <InfoSection title="Course overview" index={nextIndex()}><div className="wp-content" dangerouslySetInnerHTML={{ __html: overview || "Detailed course information will be published here by the academy." }} /></InfoSection>
            {postContent && <InfoSection title="Published course details" index={nextIndex()}><div className="wp-content" dangerouslySetInnerHTML={{ __html: postContent }} /></InfoSection>}
            {sections.map((section) => <InfoSection title={section.title} index={nextIndex()} key={section.title}><div className="wp-content" dangerouslySetInnerHTML={{ __html: section.content }} /></InfoSection>)}
            {additionalFields.map((field) => <InfoSection title={field.label} index={nextIndex()} key={field.label}><div className="wp-content" dangerouslySetInnerHTML={{ __html: field.value }} /></InfoSection>)}
            {apiFields.map((item) => <ApiField item={item} index={nextIndex()} key={item.key} />)}
          </article>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-2xl bg-ink-900 p-7 text-ink-200">
            <p className="eyebrow mb-3 text-gold-400">Free guidance</p>
            <h3 className="font-display text-2xl text-white">Planning to apply?</h3>
            <ul className="mt-5 flex flex-col gap-3 text-sm">
              {["Check eligibility for your profile", "Compare colleges offering this course", "Plan entrance exams & deadlines"].map((point) => (
                <li className="flex gap-2.5" key={point}><Check className="mt-0.5 size-4 shrink-0 text-gold-400" />{point}</li>
              ))}
            </ul>
            <a className="btn btn-gold mt-7 w-full" href="/#contact">Talk to an advisor <ArrowUpRight /></a>
          </div>
        </aside>
      </section>

      {faqs.length > 0 && (
        <section className="section-y bg-white">
          <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="eyebrow mb-3">Need to know</p>
              <h2 className="heading-display text-3xl sm:text-4xl">Frequently Asked <em>Questions</em></h2>
              <p className="mt-4 text-ink-500">Simple answers to help you choose the right course with confidence.</p>
            </div>
            <FaqAccordion items={faqs} />
          </div>
        </section>
      )}

      <div className="pt-20 sm:pt-24">
        <CtaBand eyebrow="Ready for your next step?" title={<>Need help choosing <em>the right course?</em></>} description="Compare options, understand admission requirements and plan with confidence." />
      </div>
    </main>
  );
}
