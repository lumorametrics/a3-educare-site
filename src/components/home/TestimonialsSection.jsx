import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "../ui/Reveal";
import { ChevronLeft, ChevronRight } from "../ui/Icons";
import { getTestimonials } from "../../services/wordpress";
import { Eyebrow } from "./HomeSections";

const AUTOPLAY_MS = 6000;

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** "City, District, State" without repeats (a city is often also its district's name). */
function placeLine({ city, district, state }) {
  const seen = new Set();
  return [city, district, state].filter((part) => {
    const key = part.toLowerCase();
    if (!part || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join(", ");
}

/** Five filled/empty stars for a 1–5 rating (drawn inline: the outline Star icon belongs to another section). */
function RatingStars({ rating }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" aria-hidden="true" className={`size-4 ${i < rating ? "text-gold-500" : "text-sand-200"}`}>
          <path fill="currentColor" d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

/** Student photo, or an initials avatar of the same size when no photo was uploaded (no layout shift either way). */
function Avatar({ image, name }) {
  const box = "size-14 shrink-0 rounded-full ring-4 ring-brand-50 sm:size-16";
  if (image) {
    return <img src={image.src} srcSet={image.srcSet} sizes="64px" alt={image.alt || name} width="64" height="64" loading="lazy" decoding="async" className={`${box} bg-sand-100 object-cover`} />;
  }
  const initials = name.replace(/^\s*demo\s+/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "A3";
  return <span aria-hidden="true" className={`${box} grid place-items-center bg-linear-to-br from-brand-600 to-brand-800 font-display text-lg font-semibold text-white`}>{initials}</span>;
}

function TestimonialCard({ testimonial, index, total }) {
  const { name, quote, image, category, course, college, year, rating, demo } = testimonial;
  const place = placeLine(testimonial);
  const study = [course, college, year].filter(Boolean).join(" · ");
  return (
    <article
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${name}${demo ? " (demo)" : ""}`}
      className="relative flex h-full flex-col rounded-[1.75rem] border border-sand-200 bg-white p-7 shadow-card transition-[box-shadow,border-color,translate] duration-400 ease-(--ease-out-soft) hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift sm:p-8"
    >
      <span aria-hidden="true" className="pointer-events-none absolute top-5 right-7 font-display text-7xl leading-none text-gold-300 select-none">”</span>
      {(category || demo) && (
        <div className="flex flex-wrap items-center gap-2 pr-10">
          {demo && <span className="rounded-full border border-gold-500 bg-gold-100 px-3 py-1 text-xs font-bold tracking-[0.12em] text-ink-900 uppercase">Demo</span>}
          {category && <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold tracking-wide text-brand-700">{category.name}</span>}
        </div>
      )}
      {rating && <div className="mt-4"><RatingStars rating={rating} /></div>}
      <blockquote className={`flex-1 space-y-3 text-[0.95rem] leading-relaxed text-ink-700 ${rating ? "mt-3" : category || demo ? "mt-5" : "mt-2"}`}>
        {quote.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </blockquote>
      <footer className="mt-7 flex items-center gap-4 border-t border-sand-200 pt-6">
        <Avatar image={image} name={name} />
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-ink-900">{name}</p>
          {study && <p className="mt-0.5 text-sm text-ink-500">{study}</p>}
          {place && <p className="mt-0.5 text-xs tracking-wide text-ink-400 uppercase">{place}</p>}
        </div>
      </footer>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div aria-hidden="true" className="flex h-80 w-full shrink-0 flex-col rounded-[1.75rem] border border-sand-200 bg-white p-8 md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
      <div className="h-6 w-24 animate-pulse rounded-full bg-sand-100" />
      <div className="mt-6 space-y-2.5">{[100, 95, 90, 70].map((w) => <div key={w} className="h-3.5 animate-pulse rounded bg-sand-100" style={{ width: `${w}%` }} />)}</div>
      <div className="mt-auto flex items-center gap-4"><div className="size-16 animate-pulse rounded-full bg-sand-100" /><div className="h-4 w-32 animate-pulse rounded bg-sand-100" /></div>
    </div>
  );
}

/**
 * Student Success Stories: published WordPress testimonials, newest first, in a scroll-snap carousel.
 * 3 cards on desktop, 2 on tablets, 1 on phones; swipe, arrows, dots and arrow keys; autoplay that pauses on
 * hover/focus, stops after any interaction, and is off for reduced motion. With no published testimonials
 * (or the endpoint unavailable) the section is not rendered at all, so no empty or broken cards appear.
 */
export default function TestimonialsSection() {
  const [state, setState] = useState({ status: "loading", items: [] });
  const [view, setView] = useState({ index: 0, perView: 1, positions: 1 });
  const [stopped, setStopped] = useState(reducedMotion);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    let live = true;
    getTestimonials()
      .then((items) => live && setState({ status: items.length ? "ready" : "empty", items }))
      .catch((error) => {
        // A 404 means the Testimonials type is not registered yet: treat it as "nothing to show".
        if (!/\b404\b/.test(error.message)) console.error("Unable to load testimonials:", error);
        if (live) setState({ status: "empty", items: [] });
      });
    return () => { live = false; };
  }, []);

  const stride = useCallback(() => {
    const track = trackRef.current;
    const slide = track?.firstElementChild;
    if (!track || !slide) return 0;
    return slide.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
  }, []);

  // Track position and how many cards fit, from the real layout (so CSS breakpoints decide 1/2/3).
  useEffect(() => {
    const track = trackRef.current;
    if (!track || state.status !== "ready") return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const step = stride();
      if (!step) return;
      const perView = Math.max(1, Math.round((track.clientWidth + (parseFloat(getComputedStyle(track).columnGap) || 0)) / step));
      const positions = Math.max(1, state.items.length - perView + 1);
      const index = Math.min(positions - 1, Math.round(track.scrollLeft / step));
      setView((current) => (current.index === index && current.perView === perView && current.positions === positions ? current : { index, perView, positions }));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    track.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [state, stride]);

  const goTo = useCallback((target) => {
    const track = trackRef.current;
    if (!track) return;
    const index = (target + view.positions) % view.positions;
    track.scrollTo({ left: index * stride(), behavior: reducedMotion() ? "auto" : "smooth" });
  }, [view.positions, stride]);

  const userGoTo = (target) => {
    setStopped(true); // any manual navigation ends autoplay for good
    goTo(target);
  };

  // Autoplay: one interval, paused on hover/focus/hidden tab, stopped after interaction or for reduced motion.
  useEffect(() => {
    if (stopped || paused || view.positions < 2) return undefined;
    const timer = setInterval(() => { if (!document.hidden) goTo(view.index + 1); }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [stopped, paused, view.index, view.positions, goTo]);

  if (state.status === "empty") return null;

  const items = state.items;
  const scrollable = view.positions > 1;

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28" id="success-stories" aria-labelledby="stories-title">
      <div className="shell">
        <div className="mb-10 flex flex-col gap-6 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <Eyebrow>Testimonials</Eyebrow>
            <h2 id="stories-title" className="heading-display text-[2rem] leading-[1.08] sm:text-[2.6rem] lg:text-[3.1rem]">
              Student <em>Success Stories</em>
            </h2>
            <p className="mt-4 text-ink-500 sm:text-lg">Real Journeys. Real Achievements. Real Experiences.</p>
          </Reveal>
          {state.status === "ready" && scrollable && (
            <div className="flex shrink-0 items-center gap-2">
              {[["Previous testimonials", ChevronLeft, -1], ["Next testimonials", ChevronRight, 1]].map(([label, Icon, step]) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  aria-controls="stories-track"
                  onClick={() => userGoTo(view.index + step)}
                  className="grid size-12 place-items-center rounded-full border border-sand-200 bg-white text-ink-700 transition-[background-color,border-color,color,scale] duration-200 hover:border-brand-600 hover:bg-brand-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-95"
                >
                  <Icon className="size-5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {state.status === "loading" ? (
          <div className="flex gap-5 overflow-hidden" aria-busy="true" aria-label="Loading testimonials">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Student success stories"
            tabIndex={scrollable ? 0 : undefined}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") { event.preventDefault(); userGoTo(view.index + 1); }
              if (event.key === "ArrowLeft") { event.preventDefault(); userGoTo(view.index - 1); }
            }}
            onPointerEnter={(event) => event.pointerType === "mouse" && setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onPointerDown={() => setStopped(true)}
            onFocus={() => setPaused(true)}
            onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setPaused(false)}
            className="rounded-[1.75rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
          >
            <ul
              id="stories-track"
              ref={trackRef}
              aria-live={stopped ? "polite" : "off"}
              // "Safe" centring: centred when the cards fit, start-aligned when they overflow. A plain
              // justify-center on an overflowing track shifted the first card out of view on load.
              className="-my-3 flex justify-center-safe snap-x snap-mandatory gap-5 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((testimonial, index) => (
                <li key={testimonial.id} className="flex w-full shrink-0 snap-start md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]">
                  <TestimonialCard testimonial={testimonial} index={index} total={items.length} />
                </li>
              ))}
            </ul>

            {scrollable && (
              <div className="mt-8 flex justify-center gap-2" role="group" aria-label="Choose testimonials">
                {Array.from({ length: view.positions }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Show testimonial ${index + 1}${view.perView > 1 ? `–${Math.min(items.length, index + view.perView)}` : ""}`}
                    aria-current={index === view.index ? "true" : undefined}
                    onClick={() => userGoTo(index)}
                    className="grid h-8 place-items-center"
                  >
                    <span className={`block h-1.5 rounded-full transition-[width,background-color] duration-400 ease-(--ease-out-soft) ${index === view.index ? "w-8 bg-brand-600" : "w-1.5 bg-sand-200 hover:bg-ink-300"}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
