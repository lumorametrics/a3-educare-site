import PlaceHero from "../state/PlaceHero";
import SectionHeading from "../ui/SectionHeading";
import CtaBand from "../ui/CtaBand";
import Reveal from "../ui/Reveal";
import CollegeCard from "./CollegeCard";
import CollegeResults from "./CollegeResults";

import { ArrowUpRight } from "../ui/Icons";
import { CATEGORY_CONTENT } from "../../lib/categoryInfo";
import { getHeroImage } from "../../lib/collegeImage";
import { toPlainText } from "../../lib/text";
import { courseUrl } from "../../lib/urls";
import { openApplyForm } from "../../lib/applyForm";

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
 * /states/<state>/<district>/<category>).
 *
 * The page is built from independent blocks, so an empty college list never hides category content:
 *   1. hero            category photo, title
 *   2. about           category introduction + description (WordPress term fields, general fallback text otherwise)
 *   3. entrance exams  common entrance exams for the category
 *   4. courses         the category's courses
 *   5. colleges        profiles for this place + category, or an honest empty state with nearby options
 *   6. other categories, call to action
 * Nothing about colleges is invented: when a place has no profile yet the page says so.
 */
export default function CollegeCategoryPage({
  breadcrumb, eyebrow, title, description, placeName, categoryName, categorySlug, categoryContent = {}, placeIntro, image, imageAlt,
  colleges, elsewhere = [], elsewhereTitle, elsewhereDescription, elsewhereHref, courses, otherCategories, parentHref, parentLabel,
}) {
  // WordPress term fields come first; the general text in categoryInfo.js only fills what is still empty there.
  const fallback = CATEGORY_CONTENT[categorySlug] || {};
  const introduction = categoryContent.introduction || fallback.introduction || "";
  const aboutText = categoryContent.description || fallback.description || "";
  const exams = categoryContent.exams || fallback.exams || "";
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

      {(introduction || aboutText || exams) && (
        <section className="shell pt-14 sm:pt-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
            <div>
              <SectionHeading eyebrow={`About ${lower} study`} title={<>{categoryName} <em>Programmes</em></>} />
              <Reveal className="max-w-3xl space-y-4">
                {introduction && <p className="text-lg font-medium text-ink-700">{introduction}</p>}
                {aboutText && aboutText !== introduction && <p className="text-ink-500">{aboutText}</p>}
              </Reveal>
            </div>
            {exams && (
              <Reveal delay={120} className="card self-start p-6 sm:p-7">
                <p className="eyebrow mb-3"><span aria-hidden="true" className="h-px w-6 bg-brand-600" />Common entrance exams</p>
                <p className="text-ink-700">{exams}</p>
                <p className="mt-3 text-sm text-ink-400">Exams and eligibility change from year to year. Confirm them with each institution&apos;s official notice.</p>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {courses.length > 0 && (
        <section className="shell section-y">
          <SectionHeading eyebrow="Courses" title={<>{categoryName} <em>Courses</em></>} description={`${courses.length} ${lower} ${courses.length === 1 ? "course" : "courses"} you can explore, with duration, eligibility and career options.`} />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const intro = toPlainText(course.acf?.course_short_introduction || "");
              const duration = toPlainText(course.acf?.duration || course.acf?.course_duration || "");
              return (
                <li key={course.id}>
                  <a className="group card-interactive flex h-full flex-col gap-2 p-5" href={courseUrl(course)}>
                    <span className="flex items-start justify-between gap-3 font-semibold text-ink-900">{toPlainText(course.title?.rendered)}<ArrowUpRight className="mt-0.5 size-4 shrink-0 text-ink-300 transition group-hover:text-brand-600" /></span>
                    {intro && <span className="line-clamp-3 text-sm text-ink-500">{intro}</span>}
                    {duration && <span className="mt-auto pt-1 text-xs font-medium text-brand-700">{duration}</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="section-y bg-white">
        <div className="shell">
          <SectionHeading
            eyebrow={count > 0 ? "College profiles" : "Your next steps"}
            title={count > 0 ? <>{categoryName} <em>Colleges</em> in {placeName}</> : <>Finding a {lower} college <em>in {placeName}</em></>}
            description={count > 0 ? `${count} ${count === 1 ? "profile" : "profiles"} listed for ${lower} study in ${placeName}.` : `We are still verifying ${lower} institutions for ${placeName}. Here is how to move forward in the meantime.`}
          />
          {count > 0 ? (
            <CollegeResults colleges={colleges} />
          ) : (
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Reveal as="li" className="card flex flex-col gap-3 p-6 sm:p-7">
                <span className="eyebrow"><span aria-hidden="true" className="h-px w-6 bg-brand-600" />1 · Check the route in</span>
                <h3 className="font-display text-xl font-semibold">Entrance and eligibility</h3>
                <p className="text-sm text-ink-500">{exams ? `Common entrance exams for ${lower} study: ${exams}.` : `Entrance routes for ${lower} study differ by institution.`} Eligibility and seats change every session, so confirm them on each institution&apos;s official notice.</p>
              </Reveal>
              <Reveal as="li" delay={70} className="card flex flex-col gap-3 p-6 sm:p-7">
                <span className="eyebrow"><span aria-hidden="true" className="h-px w-6 bg-brand-600" />2 · Compare options</span>
                <h3 className="font-display text-xl font-semibold">{elsewhere.length > 0 ? "Verified colleges nearby" : "Courses and other categories"}</h3>
                <p className="text-sm text-ink-500">{elsewhere.length > 0 ? `Colleges from our verified list are shown below, clearly labelled with where they are.` : `Read the ${lower} courses above, or explore the categories that do have profiles for ${placeName}.`}</p>
                <a className="link-arrow mt-auto pt-2" href={elsewhere.length > 0 ? "#nearby-options" : parentHref}>{elsewhere.length > 0 ? "See them below" : parentLabel} <ArrowUpRight /></a>
              </Reveal>
              <Reveal as="li" delay={140} className="card flex flex-col gap-3 border-brand-200 bg-brand-50/60 p-6 sm:p-7">
                <span className="eyebrow"><span aria-hidden="true" className="h-px w-6 bg-brand-600" />3 · Talk to us</span>
                <h3 className="font-display text-xl font-semibold">Get a personal shortlist</h3>
                <p className="text-sm text-ink-500">Tell us your marks, budget and preferred city and our counsellors will suggest {lower} colleges to consider and help with the application.</p>
                <div className="mt-auto flex flex-wrap gap-3 pt-2">
                  <button type="button" className="btn btn-dark" aria-haspopup="dialog" onClick={openApplyForm}>Apply Now</button>
                  <a className="btn btn-outline" href="/contact">Contact us</a>
                </div>
              </Reveal>
            </ul>
          )}
          {placeIntro && (
            <p className="mt-10 max-w-3xl text-sm text-ink-500"><span className="font-medium text-ink-700">About {placeName}: </span>{placeIntro}</p>
          )}
        </div>
      </section>

      {elsewhere.length > 0 && (
        <section id="nearby-options" className="shell section-y scroll-mt-24">
          <SectionHeading eyebrow="Nearby options" title={elsewhereTitle} description={elsewhereDescription} />
          <CollegeGrid colleges={elsewhere} />
        </section>
      )}

      {otherCategories.length > 0 && (
        <section className="shell section-y">
          <SectionHeading eyebrow="Explore more" title={<>Other categories in <em>{placeName}</em></>} />
          <ul className="flex flex-wrap gap-2">
            {otherCategories.map((item) => (
              <li key={item.href}><a className="chip hover:border-brand-600 hover:text-brand-700" href={item.href}>{item.label}</a></li>
            ))}
          </ul>
        </section>
      )}

      <CtaBand eyebrow="Need guidance?" title={<>Looking for {lower} colleges <em>in {placeName}?</em></>} description="Tell us your interests and goals and we will help you compare colleges, eligibility and admissions." />
    </main>
  );
}
