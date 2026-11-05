/**
 * Two shared IntersectionObservers for the whole app (instead of one per element):
 * - "enter" fires once an element's top passes 90% of the viewport height.
 * - "leave" fires once an element has scrolled fully back *below* the viewport,
 *   so it can animate again the next time the visitor scrolls down to it.
 *   Elements leaving through the top stay visible, which avoids replaying
 *   animations in reverse while scrolling up.
 *
 * IntersectionObserver only reports *crossings*, so a jump from above the viewport to
 * below it (back-to-top, Home key, anchor links) is never reported. A debounced
 * scroll-end sweep over the currently shown elements covers that case.
 */
const listeners = new Map();
const shown = new Set();
let enterObserver;
let leaveObserver;
let sweepTimer = 0;

function sweep() {
  sweepTimer = 0;
  const viewportBottom = window.innerHeight;
  // Read every rect first, then notify, so layout is measured once.
  const leftBelow = [...shown].filter((node) => node.getBoundingClientRect().top > viewportBottom);
  leftBelow.forEach((node) => listeners.get(node)?.(false));
}

function ensureObservers() {
  if (enterObserver) return true;
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return false;

  enterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) listeners.get(entry.target)?.(true);
    });
  }, { rootMargin: "0px 0px -10% 0px" });

  leaveObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting && entry.boundingClientRect.top > 0) listeners.get(entry.target)?.(false);
    });
  });

  window.addEventListener("scroll", () => {
    clearTimeout(sweepTimer);
    sweepTimer = setTimeout(sweep, 150);
  }, { passive: true });
  return true;
}

/** Calls onChange(true|false) as `node` enters/leaves the viewport. Returns a cleanup function. */
export function observeInView(node, onChange, { once = false } = {}) {
  if (!node) return () => {};
  if (!ensureObservers()) {
    onChange(true);
    return () => {};
  }

  const stop = () => {
    listeners.delete(node);
    shown.delete(node);
    enterObserver.unobserve(node);
    leaveObserver.unobserve(node);
  };

  listeners.set(node, (visible) => {
    if (visible) shown.add(node);
    else shown.delete(node);
    onChange(visible);
    if (visible && once) stop();
  });
  enterObserver.observe(node);
  leaveObserver.observe(node);
  return stop;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
