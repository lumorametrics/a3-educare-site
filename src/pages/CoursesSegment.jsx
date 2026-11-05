import { useEffect, useState } from "react";
import { getCourseBySlug, getCourseCategories } from "../services/wordpress";
import CourseDirectory from "./CourseDirectory";
import CourseDetail from "./CourseDetail";
import SplashScreen from "../components/ui/SplashScreen";

/**
 * /courses/<segment>: a course category (the sitemap's /courses/engineering) or, for old links, a course slug
 * (/courses/btech-cse), which is shown under its canonical /courses/<category>/<course> address.
 */
export default function CoursesSegment({ segment }) {
  const [kind, setKind] = useState("loading");

  useEffect(() => {
    let active = true;
    getCourseCategories()
      .then(async (categories) => {
        if (categories.some((category) => category.slug === segment)) return "category";
        const [course] = await getCourseBySlug(segment);
        if (course?.categorySlug) window.history.replaceState(null, "", `/courses/${course.categorySlug}/${course.slug}`);
        return course ? "course" : "missing";
      })
      .catch(() => "error")
      .then((result) => active && setKind(result));
    return () => { active = false; };
  }, [segment]);

  if (kind === "loading") return <SplashScreen label="Loading" />;
  if (kind === "category") return <CourseDirectory category={segment} />;
  return <CourseDetail slug={segment} />;
}
