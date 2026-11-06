import { useEffect, useState } from "react";
import { getStudyAbroadBySlug } from "../services/wordpress";
import SplashScreen from "../components/ui/SplashScreen";
import PlaceHero from "../components/state/PlaceHero";
import FaqAccordion from "../components/ui/FaqAccordion";
import StatusMessage from "../components/ui/StatusMessage";
import CtaBand from "../components/ui/CtaBand";
import Reveal from "../components/ui/Reveal";
import FadeImage from "../components/ui/FadeImage";
import { Check } from "../components/ui/Icons";
import { toPlainText } from "../lib/text";
import { useSeo } from "../lib/seo";
import { getHeroImage } from "../lib/collegeImage";

function stripHtml(value = "") {
  return toPlainText(getText(value).replace(/```/g, ""));
}

function getImageUrl(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return (
      value.url ||
      value.source_url ||
      value.sizes?.large?.source_url ||
      value.sizes?.large?.url ||
      ""
    );
  }
  return "";
}

function getFeaturedImage(item, fields) {
  return getImageUrl(
    getField(fields, [
      "header_image",
      "hero_image",
      "featured_image",
      "country_image",
      "image",
      "featured_media",
    ]) ||
      item._embedded?.["wp:featuredmedia"]?.[0] ||
      item.featured_media_url,
  );
}

function getField(fields, names) {
  for (const name of names) {
    if (fields[name]) return fields[name];
  }
  return "";
}

function getText(value) {
  if (Array.isArray(value))
    return value
      .map((item) => getText(item))
      .filter(Boolean)
      .join(", ");
  if (typeof value === "object" && value !== null)
    return value.rendered || value.text || "";
  return String(value || "");
}

function fieldLabel(key) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getFaqItems(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === "string") return [{ question: item, answer: "" }];
      if (!item || typeof item !== "object") return [];
      const question =
        item.question ||
        item.question_title ||
        item.title ||
        item.faq_question ||
        item.q;
      const answer =
        item.answer ||
        item.faq_answer ||
        item.content ||
        item.description ||
        item.a;
      return question
        ? [{ question: getText(question), answer: getText(answer) }]
        : [];
    });
  }
  if (typeof value === "object") {
    return Object.entries(value).map(([question, answer]) => ({
      question: getText(question),
      answer: getText(answer),
    }));
  }
  return [];
}

function findFaqs(fields) {
  const items = [];
  for (let index = 1; index <= 10; index += 1) {
    const question = fields[`faq_q${index}`];
    const answer = fields[`faq_a${index}`];
    if (question)
      items.push({ question: getText(question), answer: getText(answer) });
  }
  if (items.length) return items;
  const faqEntry = Object.entries(fields).find(([key]) =>
    /faq|frequently_asked/i.test(key),
  );
  return faqEntry ? getFaqItems(faqEntry[1]) : [];
}

function renderFieldValue(value) {
  if (Array.isArray(value)) {
    if (!value.length) return null;
    if (
      value.every(
        (item) => typeof item === "string" || typeof item === "number",
      )
    ) {
      return (
        <ul className="flex flex-col gap-2.5">
          {value.map((item, index) => (
            <li className="flex gap-2.5 text-ink-600" key={`${item}-${index}`}><Check className="mt-1 size-4 shrink-0 text-brand-600" />{String(item)}</li>
          ))}
        </ul>
      );
    }
    return (
      <div className="flex flex-col gap-3">
        {value.map((item, index) => (
          <div className="rounded-xl border border-sand-200 bg-sand-50 p-4 [&_strong]:block [&_strong]:text-sm [&_strong]:text-ink-900" key={index}>
            {typeof item === "object" && item !== null
              ? Object.entries(item).map(([key, nestedValue]) => (
                  <div key={key}>
                    <strong>{fieldLabel(key)}</strong>
                    {renderFieldValue(nestedValue)}
                  </div>
                ))
              : renderFieldValue(item)}
          </div>
        ))}
      </div>
    );
  }
  if (value && typeof value === "object") {
    if (getImageUrl(value)) return <FadeImage className="rounded-xl" src={getImageUrl(value)} loading="lazy" />;
    return (
      <div className="flex flex-col gap-3 [&_strong]:block [&_strong]:text-sm [&_strong]:text-ink-900">
        {Object.entries(value).map(([key, nestedValue]) => (
          <div key={key}>
            <strong>{fieldLabel(key)}</strong>
            {renderFieldValue(nestedValue)}
          </div>
        ))}
      </div>
    );
  }
  if (!value) return null;
  const text = String(value);
  return /<[^>]+>/.test(text) ? (
    <div className="wp-content" dangerouslySetInnerHTML={{ __html: text }} />
  ) : (
    <p className="text-ink-600">{text}</p>
  );
}

function getCuratedSections(fields) {
  const sectionDefinitions = [
    [
      "popular_programs_title",
      "popular_programs_list",
      "Popular Programs for Indian Students",
    ],
    [
      "admission_requirements_title",
      "admission_requirements",
      "Admission Requirements",
    ],
    ["visa_overview_title", "visa_overview_content", "Student Visa Overview"],
    ["checklist_title", "checklist_items", "Student Checklist"],
  ];

  return sectionDefinitions
    .map(([titleKey, contentKey, fallbackTitle]) => {
      const value = fields[contentKey];
      const title = stripHtml(fields[titleKey] || fallbackTitle);
      return value ? { title, value } : null;
    })
    .filter(Boolean);
}


export default function StudyAbroadDetail({ slug }) {
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    getStudyAbroadBySlug(slug)
      .then((data) => {
        if (!active) return;
        setItem(data);
        setStatus(data ? "ready" : "missing");
      })
      .catch((error) => {
        if (!active) return;
        setErrorMessage(error.message);
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  useSeo(item ? {
    title: toPlainText(item.acf?.page_title || item.title?.rendered),
    description: item.acf?.intro_description || item.acf?.country_overview,
    image: getFeaturedImage(item, item.acf || {}) || undefined,
  } : null);

  if (status === "loading")
    return <SplashScreen label="Loading destination guide" />;
  if (status === "error")
    return (
      <StatusMessage page tone="error" title="Study Abroad data could not be loaded." action={<a className="btn btn-dark mt-2" href="/study-abroad">Back to Study Abroad</a>}>
        <small>{errorMessage}</small>
      </StatusMessage>
    );
  if (status === "missing")
    return (
      <StatusMessage page title="Destination not found" action={<a className="btn btn-dark mt-2" href="/study-abroad">Back to Study Abroad</a>}>
        This destination is not published in WordPress.
      </StatusMessage>
    );

  const fields = item.acf || {};
  const title = stripHtml(
    fields.page_title ||
      item.title?.rendered ||
      fields.country ||
      "Study Abroad",
  );
  const intro = stripHtml(
    getField(fields, [
      "intro_description",
      "country_overview",
      "short_introduction",
      "description",
    ]) ||
      item.excerpt?.rendered ||
      "",
  );
  const image = getFeaturedImage(item, fields);
  const content = item.content?.rendered || getText(fields.content);
  const acfSections = getCuratedSections(fields);
  const visaWarning = getText(fields.visa_warning_box_text);
  const faqs = findFaqs(fields);

  return (
    <main>
      <PlaceHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Study Abroad", href: "/study-abroad" }, { label: title }]}
        eyebrow="Destination guide"
        title={title}
        longTitle={title.length > 34}
        description={intro}
        image={getHeroImage(fields.header_image, title) || (image ? { url: image, alt: title, note: "" } : null)}
        actions={["Explore your options", "Plan with confidence"].map((step, index) => (
          <span key={step} className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-2 pr-4 pl-2 text-sm text-ink-100 backdrop-blur-sm">
            <b className="grid size-7 place-items-center rounded-full bg-accent text-xs text-ink-950">0{index + 1}</b>{step}
          </span>
        ))}
      />

      {content && (
        <section className="shell section-y">
          <article className="wp-content mx-auto max-w-3xl lg:prose-lg" dangerouslySetInnerHTML={{ __html: content }} />
        </section>
      )}

      {acfSections.length > 0 && (
        <section className={`section-y ${content ? "bg-white" : ""}`}>
          <div className="shell">
            <div className="mb-12 max-w-2xl">
              <p className="eyebrow mb-3">Your journey starts here</p>
              <h2 className="heading-display text-3xl sm:text-4xl lg:text-5xl">Everything you need to <em>move forward.</em></h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {acfSections.map(({ title: sectionTitle, value }, index) => (
                <Reveal as="article" delay={(index % 2) * 80} className="card flex flex-col p-6 sm:p-8" key={sectionTitle}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand-50 font-display text-sm text-brand-700">0{index + 1}</span>
                    <span className="h-px flex-1 bg-sand-200" />
                  </div>
                  <h2 className="mb-4 font-display text-2xl font-semibold">{sectionTitle}</h2>
                  <div className="flex-1">{renderFieldValue(value)}</div>
                  {sectionTitle === "Student Visa Overview" && visaWarning && (
                    <aside
                      className="mt-6 rounded-xl border-l-4 border-gold-500 bg-gold-100/70 p-4 text-sm text-ink-800 [&_p]:m-0"
                      dangerouslySetInnerHTML={{ __html: visaWarning }}
                    />
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="shell section-y grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">Need to know</p>
            <h2 className="heading-display text-3xl sm:text-4xl">Frequently Asked <em>Questions</em></h2>
            <p className="mt-4 text-ink-500">Simple answers to help you take the next step with clarity.</p>
          </div>
          <FaqAccordion items={faqs} defaultOpen={0} />
        </section>
      )}

      <div className={faqs.length > 0 ? "" : "pt-20 sm:pt-24"}>
        <CtaBand eyebrow="Study abroad guidance" title={<>Considering {title} <em>for higher studies?</em></>} description="Cross-check current admission and visa rules with official sources." actionLabel="Apply Now" />
      </div>
    </main>
  );
}
