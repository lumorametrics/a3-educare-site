/**
 * Build-time HTML snapshots of rendered routes (used by routeShells.js).
 *
 * Why: on a throttled phone the largest element could not paint until the JavaScript bundle had been downloaded, parsed and run
 * (about 3.5 s of simulated LCP) even with the data and images already preloaded. A snapshot puts that element in the HTML itself.
 *
 * How: each route's HTML file (already carrying its seed and preloads) is opened in headless Chrome from a local static server,
 * the app renders exactly as a visitor would see it, and the rendered #root markup is stored in the file as <div id="a3-snapshot">.
 * At runtime src/main.jsx mounts the live app into the normal (hidden) #root next to it, waits until it has rendered and settled,
 * then removes the snapshot, so nothing visible changes. If anything fails, or JavaScript never runs, the snapshot simply stays.
 *
 * Needs Chrome/Chromium (present on GitHub's ubuntu runners). Without it the build keeps the seeded SPA and says so.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, stat, writeFile } from 'node:fs/promises'
import http from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join, normalize } from 'node:path'

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean)

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain' }
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const SNAPSHOT_STYLE = '    <style>/* hides the live app until it has rendered; removing #a3-snapshot reveals it in place */#a3-snapshot~#root{position:absolute;top:0;left:0;right:0;visibility:hidden;pointer-events:none}</style>\n'

/** Static server for dist with GitHub Pages semantics: exact file, file.html, directory index, else 404.html. */
function serve(dir, base) {
  const prefix = base.endsWith('/') ? base : `${base}/`
  const exists = async (path) => { try { return (await stat(path)).isFile() } catch { return false } }
  const server = http.createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    let file = null
    let status = 200
    if (path.startsWith(prefix) || `${path}/` === prefix) {
      const rel = normalize(path.slice(prefix.length)).split('\\').join('/').split('/').filter(Boolean).join('/')
      for (const candidate of rel ? [rel, `${rel}.html`, `${rel}/index.html`] : ['index.html']) {
        if (await exists(join(dir, candidate))) { file = join(dir, candidate); break }
      }
    }
    if (!file) { file = join(dir, '404.html'); status = 404 }
    res.writeHead(status, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' })
    res.end(await readFile(file))
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port })))
}

async function startChrome() {
  const path = CHROME_CANDIDATES.find((candidate) => existsSync(candidate))
  if (!path) throw new Error('Chrome/Chromium not found (set CHROME_PATH)')
  const port = 9400 + Math.floor(Math.random() * 400)
  const profile = join(tmpdir(), `a3-snapshot-${process.pid}-${Date.now()}`)
  const child = spawn(path, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=CalculateNativeWinOcclusion', 'about:blank'], { stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    try { await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); return { child, port } } catch { await sleep(250) }
  }
  child.kill()
  throw new Error('Chrome did not start')
}

async function openTab(port) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  let id = 0
  const pending = new Map()
  ws.onmessage = (event) => { const message = JSON.parse(event.data); if (message.id) pending.get(message.id)?.(message) }
  const send = (method, params = {}) => new Promise((resolve) => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })) })
  const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  // Every tab must behave as the foreground tab, otherwise Chrome throttles timers and animations in all but one.
  await send('Emulation.setFocusEmulationEnabled', { enabled: true })
  await send('Page.bringToFront')
  return { send, evaluate, close: () => { ws.close(); fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(() => {}) } }
}

// Runs in the page: wait for the route to render and settle, then return its markup ready to embed.
const CAPTURE = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const started = Date.now(); const marks = {};
  const rendered = () => document.querySelector('#root main') && !document.querySelector('#root [role="status"]') && document.querySelectorAll('#root img').length > 0;
  while (!rendered() && Date.now() - started < 15000) await sleep(150);
  if (!rendered()) return null;
  marks.rendered = Date.now() - started;
  // Load every image once, so no frame is saved in its "not loaded yet" (transparent) state; lazy loading is restored below.
  const lazy = [...document.querySelectorAll('#root img[loading="lazy"]')];
  lazy.forEach((img) => { img.dataset.a3lazy = '1'; img.loading = 'eager'; });
  await Promise.all([...document.querySelectorAll('#root img')].filter((img) => !img.complete).map((img) => new Promise((resolve) => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); setTimeout(resolve, 8000); })));
  marks.images = Date.now() - started;
  // Reveal-on-scroll and entrance animations: show the final state, as a visitor sees after scrolling through.
  for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await sleep(60); }
  scrollTo(0, 0); marks.scrolled = Date.now() - started;
  const settled = () => document.getAnimations().every((a) => { const t = a.effect && a.effect.getComputedTiming(); return !t || t.iterations === Infinity || a.playState !== 'running'; });
  for (let i = 0; i < 40 && !settled(); i++) await sleep(150);
  marks.settled = Date.now() - started;
  await sleep(400);
  const root = document.getElementById('root').cloneNode(true);
  root.querySelectorAll('[data-reveal]').forEach((node) => node.setAttribute('data-visible', 'true'));
  root.querySelectorAll('script, noscript, style, dialog, link, template').forEach((node) => node.remove());
  root.querySelectorAll('img[data-a3lazy]').forEach((img) => { img.removeAttribute('data-a3lazy'); img.setAttribute('loading', 'lazy'); });
  // Any frame still marked "not loaded" (an image that failed or timed out) is shown as loaded instead of blank.
  root.querySelectorAll('img.opacity-0').forEach((img) => { img.classList.remove('opacity-0'); img.classList.add('opacity-100'); });
  root.querySelectorAll('.animate-pulse').forEach((node) => node.classList.remove('animate-pulse'));
  window.__marks = marks;
  return root.innerHTML;
})()`

/**
 * Adds a rendered snapshot to each given route file. `routes` are route paths without extension ("colleges", "colleges/<slug>").
 * Returns how many files were updated.
 */
export async function addSnapshots({ outDir, base, routes, concurrency = 4, log = console.log }) {
  const prefix = base.endsWith('/') ? base : `${base}/`
  const { server, port: webPort } = await serve(outDir, prefix)
  let chrome
  const tabs = []
  try {
    chrome = await startChrome()
    for (let i = 0; i < concurrency; i++) tabs.push(await openTab(chrome.port))
    let done = 0
    let failed = 0
    let next = 0
    await Promise.all(tabs.map(async (tab) => {
      while (next < routes.length) {
        const route = routes[next++]
        try {
          await tab.send('Page.navigate', { url: `http://127.0.0.1:${webPort}${prefix}${route === 'index' ? '' : route}` })
          const t0 = Date.now()
          const html = await tab.evaluate(CAPTURE)
          if (process.env.A3_SNAPSHOT_DEBUG) log(`  ${route}: ${Date.now() - t0} ms`, JSON.stringify(await tab.evaluate('window.__marks')))
          if (!html || html.length < 2000) { failed++; continue }
          const file = join(outDir, `${route}.html`)
          const page = await readFile(file, 'utf8')
          if (!page.includes('<div id="root"></div>')) { failed++; continue }
          await writeFile(file, page.replace('</head>', `${SNAPSHOT_STYLE}  </head>`).replace('<div id="root"></div>', `<div id="a3-snapshot">${html}</div><div id="root"></div>`))
          done++
        } catch { failed++ }
      }
    }))
    log(`✓ snapshots embedded in ${done} route file(s)${failed ? `, ${failed} skipped` : ''}`)
    return done
  } finally {
    tabs.forEach((tab) => tab.close())
    chrome?.child.kill()
    await new Promise((resolve) => server.close(resolve))
  }
}
