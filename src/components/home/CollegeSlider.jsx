import { useEffect, useRef, useState } from "react";
import CollegeCard from "../college/CollegeCard";
import Reveal from "../ui/Reveal";
import { ChevronLeft, ChevronRight } from "../ui/Icons";

/**
 * Horizontally scrolling, scroll-snapping row of college cards (native scrolling, no library):
 * swipe or scroll on touch devices, arrow buttons and a progress bar elsewhere. Cards rise in with the
 * site's Reveal as they enter the viewport. No autoplay, so nothing moves unless the visitor asks.
 */
export default function CollegeSlider({ colleges }) {
  const trackRef = useRef(null);
  const [view, setView] = useState({ atStart: true, atEnd: false, progress: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = track.scrollWidth - track.clientWidth;
      setView({
        atStart: track.scrollLeft <= 2,
        atEnd: max <= 2 || track.scrollLeft >= max - 2,
        progress: track.scrollWidth ? Math.min(1, (track.scrollLeft + track.clientWidth) / track.scrollWidth) : 1,
      });
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
  }, [colleges.length]);

  // One "page" = as many whole cards as are in view, so the next card lands snapped at the left edge.
  const move = (direction) => {
    const track = trackRef.current;
    const card = track?.firstElementChild;
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const stride = card.offsetWidth + gap;
    const perPage = Math.max(1, Math.floor((track.clientWidth + gap) / stride));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * perPage * stride, behavior: reduce ? "auto" : "smooth" });
  };

  const arrow = "grid size-11 place-items-center rounded-full border border-sand-200 bg-white text-ink-700 transition-[background-color,border-color,color,scale] duration-200 hover:border-brand-600 hover:bg-brand-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-95 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Popular colleges">
      <ul
        ref={trackRef}
        className="-mx-5 -my-4 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 py-4 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {colleges.map((college, index) => (
          <Reveal
            as="li"
            key={college.id}
            delay={(index % 3) * 80}
            className="basis-[84%] shrink-0 snap-start sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]"
          >
            <CollegeCard college={college} />
          </Reveal>
        ))}
      </ul>
      <div className="mt-8 flex items-center gap-5">
        <div aria-hidden="true" className="h-1 flex-1 overflow-hidden rounded-full bg-sand-200">
          <div className="h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-(--ease-out-soft)" style={{ width: `${Math.round(view.progress * 100)}%` }} />
        </div>
        <div className="flex gap-2">
          <button type="button" className={arrow} onClick={() => move(-1)} disabled={view.atStart} aria-label="Previous colleges"><ChevronLeft className="size-5" /></button>
          <button type="button" className={arrow} onClick={() => move(1)} disabled={view.atEnd} aria-label="Next colleges"><ChevronRight className="size-5" /></button>
        </div>
      </div>
    </div>
  );
}
