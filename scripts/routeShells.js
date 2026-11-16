/**
 * Per-route HTML for the static host (GitHub Pages).
 *
 * The app is a client-rendered SPA: before this step the browser had to download the entry script, then the page's chunk,
 * then ask WordPress for data (two calls for colleges), and only then request the largest image. On a phone that chain is
 * what made LCP 3.3-3.8 s. After `vite build` this plugin writes, for each route below, a copy of dist/index.html with:
 *   - <link rel="modulepreload"> for the route's page chunk and its shared chunks (downloaded in parallel with the entry),
 *   - <link rel="preload" as="image"> for the route's largest image (same srcset/sizes as the component, so it is reused),
 *   - for colleges: the route's WordPress data as <script id="a3-seed"> (read by src/lib/seed.js), so the first render
 *     already shows content and no API call sits in front of it.
 * Files are named so GitHub Pages serves them at the existing URLs with no redirect: colleges.html -> /colleges,
 * colleges/<slug>.html -> /colleges/<slug>. They also stop direct visits being answered by the 404.html fallback.
 *
 * Nothing here changes what the app renders or any URL, slug, canonical or metadata: the app still sets those itself, and
 * it still refreshes from WordPress after load. If WordPress or the manifest is unavailable the build keeps the plain SPA.
 */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createServer } from 'vite'
import { addSnapshots } from './snapshot.js'

// Same srcset `sizes` the components use (CollectionDirectory featured cards, CollegeHeroBackdrop, About hero).
const COLLEGE_CARD_SIZES = '(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw'
const HERO_SIZES = '100vw'
const LIST_SIZES = new Set(['medium', 'medium_large', 'large'])

// Static pages that only need their chunk preloaded: route file (without .html) -> page module.
const CHUNK_ONLY_ROUTES = {
  about: 'src/pages/AboutUs.jsx',
  services: 'src/pages/Services.jsx',
  contact: 'src/pages/ContactUs.jsx',
  registration: 'src/pages/Registration.jsx',
  gallery: 'src/pages/Gallery.jsx',
  scholarships: 'src/pages/Scholarships.jsx',
  courses: 'src/pages/CourseDirectory.jsx',
  states: 'src/pages/CollectionDirectory.jsx',
  districts: 'src/pages/CollectionDirectory.jsx',
  'study-abroad': 'src/pages/CollectionDirectory.jsx',
  blog: 'src/pages/BlogDirectory.jsx',
  'apply-now': 'src/pages/ApplyNow.jsx',
  'privacy-policy': 'src/pages/PrivacyPolicy.jsx',
  terms: 'src/pages/TermsOfUse.jsx',
  'image-credits': 'src/pages/ImageCreditsPage.jsx',
}

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const escapeJson = (value) => JSON.stringify(value).replace(/</g, '\u003c').replace(new RegExp(String.fromCharCode(0x2028), 'g'), '\u2028').replace(new RegExp(String.fromCharCode(0x2029), 'g'), '\u2029')

async function mapLimit(items, limit, task) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await task(items[index], index)
    }
  }))
  return results
}

/** The image the page shows first for a college, by the same priority as src/lib/collegeImage.js (ACF image, older ACF image, native). */
function firstImage(acf, getResponsiveImage) {
  for (const key of ['featured_image', 'college_image', 'featured_media']) {
    const value = acf?.[key]
    if (value && typeof value === 'object') {
      const image = getResponsiveImage(value, '')
      if (image) return image
    }
  }
  return null
}

/** A media record reduced to what a card reads: the original URL, alt text and the size variants behind its srcset. */
function slimMedia(media) {
  if (!media || typeof media !== 'object') return media
  const sizes = {}
  for (const [name, size] of Object.entries(media.media_details?.sizes || {})) {
    // Cards pick at most the 1024 px variant (a 288-360 px frame at up to 3x); the 1536/2048/full sizes stay out of the list seed.
    if (LIST_SIZES.has(name) && size?.source_url && size.width) sizes[name] = { source_url: size.source_url, width: size.width }
  }
  return { id: media.id, source_url: media.source_url, alt_text: media.alt_text || '', media_details: { sizes } }
}

/** The colleges list as /colleges renders it: only the fields its cards read (the live refresh brings the rest). */
function slimCollege(item) {
  const acf = item.acf || {}
  const keep = {}
  for (const key of ['college_location', 'location', 'city', 'state']) if (acf[key] !== undefined) keep[key] = acf[key]
  for (const key of ['featured_image', 'college_image', 'featured_media']) if (acf[key] !== undefined) keep[key] = slimMedia(acf[key])
  return { id: item.id, slug: item.slug, title: { rendered: item.title?.rendered || '' }, featured_media: item.featured_media, acf: keep }
}

function preloadImage(image, sizes, media) {
  if (!image?.src) return ''
  const attrs = [
    'rel="preload"', 'as="image"', `href="${escapeAttr(image.src)}"`,
    image.srcSet ? `imagesrcset="${escapeAttr(image.srcSet)}"` : '', image.srcSet ? `imagesizes="${escapeAttr(sizes)}"` : '',
    media ? `media="${media}"` : '', 'fetchpriority="high"',
  ].filter(Boolean).join(' ')
  return `    <link ${attrs} />\n`
}

export default function routeShells({ mode, base }) {
  let outDir = 'dist'
  let root = process.cwd()
  let isBuild = false
  return {
    name: 'a3-route-shells',
    apply: 'build',
    config() {
      // The manifest maps each page module to its hashed chunk and the shared chunks it imports.
      return { build: { manifest: true } }
    },
    configResolved(config) {
      root = config.root
      outDir = resolve(config.root, config.build.outDir)
      isBuild = config.command === 'build'
    },
    async closeBundle() {
      if (!isBuild || process.env.A3_ROUTE_SHELLS === 'off') return
      let server
      try {
        const template = await readFile(resolve(outDir, 'index.html'), 'utf8')
        const manifest = JSON.parse(await readFile(resolve(outDir, '.vite/manifest.json'), 'utf8'))
        const prefix = base.endsWith('/') ? base : `${base}/`

        // Chunk files for a page module, plus the shared chunks it statically imports (the entry is already requested).
        const chunkFiles = (key) => {
          const files = new Set()
          const visit = (name) => {
            const entry = manifest[name]
            if (!entry || files.has(entry.file) || entry.isEntry) return
            files.add(entry.file)
            for (const dep of entry.imports || []) visit(dep)
          }
          visit(key)
          return [...files]
        }
        const chunkLinks = (key) => chunkFiles(key).map((file) => `    <link rel="modulepreload" crossorigin href="${prefix}${file}" />\n`).join('')

        const write = async (routePath, html) => {
          const target = resolve(outDir, `${routePath}.html`)
          await mkdir(dirname(target), { recursive: true })
          await writeFile(target, html)
        }
        const shell = (extraHead) => template.replace('</head>', `${extraHead}  </head>`)
        const written = []
        // The fallback page for addresses without a file stays the plain app shell (no page-specific preloads).
        await writeFile(resolve(outDir, '404.html'), template)

        // Routes that only need their chunk preloaded.
        for (const [route, moduleKey] of Object.entries(CHUNK_ONLY_ROUTES)) {
          if (!manifest[moduleKey]) continue
          await write(route, shell(chunkLinks(moduleKey)))
          written.push(route)
        }
        // Home: the first hero slide is already preloaded by index.html; add the home chunk.
        if (manifest['src/pages/HomePage.jsx']) {
          await writeFile(resolve(outDir, 'index.html'), shell(chunkLinks('src/pages/HomePage.jsx')))
          written.push('index')
        }

        // Colleges list and detail pages need WordPress data; load it with the app's own service functions.
        server = await createServer({
          root, mode, base, configFile: false, appType: 'custom', logLevel: 'silent', envDir: root, envPrefix: 'VITE_', define: { 'import.meta.env.DEV': false },
          server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] },
        })
        const wp = await server.ssrLoadModule('/src/services/wordpress.js')
        const media = await server.ssrLoadModule('/src/lib/media.js')
        const colleges = await wp.getColleges()
        if (!Array.isArray(colleges) || !colleges.length) throw new Error('no colleges returned by WordPress')

        const listSeed = colleges.map(slimCollege)
        if (manifest['src/pages/CollectionDirectory.jsx']) {
          const images = listSeed.slice(0, 4).map((college) => firstImage(college.acf, media.getResponsiveImage))
          const preloads = images.map((image, index) => preloadImage(image, COLLEGE_CARD_SIZES, index === 0 ? '' : index === 1 ? '(min-width: 640px)' : '(min-width: 1024px)')).join('')
          const seedTag = `    <script id="a3-seed" type="application/json">${escapeJson({ builtAt: new Date().toISOString(), entries: { colleges: listSeed } })}</script>\n`
          await write('colleges', shell(chunkLinks('src/pages/CollectionDirectory.jsx') + preloads + seedTag))
          written.push('colleges')
        }

        if (manifest['src/pages/CollegeDetail.jsx']) {
          const detailLinks = chunkLinks('src/pages/CollegeDetail.jsx')
          const slugs = colleges.map((college) => college.slug).filter(Boolean)
          let failed = 0
          await mapLimit(slugs, 6, async (slug) => {
            try {
              const items = await wp.getCollegeBySlug(slug)
              if (!items?.[0]) { failed++; return }
              const image = firstImage(items[0].acf, media.getResponsiveImage)
              const seedTag = `    <script id="a3-seed" type="application/json">${escapeJson({ builtAt: new Date().toISOString(), entries: { [`college:${slug}`]: items } })}</script>\n`
              await write(`colleges/${slug}`, shell(detailLinks + preloadImage(image, HERO_SIZES) + seedTag))
              written.push(`colleges/${slug}`)
            } catch {
              failed++ // this college simply keeps loading as a normal SPA page
            }
          })
          if (failed) this.warn(`route shells: ${failed} college page(s) were skipped (WordPress data unavailable)`)
        }
        console.log(`\n✓ route shells written for ${written.length} routes (${written.filter((route) => route.startsWith('colleges/')).length} college pages)`)

        // Rendered HTML for the routes where the largest element otherwise waits for JavaScript (see snapshot.js).
        if (process.env.A3_SNAPSHOTS !== 'off') {
          try {
            await server.close()
            server = undefined
            await addSnapshots({ outDir, base: prefix, routes: written.filter((route) => (process.env.A3_SNAPSHOT_ROUTES ? process.env.A3_SNAPSHOT_ROUTES.split(',').includes(route) : route === 'colleges' || route === 'about' || route.startsWith('colleges/'))) })
          } catch (error) {
            this.warn(`snapshots skipped, route files keep their seed and preloads only: ${error.message}`)
          }
        }
      } catch (error) {
        this.warn(`route shells skipped, the site stays a plain SPA: ${error.message}`)
      } finally {
        await server?.close()
        await rm(resolve(outDir, '.vite'), { recursive: true, force: true })
      }
    },
  }
}
