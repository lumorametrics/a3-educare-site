import Reveal from "../ui/Reveal";
import { ArrowUpRight, BadgeCheck, Compass, Shield, Users } from "../ui/Icons";
import { withBase } from "../../lib/basePath";

/**
 * Brand Ambassador of A3 EduCare Hub & Research Academy, from the organisation's own photograph
 * (public/brand/brand-ambassador-{600,900}.webp: the supplied 900x1600 photo, resized and re-encoded only).
 *
 * Two presentations, each used once:
 * - BrandAmbassadorPanel: part two of the home page "About A3 EduCare Hub" section (rendered inside it by AboutIntro).
 * - BrandAmbassadorProfile: the About page profile card (light, photo on the left, a short formal profile).
 *
 * The copy states only the designation and the organisation's own published values (transparency, accessible career
 * guidance, student empowerment; see the leadership message on the About page). Name and biography are deliberately
 * left out until they are confirmed.
 */

const DESIGNATION = "Brand Ambassador";
const ORGANISATION = "A3 EduCare Hub & Research Academy";
const PHOTO_ALT = `${DESIGNATION} of ${ORGANISATION}`;

const photo = {
  src: withBase("/brand/brand-ambassador-900.webp"),
  srcSet: `${withBase("/brand/brand-ambassador-600.webp")} 600w, ${withBase("/brand/brand-ambassador-900.webp")} 900w`,
  width: 900,
  height: 1600,
};

// The organisation's stated values, worded as on the About page.
const VALUES = [
  { Icon: Shield, label: "Transparency" },
  { Icon: Compass, label: "Accessible career guidance" },
  { Icon: Users, label: "Student empowerment" },
];

/**
 * The photograph in a frame that wipes into view (Reveal "clip") and settles from a slight zoom; gentle zoom on hover.
 * `fill`: from tablets up the frame takes the full height of its container (set by the text beside it, with a minimum)
 * and the photo covers it, instead of the photo's own tall 9:16 shape setting the height.
 */
function Portrait({ sizes, imgClassName, fill = false, children }) {
  return (
    <Reveal variant="clip" once className={fill ? "md:h-full" : ""}>
      <figure className={`reveal-frame group/ba-photo relative overflow-hidden rounded-[1.75rem] bg-ink-800 shadow-lift ${fill ? "md:h-full md:min-h-104 lg:min-h-136" : ""}`}>
        <div className={`reveal-media ${fill ? "md:absolute md:inset-0" : ""}`}>
          <img
            src={photo.src}
            srcSet={photo.srcSet}
            sizes={sizes}
            width={photo.width}
            height={photo.height}
            alt={PHOTO_ALT}
            loading="lazy"
            decoding="async"
            className={`block w-full object-cover transition-transform duration-[1.2s] ease-(--ease-out-soft) motion-safe:group-hover/ba-photo:scale-[1.03] ${imgClassName}`}
          />
        </div>
        {children}
      </figure>
    </Reveal>
  );
}

/**
 * Home page, part two of the "About A3 EduCare Hub" section: rendered inside that section by AboutIntro, never as a
 * section of its own. A dark editorial panel: the photograph in a gold-lined frame, then the official designation and a
 * brand-focused introduction. Its heading is an h3 under the section's h2.
 */
export function BrandAmbassadorPanel() {
  return (
    <div className="relative mt-20 sm:mt-24 lg:mt-28" aria-labelledby="brand-ambassador-title" role="group">
      {/* Bridge from Part A: a gold hairline with the A3 mark, so both parts read as one section. */}
      <div aria-hidden="true" className="mb-8 flex items-center gap-4 sm:mb-10">
        <span className="h-px flex-1 bg-linear-to-r from-transparent to-accent/50" />
        <span className="size-2 rotate-45 bg-accent" />
        <span className="h-px flex-1 bg-linear-to-l from-transparent to-accent/50" />
      </div>

      <Reveal className="relative isolate overflow-hidden rounded-[2.25rem] bg-ink-950 text-white shadow-[0_40px_80px_-40px_rgb(9_24_41/0.55)] ring-1 ring-accent/25">
        {/* One warm light and a faint brand light: depth without decoration. */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 -z-10 size-[26rem] rounded-full bg-accent/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-1/4 -z-10 size-[24rem] rounded-full bg-brand-600/20 blur-3xl" />

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* Photograph first (also on phones), full panel height from tablets up, framed by an inset gold line. */}
          <div className="p-4 pb-0 sm:p-6 sm:pb-0 md:pr-0 md:pb-6 lg:p-8 lg:pr-0">
            <Portrait
              fill
              sizes="(min-width: 1280px) 30rem, (min-width: 768px) 38vw, 92vw"
              imgClassName="aspect-[4/5] object-[50%_12%] md:aspect-auto md:h-full"
            >
              <span aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-accent/50 sm:inset-4" />
              <figcaption className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-ink-950/75 py-1.5 pr-4 pl-1.5 text-xs font-medium text-white backdrop-blur-sm">
                  <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-accent text-ink-950">
                    <BadgeCheck className="size-3.5" />
                  </span>
                  Official {DESIGNATION}
                </span>
              </figcaption>
            </Portrait>
          </div>

          {/* Introduction and designation */}
          <div className="flex min-w-0 flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16 xl:px-16">
            <p className="eyebrow mb-4 text-gold-400">
              <span aria-hidden="true" className="h-px w-8 bg-gold-400" />
              {DESIGNATION}
            </p>
            <h3 id="brand-ambassador-title" className="heading-display text-[1.9rem] leading-[1.1] text-white sm:text-[2.4rem] lg:text-[2.75rem] [&_em]:text-gold-400">
              Meet our <em>Brand Ambassador.</em>
            </h3>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-200 sm:text-lg">
              We are proud to introduce the official Brand Ambassador of {ORGANISATION}: the face of the organisation
              introduced above, representing the A3 brand, its mission and the commitment we make to every student and
              family we guide.
            </p>

            {/* Official designation, set like a title on a certificate. */}
            <div className="mt-8 max-w-lg border-l-2 border-accent pl-5 sm:pl-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-ink-300 uppercase">Official designation</p>
              <p className="mt-2 font-display text-2xl font-semibold text-white sm:text-[1.75rem]">{DESIGNATION}</p>
              <p className="mt-1 text-sm text-gold-400">{ORGANISATION}</p>
            </div>

            {/* To the About page; same pattern as "Discover our story" above, in the panel's gold. */}
            <a
              className="group mt-9 inline-flex items-center gap-3 self-start rounded-full bg-gold-400 py-2 pr-2 pl-6 text-sm font-semibold text-ink-950 transition-[background-color,translate] duration-300 hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
              href="/about"
            >
              Learn more about A3 EduCare Hub
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-ink-950 text-gold-400 transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/** About page profile: a light card with a formal designation list, different in layout and wording from the home page. */
export function BrandAmbassadorProfile() {
  return (
    <section className="section-y scroll-mt-24" id="brand-ambassador-profile" aria-labelledby="about-brand-ambassador-title">
      <div className="shell">
        <div className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[2rem] border border-sand-200 bg-white p-5 shadow-card sm:p-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14 lg:p-10">
          <div className="mx-auto w-full max-w-xs md:max-w-none">
            <Portrait sizes="(min-width: 768px) 30vw, 20rem" imgClassName="aspect-[3/4] object-[50%_8%]" />
          </div>

          <Reveal variant="right" delay={100} className="min-w-0">
            <p className="eyebrow mb-3">
              <span aria-hidden="true" className="h-px w-6 bg-accent" />
              Our {DESIGNATION}
            </p>
            <h2 id="about-brand-ambassador-title" className="heading-display text-3xl leading-tight sm:text-4xl [&_em]:text-accent">
              Representing the <em>A3 brand.</em>
            </h2>
            <p className="mt-5 max-w-xl text-ink-500">
              {ORGANISATION} has appointed an official Brand Ambassador to represent our organisation, our identity and the
              commitment we make to students and their families.
            </p>

            <dl className="mt-8 grid max-w-xl grid-cols-1 divide-y divide-sand-200 border-y border-sand-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              <div className="py-4 lg:pr-6">
                <dt className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">Designation</dt>
                <dd className="mt-1 font-display text-lg font-semibold text-ink-900">{DESIGNATION}</dd>
              </div>
              <div className="py-4 lg:pl-6">
                <dt className="text-xs font-semibold tracking-[0.14em] text-ink-500 uppercase">Organisation</dt>
                <dd className="mt-1 font-display text-lg font-semibold text-ink-900">{ORGANISATION}</dd>
              </div>
            </dl>

            <ul className="mt-6 flex flex-wrap gap-2">
              {VALUES.map(({ Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 px-3.5 py-1.5 text-sm text-ink-700">
                  <Icon aria-hidden="true" className="size-3.5 text-accent" />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
