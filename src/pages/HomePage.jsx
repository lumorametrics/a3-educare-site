import { useEffect, useState } from "react";
import Reveal from "../components/ui/Reveal";
import CountUp from "../components/ui/CountUp";
import FaqAccordion from "../components/ui/FaqAccordion";
import StatusMessage from "../components/ui/StatusMessage";
import FadeImage from "../components/ui/FadeImage";
import { ArrowRight, ArrowUpRight, Building, Globe, Graduation, MapFold, Newspaper } from "../components/ui/Icons";
import HeroSlider from "../components/home/HeroSlider";
import CollegeSlider from "../components/home/CollegeSlider";
import AboutIntro from "../components/home/AboutIntro";
import JourneySection from "../components/home/JourneySection";
import CourseExplorer from "../components/home/CourseExplorer";
import { Eyebrow, FinalCta, ServicesSection, WhyChoose } from "../components/home/HomeSections";
import TestimonialsSection from "../components/home/TestimonialsSection";
import { HOME_FAQS } from "../components/home/homeContent";
import {
  getCourseCategories,
  getColleges,
  getCourses,
  getStates,
  getPosts,
  getPostFeaturedImage,
  getScholarships,
  getStudyAbroad,
} from "../services/wordpress";
import { getResponsiveImage } from "../lib/media";
import { resolveOwnCollegeImage } from "../lib/collegeImage";
import { toPlainText } from "../lib/text";

function stripHtml(value = "") {
  return toPlainText(value);
}

function SkeletonGrid({ count = 3, className = "h-64", columns = "sm:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`grid grid-cols-1 gap-5 ${columns}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => <div key={index} className={`animate-pulse rounded-2xl bg-sand-100 ${className}`} />)}
    </div>
  );
}

/** Section header used by the WordPress-driven sections: eyebrow + h2 on the left, note + link on the right. */
function SectionIntro({ id, eyebrow, title, description, action, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <div className="mb-10 flex flex-col gap-5 sm:mb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <Reveal className="max-w-2xl">
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h2 id={id} className={`heading-display text-[2rem] leading-[1.08] sm:text-[2.6rem] lg:text-[3.1rem] ${dark ? "text-white [&_em]:text-gold-400" : ""}`}>{title}</h2>
      </Reveal>
      {(description || action) && (
        <Reveal delay={120} className="flex flex-col gap-4 lg:max-w-sm lg:items-end lg:text-right">
          {description && <p className={dark ? "text-ink-200" : "text-ink-500"}>{description}</p>}
          {action}
        </Reveal>
      )}
    </div>
  );
}

// Each homepage section renders as soon as its own collection arrives,
// instead of every section waiting for the slowest request (courses, ~3-4 s).
const HOME_SOURCES = {
  courses: getCourses,
  colleges: getColleges,
  categories: getCourseCategories,
  states: getStates,
  articles: getPosts,
  destinations: getStudyAbroad,
  scholarships: getScholarships,
};

/**
 * Home page, in story order (each section says something no other section says, with its own layout and images):
 *   hero (approved, unchanged) → at a glance → who we are → how we work → services → streams → why A3 →
 *   colleges → scholarships → study abroad → founder → news → FAQ → get in touch.
 * Company copy lives in components/home (see the zero-repetition map in homeContent.js); everything WordPress
 * publishes is loaded live below, with its own WordPress images.
 */
function HomePage() {
  const [data, setData] = useState({});
  // Which collections failed, so a WordPress outage is reported instead of looking like "no content".
  const [failed, setFailed] = useState({});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    // Already-loaded collections come straight from the service cache on retry.
    Object.entries(HOME_SOURCES).forEach(([key, load]) => {
      load().then(
        (value) => active && setData((current) => ({ ...current, [key]: value })),
        (error) => {
          if (!active) return;
          console.error(`Unable to load homepage ${key}:`, error);
          setFailed((current) => ({ ...current, [key]: true }));
        },
      );
    });
    return () => { active = false; };
  }, [attempt]);

  const isLoading = (key) => !data[key] && !failed[key];
  const { courses = [], colleges = [], categories = [], states = [], articles = [], destinations = [], scholarships = [] } = data;

  const retry = () => {
    setFailed({});
    setAttempt((count) => count + 1);
  };
  const loadError = (what) => (
    <StatusMessage tone="error" action={<button type="button" className="btn btn-dark mt-2" onClick={retry}>Try again</button>}>
      {what} could not be loaded right now.
    </StatusMessage>
  );

  // Eight published college profiles, those with their own campus photo first (stable order otherwise).
  const popularColleges = [...colleges]
    .sort((a, b) => Number(!resolveOwnCollegeImage(a.acf || {})) - Number(!resolveOwnCollegeImage(b.acf || {})))
    .slice(0, 8);
  const stateLinks = states.slice(0, 10);
  const articleCards = articles.slice(0, 3);
  const destinationCards = destinations.slice(0, 5);
  // The only figures on the page. Fixed headline figures have a null key (not tied to a WordPress request).
  const stats = [
    [null, 500, "Courses", Graduation],
    [null, 200, "University", Building],
    ["states", states.length, "States & UTs", MapFold],
    ["destinations", destinations.length, "Abroad guides", Globe],
  ];

  return (
    <main>
      {/* Hero: the approved banner slider. Keep unchanged. */}
      <HeroSlider />

      {/* At a glance. Always rendered (dash until loaded) so nothing below shifts. */}
      <section aria-label="At a glance" className="relative z-20 -mt-10 bg-[linear-gradient(to_bottom,transparent_2.5rem,white_2.5rem)] sm:-mt-14 sm:bg-[linear-gradient(to_bottom,transparent_3.5rem,white_3.5rem)]">
        <div className="shell">
          <dl className="card grid grid-cols-2 gap-x-6 gap-y-6 p-6 sm:grid-cols-4 sm:p-8 lg:divide-x lg:divide-sand-200 lg:p-0">
            {stats.map(([key, count, label, Icon]) => (
              // dl > div > dt + dd only (valid list); the icon sits inside <dt>, positioned to the left.
              <div key={label} className="relative sm:pl-15 lg:py-7 lg:pr-8 lg:pl-23">
                <dt className="text-xs font-medium text-ink-500">
                  <span aria-hidden="true" className="absolute top-1/2 left-0 hidden size-11 -translate-y-1/2 place-items-center rounded-xl bg-brand-50 text-brand-700 sm:grid lg:left-8"><Icon className="size-5" /></span>
                  {label}
                </dt>
                <dd className="mt-0.5 font-display text-3xl font-semibold text-ink-900">
                  {(key && isLoading(key)) || !count ? <span className="text-ink-300">—</span> : <CountUp value={count} suffix={count >= 100 ? "+" : ""} />}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <AboutIntro />
      <JourneySection />
      <ServicesSection />
      <CourseExplorer
        categories={categories}
        courses={courses}
        loadingCategories={isLoading("categories")}
        loadingCourses={isLoading("courses")}
        failedCategories={failed.categories}
        onRetry={retry}
      />
      <WhyChoose />

      {/* Colleges: horizontal slider of WordPress college profiles (their own campus photos) + state shortcuts. */}
      <section className="bg-white py-20 sm:py-24 lg:py-28" id="popular-colleges" aria-labelledby="colleges-title">
        <div className="shell">
          <SectionIntro id="colleges-title" eyebrow="Colleges & universities" title={<>Featured <em>colleges.</em></>} description="Campus profiles with facilities, approvals and admission details." action={<a className="link-arrow" href="/colleges">View all colleges <ArrowUpRight /></a>} />
          {isLoading("colleges") ? <SkeletonGrid count={3} className="h-96" /> : popularColleges.length ? (
            <CollegeSlider colleges={popularColleges} />
          ) : failed.colleges ? loadError("Colleges") : <StatusMessage>No published colleges are available yet.</StatusMessage>}

          {(stateLinks.length > 0 || failed.states) && (
            <Reveal className="mt-12 flex flex-col gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8">
              <p className="shrink-0 font-semibold text-ink-900">Browse colleges by state</p>
              {failed.states ? (
                <p className="text-sm text-ink-500">States could not be loaded right now. <button type="button" className="font-medium text-brand-700 underline" onClick={retry}>Try again</button></p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {stateLinks.map((state) => (
                    <li key={state.id}>
                      <a className="inline-flex rounded-full border border-sand-200 bg-white px-3.5 py-1.5 text-sm text-ink-700 transition-colors hover:border-brand-600 hover:text-brand-700" href={`/states/${state.slug || state.id}`} dangerouslySetInnerHTML={{ __html: state.title?.rendered || state.name }} />
                    </li>
                  ))}
                  <li><a className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-3.5 py-1.5 text-sm text-white transition-colors hover:bg-brand-700" href="/states">All states &amp; UTs <ArrowRight className="size-3.5" /></a></li>
                </ul>
              )}
            </Reveal>
          )}
        </div>
      </section>

      {/* Scholarships: the WordPress scholarship guides as a two-column list with their own category thumbnails. */}
      <section className="py-20 sm:py-24 lg:py-28" id="scholarships" aria-labelledby="scholarships-title">
        <div className="shell">
          <SectionIntro id="scholarships-title" eyebrow="Scholarships" title={<>Funding your education, <em>made simpler.</em></>} description="Read what each type of scholarship covers and where to apply." action={<a className="link-arrow" href="/scholarships">All scholarship guides <ArrowUpRight /></a>} />
          {isLoading("scholarships") ? <SkeletonGrid count={6} className="h-72" /> : scholarships.length ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {scholarships.map((item, index) => {
                const title = stripHtml(item.title?.rendered);
                const image = getResponsiveImage(item.acf?.category_image, title) || getResponsiveImage(item.acf?.featured_image, title);
                const intro = stripHtml(item.acf?.category_intro);
                return (
                  <Reveal as="li" key={item.id} delay={(index % 3) * 80} className="h-full">
                    <a className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-sand-200 bg-white transition-[translate,border-color,box-shadow] duration-400 ease-(--ease-out-soft) hover:-translate-y-1 hover:border-gold-400 hover:shadow-lift" href={`/scholarships/${item.slug || item.id}`}>
                      <div className="relative aspect-[16/9] overflow-hidden bg-gold-100">
                        {image && <img src={image.src} srcSet={image.srcSet} sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 92vw" alt={image.alt} loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-[1.1s] ease-(--ease-out-soft) group-hover:scale-105" />}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
                        {intro && <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink-500">{intro}</p>}
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900">Read the guide <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" /></span>
                      </div>
                    </a>
                  </Reveal>
                );
              })}
            </ul>
          ) : failed.scholarships ? loadError("Scholarships") : <StatusMessage>No scholarships are published yet.</StatusMessage>}
        </div>
      </section>

      {/* Study abroad: destination guides with their own university photos, in an editorial mosaic. */}
      <section className="bg-ink-900 py-20 sm:py-24 lg:py-28" id="study-abroad" aria-labelledby="abroad-title">
        <div className="shell">
          <SectionIntro id="abroad-title" tone="dark" eyebrow="Study abroad" title={<>Universities beyond <em>borders.</em></>} description="Country guides covering universities, costs, eligibility and visa preparation." action={<a className="link-arrow text-white hover:text-gold-400" href="/study-abroad">All destinations <ArrowUpRight /></a>} />
          {isLoading("destinations") ? <SkeletonGrid count={3} className="h-64 bg-white/5!" /> : destinationCards.length ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
              {destinationCards.map((destination, index) => {
                const title = destination.title?.rendered || destination.acf?.country || "";
                const image = getResponsiveImage(destination._embedded?.["wp:featuredmedia"]?.[0], stripHtml(title));
                const lead = index === 0;
                return (
                  <Reveal as="li" key={destination.id} delay={(index % 4) * 80} className={lead ? "sm:col-span-2 lg:row-span-2" : ""}>
                    <a className={`group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-[1.5rem] bg-ink-800 p-6 ring-1 ring-white/10 ${lead ? "min-h-80 sm:p-8 lg:min-h-full" : "min-h-56"}`} href={`/study-abroad/${destination.slug || destination.id}`}>
                      {image && <img src={image.src} srcSet={image.srcSet} sizes={lead ? "(min-width: 1024px) 40rem, 92vw" : "(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 92vw"} alt={image.alt} loading="lazy" decoding="async" className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-[1.2s] ease-(--ease-out-soft) group-hover:scale-105" />}
                      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950/95 via-ink-950/50 to-ink-950/5" />
                      <span className="absolute top-5 right-5 grid size-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-gold-400 group-hover:text-ink-900"><ArrowUpRight className="size-4" /></span>
                      <h3 className={`font-display font-semibold text-white ${lead ? "text-3xl" : "text-xl"}`} dangerouslySetInnerHTML={{ __html: title }} />
                      {lead && <p className="mt-3 line-clamp-3 max-w-lg text-sm text-white/80">{stripHtml(destination.acf?.intro_description || destination.acf?.country_overview || destination.acf?.description)}</p>}
                    </a>
                  </Reveal>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-ink-300">
              {failed.destinations ? "Study-abroad destinations could not be loaded right now." : "Study-abroad destinations are not available yet."}
              {failed.destinations && <button type="button" className="btn btn-light" onClick={retry}>Try again</button>}
            </div>
          )}
        </div>
      </section>

      {/* Student success stories (WordPress Testimonials CPT, latest first). Replaces the former founder section. */}
      <TestimonialsSection />

      {/* News: a featured story beside a compact list of the next posts (WordPress posts and their own images). */}
      <section className="py-20 sm:py-24 lg:py-28" id="articles" aria-labelledby="articles-title">
        <div className="shell">
          <SectionIntro id="articles-title" eyebrow="News & admission guides" title={<>Stay ahead of <em>admission season.</em></>} description="Updates, comparisons and step-by-step guides from our education team." action={<a className="link-arrow" href="/blog">View all articles <ArrowUpRight /></a>} />
          {isLoading("articles") ? <SkeletonGrid count={3} className="h-80" /> : articleCards.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articleCards.map((article, index) => {
                const image = getPostFeaturedImage(article);
                return (
                  <Reveal key={article.id} delay={index * 80} className="h-full">
                    <a className="group card-interactive flex h-full flex-col overflow-hidden" href={`/blog/${article.slug || article.id}`}>
                      <div className={`relative h-44 overflow-hidden bg-linear-to-br ${["from-brand-600 to-ink-900", "from-gold-400 to-coral-500", "from-ink-700 to-brand-800"][index % 3]}`}>
                        {image ? (
                          <FadeImage className="size-full" imgClassName="group-hover:scale-105" zoom={false} src={image.url} alt={image.alt} loading="lazy" />
                        ) : (
                          <Newspaper className="absolute right-6 bottom-6 size-16 text-white/20" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="font-display text-xl leading-snug font-semibold transition-colors group-hover:text-brand-800" dangerouslySetInnerHTML={{ __html: article.title?.rendered }} />
                        <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink-500">{stripHtml(article.excerpt?.rendered)}</p>
                        <span className="link-arrow mt-5">Read article <ArrowUpRight /></span>
                      </div>
                    </a>
                  </Reveal>
                );
              })}
            </div>
          ) : failed.articles ? loadError("Articles") : <StatusMessage>No published articles are available yet.</StatusMessage>}
        </div>
      </section>

      {/* FAQ: practical questions that no other section answers. */}
      <section className="bg-white py-20 sm:py-24 lg:py-28" id="faq" aria-labelledby="faq-title">
        <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Before you get in touch</Eyebrow>
            <h2 id="faq-title" className="heading-display text-[2rem] leading-[1.08] sm:text-[2.6rem] lg:text-[3.1rem]">Questions families <em>often ask.</em></h2>
          </Reveal>
          <Reveal variant="right" delay={100}><FaqAccordion items={HOME_FAQS.map(([question, answer]) => ({ question, answer }))} defaultOpen={0} numbered /></Reveal>
        </div>
      </section>

      <div className="pt-20 sm:pt-24">
        <FinalCta />
      </div>
    </main>
  );
}

export default HomePage;
