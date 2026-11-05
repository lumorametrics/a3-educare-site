import { useEffect, useMemo, useState } from "react";
import { getScholarshipBySlug, getScholarships } from "../services/wordpress";
import Breadcrumb from "../components/ui/Breadcrumb";
import CtaBand from "../components/ui/CtaBand";
import FadeImage from "../components/ui/FadeImage";
import FaqAccordion from "../components/ui/FaqAccordion";
import Reveal from "../components/ui/Reveal";
import SectionHeading from "../components/ui/SectionHeading";
import SplashScreen from "../components/ui/SplashScreen";
import StatusMessage from "../components/ui/StatusMessage";
import { ArrowUpRight, Award, Check, ChevronLeft, Shield } from "../components/ui/Icons";
import { getResponsiveImage } from "../lib/media";
import { toPlainText } from "../lib/text";
import { useSeo } from "../lib/seo";
import NotFound from "./NotFound";

/** Plain-text ACF values become safe HTML; values that already hold markup pass through. */
function asHtml(value) {
  const source = String(value || "").trim();
  if (!source) return "";
  if (/<[a-z][\s\S]*>/i.test(source)) return source;
  const escaped = source.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.split(/\n{2,}/).map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`).join("");
}

/** The items of a WYSIWYG value that is exactly one list, as HTML strings; [] for any other content. */
function getListItems(html) {
  if (!html || typeof DOMParser === "undefined") return [];
  const { body } = new DOMParser().parseFromString(html, "text/html");
  const list = body.firstElementChild;
  if (!list || body.children.length !== 1 || !/^(UL|OL)$/.test(list.tagName)) return [];
  if (body.textContent.trim() !== list.textContent.trim()) return [];
  return [...list.children].filter((item) => item.tagName === "LI" && item.textContent.trim()).map((item) => item.innerHTML);
}

function getFaqs(fields) {
  return Object.keys(fields)
    .map((key) => key.match(/^faq_(\d+)_question$/)?.[1])
    .filter(Boolean)
    .sort((a, b) => a - b)
    .map((n) => ({ question: toPlainText(fields[`faq_${n}_question`]), answer: asHtml(fields[`faq_${n}_answer`]) }))
    .filter((faq) => faq.question && toPlainText(faq.answer));
}

const Prose = ({ html, className = "" }) => <div className={`wp-content max-w-none ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;

/** A WYSIWYG section: `renderItems` lays out a simple list; anything else keeps WordPress's own formatting. */
function ListOrProse({ html, renderItems }) {
  const items = getListItems(html);
  if (items.length) return renderItems(items);
  return <Reveal className="card p-6 sm:p-8"><Prose html={html} /></Reveal>;
}

const Item = ({ html, className = "" }) => <span className={`min-w-0 ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;

export default function ScholarshipDetail({ slug }) {
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const [others, setOthers] = useState([]);

  useEffect(() => {
    let active = true;
    getScholarshipBySlug(slug)
      .then((items) => {
        if (!active) return;
        setItem(items[0] || null);
        setStatus(items[0] ? "ready" : "not-found");
      })
      .catch((error) => {
        if (!active) return;
        console.error("Unable to load scholarship details:", error);
        setStatus("error");
      });
    // Nice-to-have: the "other categories" section simply stays hidden if this request fails.
    getScholarships()
      .then((items) => active && setOthers(items.filter((other) => other.slug !== slug)))
      .catch((error) => console.error("Unable to load other scholarship categories:", error));
    return () => { active = false; };
  }, [slug, attempt]);

  const fields = useMemo(() => item?.acf || {}, [item]);
  const faqs = useMemo(() => getFaqs(fields), [fields]);
  const title = toPlainText(item?.title?.rendered);
  const heading = toPlainText(fields.category_heading) || title;
  const intro = toPlainText(fields.category_intro);
  const banner = getResponsiveImage(fields.featured_image);
  const categoryImage = getResponsiveImage(fields.category_image, heading);

  useSeo(
    status === "not-found" ? { title: "Page not found", noindex: true }
    : item ? {
      title: heading,
      description: intro,
      image: banner?.src,
      jsonLd: faqs.length ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: toPlainText(faq.answer) } })),
      } : undefined,
    } : null,
  );

  if (status === "loading") return <SplashScreen label="Loading scholarship details" />;
  if (status === "not-found") return <NotFound />;
  if (status === "error") {
    return (
      <StatusMessage page tone="error" title="Scholarship details could not be loaded" action={<button type="button" className="btn btn-dark mt-2" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}>Try again</button>}>
        Please check your connection and try again.
      </StatusMessage>
    );
  }

  const has = (value) => Boolean(toPlainText(value));
  const about = asHtml(fields.about_scholarship);
  const important = asHtml(fields.important_information);

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-ink-950 text-white">
        {banner && (
          <>
            <img src={banner.src} srcSet={banner.srcSet} sizes="100vw" alt={banner.alt} fetchPriority="high" decoding="async" className="absolute inset-0 -z-10 size-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-ink-950/95 via-ink-950/80 to-ink-950/40" />
          </>
        )}
        <div className="shell relative flex min-h-[26rem] flex-col justify-center pt-8 pb-16 sm:min-h-[30rem] sm:pb-20">
          <div className="motion-safe:animate-page-in"><Breadcrumb tone="dark" items={[{ label: "Home", href: "/" }, { label: "Scholarships", href: "/scholarships" }, { label: title }]} /></div>
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-sm motion-safe:animate-fade-up">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-400" />
              Scholarship guide
            </p>
            <h1 className="mt-5 text-[2rem] leading-[1.1] font-bold tracking-[-0.02em] text-white motion-safe:animate-fade-up motion-safe:[animation-delay:90ms] min-[375px]:text-[2.25rem] sm:text-5xl lg:text-[3.5rem]">{heading}</h1>
            {intro && <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 motion-safe:animate-fade-up motion-safe:[animation-delay:180ms] sm:text-lg">{intro}</p>}
          </div>
        </div>
      </section>

      {(has(about) || categoryImage) && (
        <section className="section-y bg-white">
          <div className={`shell grid grid-cols-1 items-center gap-10 ${has(about) && categoryImage ? "lg:grid-cols-2 lg:gap-16" : ""}`}>
            {has(about) && (
              <div className="min-w-0">
                <Reveal>
                  <p className="eyebrow mb-3"><span aria-hidden="true" className="h-px w-6 bg-brand-600" />Overview</p>
                  <h2 className="heading-display text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem]">About This <em>Scholarship</em></h2>
                </Reveal>
                <Reveal delay={100}><Prose html={about} className="mt-6" /></Reveal>
              </div>
            )}
            {categoryImage && (
              <Reveal variant="fade" className="min-w-0">
                <FadeImage src={categoryImage.src} srcSet={categoryImage.srcSet} sizes="(min-width: 1024px) 40rem, 100vw" alt={categoryImage.alt} loading="lazy" className="aspect-[3/2] w-full rounded-2xl shadow-card" />
              </Reveal>
            )}
          </div>
        </section>
      )}

      {has(fields.who_can_apply) && (
        <section className="shell section-y">
          <SectionHeading eyebrow="Eligibility" title={<>Who Can <em>Apply</em></>} />
          <ListOrProse
            html={fields.who_can_apply}
            renderItems={(items) => (
              <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {items.map((html, index) => (
                  <Reveal as="li" key={html} delay={(index % 2) * 70} className="card flex h-full gap-4 p-5 sm:p-6">
                    <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"><Check className="size-4" /></span>
                    <Item html={html} className="text-ink-700" />
                  </Reveal>
                ))}
              </ul>
            )}
          />
        </section>
      )}

      {has(fields.scholarship_benefits) && (
        <section className="section-y bg-white">
          <div className="shell">
            <SectionHeading eyebrow="What you can get" title={<>Scholarship <em>Benefits</em></>} />
            <ListOrProse
              html={fields.scholarship_benefits}
              renderItems={(items) => (
                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {items.map((html, index) => (
                    <Reveal as="li" key={html} delay={(index % 2) * 70} className="h-full rounded-2xl border border-brand-100 bg-brand-50/50 p-6">
                      <span aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-white text-brand-700 shadow-card"><Award className="size-5" /></span>
                      <Item html={html} className="mt-4 block text-ink-800" />
                    </Reveal>
                  ))}
                </ul>
              )}
            />
          </div>
        </section>
      )}

      {has(fields.how_to_apply) && (
        <section className="shell section-y">
          <SectionHeading eyebrow="Step by step" title={<>How to <em>Apply</em></>} />
          <ListOrProse
            html={fields.how_to_apply}
            renderItems={(items) => (
              <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((html, index) => (
                  <Reveal as="li" key={html} delay={(index % 3) * 70} className="card h-full p-6">
                    <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-ink-900 text-sm font-semibold text-white">{index + 1}</span>
                    <Item html={html} className="mt-4 block text-ink-700" />
                  </Reveal>
                ))}
              </ol>
            )}
          />
        </section>
      )}

      {has(fields.required_documents) && (
        <section className="section-y bg-white">
          <div className="shell">
            <SectionHeading eyebrow="Checklist" title={<>Required <em>Documents</em></>} />
            <ListOrProse
              html={fields.required_documents}
              renderItems={(items) => (
                <Reveal className="card p-6 sm:p-8">
                  <ul className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
                    {items.map((html) => (
                      <li key={html} className="flex gap-3">
                        <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded border border-brand-600 text-brand-700"><Check className="size-3.5" /></span>
                        <Item html={html} className="text-ink-700" />
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            />
          </div>
        </section>
      )}

      {has(important) && (
        <section className="shell section-y">
          <Reveal className="flex flex-col gap-4 rounded-2xl border border-gold-300 bg-gold-100/60 p-6 sm:flex-row sm:p-8">
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-400 text-ink-900"><Shield className="size-5" /></span>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-ink-900">Important Information</h2>
              <Prose html={important} className="mt-2" />
            </div>
          </Reveal>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="section-y bg-white">
          <div className="shell">
            <SectionHeading eyebrow="FAQ" title={<>Frequently Asked <em>Questions</em></>} />
            <FaqAccordion items={faqs} />
          </div>
        </section>
      )}

      <section className="shell section-y">
        {others.length > 0 && (
          <>
            <SectionHeading eyebrow="Explore more" title={<>Other Scholarship <em>Categories</em></>} />
            <ul className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <li key={other.id}>
                  <a className="group card-interactive flex h-full items-center justify-between gap-3 p-5" href={`/scholarships/${other.slug}`}>
                    <strong className="min-w-0 font-semibold text-ink-900">{toPlainText(other.title?.rendered)}</strong>
                    <ArrowUpRight className="size-4 shrink-0 text-ink-300 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        <a className="btn btn-outline" href="/scholarships"><ChevronLeft /> Back to Scholarships</a>
      </section>

      <CtaBand
        eyebrow="Need guidance?"
        title={<>Not sure if you <em>qualify?</em></>}
        description="Talk to an A3 EduCare Hub advisor about your course plans and the options worth exploring."
        actionHref="/contact"
      />
    </main>
  );
}
