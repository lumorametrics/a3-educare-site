import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "../ui/Icons";
import { withBase } from "../../lib/basePath";
import { HERO_SLIDES } from "./heroSlides";

// Time each slide stays on screen before autoplay advances (the progress bar uses the same value).
const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Full-width home page banner slider.
 *
 * - Transition: the incoming slide fades in on top of the outgoing one, which stays fully
 *   visible underneath until it is covered, so there is never a dark or blank frame.
 * - Autoplay: one timer, AUTOPLAY_MS per slide, looping. It pauses (keeping the elapsed time)
 *   on mouse hover, keyboard focus inside the slider and hidden tabs, and via the pause button
 *   (WCAG 2.2.2). Manual navigation restarts the countdown for the new slide.
 * - Reduced motion: autoplay and the opacity cross-fade remain (fades are not movement), but
 *   the Ken Burns zoom and the sliding text entrance are switched off.
 */
export default function HeroSlider({ slides = HERO_SLIDES }) {
  const count = slides.length;
  const [active, setActive] = useState(0);
  // Slide being faded over; null until the first change, so the first image never fades in (LCP).
  const [previous, setPrevious] = useState(null);
  const [entered, setEntered] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  // Images are only requested for slides that are showing or adjacent.
  const [mounted, setMounted] = useState(() => new Set([0, 1 % count]));
  const [reducedMotion] = useState(prefersReducedMotion);
  const pointerStart = useRef(null);
  // Time already spent on the current slide before a pause, so resuming doesn't restart it.
  const elapsed = useRef({ index: 0, ms: 0 });

  const goTo = useCallback((index) => {
    const next = (index + count) % count;
    if (next === active) return;
    setPrevious(active);
    setActive(next);
    setMounted((current) => {
      const wanted = [next, (next + 1) % count, (next - 1 + count) % count];
      return wanted.every((i) => current.has(i)) ? current : new Set([...current, ...wanted]);
    });
  }, [active, count]);

  useEffect(() => {
    // Lets the first slide's text animate in after the initial paint.
    const frame = requestAnimationFrame(() => setEntered(true));
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const autoplay = playing && count > 1;
  const paused = hovered || focused || tabHidden;

  // The only autoplay timer. Re-created whenever the slide or pause state changes, and always
  // cleared first, so two timers can never run at once.
  useEffect(() => {
    if (!autoplay || paused) return undefined;
    if (elapsed.current.index !== active) elapsed.current = { index: active, ms: 0 };
    const startedAt = performance.now();
    const timer = setTimeout(() => goTo(active + 1), Math.max(0, AUTOPLAY_MS - elapsed.current.ms));
    return () => {
      clearTimeout(timer);
      if (elapsed.current.index === active) elapsed.current.ms += performance.now() - startedAt;
    };
  }, [active, autoplay, paused, goTo]);

  const onKeyDown = (event) => {
    if (event.key === "ArrowLeft") goTo(active - 1);
    else if (event.key === "ArrowRight") goTo(active + 1);
    else return;
    event.preventDefault();
  };

  const onPointerDown = (event) => {
    if (event.pointerType !== "mouse") pointerStart.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) goTo(active + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      // Fills the screen below the header (capped at 820px), but never shorter than its content:
      // the slides share one grid cell, so the tallest slide sets the height and short or narrow
      // screens grow the hero instead of clipping the text.
      className="relative isolate grid min-h-[max(560px,min(calc(100svh-4rem),820px))] touch-pan-y overflow-hidden bg-ink-950 text-white sm:min-h-[max(560px,min(calc(100svh-5rem),820px))]"
      style={{ "--hero-interval": `${AUTOPLAY_MS}ms` }}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { pointerStart.current = null; }}
      // Hover pause only for real mice; on touch screens "hover" would stick after a tap.
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      // Only keyboard focus pauses; a mouse click on prev/next must not stop autoplay for good.
      onFocus={(event) => event.target.matches(":focus-visible") && setFocused(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}
    >
      <div aria-live={autoplay && !paused ? "off" : "polite"} className="grid">
        {slides.map((slide, index) => {
          const isActive = index === active;
          const isPrevious = index === previous;
          const show = isActive && entered;
          const Heading = index === 0 ? "h1" : "h2"; // one h1 per page; every slide looks the same
          // Staggered text entrance (a fade only for reduced motion); outgoing text fades out fast.
          const revealClass = reducedMotion
            ? `transition-opacity ${show ? "opacity-100 duration-700" : "opacity-0 duration-300"}`
            : `transition-[opacity,translate] ${show ? "translate-y-0 opacity-100 duration-700 ease-(--ease-out-soft)" : "translate-y-5 opacity-0 duration-300"}`;
          const delay = (ms) => ({ transitionDelay: show ? `${ms}ms` : "0ms" });
          return (
            <div
              key={slide.image}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
              aria-hidden={!isActive}
              inert={!isActive}
              className={`relative flex flex-col [grid-area:1/1] ${
                isActive ? `z-20 ${previous !== null ? "hero-fade-in" : ""}` : isPrevious ? "z-10" : "invisible z-0"
              }`}
            >
              {mounted.has(index) && (
                <picture>
                  <source media="(max-width: 639px)" srcSet={withBase(`/hero/${slide.image}-mobile.webp`)} type="image/webp" />
                  <img
                    src={withBase(`/hero/${slide.image}-1408.webp`)}
                    srcSet={`${withBase(`/hero/${slide.image}-1024.webp`)} 1024w, ${withBase(`/hero/${slide.image}-1408.webp`)} 1408w`}
                    sizes="100vw"
                    alt=""
                    width="1408"
                    height="768"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    decoding="async"
                    style={{ "--hero-position": slide.position }}
                    // Slow zoom-out (Ken Burns) while a slide is showing; static for reduced motion.
                    className={`absolute inset-0 size-full object-cover object-center sm:object-(--hero-position) ${
                      reducedMotion ? "" : `transition-transform duration-[6000ms] ease-linear will-change-transform ${show ? "scale-100" : "scale-[1.08]"}`
                    }`}
                  />
                </picture>
              )}
              {/* Dark gradient for legible text: from the bottom on phones, from the left on wider screens
                  (stronger on tablets, where the text spans most of the width). */}
              <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/75 to-ink-950/15 sm:bg-linear-to-r sm:from-ink-950/90 sm:via-ink-950/75 sm:to-ink-950/45 lg:via-ink-950/60 lg:to-ink-950/5" />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-ink-950/70 to-transparent" />

              {/* Top padding keeps the text clear of the header; bottom padding clears the controls and
                  the stats card that overlaps the hero's lower edge. */}
              <div className="shell relative flex flex-1 flex-col justify-end pt-12 pb-32 sm:justify-center sm:pt-16 sm:pb-44">
                <div className="max-w-xl lg:max-w-2xl">
                  <p style={delay(0)} className={`${revealClass} inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-sm`}>
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-400" />
                    {slide.eyebrow}
                  </p>
                  <Heading style={delay(90)} className={`${revealClass} mt-5 text-[1.9rem] leading-[1.08] font-bold min-[375px]:text-[2.15rem] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl`}>
                    {slide.title} <span className="text-brand-300">{slide.accent}</span>
                  </Heading>
                  <p style={delay(180)} className={`${revealClass} mt-5 max-w-xl text-base leading-relaxed font-normal text-white/80 sm:text-lg`}>
                    {slide.text}
                  </p>
                  <div style={delay(270)} className={`${revealClass} mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap`}>
                    <a className="btn btn-primary px-7 py-3.5" href="/courses">Explore Courses <ArrowUpRight /></a>
                    <a className="btn btn-ghost-light px-7 py-3.5 backdrop-blur-sm" href="/#contact">Book Free Counseling</a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-30 pb-16 sm:pb-24">
          <div className="shell flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              {slides.map((slide, index) => {
                const isActive = index === active;
                return (
                  <button
                    key={slide.image}
                    type="button"
                    aria-label={`Go to slide ${index + 1}: ${slide.title} ${slide.accent}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => goTo(index)}
                    className="group grid h-8 place-items-center"
                  >
                    <span className={`relative block h-1 overflow-hidden rounded-full bg-white/30 transition-[width,background-color] duration-500 ease-(--ease-out-soft) group-hover:bg-white/50 ${isActive ? "w-6 sm:w-16" : "w-2 sm:w-6"}`}>
                      {/* Autoplay countdown; paused together with the timer. Full bar when autoplay is off. */}
                      {isActive && (
                        <span
                          key={`${active}-${autoplay}`}
                          className={`absolute inset-0 origin-left rounded-full bg-white ${autoplay ? "hero-progress" : ""}`}
                          style={autoplay ? { animationPlayState: paused ? "paused" : "running" } : undefined}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
              <span className="ml-2 hidden text-xs font-medium text-white/70 tabular-nums sm:inline">
                {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                onClick={() => setPlaying((value) => !value)}
                className="grid size-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => goTo(active - 1)}
                className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/5 backdrop-blur-sm transition-[background-color,border-color,scale] duration-300 hover:border-white/60 hover:bg-white/15 active:scale-95 sm:size-12"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => goTo(active + 1)}
                className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/5 backdrop-blur-sm transition-[background-color,border-color,scale] duration-300 hover:border-white/60 hover:bg-white/15 active:scale-95 sm:size-12"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
