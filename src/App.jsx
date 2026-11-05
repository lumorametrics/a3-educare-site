import { lazy, startTransition, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import PageEffects from "./components/ui/PageEffects";
import WhatsAppButton from "./components/common/WhatsAppButton";
import SplashScreen from "./components/ui/SplashScreen";
import { applySeo } from "./lib/seo";
import {
  getCollegeBySlug, getColleges, getCourseBySlug, getCourseCategories, getCourses, getDistrictBySlug,
  getDistricts, getPostBySlug, getPosts, getScholarshipBySlug, getScholarships, getStateBySlug, getStates, getStudyAbroad, getStudyAbroadBySlug,
} from "./services/wordpress";

// Each page is its own chunk, so visitors only download the code for the page they open.
const pageModules = {
  home: () => import("./pages/HomePage"),
  courseDirectory: () => import("./pages/CourseDirectory"),
  courseDetail: () => import("./pages/CourseDetail"),
  collectionDirectory: () => import("./pages/CollectionDirectory"),
  collegeDetail: () => import("./pages/CollegeDetail"),
  stateDetail: () => import("./pages/StateDetail"),
  districtDetail: () => import("./pages/DistrictDetail"),
  studyAbroadDetail: () => import("./pages/StudyAbroadDetail"),
  blogDirectory: () => import("./pages/BlogDirectory"),
  blogDetail: () => import("./pages/BlogDetail"),
  scholarships: () => import("./pages/Scholarships"),
  scholarshipDetail: () => import("./pages/ScholarshipDetail"),
};
const HomePage = lazy(pageModules.home);
const CourseDirectory = lazy(pageModules.courseDirectory);
const CourseDetail = lazy(pageModules.courseDetail);
const CollectionDirectory = lazy(pageModules.collectionDirectory);
const CollegeDetail = lazy(pageModules.collegeDetail);
const StateDetail = lazy(pageModules.stateDetail);
const DistrictDetail = lazy(pageModules.districtDetail);
const StudyAbroadDetail = lazy(pageModules.studyAbroadDetail);
const BlogDirectory = lazy(pageModules.blogDirectory);
const BlogDetail = lazy(pageModules.blogDetail);
const Scholarships = lazy(pageModules.scholarships);
const ScholarshipDetail = lazy(pageModules.scholarshipDetail);
const CoursesSegment = lazy(() => import("./pages/CoursesSegment"));
const StateCategory = lazy(() => import("./pages/StateCategory"));
const DistrictCategory = lazy(() => import("./pages/DistrictCategory"));
const ApplyNow = lazy(() => import("./pages/ApplyNow"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const ImageCreditsPage = lazy(() => import("./pages/ImageCreditsPage"));
const Services = lazy(() => import("./pages/Services"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Gallery = lazy(() => import("./pages/Gallery"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Registration = lazy(() => import("./pages/Registration"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Public URLs follow the site's sitemap (see lib/urls.js). Route keys are "<section>/<rest>"; <rest> may hold
// several "/"-separated parts (state/district/category). Singular/underscore forms keep old permalinks working.
const DETAIL_MATCHERS = [
  // Most specific first.
  [/^districts?\/([^/]+)\/([^/]+)\/([^/]+)$/i, (m) => `district-category/${m[1]}/${m[2]}/${m[3]}`],
  [/^states?\/([^/]+)\/([^/]+)\/([^/]+)$/i, (m) => `district-category/${m[1]}/${m[2]}/${m[3]}`],
  [/^states?\/([^/]+)\/([^/]+)-colleges$/i, (m) => `state-category/${m[1]}/${m[2]}`],
  [/^states?\/([^/]+)\/([^/]+)$/i, (m) => `district/${m[1]}/${m[2]}`],
  [/^states?\/([^/]+)$/i, (m) => `state/${m[1]}`],
  [/^districts?\/([^/]+)$/i, (m) => `district-legacy/${m[1]}`],
  [/^courses?\/([^/]+)\/([^/]+)$/i, (m) => `course/${m[1]}/${m[2]}`],
  [/^courses?\/([^/]+)$/i, (m) => `courses-segment/${m[1]}`],
  [/^colleges?\/([^/]+)$/i, (m) => `college/${m[1]}`],
  [/^study[-_]abroad\/([^/]+)$/i, (m) => `study-abroad/${m[1]}`],
  [/^blog\/([^/]+)$/i, (m) => `blog/${m[1]}`],
  [/^scholarships\/([^/]+)$/i, (m) => `scholarships/${m[1]}`],
];
const LISTING_ROUTES = ["course-directory", "blog", "states", "districts", "study-abroad", "colleges", "scholarships"];
const STATIC_ROUTES = ["privacy-policy", "terms-of-use", "image-credits", "services", "about-us", "gallery", "contact", "registration", "apply-now"];
// Sitemap URL -> internal route key, and the old URLs that are redirected to the sitemap URL.
const PATH_ALIASES = { courses: "course-directory", about: "about-us", terms: "terms-of-use", "contact-us": "contact" };
const LEGACY_REDIRECTS = { "course-directory": "/courses", "about-us": "/about", "terms-of-use": "/terms", "contact-us": "/contact" };

function matchPath(path) {
  if (PATH_ALIASES[path]) return PATH_ALIASES[path];
  for (const [pattern, toRoute] of DETAIL_MATCHERS) {
    const match = path.match(pattern);
    if (match) return toRoute(match);
  }
  if (LISTING_ROUTES.includes(path) || STATIC_ROUTES.includes(path)) return path;
  return null;
}

/** Old addresses (/about-us, /terms-of-use, /course-directory?category=x) are replaced in place by their sitemap URL. */
function redirectLegacyPath() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  let target = LEGACY_REDIRECTS[path];
  if (!target) return;
  const query = new URLSearchParams(window.location.search);
  if (path === "course-directory" && query.get("category")) {
    target = `/courses/${query.get("category")}`;
    query.delete("category");
  }
  const rest = query.toString();
  window.history.replaceState(null, "", `${target}${rest ? `?${rest}` : ""}${window.location.hash}`);
}

/**
 * Page chunk + main WordPress request for a route, started when a visitor hovers, focuses or
 * touches a link to it. The service layer de-duplicates and caches, so the page picks up the
 * in-flight request instead of starting its own after the click.
 */
const PREFETCH = {
  "course/": (slug) => [pageModules.courseDetail(), getCourseBySlug(slug.split("/").pop())],
  "college/": (slug) => [pageModules.collegeDetail(), getCollegeBySlug(slug)],
  "state/": (slug) => [pageModules.stateDetail(), getStateBySlug(slug)],
  "district/": (slug) => [pageModules.districtDetail(), getDistrictBySlug(slug.split("/").pop())],
  "study-abroad/": (slug) => [pageModules.studyAbroadDetail(), getStudyAbroadBySlug(slug)],
  "blog/": (slug) => [pageModules.blogDetail(), getPostBySlug(slug)],
  "scholarships/": (slug) => [pageModules.scholarshipDetail(), getScholarshipBySlug(slug)],
  "": () => [pageModules.home()],
  "course-directory": () => [pageModules.courseDirectory(), getCourses(), getCourseCategories()],
  colleges: () => [pageModules.collectionDirectory(), getColleges()],
  states: () => [pageModules.collectionDirectory(), getStates()],
  districts: () => [pageModules.collectionDirectory(), getDistricts()],
  "study-abroad": () => [pageModules.collectionDirectory(), getStudyAbroad()],
  blog: () => [pageModules.blogDirectory(), getPosts()],
  scholarships: () => [pageModules.scholarships(), getScholarships()],
};

function prefetchRoute(route) {
  const slash = route.indexOf("/");
  const [key, slug] = slash === -1 ? [route, ""] : [route.slice(0, slash + 1), route.slice(slash + 1)];
  try {
    // Failures are ignored here; the page reports them itself when it renders.
    PREFETCH[key]?.(slug).forEach((request) => request.catch(() => {}));
  } catch {
    // Prefetching is best-effort.
  }
}

/** The same-origin app link an event targets, or null for files, wp-admin, other sites, new tabs. */
function getAppLink(event) {
  const anchor = event.target.closest?.("a[href]");
  if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  const path = url.pathname.replace(/^\/+|\/+$/g, "");
  const route = path ? matchPath(path) : "";
  return route === null ? null : { url, route };
}

function scrollToHash(hash) {
  // The target may sit in content that is still loading, so retry for a few seconds.
  let attempts = 0;
  let timer = 0;
  const tryScroll = () => {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) {
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    if (attempts++ < 40) timer = setTimeout(tryScroll, 100);
  };
  tryScroll();
  return () => clearTimeout(timer);
}

function getRoute() {
  redirectLegacyPath();
  // Legacy hash links (#college/slug, #districts) still resolve, but ordinary in-page
  // anchors such as #our-services or #contact must not be mistaken for routes.
  const hashRoute = matchPath(window.location.hash.slice(1).replace(/^\/+|\/+$/g, ""));
  if (hashRoute) return hashRoute;

  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!pathname) return "";
  return matchPath(pathname) ?? "not-found";
}

// Route-level defaults; detail pages refine these with WordPress data once it loads.
const ROUTE_SEO = {
  "": { description: "Compare courses, shortlist trusted colleges and discover study-abroad opportunities with clear, practical guidance." },
  "course-directory": { title: "Courses", description: "Explore courses in India by category — duration, eligibility, fees and career outcomes." },
  blog: { title: "Blog", description: "Admission guides, comparisons and current-cycle explainers from A3 EduCare Hub." },
  states: { title: "States & Union Territories", description: "Education information, colleges, courses and admission resources across Indian states and union territories." },
  colleges: { title: "Colleges", description: "Browse college profiles with admissions, facilities and official links." },
  districts: { title: "Districts", description: "District-level education guides: popular courses, colleges and admission information." },
  "study-abroad": { title: "Study Abroad", description: "Destination guides, university options and visa information for studying abroad." },
  scholarships: { title: "Scholarships", description: "Explore central and state government, merit-cum-means, institutional, private and study-abroad scholarships for students, with eligibility, benefits and how to apply." },
  "privacy-policy": { title: "Privacy Policy", description: "Read the Privacy Policy for A3 EduCare Hub." },
  "terms-of-use": { title: "Terms of Use", description: "Read the Terms of Use for A3 EduCare Hub." },
  "image-credits": { title: "Image Credits", description: "Authors, licences and sources of the photographs used on A3 EduCare Hub.", noindex: true },
  "apply-now": { title: "Apply Now", description: "Apply to A3 Educare Hub for admission guidance, course and college selection support." },
  "state-category/": { title: "Colleges by state and category" },
  "district-category/": { title: "Colleges by district and category" },
  "courses-segment/": { title: "Courses" },
  services: { title: "Services", description: "Personalised course, college, career and study-abroad guidance from A3 EduCare Hub." },
  "about-us": { title: "About Us", description: "Learn about A3 Educare Hub & Research Academy, our leadership, education guidance services and regional offices." },
  contact: { title: "Contact Us", description: "Talk to A3 Educare Hub about admissions, courses and career guidance. Call +91 89698 86176 or send us your question." },
  gallery: { title: "Gallery", description: "Explore the A3 Educare Hub gallery and discover our education community." },
  registration: { title: "Registration", description: "Register with A3 Educare Hub as a student, franchise partner, coordinator or placement candidate." },
  "not-found": { title: "Page not found", noindex: true },
  "course/": { title: "Course details" },
  "college/": { title: "College profile" },
  "state/": { title: "State education guide" },
  "district/": { title: "District education guide" },
  "study-abroad/": { title: "Study Abroad destination" },
  "blog/": { title: "Article", type: "article" },
  "scholarships/": { title: "Scholarship details" },
};

export default function App() {
  const [route, setRoute] = useState(getRoute);
  // Set on in-app link clicks; tells the layout effect where to scroll once the new page commits.
  const [navigation, setNavigation] = useState(null);
  const mainRef = useRef(null);

  useEffect(() => {
    const handleNavigation = () => startTransition(() => setRoute(getRoute()));
    window.addEventListener("hashchange", handleNavigation);
    window.addEventListener("popstate", handleNavigation);
    return () => {
      window.removeEventListener("hashchange", handleNavigation);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, []);

  // Internal links navigate client-side. A full page reload threw away the loaded JS and the
  // WordPress response cache, so every page used to wait on WordPress (0.7-4 s) again.
  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = getAppLink(event);
      if (!link) return;
      const { url } = link;
      // In-page anchors (and legacy #route links) keep the browser's own behaviour.
      if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      if (url.href !== window.location.href) window.history.pushState(null, "", url);
      // A transition keeps the current page on screen while the next page's code loads.
      startTransition(() => {
        setRoute(getRoute());
        setNavigation({ hash: url.hash });
      });
    };

    let hoverTimer = 0;
    const warm = (event) => {
      const link = getAppLink(event);
      if (link) prefetchRoute(link.route);
    };
    // Short delay so sweeping the pointer across a grid of cards doesn't request every one.
    const onPointerOver = (event) => {
      clearTimeout(hoverTimer);
      if (event.pointerType === "mouse") hoverTimer = setTimeout(() => warm(event), 80);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerdown", warm, { passive: true });
    document.addEventListener("focusin", warm);
    return () => {
      clearTimeout(hoverTimer);
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerdown", warm);
      document.removeEventListener("focusin", warm);
    };
  }, []);

  useLayoutEffect(() => {
    if (!navigation) return undefined;
    // Move keyboard/screen-reader focus to the new page, as a full page load would.
    mainRef.current?.focus({ preventScroll: true });
    if (navigation.hash) return scrollToHash(navigation.hash);
    window.scrollTo(0, 0);
    return undefined;
  }, [navigation]);

  useEffect(() => {
    const prefix = route.match(/^[a-z-]+\//)?.[0];
    applySeo(ROUTE_SEO[prefix] || ROUTE_SEO[route] || ROUTE_SEO[""]);
  }, [route]);

  const [section, slug] = route.includes("/") ? [route.slice(0, route.indexOf("/")), route.slice(route.indexOf("/") + 1)] : [route, ""];
  const parts = slug.split("/");
  const content = slug
    ? {
        course: <CourseDetail slug={parts[1]} category={parts[0]} />,
        "courses-segment": <CoursesSegment segment={slug} />,
        college: <CollegeDetail slug={slug} />,
        state: <StateDetail slug={slug} />,
        "state-category": <StateCategory stateSlug={parts[0]} categorySlug={parts[1]} />,
        district: <DistrictDetail slug={parts[1]} stateSlug={parts[0]} />,
        "district-legacy": <DistrictDetail slug={slug} />,
        "district-category": <DistrictCategory stateSlug={parts[0]} districtSlug={parts[1]} categorySlug={parts[2]} />,
        "study-abroad": <StudyAbroadDetail slug={slug} />,
        blog: <BlogDetail slug={slug} />,
        scholarships: <ScholarshipDetail slug={slug} />,
      }[section]
    : {
        "": <HomePage />,
        "course-directory": <CourseDirectory />,
        blog: <BlogDirectory />,
        states: <CollectionDirectory type="states" />,
        districts: <CollectionDirectory type="districts" />,
        "study-abroad": <CollectionDirectory type="study-abroad" />,
        colleges: <CollectionDirectory type="colleges" />,
        scholarships: <Scholarships />,
        "privacy-policy": <PrivacyPolicy />,
        "terms-of-use": <TermsOfUse />,
        "image-credits": <ImageCreditsPage />,
        services: <Services />,
        "about-us": <AboutUs />,
        contact: <ContactUs />,
        registration: <Registration />,
        "apply-now": <ApplyNow />,
        gallery: <Gallery />,
      }[section];

  return (
    <div className="flex min-h-screen flex-col">
      <PageEffects />
      <Header />
      <div ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<SplashScreen />}>
          {/* Keyed so each navigation mounts a fresh page (state reset + entry animation). */}
          <div key={window.location.pathname + window.location.search} className="motion-safe:animate-page-in">
            {content || <NotFound />}
          </div>
        </Suspense>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
