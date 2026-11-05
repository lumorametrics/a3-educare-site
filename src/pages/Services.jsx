import Reveal from "../components/ui/Reveal";
import SectionHeading from "../components/ui/SectionHeading";
import FaqAccordion from "../components/ui/FaqAccordion";
import CtaBand from "../components/ui/CtaBand";
import { ArrowDown, ArrowUpRight, Building, Check, Globe, Graduation, Shield } from "../components/ui/Icons";

const services = [
  {
    number: "01",
    title: "Course & career guidance",
    text: "Turn your interests and strengths into a practical shortlist of courses, specialisations and career directions.",
    points: ["Interest-led course matching", "Career pathway conversations", "Clear next-step recommendations"],
    icon: Graduation,
    tone: "bg-brand-50 text-brand-700",
  },
  {
    number: "02",
    title: "College shortlisting",
    text: "Compare colleges with the details that matter: eligibility, fees, location, facilities, reputation and outcomes.",
    points: ["Personalised college shortlist", "Course and fee comparison", "Admission timeline planning"],
    icon: Building,
    tone: "bg-gold-100 text-ink-800",
  },
  {
    number: "03",
    title: "Study abroad guidance",
    text: "Plan your international education journey with destination research, university selection and application support.",
    points: ["Country and university research", "Application document checklist", "Visa preparation guidance"],
    icon: Globe,
    tone: "bg-ink-50 text-ink-700",
  },
  {
    number: "04",
    title: "Application readiness",
    text: "Move from research to action with a structured plan that keeps deadlines, documents and decisions organised.",
    points: ["Profile and document review", "Deadline tracking", "Confident application planning"],
    icon: Shield,
    tone: "bg-coral-50 text-coral-600",
  },
];

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

export default function Services() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-brand-100),transparent_55%),radial-gradient(ellipse_at_bottom_left,var(--color-gold-100),transparent_50%)]" />
        <div className="shell relative grid grid-cols-1 items-center gap-14 pt-10 pb-16 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
          <div className="motion-safe:animate-fade-up">
            <p className="eyebrow mb-5">Guidance for your next chapter</p>
            <h1 className="heading-display text-[2.75rem] leading-[1.03] sm:text-6xl lg:text-7xl">Better decisions begin with <em>the right guidance.</em></h1>
            <p className="mt-6 max-w-xl text-lg text-ink-500">From choosing your first course to planning a study-abroad journey, A3 EduCare Hub helps you move forward with clarity, context and confidence.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a className="btn btn-primary px-7 py-3.5" href="/#contact">Talk to an advisor <ArrowUpRight /></a>
              <a className="btn btn-outline px-7 py-3.5" href="#our-services">Explore our services <ArrowDown /></a>
            </div>
          </div>
          <div className="relative motion-safe:animate-fade-up [animation-delay:150ms]">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-ink-900 p-8 shadow-lift sm:p-10">
              <div aria-hidden="true" className="absolute -top-20 -right-20 size-72 rounded-full bg-brand-500/40 blur-3xl" />
              <div aria-hidden="true" className="absolute -bottom-24 -left-10 size-64 rounded-full bg-gold-400/20 blur-3xl" />
              <p className="eyebrow relative text-gold-400">Your next step</p>
              <p className="relative mt-4 font-display text-4xl leading-tight text-white sm:text-5xl">Clarity over <em className="text-gold-400">confusion.</em></p>
              <p className="relative mt-4 text-ink-300">A calm, structured way to make important education decisions.</p>
              <div className="relative mt-10 flex flex-wrap items-center gap-3 text-sm font-medium text-white">
                {["Explore", "Compare", "Decide"].map((word, index) => (
                  <span key={word} className="flex items-center gap-3">
                    <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">{word}</span>
                    {index < 2 && <span className="h-px w-4 bg-white/30 sm:w-6" />}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-white p-4 pr-6 shadow-lift motion-safe:animate-float sm:-left-8">
              <strong className="font-display text-3xl text-brand-600">01</strong>
              <span className="text-sm leading-tight text-ink-600">conversation<br />at a time</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y bg-white">
        <div className="shell grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <Reveal variant="left">
            <p className="eyebrow mb-3">Why A3 EduCare Hub</p>
            <h2 className="heading-display text-3xl leading-tight sm:text-4xl lg:text-5xl">Advice that feels <em>personal, not generic.</em></h2>
          </Reveal>
          <Reveal variant="right" delay={100}><p className="text-lg text-ink-500 lg:pt-10">Every student starts from a different place. We bring together accessible research, honest conversations and useful comparisons so you can make a choice that fits your ambitions, budget and life.</p></Reveal>
        </div>
      </section>

      <section className="shell section-y" id="our-services">
        <SectionHeading eyebrow="What we help with" title={<>Support for every <em>important decision.</em></>} description="Choose the support you need today. Your plan can grow as your goals become clearer." />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.number} delay={(index % 2) * 90} className="h-full">
                <article className="group card-interactive flex h-full flex-col p-7 sm:p-9">
                  <div className="flex items-center justify-between">
                    <span className={`grid size-14 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 ${service.tone}`}><Icon className="size-6" /></span>
                    <span className="font-display text-4xl text-sand-200 transition-colors duration-300 group-hover:text-brand-200">{service.number}</span>
                  </div>
                  <h3 className="mt-7 font-display text-2xl font-semibold">{service.title}</h3>
                  <p className="mt-3 text-ink-500">{service.text}</p>
                  <ul className="mt-6 flex flex-col gap-2.5 border-t border-sand-100 pt-6">
                    {service.points.map((point) => <li className="flex items-center gap-2.5 text-sm text-ink-700" key={point}><span className="grid size-5 place-items-center rounded-full bg-brand-50 text-brand-700"><Check className="size-3" strokeWidth={2.5} /></span>{point}</li>)}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
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
        <Reveal variant="left" className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-100 via-sand-50 to-gold-100">
          <div aria-hidden="true" className="absolute top-10 left-10 size-40 rounded-full bg-brand-300/60 blur-2xl" />
          <div aria-hidden="true" className="absolute right-10 bottom-10 size-48 rounded-full bg-gold-300/70 blur-2xl" />
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
