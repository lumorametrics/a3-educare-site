import { useEffect, useMemo, useState } from "react";
import CourseCard from "../components/cards/CourseCard";
import Reveal from "../components/ui/Reveal";
import CountUp from "../components/ui/CountUp";
import SectionHeading from "../components/ui/SectionHeading";
import FaqAccordion from "../components/ui/FaqAccordion";
import StatusMessage from "../components/ui/StatusMessage";
import CtaBand from "../components/ui/CtaBand";
import FadeImage from "../components/ui/FadeImage";
import { ArrowRight, ArrowUpRight, Book, Globe, Graduation, MapPin } from "../components/ui/Icons";
import HeroSlider from "../components/home/HeroSlider";
import CollegeSlider from "../components/home/CollegeSlider";
import {
  getCourseCategories,
  getColleges,
  getCourses,
  getStates,
  getPosts,
  getPostFeaturedImage,
  getStudyAbroad,
} from "../services/wordpress";
import { toPlainText } from "../lib/text";
import { withBase } from "../lib/basePath";

const faqs = [
  ["How do I choose the right course?", "Start with your interests, academic strengths and long-term goals. Our advisors can help you compare eligibility, duration, fees and career outcomes."],
  ["Can you help me shortlist colleges?", "Yes. We help you compare institutions, locations, courses, fees, facilities and admission requirements so you can shortlist with confidence."],
  ["Do you provide study-abroad guidance?", "Our guidance covers destination selection, university shortlisting, applications, documentation and visa-related preparation."],
  ["How much does a consultation cost?", "Your first conversation is complimentary. It is an opportunity to understand your goals and outline your best next steps."],
];

const categoryTones = [
  "from-brand-50 to-white text-brand-700",
  "from-gold-100 to-white text-ink-800",
  "from-coral-50 to-white text-coral-600",
  "from-ink-50 to-white text-ink-700",
];

const POPULAR_CATEGORY_SLUGS = ["engineering", "medical", "nursing", "management", "pharmacy"];

function categoryImage(slug) {
  return withBase(`/hero/${slug}-1408.webp`);
}

function stripHtml(value = "") {
  return toPlainText(value);
}

function SkeletonGrid({ count = 3, className = "h-64" }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => <div key={index} className={`animate-pulse rounded-2xl bg-sand-100 ${className}`} />)}
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
};

function HomePage() {
  const [data, setData] = useState({});
  const [activeFilter, setActiveFilter] = useState("All");
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
  const { courses = [], colleges = [], categories = [], states = [], articles = [], destinations = [] } = data;

  const retry = () => {
    setFailed({});
    setAttempt((count) => count + 1);
  };
  const loadError = (what) => (
    <StatusMessage tone="error" action={<button type="button" className="btn btn-dark mt-2" onClick={retry}>Try again</button>}>
      {what} could not be loaded right now.
    </StatusMessage>
  );

  const popularCategories = useMemo(
    () => POPULAR_CATEGORY_SLUGS
      .map((slug) => categories.find((item) => item.slug === slug))
      .filter(Boolean),
    [categories],
  );

  const categoryName = (course) => {
    const category = categories.find((item) => [].concat(course.course_category || []).map(String).includes(String(item.id)));
    return category?.name || course.course_category_name || course.category;
  };

  const popularCourses = useMemo(() => {
    const selected = courses.filter((course) => {
      const slug = course.categorySlug || categories.find((item) =>
        [].concat(course.course_category || []).map(String).includes(String(item.id))
      )?.slug;
      return POPULAR_CATEGORY_SLUGS.includes(slug);
    });
    if (activeFilter === "All") {
      return POPULAR_CATEGORY_SLUGS
        .map((slug) => selected.find((course) => {
          const category = categories.find((item) =>
            [].concat(course.course_category || []).map(String).includes(String(item.id))
          );
          return (course.categorySlug || category?.slug) === slug;
        }))
        .filter(Boolean);
    }
    return selected.filter((course) => {
      const category = categories.find((item) => [].concat(course.course_category || []).map(String).includes(String(item.id)));
      return category?.slug === activeFilter.toLowerCase();
    }).slice(0, 6);
  }, [courses, categories, activeFilter]);

  // The latest eight published college profiles, each with its own featured image.
  const popularColleges = colleges.slice(0, 8);
  const categoryCards = categories;
  const stateCards = states.slice(0, 8);
  const articleCards = articles.slice(0, 3);
  const stats = [
    ["courses", courses.length, "Courses", Graduation],
    ["categories", categories.length, "Streams", Book],
    ["states", states.length, "States & UTs", MapPin],
    ["destinations", destinations.length, "Abroad guides", Globe],
  ];

  return (
    <main>
      {/* Hero */}
      <HeroSlider />

      {/* Live WordPress counts. Always rendered (dash until loaded) so nothing below shifts. */}
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
                  {isLoading(key) || !count ? <span className="text-ink-300">—</span> : <CountUp value={count} suffix={count >= 100 ? "+" : ""} />}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Popular courses */}
      <section className="section-y bg-white" id="popular-courses">
        <div className="shell">
          <SectionHeading eyebrow="Start exploring" title={<>Popular <em>Courses</em></>} description="Frequently explored degree programs across streams." action={<a className="link-arrow" href="/courses">View all courses <ArrowUpRight /></a>} />
          <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Popular course filters">
            {["All", ...popularCategories.map((category) => category.name)].map((filter) => (
              <button type="button" aria-pressed={activeFilter === filter} className={`chip shrink-0 ${activeFilter === filter ? "chip-active" : ""}`} key={filter} onClick={() => setActiveFilter(filter)}>{filter}</button>
            ))}
          </div>
          {isLoading("courses") ? <SkeletonGrid count={3} /> : popularCourses.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popularCourses.map((course, index) => {
                const name = categoryName(course);
                const category = popularCategories.find((item) => item.name === name);
                return <Reveal key={course.id} delay={(index % 3) * 80} className="h-full"><CourseCard course={course} index={index} categoryName={name} categoryImage={category ? categoryImage(category.slug) : undefined} hideImage={activeFilter === "All"} /></Reveal>;
              })}
            </div>
          ) : failed.courses ? loadError("Courses") : <StatusMessage>No published courses are available yet.</StatusMessage>}
        </div>
      </section>

      {/* Popular colleges: real College posts from WordPress, in a scroll-snap slider. */}
      <section className="section-y pb-0!" id="popular-colleges">
        <div className="shell">
          <SectionHeading eyebrow="Find your campus" title={<>Popular <em>Colleges</em></>} description="Explore institutions, locations and admission information." action={<a className="link-arrow" href="/colleges">View all colleges <ArrowUpRight /></a>} />
          {isLoading("colleges") ? <SkeletonGrid count={3} className="h-96" /> : popularColleges.length ? (
            <CollegeSlider colleges={popularColleges} />
          ) : failed.colleges ? loadError("Colleges") : <StatusMessage>No published colleges are available yet.</StatusMessage>}
        </div>
      </section>

      {/* Categories */}
      <section className="section-y" id="categories">
        <div className="shell">
          <SectionHeading eyebrow="Find your stream" title={<>Explore Course <em>Categories</em></>} description="From first degree to professional specialisation, find a route that fits your ambitions." />
          {isLoading("categories") ? <SkeletonGrid count={6} className="h-24" /> : categoryCards.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {categoryCards.map((category, index) => (
                <Reveal key={category.id} delay={(index % 4) * 60}>
                  <a className={`group flex h-full items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-linear-to-br transition-[translate,box-shadow,border-color] duration-400 ease-(--ease-out-soft) hover:-translate-y-1 hover:border-transparent hover:shadow-lift p-4 min-[400px]:p-5 sm:p-6 ${categoryTones[index % 4]}`} href={`/courses/${encodeURIComponent(category.slug)}`}>
                    <span className="min-w-0">
                      <strong className="block font-semibold break-words hyphens-auto text-ink-900">{category.name}</strong>
                      {category.count > 0 && <span className="text-xs text-ink-400">{category.count} course{category.count === 1 ? "" : "s"}</span>}
                    </span>
                    <ArrowRight className="hidden size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 min-[400px]:block" />
                  </a>
                </Reveal>
              ))}
            </div>
          ) : failed.categories ? loadError("Course categories") : <StatusMessage>No course categories are published yet.</StatusMessage>}
        </div>
      </section>

      {/* States */}
      <section className="section-y bg-white">
        <div className="shell">
          <SectionHeading eyebrow="Local knowledge, wider choices" title={<>Explore by <em>State</em></>} description="Discover institutions, popular courses and local admission information." action={<a className="link-arrow" href="/states">All states &amp; UTs <ArrowUpRight /></a>} />
          {isLoading("states") ? <SkeletonGrid count={6} className="h-20" /> : stateCards.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stateCards.map((state, index) => (
                <Reveal key={state.id} delay={(index % 4) * 60}>
                  <a className="group flex items-center gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-5 transition-[background-color,border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-ink-900 hover:bg-ink-900" href={`/states/${state.slug || state.id}`}>
                    <span className="font-display text-sm text-brand-600 transition-colors group-hover:text-gold-400">{String(index + 1).padStart(2, "0")}</span>
                    <strong className="flex-1 font-semibold text-ink-900 transition-colors group-hover:text-white" dangerouslySetInnerHTML={{ __html: state.title?.rendered || state.name }} />
                    <ArrowUpRight className="size-4 text-ink-300 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                  </a>
                </Reveal>
              ))}
            </div>
          ) : failed.states ? loadError("States") : <StatusMessage>No states are published yet.</StatusMessage>}
        </div>
      </section>

      {/* Study abroad */}
      <section className="section-y relative overflow-hidden bg-ink-900" id="study-abroad">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-0 size-[30rem] rounded-full bg-brand-600/25 blur-3xl" />
        <div className="shell relative">
          <SectionHeading tone="dark" eyebrow="The world is waiting" title={<>Study <em>Abroad</em></>} description="Explore country guides, university options and visa preparation." action={<a className="link-arrow text-white hover:text-gold-400" href="/study-abroad">All destinations <ArrowUpRight /></a>} />
          {isLoading("destinations") ? <SkeletonGrid count={3} className="h-48 bg-white/5!" /> : destinations.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination, index) => (
                <Reveal key={destination.id} delay={(index % 3) * 80} className="h-full">
                  <a className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-7 transition-[translate,background-color,border-color] duration-400 ease-(--ease-out-soft) hover:-translate-y-1 hover:border-gold-400/40 hover:bg-white/10" href={`/study-abroad/${destination.slug || destination.id}`}>
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-xl bg-gold-400 font-semibold text-ink-900 transition-transform duration-500 ease-(--ease-out-soft) group-hover:scale-110 group-hover:-rotate-6">{destination.acf?.country_code || <Globe className="size-5" />}</span>
                      <ArrowUpRight className="size-5 text-ink-300 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-400" />
                    </div>
                    <h3 className="mt-8 font-display text-2xl font-semibold text-white" dangerouslySetInnerHTML={{ __html: destination.title?.rendered || destination.acf?.country }} />
                    <p className="mt-3 line-clamp-3 text-sm text-ink-300">{stripHtml(destination.acf?.intro_description || destination.acf?.country_overview || destination.acf?.description) || "Explore this destination guide."}</p>
                  </a>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-ink-300">
              {failed.destinations ? "Study-abroad destinations could not be loaded right now." : "Study-abroad destinations are not available yet."}
              {failed.destinations && <button type="button" className="btn btn-light" onClick={retry}>Try again</button>}
            </div>
          )}
        </div>
      </section>

      {/* Articles */}
      <section className="section-y" id="articles">
        <div className="shell">
          <SectionHeading eyebrow="Knowledge for your next step" title={<>Latest <em>Articles</em></>} action={<a className="link-arrow" href="/blog">View all articles <ArrowUpRight /></a>} />
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
                        <Book className="absolute right-6 bottom-6 size-16 text-white/20 transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12" />
                      )}
                      <span className="absolute top-5 left-5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-900 shadow-card backdrop-blur">Education guide</span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-xl leading-snug font-semibold transition-colors group-hover:text-brand-800" dangerouslySetInnerHTML={{ __html: article.title?.rendered }} />
                      <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink-500">{stripHtml(article.excerpt?.rendered) || "Read the latest guidance from our education experts."}</p>
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

      {/* FAQ */}
      <section className="section-y bg-white" id="faq">
        <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow="Questions, answered" title={<>Frequently Asked <em>Questions</em></>} />
            <p className="-mt-4 text-ink-500">Still unsure? Our advisors are one conversation away.</p>
            <a className="btn btn-dark mt-6" href="#contact">Ask an advisor <ArrowUpRight /></a>
          </div>
          <Reveal variant="right" delay={100}><FaqAccordion items={faqs.map(([question, answer]) => ({ question, answer }))} defaultOpen={0} numbered /></Reveal>
        </div>
      </section>

      <div className="pt-20 sm:pt-24">
        <CtaBand id="contact" eyebrow="Your next chapter starts here" title={<>Not sure where <em>to start?</em></>} description="Get a clear, personalised plan for your education journey." actionLabel="Apply Now" actionHref="mailto:hello@a3educarehub.in" />
      </div>
    </main>
  );
}

export default HomePage;
