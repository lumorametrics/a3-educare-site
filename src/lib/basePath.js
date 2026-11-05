/**
 * Support for hosting the site under a sub-path, such as GitHub Pages at /a3-educare-frontend/.
 * The path comes from VITE_BASE_PATH at build time. At the domain root BASE is empty, every
 * helper returns its input unchanged and installBasePath() does nothing.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

export const basePath = BASE;

/** The current or given address without the hosting sub-path, which is what the router matches. */
export function stripBase(pathname) {
  if (!BASE) return pathname;
  if (pathname === BASE) return "/";
  return pathname.startsWith(`${BASE}/`) ? pathname.slice(BASE.length) : pathname;
}

/** A root-relative site path or public file path, with the hosting sub-path added. */
export function withBase(path) {
  if (!BASE || !path.startsWith("/") || path.startsWith("//")) return path;
  return path === BASE || path.startsWith(`${BASE}/`) ? path : `${BASE}${path}`;
}

function fixLink(anchor) {
  const href = anchor.getAttribute("href");
  if (href && href !== withBase(href)) anchor.setAttribute("href", withBase(href));
}

function fixLinksIn(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  if (node.matches("a[href]")) fixLink(node);
  node.querySelectorAll("a[href]").forEach(fixLink);
}

/**
 * Pages write links and history entries as /about, including links inside WordPress content.
 * Under a sub-path these are corrected in one place, so new tabs and shared links also work.
 */
export function installBasePath() {
  if (!BASE) return;
  for (const method of ["pushState", "replaceState"]) {
    const original = window.history[method].bind(window.history);
    window.history[method] = (state, title, url) => {
      if (url == null) return original(state, title);
      const target = new URL(String(url), window.location.href);
      if (target.origin === window.location.origin) target.pathname = withBase(target.pathname);
      return original(state, title, target);
    };
  }
  new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "attributes") fixLinksIn(change.target);
      else change.addedNodes.forEach(fixLinksIn);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["href"] });
  fixLinksIn(document.documentElement);
}
