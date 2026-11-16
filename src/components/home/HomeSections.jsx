/**
 * Home page company sections after About and What we do: services, why choose A3, the founder's message and
 * the final call to action. WordPress-driven sections live in HomePage.jsx.
 *
 * Each section keeps the established home page design and has its own icons; copy comes from homeContent.js,
 * which assigns each fact to exactly one section.
 */
import Reveal from "../ui/Reveal";
import { ArrowRight, ArrowUpRight, Laptop, Mail, Phone, WhatsAppIcon } from "../ui/Icons";
import { withBase } from "../../lib/basePath";
import { PHONE_DISPLAY, PHONE_HREF, whatsappChatUrl } from "../../lib/contact";
import { CAREER_SERVICES, CAREER_SERVICES_IMAGE, CORE_SERVICES, TRUST_REASONS } from "./homeContent";

export function Eyebrow({ children, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <p className={`eyebrow mb-4 ${dark ? "text-gold-400" : ""}`}>
      <span aria-hidden="true" className={`h-px w-8 ${dark ? "bg-gold-400" : "bg-brand-600"}`} />{children}
    </p>
  );
}

function Photo({ image, position, sizes, className = "", alt = "" }) {
  return (
    <img
      src={withBase(image.large)}
      srcSet={`${withBase(image.small)} 640w, ${withBase(image.large)} 1200w`}
      sizes={sizes}
      width="1200"
      height="800"
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{ objectPosition: position }}
      className={`object-cover ${className}`}
    />
  );
}

// Each core service's own accent: icon badge and the underline of its link.
const SERVICE_ACCENTS = [
  ["bg-brand-600 text-white", "decoration-brand-300"],
  ["bg-gold-400 text-ink-900", "decoration-gold-400"],
  ["bg-coral-500 text-white", "decoration-coral-100"],
  ["bg-ink-900 text-white", "decoration-ink-300"],
];

/* ------------------------------------------------------------------------------------------------ */

/** Services: the only presentation of each offering. Photo cards for the core four, a photo panel for the rest. */
export function ServicesSection() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-28" id="services" aria-labelledby="services-title">
      <div className="shell">
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
          <Reveal>
            <Eyebrow>Our services</Eyebrow>
            <h2 id="services-title" className="heading-display text-[2rem] leading-[1.08] sm:text-[2.6rem] lg:text-[3.1rem]">
              Practical help, <em>exactly where you need it.</em>
            </h2>
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-4 lg:items-end lg:text-right">
            <p className="text-ink-500">Ten services. Use one, or combine several as your plans take shape.</p>
            <a className="link-arrow" href="/services">Full service details <ArrowUpRight /></a>
          </Reveal>
        </div>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_SERVICES.map((service, index) => {
            const [badge, underline] = SERVICE_ACCENTS[index % SERVICE_ACCENTS.length];
            return (
              <Reveal as="li" key={service.key} delay={index * 90} className="h-full">
                <a href={service.href} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-sand-200 bg-white shadow-card transition-[translate,box-shadow,border-color] duration-500 ease-(--ease-out-soft) hover:-translate-y-1.5 hover:border-transparent hover:shadow-lift">
                  <div className="relative overflow-hidden">
                    <Photo image={service.image} position={service.position} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw" className="aspect-[4/3] w-full transition-transform duration-[1.1s] ease-(--ease-out-soft) group-hover:scale-105" />
                    <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink-950/35 to-transparent" />
                    {service.tag && <span className="absolute top-4 right-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-card">{service.tag}</span>}
                  </div>
                  <div className="relative flex flex-1 flex-col px-6 pt-9 pb-6">
                    <span className={`absolute -top-6 left-6 grid size-12 place-items-center rounded-2xl shadow-lift ring-4 ring-white transition-transform duration-500 group-hover:-rotate-6 ${badge}`}><service.Icon className="size-5" /></span>
                    <h3 className="font-display text-lg font-semibold text-ink-900">{service.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-ink-500">{service.text}</p>
                    <span className={`mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 underline decoration-2 underline-offset-[6px] ${underline}`}>
                      {service.label} <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="mt-8">
          <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] border border-sand-200 bg-white shadow-card lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative isolate flex min-h-64 flex-col justify-end p-7 text-white sm:p-9 lg:min-h-full">
              <Photo image={CAREER_SERVICES_IMAGE} position={CAREER_SERVICES_IMAGE.position} sizes="(min-width: 1024px) 34vw, 100vw" className="absolute inset-0 -z-20 size-full" />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-brand-900/95 via-brand-900/75 to-brand-900/25" />
              <p className="text-xs font-semibold tracking-[0.18em] text-gold-400 uppercase">For students &amp; graduates</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">Career &amp; skill development</h3>
            </div>
            <ul className="grid grid-cols-1 gap-1 p-4 sm:grid-cols-2 sm:p-6 lg:p-8">
              {CAREER_SERVICES.map(({ Icon, title, text, href, label }) => (
                <li key={title}>
                  <a href={href} className="group flex h-full gap-4 rounded-2xl p-4 transition-colors duration-300 hover:bg-sand-50">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white"><Icon className="size-5" /></span>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-ink-900">{title}</h4>
                      <p className="mt-0.5 text-sm text-ink-500">{text}</p>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-brand-700 uppercase">{label} <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" /></span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------------ */

/** Why choose A3: sticky heading beside a numbered two-column list of differentiators. */
export function WhyChoose() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28" id="why-a3" aria-labelledby="why-title">
      <div className="shell relative grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <Eyebrow>Why choose A3</Eyebrow>
            <h2 id="why-title" className="heading-display text-[2rem] leading-[1.08] sm:text-[2.6rem] lg:text-[3.1rem]">
              What sets our guidance <em>apart.</em>
            </h2>
            <p className="mt-5 text-ink-500 sm:text-lg">
              Plenty of people can hand you a college list. These are the reasons families choose to plan with us.
            </p>
          </Reveal>
        </div>

        <ol className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {TRUST_REASONS.map(({ Icon, title, text }, index) => (
            <Reveal as="li" key={title} delay={(index % 2) * 90}>
              <div className="group h-full border-t border-sand-200 py-7 sm:pr-4">
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition-[background-color,color,rotate] duration-500 group-hover:-rotate-6 group-hover:bg-brand-600 group-hover:text-white"><Icon className="size-5" /></span>
                  <span className="font-display text-sm font-semibold text-ink-300 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink-900 sm:text-xl">{title}</h3>
                <p className="mt-2 text-ink-500">{text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------------ */

/** Founder: his message beside his portrait (credentials sit in the title line only). */
export function FounderMessage() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28" id="founder" aria-labelledby="founder-title">
      <div className="shell grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div className="order-2 lg:order-1">
          <Reveal>
            <Eyebrow>Meet our founder</Eyebrow>
            <h2 id="founder-title" className="heading-display text-[2rem] leading-[1.08] sm:text-[2.6rem] lg:text-[3.1rem]">Er. Ajay Kumar</h2>
            <p className="mt-2 font-medium text-ink-500">Founder &amp; Chairman · B.Tech, M.Tech</p>
          </Reveal>
          <Reveal delay={100}>
            <blockquote className="relative mt-8 pl-10 font-display text-xl leading-relaxed font-medium tracking-tight text-ink-900 sm:text-2xl">
              <span aria-hidden="true" className="absolute -top-4 left-0 font-display text-7xl leading-none text-gold-400">“</span>
              Our responsibility is not simply to show students a list of courses. It is to help them understand
              their choices, ask the right questions and move towards a future they can believe in.
            </blockquote>
            <a className="link-arrow mt-8" href="/about">Read the full message <ArrowUpRight /></a>
          </Reveal>
        </div>

        <Reveal variant="right" className="relative order-1 mx-auto w-full max-w-sm lg:order-2 lg:max-w-none">
          <div aria-hidden="true" className="absolute inset-0 -translate-x-4 translate-y-4 rounded-[2rem] bg-brand-100 sm:-translate-x-6 sm:translate-y-6" />
          <div className="relative overflow-hidden rounded-[2rem] shadow-lift">
            <img
              src={withBase("/about/about-Ajay Kumar-.jpeg")}
              width="900"
              height="1600"
              loading="lazy"
              decoding="async"
              alt="Er. Ajay Kumar, Founder and Chairman of A3 EduCare Hub"
              className="aspect-[4/5] w-full object-cover object-[50%_30%]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------------ */

const START_CHANNELS = [
  { Icon: Phone, label: "Call an advisor", detail: PHONE_DISPLAY, href: PHONE_HREF },
  { Icon: WhatsAppIcon, label: "Chat on WhatsApp", detail: "Message the team", href: whatsappChatUrl(), external: true },
  { Icon: Laptop, label: "Apply online", detail: "Admission form", href: "/apply-now" },
  { Icon: Mail, label: "Send an enquiry", detail: "Online form", href: "/contact" },
];

/**
 * Final call to action. id="contact" is the target of the site-wide "/#contact" links, and this is the only place
 * on the page with the contact channels. Brand-green panel: headline left, the four channels right.
 */
export function FinalCta() {
  return (
    <section className="shell pb-20 sm:pb-24" id="contact" aria-labelledby="contact-title">
      <Reveal variant="zoom" className="relative isolate overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-700 via-brand-800 to-ink-950 px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/3 -z-10 size-96 rounded-full bg-gold-400/15 blur-3xl" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <Eyebrow tone="dark">Admissions open 2026–27</Eyebrow>
            <h2 id="contact-title" className="font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.03em] text-white sm:text-[2.6rem] lg:text-5xl">
              Ready when <span className="text-gold-400">you are.</span>
            </h2>
            <p className="mt-5 max-w-lg text-brand-50/85 sm:text-lg">
              Choose the way that suits you to reach our team. An early start keeps more options open.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {START_CHANNELS.map(({ Icon, label, detail, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex h-full items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm transition-[background-color,border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-gold-400/50 hover:bg-white/[0.12]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-brand-700 transition-colors duration-300 group-hover:bg-gold-400 group-hover:text-ink-900"><Icon className="size-5" /></span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{label}</span>
                    <span className="block truncate text-sm text-brand-50/75">{detail}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
