import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'

const DEFAULT_WP_API = 'https://staging.a3educarehub.in/wp-json/wp/v2'

// Public routes that do not come from WordPress collections.
const STATIC_ROUTES = ['', 'courses', 'colleges', 'states', 'study-abroad', 'blog', 'services', 'about', 'gallery', 'privacy-policy', 'terms', 'contact', 'scholarships', 'apply-now']
// [REST base, frontend path prefix]; courses, states and districts are added separately (nested URLs).
// Blog posts and individual scholarship pages are deliberately not listed (the blog is handled separately).
const SITEMAP_COLLECTIONS = [['college', 'colleges'], ['study-abroad', 'study-abroad']]

async function fetchAll(apiBase, restBase, fields = 'slug,modified_gmt,course_category') {
  const items = []
  for (let page = 1, totalPages = 1; page <= totalPages; page += 1) {
    const response = await fetch(`${apiBase}/${restBase}?per_page=100&page=${page}&_fields=${fields}`, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error(`${restBase}: HTTP ${response.status}`)
    totalPages = Number(response.headers.get('x-wp-totalpages')) || 1
    items.push(...await response.json())
  }
  return items
}

/**
 * - Replaces %WP_ORIGIN% in index.html (preconnect hints for the WordPress host).
 * - After `vite build`, writes dist/sitemap.xml from the live WordPress collections and adds
 *   it to dist/robots.txt. Needs VITE_SITE_URL (the public frontend origin); if it is missing
 *   or WordPress is unreachable the build still succeeds and only the sitemap is skipped.
 */
function wordpressSeo(env) {
  const apiBase = env.VITE_WORDPRESS_API || DEFAULT_WP_API
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/+$/, '')
  let outDir = 'dist'
  let isBuild = false
  return {
    name: 'wordpress-seo',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
      isBuild = config.command === 'build'
    },
    transformIndexHtml(html) {
      return html.replaceAll('%WP_ORIGIN%', new URL(apiBase).origin)
    },
    async closeBundle() {
      if (!isBuild) return
      if (!siteUrl) {
        this.warn('VITE_SITE_URL is not set — skipping sitemap.xml (canonical URLs fall back to the current origin).')
        return
      }
      try {
        const lastmodOf = (item) => (item.modified_gmt ? `${item.modified_gmt}Z` : undefined)
        const urls = STATIC_ROUTES.map((path) => ({ loc: `${siteUrl}/${path}` }))
        // Sitemap URL structure: /courses/<category>/<course>, /states/<state>/<district>,
        // /states/<state>/<category>-colleges and /states/<state>/<district>/<category>.
        const categories = await fetchAll(apiBase, 'course_category', 'id,slug')
        const categoryById = new Map(categories.map((term) => [term.id, term.slug]))
        urls.push(...categories.map((term) => ({ loc: `${siteUrl}/courses/${term.slug}` })))
        for (const course of await fetchAll(apiBase, 'courses')) {
          const category = [].concat(course.course_category || []).map((id) => categoryById.get(id)).find(Boolean)
          urls.push({ loc: `${siteUrl}/courses/${category ? `${category}/` : ''}${course.slug}`, lastmod: lastmodOf(course) })
        }
        const stateTerms = await fetchAll(apiBase, 'district_category', 'id,slug')
        const stateTermById = new Map(stateTerms.map((term) => [term.id, term.slug]))
        const states = await fetchAll(apiBase, 'States')
        for (const state of states) {
          urls.push({ loc: `${siteUrl}/states/${state.slug}`, lastmod: lastmodOf(state) })
          for (const category of categories) urls.push({ loc: `${siteUrl}/states/${state.slug}/${category.slug}-colleges` })
        }
        for (const district of await fetchAll(apiBase, 'Districts', 'slug,modified_gmt,district_category')) {
          const state = [].concat(district.district_category || []).map((id) => stateTermById.get(id)).find(Boolean)
          if (!state) continue // a district without a state has no sitemap URL
          urls.push({ loc: `${siteUrl}/states/${state}/${district.slug}`, lastmod: lastmodOf(district) })
          for (const category of categories) urls.push({ loc: `${siteUrl}/states/${state}/${district.slug}/${category.slug}` })
        }
        for (const [restBase, prefix] of SITEMAP_COLLECTIONS) {
          for (const item of await fetchAll(apiBase, restBase)) {
            urls.push({ loc: `${siteUrl}/${prefix}/${item.slug}`, lastmod: lastmodOf(item) })
          }
        }
        const body = urls.map(({ loc, lastmod }) => `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n')
        await writeFile(resolve(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`)
        await writeFile(resolve(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
        console.log(`\n✓ sitemap.xml written with ${urls.length} URLs`)
      } catch (error) {
        this.warn(`Could not generate sitemap.xml from WordPress: ${error.message}`)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [react(), tailwindcss(), wordpressSeo(env)],
    server: {
      proxy: {
        '/wp-api': {
          target: 'https://staging.a3educarehub.in',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/wp-api/, '/wp-json/wp/v2'),
        },
        // Fluent Forms submissions (admin-ajax.php has no CORS headers, so it must be same-origin).
        '/wp-ajax': {
          target: 'https://staging.a3educarehub.in',
          changeOrigin: true,
          rewrite: () => '/wp-admin/admin-ajax.php',
        },
      },
    },
  }
})
