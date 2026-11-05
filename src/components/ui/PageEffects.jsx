import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "./Icons";

/**
 * Site-wide interaction layer, mounted once in App:
 * - reading-progress bar (written straight to a CSS transform, no React re-renders)
 * - back-to-top button
 * - pointer "spotlight" on .card-interactive (desktop pointers only, one delegated listener)
 */
export default function PageEffects() {
  const barRef = useRef(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      setShowTop(window.scrollY > 900);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    let frame = 0;
    let lastEvent;
    const paint = () => {
      frame = 0;
      const card = lastEvent.target.closest?.(".card-interactive");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${lastEvent.clientX - rect.left}px`);
      card.style.setProperty("--my", `${lastEvent.clientY - rect.top}px`);
    };
    const onMove = (event) => {
      lastEvent = event;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5">
        <div ref={barRef} className="h-full origin-left scale-x-0 bg-linear-to-r from-brand-500 via-brand-400 to-gold-400" />
      </div>
      <button
        type="button"
        aria-label="Back to top"
        tabIndex={showTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 grid size-12 place-items-center rounded-full bg-ink-900 text-white shadow-lift transition-[opacity,translate,background-color] duration-300 ease-(--ease-out-soft) hover:bg-brand-600 active:scale-95 sm:right-6 sm:bottom-6 ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowRight className="size-5 -rotate-90" />
      </button>
    </>
  );
}
