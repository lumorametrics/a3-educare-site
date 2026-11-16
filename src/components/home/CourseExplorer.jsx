import { useMemo, useRef, useState } from "react";
import Reveal from "../ui/Reveal";
import StatusMessage from "../ui/StatusMessage";
import { CATEGORY_INFO } from "../../lib/categoryInfo";
import { toPlainText } from "../../lib/text";
import {
  ArrowRight, ArrowUpRight, BarChart, Book, ChefHat, Clock, Cpu, HeartPulse, Landmark, Microscope, Pill, Scale,
  ScrollText, Sprout, Stethoscope,
} from "../ui/Icons";
import { Eyebrow } from "./HomeSections";

// An illustrative icon per WordPress course_category slug. None of these icons is used by another section.
const CATEGORY_ICONS = {
  academic: Book, agriculture: Sprout, diploma: ScrollText, engineering: Cpu, general: Landmark, law: Scale,
  management: BarChart, medical: Stethoscope, nursing: HeartPulse, paramedical: Microscope, pharmacy: Pill,
  professional: ChefHat,
};
const DEFAULT_CATEGORY = "engineering";
const COURSES_SHOWN = 6;

const courseCategoryIds = (course) => [].concat(course.course_category || []).map(String);

/**
 * Explore courses: every WordPress course category as a selectable tile (ARIA tabs) beside a detail panel with
 * the category's description and its published courses. One DOM for all sizes: on phones the tiles become a
 * horizontally scrolling row above the panel.
 */
export default function CourseExplorer({ categories, courses, loadingCategories, loadingCourses, failedCategories, onRetry }) {
  const [selected, setSelected] = useState(null);
  const tabRefs = useRef([]);

  const activeSlug = selected
    || (categories.some((category) => category.slug === DEFAULT_CATEGORY) ? DEFAULT_CATEGORY : categories[0]?.slug);
  const activeIndex = Math.max(0, categories.findIndex((category) => category.slug === activeSlug));
  const active = categories[activeIndex];

  const activeCourses = useMemo(() => {
    if (!active) return [];
    return courses.filter((course) => course.categorySlug === active.slug || courseCategoryIds(course).includes(String(active.id)));
  }, [active, courses]);

  const onKeyDown = (event) => {
    const count = categories.length;
    const keys = { ArrowRight: activeIndex + 1, ArrowDown: activeIndex + 1, ArrowLeft: activeIndex - 1, ArrowUp: activeIndex - 1, Home: 0, End: count - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = (keys[event.key] + count) % count;
    setSelected(categories[next].slug);
    tabRefs.current[next]?.focus();
  };

  const ActiveIcon = CATEGORY_ICONS[active?.slug] || Book;
  const name = toPlainText(active?.name || "");

  return (
    <section className="relative bg-white py-20 sm:py-24 lg:py-28" id="courses" aria-labelledby="courses-title">
      <div className="shell">
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <Reveal className="max-w-2xl">
            <Eyebrow>Explore courses</Eyebrow>
            <h2 id="courses-title" className="heading-display text-[2rem] leading-[1.08] sm:text-[2.6rem] lg:text-[3.1rem]">
              Pick a stream, <em>see where it leads.</em>
            </h2>
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-4 lg:max-w-sm lg:items-end lg:text-right">
            <p className="text-ink-500">Choose a stream to see what it covers and the programmes published in it.</p>
            <a className="link-arrow" href="/courses">Course directory <ArrowUpRight /></a>
          </Reveal>
        </div>

        {loadingCategories ? (
          <div aria-hidden="true" className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="grid grid-cols-3 gap-3">{Array.from({ length: 12 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-sand-100" />)}</div>
            <div className="h-96 animate-pulse rounded-[2rem] bg-sand-100" />
          </div>
        ) : !categories.length ? (
          failedCategories ? (
            <StatusMessage tone="error" action={<button type="button" className="btn btn-dark mt-2" onClick={onRetry}>Try again</button>}>Course categories could not be loaded right now.</StatusMessage>
          ) : <StatusMessage>No course categories are published yet.</StatusMessage>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
            <Reveal variant="left">
              <div
                role="tablist"
                aria-label="Course streams"
                onKeyDown={onKeyDown}
                className="-mx-5 flex snap-x gap-2.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
              >
                {categories.map((category, index) => {
                  const Icon = CATEGORY_ICONS[category.slug] || Book;
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={category.id}
                      ref={(node) => { tabRefs.current[index] = node; }}
                      type="button"
                      role="tab"
                      id={`course-tab-${category.slug}`}
                      aria-selected={isActive}
                      aria-controls="course-panel"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setSelected(category.slug)}
                      className={`group flex shrink-0 snap-start items-center gap-3 rounded-2xl border p-3 text-left transition-[background-color,border-color,box-shadow,translate] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:flex-col sm:items-start sm:p-4 ${
                        isActive ? "border-brand-600 bg-brand-600 text-white shadow-[0_12px_28px_-14px_var(--color-brand-700)]" : "border-sand-200 bg-sand-50 text-ink-900 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white hover:shadow-card"
                      }`}
                    >
                      <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${isActive ? "bg-white/15 text-white" : "bg-white text-brand-700 group-hover:bg-brand-50"}`}><Icon className="size-4.5" /></span>
                      <span className="min-w-0 pr-1">
                        <span className="block text-sm font-semibold whitespace-nowrap sm:whitespace-normal" dangerouslySetInnerHTML={{ __html: category.name }} />                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal variant="right" delay={100}>
              <div id="course-panel" role="tabpanel" aria-labelledby={`course-tab-${active.slug}`} className="relative isolate flex h-full flex-col overflow-hidden rounded-[2rem] bg-ink-900 p-7 text-white sm:p-9">
                <div key={active.slug} className="flex flex-1 flex-col motion-safe:animate-fade-up">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-2xl bg-gold-400 text-ink-900"><ActiveIcon className="size-6" /></span>
                    <span className="text-xs font-semibold tracking-[0.18em] text-gold-400 uppercase">Stream</span>
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-semibold text-white" dangerouslySetInnerHTML={{ __html: active.name }} />
                  {CATEGORY_INFO[active.slug] && <p className="mt-3 text-ink-200">{CATEGORY_INFO[active.slug]}</p>}

                  <p className="mt-7 text-xs font-semibold tracking-[0.16em] text-ink-300 uppercase">Programmes in {name}</p>
                  {loadingCourses ? (
                    <ul aria-hidden="true" className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <li key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)}</ul>
                  ) : activeCourses.length ? (
                    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {activeCourses.slice(0, COURSES_SHOWN).map((course) => {
                        const duration = toPlainText(course.acf?.duration || course.acf?.course_duration || "");
                        return (
                          <li key={course.id}>
                            <a href={`/courses/${active.slug}/${course.slug || course.id}`} className="group flex h-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-[background-color,border-color] duration-300 hover:border-gold-400/50 hover:bg-white/10">
                              <span className="min-w-0">
                                <strong className="block truncate text-sm font-semibold" dangerouslySetInnerHTML={{ __html: course.title?.rendered }} />
                                {duration && <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-300"><Clock className="size-3 shrink-0" /> {duration}</span>}
                              </span>
                              <ArrowUpRight className="size-4 shrink-0 text-ink-300 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-400" />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-ink-300">Programme details for this stream are being added.</p>
                  )}

                  <a className="btn btn-gold mt-8 self-start" href={`/courses/${encodeURIComponent(active.slug)}`}>
                    All {name} courses <ArrowRight />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
