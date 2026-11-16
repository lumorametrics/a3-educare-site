import { withBase } from "../lib/basePath";
import Breadcrumb from "../components/ui/Breadcrumb";
import Reveal from "../components/ui/Reveal";
import SectionHeading from "../components/ui/SectionHeading";
import CtaBand from "../components/ui/CtaBand";
import { SERVICES } from "../components/common/servicesContent";
import { FOUNDED_YEAR, MISSION, OFFICES, VISION } from "../components/home/homeContent";
import {
  ArrowDown,
  ArrowUpRight,
  Award,
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  Check,
  Cpu,
  Eye,
  Graduation,
  ListChecks,
  MapPin,
  Scale,
  Shield,
  Sparkle,
  Stethoscope,
  Target,
  Users,
} from "../components/ui/Icons";

/**
 * About page. Every fact here is the organisation's own (founding year, offices, registrations, leadership message);
 * mission, vision, offices and services come from the shared content modules so they match the home and Services pages.
 *
 * Each photo appears once: the student photo in the hero, the office photo beside "Who we are", the director's
 * portrait with his message, and the certificate photo under trust & recognition. All are WebP sets in /public/about.
 */

/** A responsive WebP set from /public/about named `${name}-${width}.webp`. */
function photo(name, widths, width, height, alt) {
  const url = (w) => withBase(`/about/${name}-${w}.webp`);
  return { src: url(widths[Math.min(1, widths.length - 1)]), srcSet: widths.map((w) => `${url(w)} ${w}w`).join(", "), width, height, alt };
}

const PHOTOS = {
  student: photo("about-student-guidance", [640, 960, 1440], 1440, 1016, "A student and a member of the A3 Educare Hub & Research Academy team holding documents in front of an A3 Educare Hub & Research Academy banner"),
  office: photo("about-office", [640, 960], 960, 960, "An A3 Educare Hub & Research Academy office, with the courses offered and the 2026–27 admissions board"),
  director: photo("about-director", [480, 900], 900, 1599, "Er. Ajay Kumar, Director of A3 Educare Hub & Research Academy"),
  recognition: photo("about-recognition", [640, 960, 1440], 1440, 740, "Four people holding an A3 EduCare Hub Certificate of Appreciation in an office with a trophy and framed certificates"),
};

// Hero facts card: [label, value, icon], all stated elsewhere on this page.
const facts = [
  ["Guiding students", `Since ${FOUNDED_YEAR}`, Sparkle],
  ["City offices", String(OFFICES.length), MapPin],
  ["Quality certified", "ISO 9001:2015", Award],
  ["Registered with Govt. of India", "MSME", Shield],
];

// What a student can expect: the principles from "Who we are" and the leadership message.
const promise = {
  title: "Honest information, always",
  text: "We explain approvals, eligibility, fees and trade-offs in plain language, so every decision is made with accurate information and realistic expectations.",
  points: ["Approvals and eligibility checked with you", "The full cost discussed before you commit", "No promise of guaranteed admission"],
};
const pillars = [
  [Users, "Individual attention", "No one-size-fits-all advice. Guidance reflects each learner’s aspirations, strengths and circumstances."],
  [ListChecks, "Practical next steps", "Conversations lead to clear actions, from a course shortlist to every application deadline."],
  [MapPin, "Support close to home", "Our city offices bring guidance closer to students and families while they explore opportunities across India."],
  [Graduation, "Every stage, many pathways", "From polytechnic and engineering to management, law, nursing and pharmacy."],
];

// The programmes we guide for, grouped by stream: [icon, stream, programmes].
const streams = [
  [Cpu, "Engineering & technology", ["Polytechnic", "B.Tech", "M.Tech", "ITI"]],
  [Briefcase, "Management & computing", ["MBA", "BBA", "BCA", "Hotel Management"]],
  [Stethoscope, "Health & life sciences", ["B.Sc Nursing", "GNM", "BPT", "DMLT", "BMLT", "Pharmacy", "Paramedical"]],
  [Scale, "Law, arts & commerce", ["LLB", "LLM", "Arts & Commerce"]],
];

const trust = [
  [Shield, "Section 8(1) organisation", "Operating entity: Puja Social Empowerment Foundation, registered under Section 8(1) of the Companies Act, 2013."],
  [Sparkle, "Recognised registrations", "Aligned with Ministry of Corporate Affairs, NITI Aayog and Government of India requirements as shared by the organisation."],
  [Award, "Quality & enterprise credentials", "ISO 9001:2015 Certified and MSME Registered with the Government of India."],
];

/** Gold "Est. 2014" seal with a slowly turning text ring (the turn stops under reduced motion). Decorative. */
function Seal({ className = "" }) {
  return (
    <div aria-hidden="true" className={`grid size-24 place-items-center rounded-full bg-gold-400 text-ink-900 shadow-lift ring-4 ring-ink-950 sm:size-28 ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full motion-safe:animate-[spin_28s_linear_infinite]">
        <defs>
          <path id="about-seal-ring" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" />
        </defs>
        <text className="fill-current text-[8px] font-semibold">
          <textPath href="#about-seal-ring" textLength="232" lengthAdjust="spacing">
            EDUCATION GUIDANCE • SINCE {FOUNDED_YEAR} •
          </textPath>
        </text>
      </svg>
      <span className="relative text-center leading-none">
        <span className="block text-[0.6rem] font-semibold tracking-[0.2em]">EST.</span>
        <span className="font-display text-xl font-bold sm:text-2xl">{FOUNDED_YEAR}</span>
      </span>
    </div>
  );
}

/** A photo that wipes into view and settles from a slight zoom (Reveal variant "clip"), zooming gently on hover. */
function RevealPhoto({ image, sizes, className = "", imgClassName = "", children }) {
  return (
    <Reveal variant="clip" once className={className}>
      <figure className="reveal-frame group relative h-full overflow-hidden rounded-[2rem] bg-sand-100 shadow-lift">
        <div className="reveal-media h-full">
          <img
            src={image.src}
            srcSet={image.srcSet}
            sizes={sizes}
            width={image.width}
            height={image.height}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className={`block w-full object-cover transition-transform duration-[1.2s] ease-(--ease-out-soft) group-hover:scale-[1.04] ${imgClassName}`}
          />
        </div>
        {children}
      </figure>
    </Reveal>
  );
}

export default function AboutUs() {
  return (
    <main>
      {/* Hero: the home page's dark stage, with the student photo framed and two overlapping accents. */}
      <section className="relative isolate overflow-hidden bg-ink-950 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-brand-600/30 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-gold-400/15 blur-3xl" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)] bg-size-[48px_48px]"
        />

        <div className="shell relative grid grid-cols-1 items-center gap-14 pt-8 pb-32 sm:pb-36 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pt-14 lg:pb-40">
          <div className="min-w-0">
            <div className="motion-safe:animate-page-in">
              <Breadcrumb tone="dark" items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
            </div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-sm motion-safe:animate-fade-up">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-400" />
              Since {FOUNDED_YEAR} · Education guidance with purpose
            </p>
            <h1 className="mt-5 text-[2.4rem] leading-[1.05] font-bold tracking-[-0.03em] text-white motion-safe:animate-fade-up motion-safe:[animation-delay:90ms] min-[375px]:text-[2.75rem] sm:text-6xl lg:text-[4.25rem]">
              Your Success is <span className="text-brand-300">Our Mission!</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 motion-safe:animate-fade-up motion-safe:[animation-delay:180ms] sm:text-lg">
              A3 Educare Hub &amp; Research Academy helps students and families make informed education decisions with
              transparent guidance, practical support and a clear path forward.
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

          <div className="relative mx-auto w-full max-w-xl motion-safe:animate-fade-up motion-safe:[animation-delay:150ms] lg:max-w-none">
            {/* Offset outline frame behind the photo */}
            <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border border-gold-400/40 sm:translate-x-5 sm:translate-y-5" />
            <figure className="group relative overflow-hidden rounded-[2rem] bg-ink-900 shadow-lift ring-1 ring-white/10">
              <img
                src={PHOTOS.student.src}
                srcSet={PHOTOS.student.srcSet}
                sizes="(min-width: 1280px) 620px, (min-width: 1024px) 48vw, (min-width: 640px) 36rem, 100vw"
                width={PHOTOS.student.width}
                height={PHOTOS.student.height}
                alt={PHOTOS.student.alt}
                fetchPriority="high"
                decoding="async"
                className="block aspect-[4/3] w-full object-cover transition-transform duration-[1.4s] ease-(--ease-out-soft) group-hover:scale-[1.03]"
              />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-ink-950/55 to-transparent" />
            </figure>
            <Seal className="absolute -top-7 -right-2 sm:-top-10 sm:-right-8" />
            <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl bg-white/95 py-2.5 pr-4 pl-2.5 text-ink-900 shadow-lift backdrop-blur sm:-bottom-7 sm:-left-7 sm:py-3 motion-safe:animate-float">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
                <CalendarCheck className="size-5" />
              </span>
              <span className="text-xs leading-tight text-ink-500">
                <strong className="block text-sm font-semibold text-ink-900">Admissions open</strong>
                Session 2026–27
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* At a glance: overlaps the hero's lower edge. */}
      <section aria-label="At a glance" className="relative z-10 -mt-14 bg-[linear-gradient(to_bottom,transparent_3.5rem,white_3.5rem)] sm:-mt-16 sm:bg-[linear-gradient(to_bottom,transparent_4rem,white_4rem)]">
        <div className="shell">
          <dl className="card grid grid-cols-2 gap-x-6 gap-y-6 p-6 sm:p-8 lg:grid-cols-4 lg:divide-x lg:divide-sand-200 lg:p-0">
            {facts.map(([label, value, Icon]) => (
              // dl > div > dt + dd only (valid list); the icon sits inside <dt>, positioned to the left.
              <div key={label} className="relative min-w-0 sm:pl-15 lg:px-7 lg:py-7 xl:pr-6 xl:pl-23">
                <dt className="text-xs font-medium text-ink-500">
                  <span aria-hidden="true" className="absolute top-1/2 left-0 hidden size-11 -translate-y-1/2 place-items-center rounded-xl bg-brand-50 text-brand-700 sm:grid lg:hidden xl:left-8 xl:grid">
                    <Icon className="size-5" />
                  </span>
                  {label}
                </dt>
                <dd className="mt-0.5 text-lg font-semibold break-words text-ink-900 sm:text-2xl">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Who we are: office photo with an overlapping belief card; the story, then mission and vision. */}
      <section className="section-y bg-white" id="our-story">
        <div className="shell grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-16 xl:gap-20">
          <div className="relative isolate mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <div aria-hidden="true" className="absolute -top-6 -left-6 -z-10 size-36 bg-[radial-gradient(var(--color-brand-300)_1.5px,transparent_1.6px)] bg-size-[14px_14px] opacity-70" />
            <RevealPhoto image={PHOTOS.office} sizes="(min-width: 1024px) 34vw, 28rem" imgClassName="aspect-[4/5] object-[50%_35%]" />
            <Reveal delay={250} className="relative -mt-14 ml-auto w-[88%] sm:absolute sm:-right-6 sm:-bottom-10 sm:mt-0 sm:w-72 lg:-right-8 lg:-bottom-16 lg:w-60 xl:-right-10 xl:-bottom-12 xl:w-72">
              <figure className="rounded-2xl bg-ink-900 p-5 text-white shadow-lift sm:p-6">
                <Sparkle className="size-5 text-gold-400" />
                <blockquote className="mt-3 font-display text-base leading-snug font-medium">
                  Every learner deserves guidance that reflects their aspirations, strengths and circumstances.
                </blockquote>
                <figcaption className="mt-3 text-xs text-white/55">What we believe</figcaption>
              </figure>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow mb-3">
                <span aria-hidden="true" className="h-px w-6 bg-brand-600" />
                Who we are
              </p>
              <h2 className="heading-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
                Education choices deserve <em>clarity.</em>
              </h2>
            </Reveal>
            <Reveal delay={100} className="mt-6 flex flex-col gap-4 text-lg text-ink-500">
              <p>
                A3 Educare Hub &amp; Research Academy is an education consultancy committed to helping students choose the
                right course, college and career direction. Since {FOUNDED_YEAR}, we have worked to make education guidance
                more accessible, understandable and student-focused.
              </p>
              <p>
                Our approach is built on honest information, individual attention and practical next steps. We do not
                believe in one-size-fits-all advice; we believe every learner deserves guidance that reflects their
                aspirations, strengths and circumstances.
              </p>
            </Reveal>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                [Target, "Our mission", MISSION, "bg-brand-600 text-white"],
                [Eye, "Our vision", VISION, "bg-gold-400 text-ink-900"],
              ].map(([Icon, title, text, tone], index) => (
                <Reveal key={title} delay={150 + index * 90} className="h-full">
                  <article className="group card-interactive h-full p-6">
                    <span className={`grid size-11 place-items-center rounded-xl ${tone} transition-transform duration-500 group-hover:scale-110`}>
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why choose A3: one featured commitment and four supporting ones. */}
      <section className="relative isolate section-y">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_85%_20%,var(--color-brand-50),transparent_70%)]" />
        <div className="shell">
          <SectionHeading
            eyebrow="Why families choose A3"
            title={<>Our commitment to <em>every student.</em></>}
            description="What you can expect from us, from the first conversation to the final application."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal className="h-full sm:col-span-2 lg:col-span-1 lg:row-span-2">
              <article className="relative isolate flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-linear-to-br from-brand-700 via-brand-800 to-ink-900 p-7 text-white shadow-lift sm:p-9">
                <div aria-hidden="true" className="absolute -top-20 -right-16 -z-10 size-64 rounded-full bg-gold-400/20 blur-3xl" />
                <span className="grid size-12 place-items-center rounded-xl bg-white/10 text-gold-400 ring-1 ring-white/15">
                  <BadgeCheck className="size-6" />
                </span>
                <h3 className="mt-8 font-display text-2xl font-semibold text-white sm:text-3xl">{promise.title}</h3>
                <p className="mt-3 text-white/75">{promise.text}</p>
                <ul className="mt-8 flex flex-col gap-3 lg:mt-auto lg:pt-8">
                  {promise.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-white/90">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-400 text-ink-900">
                        <Check className="size-3" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
            {pillars.map(([Icon, title, text], index) => (
              <Reveal key={title} delay={(index + 1) * 80} className="h-full">
                <article className="group card-interactive h-full p-7">
                  <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-semibold text-ink-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How we help: the services, with the special facilitation note beside them. */}
      <section className="section-y bg-white">
        <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <p className="eyebrow mb-3">
                  <span aria-hidden="true" className="h-px w-6 bg-brand-600" />
                  How we help
                </p>
                <h2 className="heading-display text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
                  Support from the first question to <em>the final application.</em>
                </h2>
                <p className="mt-5 text-ink-500">
                  Choose the support you need today. Your plan can grow as your goals become clearer.
                </p>
                <a className="link-arrow mt-6" href="/services">
                  Explore our services <ArrowUpRight />
                </a>
              </Reveal>
              <Reveal delay={120} className="mt-10 rounded-[1.5rem] border border-gold-300 bg-gold-100/60 p-6 sm:p-7">
                <p className="eyebrow mb-2">Special facilitation</p>
                <h3 className="font-display text-2xl font-semibold text-ink-900">More support where it matters.</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">
                  We also facilitate guidance for Bihar Student Credit Card Yojana, national scholarships, and admissions in
                  NIRF, NBA and NAAC “A” grade colleges and universities. Eligibility and approvals remain subject to the
                  relevant institution or government authority.
                </p>
              </Reveal>
            </div>
          </div>
          <ol className="flex flex-col gap-4 lg:col-span-7">
            {SERVICES.map(({ number, title, text, points, icon: Icon, tone }, index) => (
              <Reveal as="li" key={title} delay={index * 80}>
                <article className="group card-interactive flex flex-col gap-5 p-6 sm:flex-row sm:gap-6 sm:p-7">
                  <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${tone} transition-transform duration-500 ease-(--ease-out-soft) group-hover:scale-110 group-hover:-rotate-6`}>
                    <Icon className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-xl font-semibold text-ink-900">{title}</h3>
                      <span aria-hidden="true" className="font-display text-sm font-semibold text-ink-300 transition-colors group-hover:text-brand-600">
                        {number}
                      </span>
                    </div>
                    <p className="mt-2 text-ink-500">{text}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {points.map((point) => (
                        <li key={point} className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-ink-600">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Programmes, grouped by stream. */}
      <section className="shell section-y">
        <SectionHeading
          eyebrow="Explore your possibilities"
          title={<>Guidance across <em>every stage.</em></>}
          description="From technical and professional programmes to healthcare, law and foundational pathways."
          action={
            <a className="link-arrow" href="/courses">
              Browse all courses <ArrowUpRight />
            </a>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {streams.map(([Icon, title, programmes], index) => (
            <Reveal key={title} delay={index * 90} className="h-full">
              <article className="group card-interactive flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-ink-900 text-gold-400 transition-transform duration-500 ease-(--ease-out-soft) group-hover:-translate-y-0.5 group-hover:rotate-6">
                    <Icon className="size-6" />
                  </span>
                  <span className="text-xs font-medium text-ink-400">
                    {programmes.length} {programmes.length === 1 ? "programme" : "programmes"}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-ink-900">{title}</h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {programmes.map((programme) => (
                    <li key={programme}>
                      <a
                        href="/courses"
                        className="inline-flex rounded-full border border-sand-200 bg-sand-50 px-3 py-1.5 text-sm text-ink-700 transition-colors duration-300 hover:border-brand-600 hover:bg-brand-600 hover:text-white"
                      >
                        {programme}
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Leadership message, on a dark stage. */}
      <section className="relative isolate overflow-hidden bg-ink-950 text-white section-y" aria-label="A message from our leadership">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/3 -z-10 size-[30rem] rounded-full bg-brand-600/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-40 -z-10 size-[26rem] rounded-full bg-gold-400/10 blur-3xl" />
        <div className="shell grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-16 xl:gap-20">
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:col-span-5 lg:max-w-none">
            <div aria-hidden="true" className="absolute inset-0 -translate-x-3 translate-y-3 rounded-[2rem] border border-gold-400/40 sm:-translate-x-5 sm:translate-y-5" />
            <RevealPhoto image={PHOTOS.director} sizes="(min-width: 1024px) 34vw, 28rem" imgClassName="aspect-[4/5] object-[50%_25%]" />
            <Reveal delay={300} className="absolute -bottom-6 left-1/2 w-max -translate-x-1/2">
              <p className="flex items-center gap-3 rounded-full bg-white py-2 pr-5 pl-2 text-ink-900 shadow-lift">
                <span className="grid size-9 place-items-center rounded-full bg-gold-400">
                  <Award className="size-4" />
                </span>
                <span className="text-sm leading-tight font-semibold">
                  Er. Ajay Kumar
                  <span className="block text-xs font-normal text-ink-500">Director · B.Tech, M.Tech</span>
                </span>
              </p>
            </Reveal>
          </div>

          <Reveal variant="right" delay={100} className="lg:col-span-7">
            <p className="eyebrow mb-3 text-gold-400">
              <span aria-hidden="true" className="h-px w-6 bg-gold-400" />
              From our leadership
            </p>
            <h2 className="heading-display text-3xl text-white sm:text-4xl lg:text-5xl [&_em]:text-gold-400">
              A message from <em>Er. Ajay Kumar.</em>
            </h2>
            <figure className="mt-10">
              <svg aria-hidden="true" viewBox="0 0 32 24" className="mb-5 h-6 w-8 text-gold-400/80">
                <path fill="currentColor" d="M0 24V14.4C0 6.6 4.2 1.8 12.6 0l1.5 3.3C9.6 4.8 7.5 7.5 7.2 11.4H13V24zm18 0V14.4C18 6.6 22.2 1.8 30.6 0l1.5 3.3c-4.5 1.5-6.6 4.2-6.9 8.1H31V24z" />
              </svg>
              <blockquote className="border-l-2 border-gold-400 pl-6 font-display text-xl leading-relaxed font-medium tracking-tight text-white sm:text-2xl">
                “Our responsibility is not simply to show students a list of courses. It is to help them understand their
                choices, ask the right questions and move towards a future they can believe in.”
              </blockquote>
            </figure>
            <div className="mt-8 grid grid-cols-1 gap-4 text-white/70 sm:grid-cols-2 sm:gap-8">
              <p>
                At A3 Educare Hub & Research Academy, our focus is transparency, accessible career guidance and student empowerment. We
                encourage every student to make decisions with accurate information, realistic expectations and confidence
                in their own potential.
              </p>
              <p>Our team is here to listen, simplify the admission journey and support students as they take each important step.</p>
            </div>
            <p className="mt-8 font-display text-xl text-white">
              Er. Ajay Kumar <span className="block font-sans text-sm text-white/50">Director, A3 Educare Hub & Research Academy</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Trust & recognition: the certificate photo beside the organisation's registrations. */}
      <section className="section-y bg-white">
        <div className="shell">
          <SectionHeading
            eyebrow="Trust & recognition"
            title={<>Professional guidance. <em>Responsible practice.</em></>}
            description="We bring a formal, transparent foundation to every student conversation."
          />
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <RevealPhoto image={PHOTOS.recognition} sizes="(min-width: 1280px) 720px, (min-width: 1024px) 56vw, 100vw" imgClassName="aspect-[16/9] object-center">
                <span className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-gold-400 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-card sm:top-5 sm:right-5">
                  <Award className="size-3.5" /> Certificate of Appreciation
                </span>
              </RevealPhoto>
              <Reveal delay={150}>
                <p className="mt-5 flex items-start gap-3 text-sm text-ink-500">
                  <span aria-hidden="true" className="mt-2 h-px w-8 shrink-0 bg-gold-500" />
                  Recognising valuable contribution, dedication and support in the growth of A3 EduCare Hub.
                </p>
              </Reveal>
            </div>
            <div className="flex flex-col gap-4 lg:col-span-5">
              {trust.map(([Icon, title, text], index) => (
                <Reveal key={title} delay={index * 90}>
                  <article className="group card-interactive flex gap-5 p-6">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-transform duration-500 group-hover:scale-110">
                      <Icon className="size-6" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{text}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Regional presence. */}
      <section className="relative isolate section-y">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(var(--color-ink-200)_1px,transparent_1.2px)] mask-[radial-gradient(ellipse_at_70%_50%,black,transparent_70%)] bg-size-[22px_22px] opacity-60" />
        <div className="shell grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal variant="left" className="lg:col-span-5">
            <p className="eyebrow mb-3">
              <span aria-hidden="true" className="h-px w-6 bg-brand-600" />
              Closer to your goals
            </p>
            <h2 className="heading-display text-3xl sm:text-4xl">
              Guidance with a <em>regional presence.</em>
            </h2>
            <p className="mt-4 text-ink-500">
              Our city offices help students and families access local support while exploring opportunities across India.
            </p>
            <a className="link-arrow mt-6" href="/#contact">
              Connect with our team <ArrowUpRight />
            </a>
          </Reveal>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
            {OFFICES.map((office, index) => (
              <Reveal as="li" key={office} delay={(index % 3) * 70}>
                <div className="group card-interactive p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                      <MapPin className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    </span>
                    <span aria-hidden="true" className="font-display text-xs font-semibold text-ink-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <strong className="mt-5 block font-semibold text-ink-900">{office}</strong>
                  <small className="text-xs text-ink-400">City office</small>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand
        eyebrow="Admissions open 2026–27"
        title={<>Let&apos;s plan your next chapter <em>with confidence.</em></>}
        description="Tell us what you are considering. We will help you understand the possibilities and find a practical next step."
        actionLabel="Start your conversation"
        secondary={
          <a className="btn btn-ghost-light" href="/courses">
            Explore courses <ArrowUpRight />
          </a>
        }
      />
    </main>
  );
}
