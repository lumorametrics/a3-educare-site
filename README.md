# A3 Educare Hub

Responsive React/Vite frontend for an education consultancy, designed for a headless WordPress + ACF backend.

## Project structure

```text
src/
  components/common/
    Header.jsx          # reusable responsive navigation
    Footer.jsx          # reusable footer and newsletter form
  components/cards/
    CourseCard.jsx      # reusable ACF-backed course card
  components/ui/
    Reveal.jsx          # IntersectionObserver entry animation wrapper
  pages/
    HomePage.jsx        # responsive homepage sections and API states
    CourseDirectory.jsx # course_category archive template
  services/
    wordpress.js        # REST API boundary
  App.jsx               # homepage composition and filtering
  App.css               # component/page styles and responsive breakpoints
  index.css             # fonts, reset and global tokens
```

## Run locally

```bash
npm install
npm run dev
npm run build
```

Set `VITE_WORDPRESS_API` to point at another WordPress REST base URL. The default is the A3 staging endpoint:

```bash
VITE_WORDPRESS_API=https://example.com/wp-json/wp/v2
```

During local Vite development, requests use the `/wp-api` proxy configured in `vite.config.js`, avoiding the staging server's missing CORS header. Production deployments must configure WordPress or the hosting proxy to send `Access-Control-Allow-Origin` for the deployed frontend origin.

If a WordPress collection is unavailable or empty, the related homepage section shows a clear empty state or is not rendered. The frontend does not fabricate courses, colleges, locations, destinations, or articles.

## WordPress and ACF setup

1. Install WordPress, **ACF Pro**, and either enable the REST API for custom post types or install WPGraphQL if the project is later migrated to GraphQL.
2. Register these public CPTs: `course`, `state`, `district`, `study_abroad`, and `college`. Set `show_in_rest => true`, a REST `rest_base` matching each plural endpoint, and `public => true`.
3. Register the taxonomies `course_category` (for `course`) and `college_category` (for `college)`, with `show_in_rest => true`.
4. Create ACF field groups:
   - Course: `course_duration`, `course_price`, `eligibility`, `syllabus`, `application_deadline`, `featured_image`.
   - College: `college_location`, `college_type`, `college_ranking`, `admission_url`, `featured_image`.
   - Study abroad: `country`, `intake_months`, `visa_support`, `tuition_range`, `featured_image`.
   - State/district: `hero_copy`, `institution_count`, `featured_institutions`, `featured_image`.
5. In **ACF → Field Groups → Settings**, enable REST API. For private fields, expose only the fields required by the frontend and never expose admin credentials.
6. Confirm the endpoints in a browser or API client. The frontend discovers the Study Abroad
   REST base from `/wp-json/wp/v2/types` instead of assuming a CPT slug. It then requests
   `GET /wp-json/wp/v2/{rest_base}`. For a normal WordPress page, it falls back to
   `GET /wp-json/wp/v2/pages?search=Study%20Abroad`.

   The other currently configured REST bases are:
   - `/wp-json/wp/v2/courses`
   - `/wp-json/wp/v2/college`
   - `/wp-json/wp/v2/states`
   - `/wp-json/wp/v2/Districts`
   - `/wp-json/wp/v2/course_category`
   - `/wp-json/wp/v2/pages`
7. Configure CORS on the WordPress host to allow the deployed frontend origin. Use HTTPS in production and cache public GET responses through the CDN.

## Extending the hubs

The Header lazy-loads the five menu collections the first time a menu item is clicked. It renders each published item title plus a short ACF summary and links to the WordPress item. If WordPress returns an error, the dropdown reports that the CPT needs `show_in_rest` enabled instead of showing an empty menu. Add `getColleges`, `getStates`, `getDistricts`, and `getStudyAbroad` beside the existing service functions, then compose route-level pages from the same `Header` and `Footer`. Taxonomy filters use the standard REST query shape, for example:

```text
/courses?course_category=engineering
/colleges?college_category=universities
```

For a multi-page SEO build, the same components can move to Next.js App Router with server-side data fetching and metadata generated from the ACF fields.

## Production route blueprint

| Route | Template | WordPress source |
|---|---|---|
| `/` | Homepage | courses, colleges, study abroad |
| `/courses` | Course archive | `courses` + `course_category` |
| `/courses/:category` | Course category | `courses?course_category=:id` |
| `/courses/:slug` | Course detail | `courses?slug=:slug` |
| `/colleges` | College directory | `college` + `college_category` |
| `/colleges/:slug` | College detail | `college?slug=:slug` |
| `/states/:state` | State hub | `states?slug=:state` |
| `/states/:state/:district` | District hub | `Districts?slug=:district` |
| `/study-abroad/:country` | Country guide | `study_abroad?slug=:country` |
| `/blog` | Blog archive | `posts` |
| `/blog/:slug` | Blog detail | `posts?slug=:slug` |

## ACF field contract

Expose ACF through REST (or map these fields in WPGraphQL). Recommended public fields:

- Course: `course_short_introduction`, `course_overview`, `duration`, `eligibility`, `admission_process`, `entrance_exams`, `career_options`, `fees_information`, `hero_image`.
- College: `college_short_introduction`, `college_overview`, `college_type`, `college_location`, `college_ranking`, `campus_amenities`, `college_image`.
- State/District: `state_overview`, `district_short_introduction`, `district_overview`, `state_name`, `headquarters`, `popular_courses`, `colleges_universities`, `official_source`.
- Study abroad: the frontend reads the registered `rest_base` at runtime and maps
  `title.rendered`, `link`, and `acf` fields such as `country_code`,
  `country_overview`, and `description`. Do not create a second post type. If the
  existing type is registered with an invalid base such as `Study Abroad`, update
  its registration (or the plugin/CPT UI that owns it) to:

  ```php
  'public'       => true,
  'show_in_rest' => true,
  'rest_namespace' => 'wp/v2',
  'rest_base'    => 'study-abroad',
  ```

  Keep the existing post type key and content unchanged, and enable ACF REST output
  for the fields used by the frontend. Verify with:
  `GET /wp-json/wp/v2/types` and then `GET /wp-json/wp/v2/{rest_base}`.

The current UI uses CSS variables and class names matching the supplied palette. If Tailwind is introduced, map the same values to `theme.extend.colors`: `brand-red: #E53935`, `brand-yellow: #FFB300`, `brand-green: #1B5E20`, `silver: #F5F5F7`, and `ink: #111111`. Keep the REST service and component boundaries unchanged during that styling migration.

## Homepage sections

`HomePage.jsx` renders the requested production homepage in this order:

1. Hero with course/college guidance message and architectural visual.
2. Quick course filters.
3. Popular Courses with live WordPress course records and ACF fields.
4. Explore Course Categories from `course_category`.
5. Explore by State from the `states` endpoint.
6. Study Abroad destination cards.
7. Latest Articles from WordPress posts with an empty state when no posts are published.
8. Accessible FAQ accordion with animated expansion.
9. Dark conversion CTA with Apply Now action.

The page uses `Reveal.jsx` for viewport entry animation, CSS hover transitions for cards and buttons, and `Promise.allSettled` so one optional WordPress collection cannot break the entire homepage.
