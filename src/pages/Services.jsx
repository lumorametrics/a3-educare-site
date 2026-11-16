import Reveal from "../components/ui/Reveal";
import Breadcrumb from "../components/ui/Breadcrumb";
import { withBase } from "../lib/basePath";
import SectionHeading from "../components/ui/SectionHeading";
import FaqAccordion from "../components/ui/FaqAccordion";
import CtaBand from "../components/ui/CtaBand";
import { SERVICES as services } from "../components/common/servicesContent";
import { ArrowDown, ArrowUpRight, Check } from "../components/ui/Icons";

const faqs = [
  ["Who is this service for?", "Students, parents and working learners who want clear, practical guidance before choosing a course, college or study destination."],
  ["Can I speak to an advisor before deciding?", "Yes. Start with a conversation about your goals and questions. We will help you understand the right next step without pressure."],
  ["Do you guarantee admission or a visa?", "No. We provide research-led guidance and preparation support. Final admission and visa decisions are always made by the institution or relevant authority."],
];

const steps = [
  ["01", "Tell us your goals", "Share what you are considering, what matters to you and where you feel stuck."],
  ["02", "Explore your options", "We help you understand the routes, compare possibilities and identify the best fit."],
  ["03", "Move with confidence", "Leave with a practical action plan, useful resources and a clearer sense of direction."],
];


/** Photos for the four services, in the same order as SERVICES. Page-specific; the files are shared read-only from /public. */
const photoSet = (base, widths, alt) => ({ src: withBase(`${base}-${widths[widths.length - 1]}.webp`), srcSet: widths.map((w) => `${withBase(`${base}-${w}.webp`)} ${w}w`).join(", "), alt });
const SERVICE_PHOTOS = [
  photoSet("/home/service-counselling", [640, 1200], "An advisor and a student talking through course options at a laptop"),
  photoSet("/hero/general", [1024, 1408], "Students walking along a tree-lined college campus"),
  photoSet("/services/study-abroad", [640, 1200], "An aeroplane wing above the clouds at sunset"),
  photoSet("/home/service-admission", [640, 1200], "Students working together on laptops and documents"),
];

export default function Services() {
  return (
    <main>
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] overflow-hidden bg-ink-950 md:min-h-[calc(100svh-5rem)]">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-linear-to-br from-ink-900 via-ink-800 to-brand-800" />
        <picture aria-hidden="true" className="absolute inset-0 -z-10 block">
          <source media="(max-width: 767px)" srcSet={withBase("/hero/counselling-mobile.webp")} />
          <img
            src={withBase("/hero/counselling-1408.webp")}
            srcSet={`${withBase("/hero/counselling-1024.webp")} 1024w, ${withBase("/hero/counselling-1408.webp")} 1408w`}
            sizes="100vw"
            alt=""
            width="1408"
            height="768"
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover object-[62%_center]"
          />
        </picture>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-ink-950/90 via-ink-950/60 to-ink-950/15 max-md:from-ink-950/30 max-md:via-ink-950/15 max-md:to-transparent" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950/95 via-ink-950/40 to-ink-950/45 max-md:from-ink-950 max-md:from-35% max-md:via-ink-950/75 max-md:via-60% max-md:to-ink-950/45" />

        <div className="shell relative flex w-full flex-col pt-6 pb-8 sm:pt-8 sm:pb-14">
          <div className="motion-safe:animate-page-in max-sm:[&_nav]:mb-3"><Breadcrumb tone="dark" items={[{ label: "Home", href: "/" }, { label: "Services" }]} /></div>
          <div className="mt-auto grid grid-cols-1 items-end gap-6 pt-8 sm:gap-10 sm:pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <div className="motion-safe:animate-fade-up">
              <p className="mb-4 flex items-center gap-3 text-sm font-semibold tracking-wide text-accent">
                <span aria-hidden="true" className="h-0.5 w-8 shrink-0 rounded-full bg-accent" />
                Guidance for your next chapter
              </p>
              <h1 className="heading-display text-[2.15rem] leading-[1.05] text-white! min-[400px]:text-[2.5rem] sm:text-5xl lg:text-6xl [&_em]:text-accent! [text-shadow:0_2px_24px_rgb(0_0_0/0.35)]">Better decisions begin with <em>the right guidance.</em></h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-100 sm:mt-6 sm:text-lg">From choosing your first course to planning a study-abroad journey, A3 EduCare Hub helps you move forward with clarity, context and confidence.</p>
              <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-9 sm:gap-3">
                <a className="btn btn-primary px-6 py-3 sm:px-7 sm:py-3.5" href="/#contact">Talk to an advisor <ArrowUpRight /></a>
                <a className="btn border border-white/40 bg-white/10 px-6 py-3 sm:px-7 sm:py-3.5 text-white backdrop-blur-md hover:bg-white/20" href="#our-services">Explore our services <ArrowDown /></a>
              </div>
            </div>
            <div className="relative motion-safe:animate-fade-up [animation-delay:160ms]">
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-lift backdrop-blur-xl sm:p-8 max-sm:p-5">
                <div aria-hidden="true" className="absolute -top-16 -right-16 size-56 rounded-full bg-brand-500/30 blur-3xl" />
                <div aria-hidden="true" className="absolute -bottom-20 -left-10 size-52 rounded-full bg-gold-400/20 blur-3xl" />
                <p className="relative text-sm font-semibold tracking-wide text-gold-400">Your next step</p>
                <p className="relative mt-2 font-display text-2xl leading-tight text-white sm:mt-3 sm:text-4xl">Clarity over <em className="text-gold-400">confusion.</em></p>
                <p className="relative mt-3 text-ink-200">A calm, structured way to make important education decisions.</p>
                <div className="relative mt-5 flex flex-wrap items-center gap-2 text-sm font-medium text-white sm:mt-7 sm:gap-3">
                  {["Explore", "Compare", "Decide"].map((word, index) => (
                    <span key={word} className="flex items-center gap-3">
                      <span className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 sm:px-4 sm:py-2">{word}</span>
                      {index < 2 && <span className="h-px w-4 bg-white/40 max-sm:hidden sm:w-6" />}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute -top-5 -right-1 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-lift motion-safe:animate-float sm:-right-5 sm:p-4 sm:pr-6">
                <strong className="font-display text-3xl text-brand-600">01</strong>
                <span className="text-sm leading-tight text-ink-600">conversation<br />at a time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y relative overflow-hidden bg-white">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-brand-100/60 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -bottom-24 size-72 rounded-full bg-gold-100/70 blur-3xl" />
        <div className="shell relative grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <Reveal variant="left">
            <p className="eyebrow mb-3">Why A3 EduCare Hub</p>
            <h2 className="heading-display text-3xl leading-tight sm:text-4xl lg:text-5xl">Advice that feels <em>personal, not generic.</em></h2>
          </Reveal>
          <Reveal variant="right" delay={100}><p className="border-l-2 border-accent pl-6 text-lg text-ink-500 lg:mt-10">Every student starts from a different place. We bring together accessible research, honest conversations and useful comparisons so you can make a choice that fits your ambitions, budget and life.</p></Reveal>
        </div>
      </section>

      <section className="shell section-y" id="our-services">
        <SectionHeading eyebrow="What we help with" title={<>Support for every <em>important decision.</em></>} description="Choose the support you need today. Your plan can grow as your goals become clearer." />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            const photo = SERVICE_PHOTOS[index];
            return (
              <Reveal key={service.number} delay={(index % 2) * 90} className="h-full">
                <article className="group card-interactive flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[3/2] overflow-hidden bg-sand-100">
                    <img
                      src={photo.src}
                      srcSet={photo.srcSet}
                      sizes="(min-width: 768px) 560px, 100vw"
                      alt={photo.alt}
                      width="1200"
                      height="800"
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-700 ease-(--ease-out-soft) group-hover:scale-105"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink-950/55 via-ink-950/5 to-transparent" />
                    <span className="absolute top-4 right-4 rounded-full border border-white/30 bg-ink-950/55 px-3.5 py-1 font-display text-xl text-white backdrop-blur-md transition-transform duration-500 group-hover:-translate-y-0.5">{service.number}</span>
                  </div>
                  <div className="flex flex-1 flex-col px-7 pb-7 sm:px-9 sm:pb-9">
                    <span className={`relative z-10 -mt-7 grid size-14 place-items-center rounded-2xl shadow-card ring-4 ring-white transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 ${service.tone}`}><Icon className="size-6" /></span>
                    <h3 className="mt-5 font-display text-2xl font-semibold">{service.title}</h3>
                    <p className="mt-3 text-ink-500">{service.text}</p>
                    <ul className="mt-6 flex flex-col gap-2.5 border-t border-sand-100 pt-6">
                      {service.points.map((point) => <li className="flex items-center gap-2.5 text-sm text-ink-700" key={point}><span className="grid size-5 place-items-center rounded-full bg-brand-50 text-brand-700"><Check className="size-3" strokeWidth={2.5} /></span>{point}</li>)}
                    </ul>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-ink-400">Study abroad photo: U.S. Department of Agriculture, public domain, via Wikimedia Commons.</p>
      </section>

      <section className="section-y relative overflow-hidden bg-ink-900">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-0 size-[30rem] rounded-full bg-brand-600/25 blur-3xl" />
        <div className="shell relative">
          <SectionHeading tone="dark" align="center" eyebrow="A simple way forward" title={<>From question to <em>next step.</em></>} description="No jargon. No overwhelming lists. Just a clear process built around you." />
          <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map(([number, title, text], index) => (
              <Reveal as="li" key={number} delay={index * 120}>
                <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-7 transition-[background-color,border-color,translate] duration-400 ease-(--ease-out-soft) hover:-translate-y-1 hover:border-gold-400/40 hover:bg-white/10">
                  <span className="grid size-12 place-items-center rounded-full bg-gold-400 font-display font-semibold text-ink-900 transition-transform duration-500 ease-(--ease-out-soft) group-hover:scale-110">{number}</span>
                  <h3 className="mt-6 font-display text-2xl text-white">{title}</h3>
                  <p className="mt-3 text-ink-300">{text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="shell section-y grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal variant="left" className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-100 via-sand-50 to-gold-100 shadow-lift">
          <img
            src={withBase("/home/journey-selection-1200.webp")}
            srcSet={`${withBase("/home/journey-selection-640.webp")} 640w, ${withBase("/home/journey-selection-1200.webp")} 1200w`}
            sizes="(min-width: 1024px) 560px, 100vw"
            alt="A group of students sitting together outside their college"
            width="1200"
            height="800"
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-700 ease-(--ease-out-soft) group-hover:scale-105"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink-950/45 via-transparent to-transparent" />
          <span className="absolute bottom-6 left-6 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-900 shadow-card">Your journey, your pace</span>
        </Reveal>
        <Reveal variant="right" delay={100}>
          <p className="eyebrow mb-3">Designed around real decisions</p>
          <h2 className="heading-display text-3xl leading-tight sm:text-4xl">For students. For parents. <em>For what comes next.</em></h2>
          <p className="mt-5 text-ink-500">Whether you are exploring your first degree, changing direction or preparing to study abroad, our guidance is designed to make the process feel more manageable.</p>
          <div className="mt-8 flex flex-col divide-y divide-sand-200 border-y border-sand-200">
            {[["Explore courses", "/courses"], ["Explore study abroad", "/study-abroad"], ["Find colleges", "/colleges"]].map(([label, href]) => (
              <a className="group flex items-center justify-between py-4 font-semibold text-ink-900 transition-colors hover:text-brand-700" href={href} key={href}>
                {label}<ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section-y bg-white">
        <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">Questions, answered</p>
            <h2 className="heading-display text-3xl sm:text-4xl">Good guidance starts with <em>good questions.</em></h2>
            <p className="mt-4 text-ink-500">Still deciding? Begin with a conversation and we will help you find the right place to start.</p>
            <a className="btn btn-dark mt-6" href="/#contact">Start a conversation <ArrowUpRight /></a>
          </div>
          <Reveal variant="right" delay={100}><FaqAccordion items={faqs.map(([question, answer]) => ({ question, answer }))} defaultOpen={0} /></Reveal>
        </div>
      </section>

      <div className="pt-20 sm:pt-24">
        <CtaBand eyebrow="Your next chapter is worth planning well" title={<>Let&apos;s make your next step <em>feel clearer.</em></>} actionLabel="Get started" />
      </div>
    </main>
  );
}
