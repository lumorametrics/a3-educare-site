import Reveal from "../ui/Reveal";
import { ArrowUpRight, Eye, Flag, Shield } from "../ui/Icons";
import { withBase } from "../../lib/basePath";
import { FOUNDED_YEAR, MISSION, OPERATING_ENTITY, VISION } from "./homeContent";

/**
 * About A3: the company introduction (identity, journey since the founding year, mission, vision, operating
 * foundation). Nothing here is repeated by another home page section.
 *
 * Layout per screen size:
 * - phones: photo first (full square, never cropped) with the foundation card overlapping its lower edge, then text
 * - tablets (md): photo and text side by side, mission and vision stacked
 * - desktops (lg+): 5/7 split with the photo vertically centred against the text, mission and vision side by side
 */
export default function AboutIntro() {
  return (
    <section className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-28" id="about-a3" aria-labelledby="about-a3-title">
      {/* Soft brand wash behind the photo side; quiet enough not to compete with the content. */}
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full bg-[radial-gradient(60%_55%_at_15%_45%,var(--color-brand-50),transparent_70%)]" />

      <div className="shell grid grid-cols-1 items-center gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-0 xl:gap-x-20">
        {/* Photo composition */}
        <Reveal variant="left" className="mx-auto w-full max-w-[26rem] md:max-w-none lg:col-span-5 lg:row-span-2">
          <div className="relative">
            <div className="relative">
              {/* Offset brand frame around the photo only: a thin outline, so the photo stays the focus. */}
              <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border-2 border-brand-200 sm:translate-x-4 sm:translate-y-4" />
              <figure className="group relative overflow-hidden rounded-[2rem] bg-sand-100 shadow-lift">
              <img
                src={withBase("/about/about-office-960.webp")}
                srcSet={`${withBase("/about/about-office-640.webp")} 640w, ${withBase("/about/about-office-960.webp")} 960w`}
                sizes="(min-width: 1024px) 34vw, (min-width: 768px) 44vw, 26rem"
                width="960"
                height="960"
                loading="lazy"
                decoding="async"
                alt="An A3 EduCare Hub office, with the courses offered and the 2026–27 admissions board"
                className="aspect-square w-full object-cover transition-transform duration-[1.2s] ease-(--ease-out-soft) group-hover:scale-[1.03]"
              />
              </figure>
            </div>

            {/* Foundation card: overlaps the photo's lower edge; on phones it sits inside the photo's width. */}
            <div className="relative mx-4 -mt-12 rounded-2xl border border-sand-200 bg-white p-4 shadow-lift transition-transform duration-500 ease-(--ease-out-soft) hover:-translate-y-1 sm:absolute sm:right-[-1.25rem] sm:-bottom-10 sm:mx-0 sm:mt-0 sm:w-72 md:right-[-1.5rem] md:w-64 lg:w-72">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white"><Shield className="size-5" /></span>
                <p className="text-xs leading-relaxed text-ink-500">
                  <span className="block text-sm font-semibold text-ink-900">{OPERATING_ENTITY}</span>
                  Operating organisation · Section 8(1) not-for-profit, Companies Act 2013
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Intro: beside the photo from tablets up */}
        <div className="lg:col-span-7 lg:self-end">
          <Reveal>
            <p className="eyebrow mb-4"><span aria-hidden="true" className="h-px w-8 bg-brand-600" />About A3 EduCare Hub</p>
            <h2 id="about-a3-title" className="heading-display text-[2rem] leading-[1.08] sm:text-[2.5rem] lg:text-[3rem]">
              Clarity for one of life&apos;s <em>biggest decisions.</em>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
              A3 EduCare Hub &amp; Research Academy is an education consultancy for students and families who are
              choosing a course, a college and a career.
            </p>
          </Reveal>

          {/* Journey since the founding year */}
          <Reveal delay={100} className="mt-8 flex items-center gap-5 rounded-2xl border-l-4 border-gold-400 bg-sand-50 py-4 pr-5 pl-5 sm:gap-6 sm:pl-6">
            <span className="font-display text-4xl leading-none font-bold tracking-tight text-brand-700 sm:text-5xl md:text-4xl lg:text-5xl">{FOUNDED_YEAR}</span>
            <p className="text-sm text-ink-600 sm:text-base">
              <strong className="block font-semibold text-ink-900">Where our journey began</strong>
              More than a decade of helping families make education choices with confidence.
            </p>
          </Reveal>
        </div>

        {/* Details: full width under photo + intro on tablets, under the intro on desktops */}
        <div className="md:col-span-2 lg:col-span-7 lg:self-start">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-6">
            {[["Our mission", MISSION, Flag], ["Our vision", VISION, Eye]].map(([title, text, Icon], index) => (
              <Reveal key={title} delay={160 + index * 80} className="h-full">
                <div className="group h-full rounded-2xl border border-sand-200 bg-white p-5 transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
                  <h3 className="flex items-center gap-2.5 font-display text-base font-semibold text-ink-900">
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white"><Icon className="size-4" /></span>
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300} className="mt-9">
            <a className="group inline-flex items-center gap-3 rounded-full bg-ink-900 py-2 pr-2 pl-6 text-sm font-medium text-white shadow-[0_12px_24px_-12px_var(--color-ink-900)] transition-[background-color,box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift" href="/about">
              Discover our story
              <span className="grid size-9 place-items-center rounded-full bg-gold-400 text-ink-900 transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
