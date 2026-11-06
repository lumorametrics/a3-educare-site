import { useEffect, useState } from "react";
import { getCollegeBySlug } from "../services/wordpress";
import SplashScreen from "../components/ui/SplashScreen";
import Breadcrumb from "../components/ui/Breadcrumb";
import FaqAccordion from "../components/ui/FaqAccordion";
import StatusMessage from "../components/ui/StatusMessage";
import CtaBand from "../components/ui/CtaBand";
import Reveal from "../components/ui/Reveal";
import CollegeHeroBackdrop from "../components/college/CollegeHeroBackdrop";

import { ArrowUpRight, Award, Building, Graduation, MapPin } from "../components/ui/Icons";
import { resolveCollegeImage } from "../lib/collegeImage";
import { toPlainText, truncateText } from "../lib/text";
import { useSeo } from "../lib/seo";

function text(value = "") {
  if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean).join(", ");
  if (value && typeof value === "object") return value.rendered || value.text || value.source_url || "";
  return String(value || "");
}

function clean(value = "") {
  return toPlainText(text(value).replace(/```/g, ""));
}

function html(value) {
  return text(value);
}

function field(fields, names, fallback = "") {
  return names.map((name) => fields[name]).find((value) => value !== undefined && value !== null && value !== "" && value !== false) || fallback;
}

function getFaqs(fields) {
  const source = field(fields, ["faqs", "faq", "college_faqs"]);
  if (Array.isArray(source)) {
    return source.map((item) => ({
      question: clean(item.question || item.faq_question || item.title || item.q),
      answer: html(item.answer || item.faq_answer || item.content || item.description || item.a),
    })).filter((item) => item.question && item.answer);
  }
  const items = [];
  for (let index = 1; index <= 10; index += 1) {
    const question = clean(fields[`faq_q${index}`] || fields[`faq_question_${index}`] || fields[`faq_${index}_question`]);
    const answer = html(fields[`faq_a${index}`] || fields[`faq_answer_${index}`] || fields[`faq_${index}_answer`]);
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

function getSections(fields, college) {
  const source = field(fields, ["sections", "college_sections", "college_information"]);
  if (Array.isArray(source)) {
    return source.map((section) => ({
      title: clean(section.title || section.heading || section.section_title),
      content: html(section.content || section.description || section.text),
    })).filter((section) => section.title && section.content && !/^contact(?:\s+info)?$/i.test(section.title));
  }
  const excluded = new Set([
    "college_overview", "college_short_introduction", "overview", "description",
    "college_location", "location", "college_type", "type", "established", "established_date",
    "admission_test", "admission_exam", "official_source", "official_website",
    "college_image", "college_banner", "campus_image", "featured_image", "image", "college_photo",
    "faqs", "faq", "college_faqs", "sections", "college_sections", "college_information",
    "contact_details", "contact_info", "contact_information",
  ]);
  // Plain text fields (affiliation, entrance exams) get a label; rich text fields carry their own markup.
  const labelled = { affiliation: "Affiliation", entrance_exams: "Entrance exams" };
  const curated = [
    ["Academic Areas & Programs", ["courses_offered"]],
    ["Admissions", ["admission_process", "eligibility", "entrance_exams"]],
    ["Recognition & Affiliation", ["recognition", "affiliation"]],
    ["Fees", ["fees_information"]],
    ["Campus & Facilities", ["campus_facilities"]],
    ["Hostel", ["hostel_information"]],
    ["Placements", ["placement_information"]],
    ["Scholarships", ["scholarships"]],
  ].map(([title, keys]) => ({
    title,
    content: keys.filter((key) => fields[key]).map((key) => (labelled[key] ? `<p><strong>${labelled[key]}:</strong> ${html(fields[key])}</p>` : html(fields[key]))).join(""),
  })).filter((section) => section.content && !/^contact(?:\s+info)?$/i.test(section.title));
  if (curated.length) return curated;
  return Object.entries({ ...college, ...fields })
    .filter(([key, value]) => !excluded.has(key) && value !== null && value !== "" && value !== false)
    .filter(([key]) => !/^faq(?:_|$)/i.test(key))
    .map(([key, value]) => ({
      title: key.replace(/^(college_|acf_)/, "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      content: html(value),
    }))
    .filter((section) => section.content && !["Id", "Date", "Date Gmt", "Modified", "Modified Gmt", "Slug", "Status", "Type", "Link", "Template", "Guid", "Title", "Content", "Excerpt", "Author", "Featured Media", "Parent", "Menu Order", "Comment Status", "Ping Status", "Sticky", "Format"].includes(section.title));
}


export default function CollegeDetail({ slug }) {
  const [college, setCollege] = useState(null);
  const [status, setStatus] = useState("loading");
  const [failedPhoto, setFailedPhoto] = useState(null); // src of a hero photo that did not load

  useEffect(() => {
    let active = true;
    getCollegeBySlug(slug)
      .then((items) => {
        if (!active) return;
        setCollege(items[0] || null);
        setStatus(items[0] ? "ready" : "not-found");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load college details:", requestError);
        setStatus("error");
      });
    return () => { active = false; };
  }, [slug]);

  useSeo(college ? {
    title: toPlainText(college.title?.rendered),
    description: college.acf?.college_short_introduction || college.acf?.college_overview,
    image: resolveCollegeImage(college.acf || {})?.src,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollegeOrUniversity",
      name: toPlainText(college.title?.rendered),
      description: truncateText(college.acf?.college_short_introduction || college.acf?.college_overview, 300),
      ...(college.acf?.city || college.acf?.state ? {
        address: { "@type": "PostalAddress", addressLocality: college.acf?.city || undefined, addressRegion: college.acf?.state || undefined, addressCountry: "IN" },
      } : {}),
      ...(/^https?:\/\//.test(college.acf?.official_website || "") ? { sameAs: college.acf.official_website } : {}),
    },
  } : null);

  if (status === "loading") return <SplashScreen label="Loading college details" />;
  if (status === "error") return <StatusMessage page tone="error" title="Something went wrong">College details could not be loaded from WordPress.</StatusMessage>;
  if (!college) return <StatusMessage page title="College not found" action={<a className="btn btn-dark mt-2" href="/colleges">Browse colleges</a>}>This college could not be found.</StatusMessage>;

  const fields = college.acf || {};
  const title = clean(field(fields, ["college_name", "page_title"], college.title?.rendered || "College"));
  // The hero clips its text, so it leads with the short introduction and the full overview gets its own section.
  const overview = field(fields, ["college_short_introduction", "college_overview", "overview", "description"], college.excerpt?.rendered || "");
  const about = fields.college_short_introduction && fields.college_overview ? html(fields.college_overview) : "";
  const image = resolveCollegeImage(fields, `${title} campus`);
  const cityState = [fields.city, fields.state].map((part) => clean(part)).filter(Boolean).join(", ");
  const location = clean(field(fields, ["college_location", "location"], cityState || "Not published"));
  const type = clean(field(fields, ["college_type", "type"], "Not published"));
  const established = clean(field(fields, ["established", "established_date", "foundation_date"], "Not published"));
  const admissionTest = clean(field(fields, ["admission_test", "admission_exam", "entrance_exam", "entrance_exams"], "Not published"));
  const officialSource = field(fields, ["official_source", "official_website", "website"]);
  const sections = getSections(fields, college);
  const faqs = getFaqs(fields);
  const relatedCourses = field(fields, ["related_courses", "college_courses", "courses"]);
  const hasLocation = location !== "Not published";
  const heroBadges = [type !== "Not published" && [type, Building], established !== "Not published" && [`Established ${established}`, Award]].filter(Boolean);
  const facts = [["Location", location, MapPin], ["Type", type, Building], ["Established", established, Award], ["Admission test", admissionTest, Graduation]].filter(([, value]) => value !== "Not published");

  return (
    <main>
      <section className="hero-photo relative isolate flex overflow-hidden bg-ink-900">
        <CollegeHeroBackdrop image={image} onPhotoFailed={setFailedPhoto} />
        <div className="shell relative flex w-full flex-col pt-8 pb-24 sm:pb-28">
          <Breadcrumb tone="dark" items={[{ label: "Home", href: "/" }, { label: "Colleges", href: "/colleges" }, { label: title }]} />
          <div className="mt-auto max-w-3xl pt-16 motion-safe:animate-fade-up sm:pt-12">
            <p className="mb-4 flex items-center gap-3 text-sm font-semibold tracking-wide text-accent"><span aria-hidden="true" className="h-0.5 w-8 shrink-0 rounded-full bg-accent" />College guide</p>
            {heroBadges.length > 0 && (
              <ul className="mb-5 flex flex-wrap gap-2">
                {heroBadges.map(([label, Icon]) => (
                  <li key={label} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <Icon className="size-3.5 text-gold-400" />{label}
                  </li>
                ))}
              </ul>
            )}
            <h1 className="font-display text-[2.1rem] leading-[1.08] font-bold tracking-tight text-white min-[420px]:text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
            {hasLocation && <p className="mt-4 flex items-center gap-2 text-base font-medium text-white/90 sm:text-lg"><MapPin className="size-5 shrink-0 text-gold-400" />{location}</p>}
            {overview && <div className="mt-5 line-clamp-4 max-w-2xl text-base leading-relaxed text-white/85 sm:line-clamp-5 sm:text-lg [&_p]:m-0" dangerouslySetInnerHTML={{ __html: html(overview) }} />}
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <a className="btn bg-accent text-ink-950 hover:-translate-y-0.5 hover:brightness-110" href="/#contact">Get admission guidance <ArrowUpRight /></a>
              {officialSource && <a className="btn btn-ghost-light" href={officialSource} target="_blank" rel="noreferrer">Official website <ArrowUpRight /></a>}
            </div>
            {image?.credit?.note && failedPhoto !== image.src && (
              <p className="mt-8 max-w-xl text-xs leading-relaxed text-white/70">
                {image.credit.note}
              </p>
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

      {about && (
        <section className="shell pt-16 sm:pt-20">
          <Reveal className="max-w-4xl">
            <h2 className="heading-display text-3xl sm:text-4xl">About <em>{title}</em></h2>
            <div className="wp-content mt-5" dangerouslySetInnerHTML={{ __html: about }} />
          </Reveal>
        </section>
      )}

      {sections.length > 0 && (
        <section className="shell section-y">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {sections.map((section, index) => (
              <Reveal as="article" delay={(index % 2) * 80} className={`card p-6 sm:p-8 ${sections.length % 2 === 1 && index === sections.length - 1 ? "md:col-span-2" : ""}`} key={`${section.title}-${index}`}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-display text-sm text-brand-600">{String(index + 1).padStart(2, "0")}</span>
                  <span className="h-px w-8 bg-brand-200" />
                </div>
                <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
                <div className="wp-content mt-4" dangerouslySetInnerHTML={{ __html: section.content }} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {fields.information_sources && (
        <section className="shell pb-8">
          <div className="wp-content text-sm text-ink-500" dangerouslySetInnerHTML={{ __html: html(fields.information_sources) }} />
        </section>
      )}

      {officialSource && (
        <section className="shell pb-16">
          <Reveal className="flex flex-col gap-4 rounded-2xl border border-gold-300 bg-gold-100/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="max-w-2xl text-sm text-ink-700">Fees, cutoffs, rankings, and facilities change frequently and are best confirmed on the institution’s own official website.</p>
            <a className="btn btn-dark shrink-0" href={officialSource} target="_blank" rel="noreferrer">Visit official website <ArrowUpRight /></a>
          </Reveal>
        </section>
      )}

      {Array.isArray(relatedCourses) && relatedCourses.length > 0 && (
        <section className="shell pb-16">
          <h2 className="heading-display mb-6 text-3xl">Related <em>Courses</em></h2>
          <div className="flex flex-wrap gap-2">{relatedCourses.map((course, index) => {
            const name = clean(course.title || course.name || course);
            const courseSlug = course.slug;
            return courseSlug
              ? <a className="chip hover:border-brand-600 hover:text-brand-700" href={`/courses/${courseSlug}`} key={`${name}-${index}`}>{name}</a>
              : <span className="chip" key={`${name}-${index}`}>{name}</span>;
          })}</div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="section-y bg-white">
          <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="eyebrow mb-3">Need to know</p>
              <h2 className="heading-display text-3xl sm:text-4xl">Frequently Asked <em>Questions</em></h2>
              <p className="mt-4 text-ink-500">Simple answers to help you take the next step with clarity.</p>
            </div>
            <FaqAccordion items={faqs} />
          </div>
        </section>
      )}

      <div className={faqs.length > 0 ? "pt-20 sm:pt-24" : ""}>
        <CtaBand eyebrow="Admissions guidance" title={clean(fields.cta_heading) || <>Considering <em>{title}?</em></>} description={clean(fields.cta_description) || "Confirm admission details on the official website before applying — and talk to us for a personalised plan."} actionLabel="Apply Now" />
      </div>
    </main>
  );
}
