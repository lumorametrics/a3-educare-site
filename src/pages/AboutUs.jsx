import Breadcrumb from "../components/ui/Breadcrumb";
import Reveal from "../components/ui/Reveal";
import SectionHeading from "../components/ui/SectionHeading";
import CtaBand from "../components/ui/CtaBand";
import {
  ArrowDown,
  ArrowUpRight,
  Award,
  MapPin,
  Shield,
  Sparkle,
} from "../components/ui/Icons";

const courses = [
  "Polytechnic",
  "B.Tech",
  "M.Tech",
  "MBA",
  "BBA",
  "BCA",
  "LLB",
  "LLM",
  "Hotel Management",
  "BPT",
  "DMLT",
  "BMLT",
  "B.Sc Nursing",
  "GNM",
  "Pharmacy",
  "Paramedical",
  "ITI",
  "Arts & Commerce",
];

const offices = ["Delhi", "Ranchi", "Bhopal", "Godda", "Palamu", "Shahdol"];

// Hero facts card: [label, value, icon], all taken from the content further down this page.
const facts = [
  ["Guiding students", "Since 2014", Sparkle],
  ["City offices", String(offices.length), MapPin],
  ["Quality certified", "ISO 9001:2015", Award],
  ["Registered with Govt. of India", "MSME", Shield],
];

const trust = [
  [
    Shield,
    "Section 8(1) organisation",
    "Operating entity: Puja Social Empowerment Foundation, registered under Section 8(1) of the Companies Act, 2013.",
  ],
  [
    Sparkle,
    "Recognised registrations",
    "Aligned with Ministry of Corporate Affairs, NITI Aayog and Government of India requirements as shared by the organisation.",
  ],
  [
    Award,
    "Quality & enterprise credentials",
    "ISO 9001:2015 Certified and MSME Registered with the Government of India.",
  ],
];

export default function AboutUs() {
  return (
    <main>
      {/* Hero — same visual language as the home page hero (dark stage, frosted eyebrow pill,
          bold white headline with a teal accent, primary + ghost CTAs, facts card overlapping the
          lower edge), with a framed office photo instead of a full-bleed slider. */}
      <section className="relative isolate overflow-hidden bg-ink-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-brand-600/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-gold-400/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)] bg-size-[48px_48px]"
        />

        <div className="shell relative grid grid-cols-1 items-center gap-12 pt-8 pb-28 sm:pb-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-14 lg:pb-36">
          <div className="min-w-0">
            <div className="motion-safe:animate-page-in">
              <Breadcrumb
                tone="dark"
                items={[{ label: "Home", href: "/" }, { label: "About Us" }]}
              />
            </div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-sm motion-safe:animate-fade-up">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-gold-400"
              />
              Since 2014 · Education guidance with purpose
            </p>
            <h1 className="mt-5 text-[2.4rem] leading-[1.05] font-bold tracking-[-0.03em] text-white motion-safe:animate-fade-up motion-safe:[animation-delay:90ms] min-[375px]:text-[2.75rem] sm:text-6xl lg:text-[4.25rem]">
              Your Success is{" "}
              <span className="text-brand-300">Our Mission!</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 motion-safe:animate-fade-up motion-safe:[animation-delay:180ms] sm:text-lg">
              A3 Educare Hub &amp; Research Academy helps students and families
              make informed education decisions with transparent guidance,
              practical support and a clear path forward.
            </p>
            <div className="mt-9 flex flex-col gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:270ms] min-[420px]:flex-row min-[420px]:flex-wrap">
              <a className="btn btn-primary px-7 py-3.5" href="/#contact">
                Talk to an advisor <ArrowUpRight />
              </a>
              <a className="btn btn-ghost-light px-7 py-3.5" href="#our-story">
                Discover our story <ArrowDown />
              </a>
            </div>
          </div>

          <figure className="relative mx-auto w-full max-w-md motion-safe:animate-fade-up motion-safe:[animation-delay:150ms] sm:max-w-lg lg:max-w-none">
            {/* Offset outline frame behind the photo */}
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border border-gold-400/40 sm:translate-x-5 sm:translate-y-5"
            />
            <div className="relative overflow-hidden rounded-[2rem] bg-ink-900 shadow-lift ring-1 ring-white/10">
              <img
                src="/about/about-office-960.webp"
                srcSet="/about/about-office-640.webp 640w, /about/about-office-960.webp 960w"
                sizes="(min-width: 1024px) 40vw, (min-width: 640px) 32rem, 100vw"
                width="960"
                height="960"
                alt="An A3 Educare Hub office, with the courses offered and the 2026–27 admissions board"
                fetchPriority="high"
                decoding="async"
                className="aspect-[4/3] w-full object-cover object-[50%_35%] sm:aspect-square"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink-950/70 to-transparent"
              />
              <figcaption className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-medium text-ink-900 shadow-card backdrop-blur sm:bottom-5 sm:left-5">
                <MapPin className="size-3.5 text-brand-700" /> {offices.length}{" "}
                city offices across India
              </figcaption>
            </div>
          </figure>
        </div>
      </section>

      {/* Facts already stated on this page, in the home page's overlapping stats-card style. */}
      <section
        aria-label="At a glance"
        className="relative z-10 -mt-14 bg-[linear-gradient(to_bottom,transparent_3.5rem,white_3.5rem)] sm:-mt-16 sm:bg-[linear-gradient(to_bottom,transparent_4rem,white_4rem)]"
      >
        <div className="shell">
          <dl className="card grid grid-cols-2 gap-x-6 gap-y-6 p-6 sm:p-8 lg:grid-cols-4 lg:divide-x lg:divide-sand-200 lg:p-0">
            {facts.map(([label, value, Icon]) => (
              // dl > div > dt + dd only (valid list); the icon sits inside <dt>, positioned to the left.
              <div
                key={label}
                className="relative min-w-0 sm:pl-15 lg:px-7 lg:py-7 xl:pr-6 xl:pl-23"
              >
                <dt className="text-xs font-medium text-ink-500">
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 left-0 hidden size-11 -translate-y-1/2 place-items-center rounded-xl bg-brand-50 text-brand-700 sm:grid lg:hidden xl:left-8 xl:grid"
                  >
                    <Icon className="size-5" />
                  </span>
                  {label}
                </dt>
                <dd className="mt-0.5 text-lg font-semibold break-words text-ink-900 sm:text-2xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-y bg-white" id="our-story">
        <div className="shell grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <Reveal variant="left">
            <p className="eyebrow mb-3">Who we are</p>
            <h2 className="heading-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Education choices deserve <em>clarity.</em>
            </h2>
          </Reveal>
          <Reveal
            variant="right"
            delay={100}
            className="flex flex-col gap-5 text-lg text-ink-500"
          >
            <p>
              A3 Educare Hub &amp; Research Academy is an education consultancy
              committed to helping students choose the right course, college and
              career direction. Since 2014, we have worked to make education
              guidance more accessible, understandable and student-focused.
            </p>
            <p>
              Our approach is built on honest information, individual attention
              and practical next steps. We do not believe in one-size-fits-all
              advice; we believe every learner deserves guidance that reflects
              their aspirations, strengths and circumstances.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="shell section-y">
        <SectionHeading
          eyebrow="Built on accountability"
          title={
            <>
              Professional guidance. <em>Responsible practice.</em>
            </>
          }
          description="We bring a formal, transparent foundation to every student conversation."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {trust.map(([Icon, title, text], index) => (
            <Reveal key={title} delay={index * 90} className="h-full">
              <div className="group card-interactive h-full p-7">
                <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-transform duration-500 group-hover:scale-110">
                  <Icon className="size-6" />
                </span>
                <strong className="mt-6 block font-display text-xl text-ink-900">
                  {title}
                </strong>
                <p className="mt-3 text-sm text-ink-500">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-y bg-white">
        <div className="shell grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal
            variant="left"
            className="relative overflow-hidden rounded-[2rem] border border-sand-200 shadow-card"
          >
            <img
              sizes="(min-width: 1024px) 40vw, (min-width: 640px) 32rem, 100vw"
              width="960"
              height="960"
              alt="An A3 Educare Hub office, with the courses offered and the 2026–27 admissions board"
              fetchPriority="high"
              decoding="async"
              className="aspect-[4/5] w-full object-cover object-[50%_35%]"
              srcSet="/about/about-Ajay Kumar-.jpeg 640w, /about/about-Ajay Kumar-.jpeg 960w"
              src="/about/about-Ajay Kumar-.jpeg"
            />
            <span className="absolute bottom-5 left-5 rounded-full bg-white/90 backdrop-blur-md px-4 py-2 text-sm font-medium text-ink-900 shadow-card">
              Leadership with purpose
            </span>
          </Reveal>
          <Reveal variant="right" delay={100}>
            <p className="eyebrow mb-3">From our leadership</p>
            <h2 className="heading-display text-3xl sm:text-4xl">
              A message from <em>Er. Ajay Kumar.</em>
            </h2>
            <p className="mt-2 text-sm font-medium text-ink-400">
              Director · B.Tech, M.Tech
            </p>
            <blockquote className="relative mt-8 border-l-4 border-gold-400 pl-6 font-display text-xl font-medium leading-relaxed tracking-tight text-ink-900 sm:text-2xl">
              “Our responsibility is not simply to show students a list of
              courses. It is to help them understand their choices, ask the
              right questions and move towards a future they can believe in.”
            </blockquote>
            <p className="mt-8 text-ink-500">
              At A3 Educare Hub, our focus is transparency, accessible career
              guidance and student empowerment. We encourage every student to
              make decisions with accurate information, realistic expectations
              and confidence in their own potential.
            </p>
            <p className="mt-4 text-ink-500">
              Our team is here to listen, simplify the admission journey and
              support students as they take each important step.
            </p>
            <p className="mt-8 font-display text-xl text-ink-900">
              Er. Ajay Kumar{" "}
              <span className="block font-sans text-sm text-ink-400">
                Director, A3 Educare Hub
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="shell section-y">
        <SectionHeading
          eyebrow="Explore your possibilities"
          title={
            <>
              Guidance across <em>every stage.</em>
            </>
          }
          description="From technical and professional programmes to healthcare, law and foundational pathways."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {courses.map((course, index) => (
            <Reveal key={course} delay={(index % 6) * 50}>
              <a
                href="/courses"
                className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-sand-200 bg-white p-4 transition-[translate,background-color,border-color] duration-300 hover:-translate-y-1 hover:border-ink-900 hover:bg-ink-900 sm:p-5"
              >
                <span className="flex items-center justify-between font-display text-xs text-brand-600 transition-colors group-hover:text-gold-400">
                  {String(index + 1).padStart(2, "0")}
                  <ArrowUpRight className="size-4 text-ink-300 transition-colors group-hover:text-white" />
                </span>
                <strong className="text-sm font-semibold text-ink-900 transition-colors group-hover:text-white">
                  {course}
                </strong>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-gold-300 bg-gold-100/60 p-6 sm:p-8 lg:grid-cols-[0.6fr_1.4fr] lg:items-center lg:gap-10">
          <div>
            <p className="eyebrow mb-2">Special facilitation</p>
            <h3 className="font-display text-2xl">
              More support where it matters.
            </h3>
          </div>
          <p className="text-ink-700">
            We also facilitate guidance for Bihar Student Credit Card Yojana,
            national scholarships, and admissions in NIRF, NBA and NAAC “A”
            grade colleges and universities. Eligibility and approvals remain
            subject to the relevant institution or government authority.
          </p>
        </Reveal>
      </section>

      <section className="section-y bg-white">
        <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal variant="left">
            <p className="eyebrow mb-3">Closer to your goals</p>
            <h2 className="heading-display text-3xl sm:text-4xl">
              Guidance with a <em>regional presence.</em>
            </h2>
            <p className="mt-4 text-ink-500">
              Our city offices help students and families access local support
              while exploring opportunities across India.
            </p>
            <a className="link-arrow mt-6" href="/#contact">
              Connect with our team <ArrowUpRight />
            </a>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {offices.map((office, index) => (
              <Reveal key={office} delay={(index % 3) * 70}>
                <div className="group card-interactive p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <MapPin className="size-5" />
                  </span>
                  <strong className="mt-5 block font-semibold text-ink-900">
                    {office}
                  </strong>
                  <small className="text-xs text-ink-400">City office</small>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="pt-20 sm:pt-24">
        <CtaBand
          eyebrow="Admissions open 2026–27"
          title={
            <>
              Let&apos;s plan your next chapter <em>with confidence.</em>
            </>
          }
          description="Tell us what you are considering. We will help you understand the possibilities and find a practical next step."
          actionLabel="Start your conversation"
        />
      </div>
    </main>
  );
}
