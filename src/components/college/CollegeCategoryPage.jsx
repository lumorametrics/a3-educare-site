import PlaceHero from "../state/PlaceHero";
import SectionHeading from "../ui/SectionHeading";
import StatusMessage from "../ui/StatusMessage";
import CtaBand from "../ui/CtaBand";
import Reveal from "../ui/Reveal";
import CollegeCard from "./CollegeCard";
import CollegeResults from "./CollegeResults";

import { ArrowUpRight } from "../ui/Icons";
import { CATEGORY_INFO } from "../../lib/categoryInfo";
import { getHeroImage } from "../../lib/collegeImage";
import { toPlainText } from "../../lib/text";
import { courseUrl } from "../../lib/urls";

function CollegeGrid({ colleges }) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {colleges.map((college, index) => (
        <Reveal as="li" key={college.id} delay={(index % 3) * 70} className="h-full"><CollegeCard college={college} showDetails /></Reveal>
      ))}
    </ul>
  );
}

/**
 * Shared layout of the "<place> + <course category>" pages (/states/<state>/<category>-colleges and
 * /states/<state>/<district>/<category>). Every block comes from WordPress data for that place and category;
 * when a place has no profile yet the page says so and points to real colleges nearby instead of inventing any.
 */
export default function CollegeCategoryPage({
  breadcrumb, eyebrow, title, description, placeName, categoryName, categorySlug, placeIntro, image, imageAlt,
  colleges, elsewhere = [], elsewhereTitle, elsewhereDescription, elsewhereHref, courses, otherCategories, parentHref, parentLabel,
}) {
  const categoryInfo = CATEGORY_INFO[categorySlug];
  const lower = categoryName.toLowerCase();
  const count = colleges.length;
  return (
    <main>
      <PlaceHero
        breadcrumb={breadcrumb}
        eyebrow={eyebrow}
        title={title}
        longTitle={`${categoryName} Colleges in ${placeName}`.length > 34}
        description={description}
        image={getHeroImage(image, imageAlt)}
        actions={(
          <>
            <a className="btn bg-accent text-ink-950 hover:-translate-y-0.5 hover:brightness-110" href={parentHref}>{parentLabel} <ArrowUpRight /></a>
            {elsewhereHref && <a className="btn btn-ghost-light" href={elsewhereHref.href}>{elsewhereHref.label} <ArrowUpRight /></a>}
          </>
        )}
      />

      {(placeIntro || categoryInfo) && (
        <section className="shell pt-14 sm:pt-20">
          <SectionHeading eyebrow="Overview" title={<>{categoryName} study in <em>{placeName}</em></>} />
          <div className="max-w-3xl space-y-4 text-ink-500">
            {placeIntro && <p>{placeIntro}</p>}
            {categoryInfo && <p>{categoryInfo}</p>}
            <p className="font-medium text-ink-700">
              {count > 0
                ? `A3 EduCare Hub currently lists ${count} ${count === 1 ? "profile" : "profiles"} for ${lower} study in ${placeName}.`
                : `A3 EduCare Hub has no ${lower} college profile for ${placeName} yet.`}
            </p>
          </div>
        </section>
      )}

      <section className="shell section-y">
        <SectionHeading eyebrow="College profiles" title={<>{categoryName} <em>Colleges</em> in {placeName}</>} />
        {count > 0 ? (
          <CollegeResults colleges={colleges} />
        ) : (
          <StatusMessage title="No college profiles yet">
            We have not published any {lower} college profiles for {placeName} yet. {elsewhere.length > 0 ? "See the colleges listed below, browse the courses" : "Browse the courses below"}, or ask our team for a personal shortlist.
          </StatusMessage>
        )}
      </section>

      {elsewhere.length > 0 && (
        <section className="section-y bg-white">
          <div className="shell">
            <SectionHeading eyebrow="Nearby options" title={elsewhereTitle} description={elsewhereDescription} />
            <CollegeGrid colleges={elsewhere} />
          </div>
        </section>
      )}

      {courses.length > 0 && (
        <section className="section-y bg-white">
          <div className="shell">
            <SectionHeading eyebrow="Courses" title={<>{categoryName} <em>Courses</em></>} />
            <ul className="flex flex-wrap gap-2">
              {courses.map((course) => (
                <li key={course.id}><a className="chip hover:border-brand-600 hover:text-brand-700" href={courseUrl(course)}>{toPlainText(course.title?.rendered)}</a></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {otherCategories.length > 0 && (
        <section className="shell section-y">
          <SectionHeading eyebrow="Explore more" title={<>Other categories in <em>{placeName}</em></>} />
          <ul className="flex flex-wrap gap-2">
            {otherCategories.map((item) => (
              <li key={item.href}><a className="chip hover:border-brand-600 hover:text-brand-700" href={item.href}>{item.label}{item.count > 0 ? ` (${item.count})` : ""}</a></li>
            ))}
          </ul>
        </section>
      )}

      <CtaBand eyebrow="Need guidance?" title={<>Looking for {lower} colleges <em>in {placeName}?</em></>} description="Tell us your interests and goals and we will help you compare colleges, eligibility and admissions." />
    </main>
  );
}
