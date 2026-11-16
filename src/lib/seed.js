/**
 * Build-time data for the first view of a page.
 *
 * `npm run build` writes one HTML file per important route (see scripts/routeShells.js) and embeds that route's WordPress
 * data in it as <script id="a3-seed" type="application/json">. The page reads it synchronously for its first render, so
 * nothing waits for JavaScript -> API -> image, and the largest image is already requested by a <link rel="preload">.
 *
 * The seed is only a head start. Pages still ask WordPress for live data (see revalidateAfterLoad) and replace what they
 * show with it, so content is never older than the next load; a missing or unreadable seed simply means "load as before".
 */
let seed = null;

function readSeed() {
  if (seed !== null) return seed;
  seed = { entries: {} };
  try {
    const node = typeof document === "undefined" ? null : document.getElementById("a3-seed");
    if (node?.textContent) seed = JSON.parse(node.textContent);
  } catch {
    // Corrupt or missing seed: behave as if there is none.
  }
  return seed;
}

/** The embedded data for `key` ("colleges", "college:<slug>"), or undefined. */
export function peekSeed(key) {
  return readSeed().entries?.[key];
}

/** Runs `task` once the page has loaded and the browser is idle, so live revalidation never competes with first paint. */
export function revalidateAfterLoad(task) {
  let cancelled = false;
  const run = () => {
    if (cancelled) return;
    if (typeof requestIdleCallback === "function") requestIdleCallback(() => !cancelled && task(), { timeout: 3000 });
    else setTimeout(() => !cancelled && task(), 200);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
  };
}
