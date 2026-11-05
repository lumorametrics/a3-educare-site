import { useEffect, useRef, useState } from "react";
import { observeInView, prefersReducedMotion } from "./inView";

/** Counts from 0 to `value` (ease-out) the first time it scrolls into view. */
export default function CountUp({ value, duration = 1400, suffix = "" }) {
  const ref = useRef(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame = 0;
    const stop = observeInView(ref.current, (inView) => {
      if (!inView) return;
      if (prefersReducedMotion()) {
        setCurrent(value);
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        setCurrent(Math.round(value * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { once: true });
    return () => {
      stop();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden="true">{current}{suffix}</span>
      <span className="sr-only">{value}{suffix}</span>
    </span>
  );
}
