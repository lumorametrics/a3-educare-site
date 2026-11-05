import { useEffect, useMemo, useState } from "react";
import CourseCard from "../components/cards/CourseCard";
import SplashScreen from "../components/ui/SplashScreen";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import StatusMessage from "../components/ui/StatusMessage";
import CtaBand from "../components/ui/CtaBand";
import { ChevronLeft, ChevronRight, Search } from "../components/ui/Icons";
import { getCourseCategories, getCourses } from "../services/wordpress";

const PAGE_SIZE = 9;

function getCategory(course, categories = []) {
  const fields = course.acf || {};
  const ids = [].concat(course.course_category || fields.course_category || []);
  const term = categories.find((category) => ids.map(String).includes(String(category.id)));
  return term?.name || course.course_category_name || fields.course_category_name || fields.category || "Uncategorized";
}

function getCategorySlug(course, categories = []) {
  const fields = course.acf || {};
  const ids = [].concat(course.course_category || fields.course_category || []);
  return categories.find((category) => ids.map(String).includes(String(category.id)))?.slug || "";
}

/** Category of the current address: /courses/<category> (the sitemap URL), or an old ?category= link. */
function getInitialCategory() {
  const fromPath = window.location.pathname.match(/^\/courses\/([^/]+)\/?$/)?.[1];
  if (fromPath) return decodeURIComponent(fromPath);
  const query = new URLSearchParams(window.location.search || window.location.hash.split("?")[1] || "");
  return query.get("category") || "all";
}

export default function CourseDirectory({ category: initialCategory }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(() => initialCategory || getInitialCategory());
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [categoryStatus, setCategoryStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCourses(), getCourseCategories()])
      .then(([courseResult, categoryResult]) => {
        if (!active) return;
        if (courseResult.status === "fulfilled") {
          setCourses(Array.isArray(courseResult.value) ? courseResult.value : []);
          setStatus("ready");
        } else {
          console.error("Unable to load courses:", courseResult.reason);
          setStatus("error");
        }
        if (categoryResult.status === "fulfilled") {
          setCategories(Array.isArray(categoryResult.value) ? categoryResult.value : []);
          setCategoryStatus("ready");
        } else {
          console.error("Unable to load course categories:", categoryResult.reason);
          setCategoryStatus("error");
        }
      })
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const syncCategory = () => {
      setCategory(getInitialCategory());
      setPage(1);
    };
    window.addEventListener("hashchange", syncCategory);
    window.addEventListener("popstate", syncCategory);
    return () => {
      window.removeEventListener("hashchange", syncCategory);
      window.removeEventListener("popstate", syncCategory);
    };
  }, []);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return courses.filter((course) => {
      const title = course.title?.rendered?.replace(/<[^>]+>/g, "") || "";
      const matchesSearch = !query || `${title} ${getCategory(course, categories)}`.toLowerCase().includes(query);
      const matchesCategory = category === "all" || getCategorySlug(course, categories) === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, categories, courses, search]);

  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const visibleCourses = filteredCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function goToPage(number) {
    setPage(number);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateCategory(value) {
    setCategory(value);
    setPage(1);
    window.history.replaceState(null, "", value === "all" ? "/courses" : `/courses/${encodeURIComponent(value)}`);
  }

  const activeCategory = categories.find((item) => item.slug === category);
  return (
    <main>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, ...(activeCategory ? [{ label: "Courses", href: "/courses" }, { label: activeCategory.name }] : [{ label: "Courses" }])]}
        eyebrow="A3 Educare Hub & Research Academy"
        title={activeCategory ? <>{activeCategory.name} <em>Courses</em></> : <>Explore Courses in <em>India</em></>}
        description="Find the right course, understand your options, and plan your next academic step."
      >
        <div className="flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-ink-400" />
            <input
              className="input-search"
              type="search"
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search course name..."
              aria-label="Search courses"
            />
          </label>
          <span className="shrink-0 px-2 text-sm font-medium text-ink-500" aria-live="polite">
            <strong className="text-ink-900">{filteredCourses.length}</strong> Courses
          </span>
        </div>
      </PageHero>
      <section className="shell py-10 sm:py-14">
        <div className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter courses by category">
          <button
            className={`chip shrink-0 ${category === "all" ? "chip-active" : ""}`}
            aria-pressed={category === "all"}
            onClick={() => updateCategory("all")}
            type="button"
          >
            All Courses
          </button>
          {categories.map((item) => (
            <button
              className={`chip shrink-0 ${category === item.slug ? "chip-active" : ""}`}
              aria-pressed={category === item.slug}
              key={item.id}
              onClick={() => updateCategory(item.slug)}
              type="button"
            >
              {item.name}
            </button>
          ))}
        </div>
        {categoryStatus === "error" && (
          <div className="mb-8"><StatusMessage tone="error">Course categories could not be loaded from WordPress.</StatusMessage></div>
        )}
        {status === "loading" && <SplashScreen label="Loading courses" />}
        {status === "error" && <StatusMessage tone="error">Courses could not be loaded from WordPress.</StatusMessage>}
        {status === "ready" && !visibleCourses.length && (
          <StatusMessage title="No matches">No courses match your search or selected filter.</StatusMessage>
        )}
        {status === "ready" && visibleCourses.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCourses.map((course, index) => (
                <Reveal key={course.id} delay={(index % 3) * 70} className="h-full">
                  <CourseCard course={course} index={index} categoryName={getCategory(course, categories)} />
                </Reveal>
              ))}
            </div>
            {pageCount > 1 && (
              <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Course pages">
                <button className="grid size-11 place-items-center rounded-full border border-sand-200 bg-white text-ink-700 transition hover:border-ink-900 disabled:opacity-40 disabled:hover:border-sand-200" type="button" disabled={page === 1} onClick={() => goToPage(page - 1)} aria-label="Previous page"><ChevronLeft /></button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                  <button
                    className={`size-11 rounded-full text-sm font-medium transition ${page === number ? "bg-ink-900 text-white shadow-lift" : "border border-sand-200 bg-white text-ink-600 hover:border-ink-900 hover:text-ink-900"}`}
                    key={number}
                    type="button"
                    onClick={() => goToPage(number)}
                    aria-label={`Go to page ${number}`}
                    aria-current={page === number ? "page" : undefined}
                  >
                    {number}
                  </button>
                ))}
                <button className="inline-flex h-11 items-center gap-1 rounded-full border border-sand-200 bg-white px-5 text-sm font-medium text-ink-700 transition hover:border-ink-900 disabled:opacity-40 disabled:hover:border-sand-200" type="button" disabled={page === pageCount} onClick={() => goToPage(page + 1)}>Next <ChevronRight /></button>
              </nav>
            )}
          </>
        )}
      </section>
      <CtaBand eyebrow="Not sure which course fits?" title={<>Get a <em>personal shortlist.</em></>} description="Tell us your interests and goals — we will help you compare courses, eligibility and career outcomes." />
    </main>
  );
}
