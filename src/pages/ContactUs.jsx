import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import Reveal from "../components/ui/Reveal";
import CtaBand from "../components/ui/CtaBand";
import FluentFormEmbed from "../components/contact/FluentFormEmbed";
import { ArrowDown, Award, Building, Clock, Graduation, Phone, Shield, Sparkle } from "../components/ui/Icons";
import { useSeo } from "../lib/seo";
import { PHONE_DISPLAY, PHONE_HREF } from "../lib/contact";

// Organisation details as supplied by A3 Educare Hub. Nothing here is inferred or added.
const ORGANIZATION = "Puja Social Empowerment Foundation";
const DIRECTOR = "Er. Ajay Kumar";
const QUALIFICATIONS = "B.Tech, M.Tech";

const contactCards = [
  { Icon: Phone, label: "Call Us", value: PHONE_DISPLAY, text: "Speak with our team for assistance with your educational queries.", action: { href: PHONE_HREF, label: "Call now" } },
  { Icon: Building, label: "Organization", value: ORGANIZATION, text: "An organization working in the education and social empowerment space." },
  { Icon: Clock, label: "Established", value: "Since 2014", text: "Committed to supporting educational aspirations and opportunities." },
  { Icon: Graduation, label: "Director", value: DIRECTOR, detail: QUALIFICATIONS, text: "Leadership and educational guidance." },
];

const credentials = [
  { Icon: Clock, title: "Working since 2014", text: "Supporting students and families with education guidance." },
  { Icon: Building, title: ORGANIZATION, text: "The organization operating A3 Educare Hub." },
  { Icon: Shield, title: "Section 8(1), Companies Act, 2013", text: "Registered under Section 8(1) of the Companies Act, 2013, as supplied by the organization." },
  { Icon: Building, title: "Ministry of Corporate Affairs", text: "Government of India." },
  { Icon: Sparkle, title: "NITI Aayog", text: "Government of India." },
  { Icon: Award, title: "ISO 9001:2015", text: "Quality management certification." },
  { Icon: Award, title: "MSME", text: "Government of India." },
  { Icon: Graduation, title: `Director: ${DIRECTOR}`, text: `Qualifications: ${QUALIFICATIONS}.` },
];

export default function ContactUs() {
  useSeo({
    title: "Contact Us",
    description: "Talk to A3 Educare Hub about admissions, courses and career guidance. Call +91 89698 86176 or send us your question.",
  });

  return (
    <main>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
        eyebrow="Get in touch"
        title={<>Let&apos;s Plan Your Educational Journey <em>Together</em></>}
        description="Have questions about admissions, educational opportunities, or career guidance? Connect with our team for personalized assistance and guidance to help you take the next step toward your future."
      >
        <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
          <a className="btn btn-primary px-7 py-3.5" href="#enquiry">Get Free Consultation <ArrowDown /></a>
          <a className="btn btn-outline px-7 py-3.5" href={PHONE_HREF}><Phone className="size-4" /> Call Us Now</a>
        </div>
      </PageHero>

      {/* Contact information */}
      <section className="shell section-y" aria-label="Contact information">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map(({ Icon, label, value, detail, text, action }, index) => (
            <Reveal as="li" key={label} delay={index * 70} className="h-full">
              <div className="group card-interactive flex h-full flex-col p-6 sm:p-7">
                <span aria-hidden="true" className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <p className="eyebrow mt-6 mb-2">{label}</p>
                <p className="text-lg font-semibold break-words text-ink-900">
                  {action ? <a className="hover:text-brand-700" href={action.href}>{value}</a> : value}
                </p>
                {detail && <p className="mt-0.5 text-sm font-medium text-ink-500">{detail}</p>}
                <p className="mt-3 text-sm text-ink-500">{text}</p>
                {action && (
                  <a className="btn btn-dark mt-auto self-start px-5 py-2.5" href={action.href}>
                    <Phone className="size-4" /> {action.label}
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Enquiry form (Fluent Forms, rendered by WordPress) */}
      <section id="enquiry" className="section-y bg-white">
        <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow mb-3">Send an enquiry</p>
            <h2 className="heading-display text-3xl leading-[1.1] sm:text-4xl">Have a Question? <em>We&apos;re Here to Help.</em></h2>
            <p className="mt-4 text-ink-500">Share your query with us, and our team will help you with the next steps.</p>
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-5">
              <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white"><Phone className="size-5" /></span>
              <div>
                <p className="text-sm text-ink-500">Prefer to talk?</p>
                <a className="text-lg font-semibold text-ink-900 hover:text-brand-700" href={PHONE_HREF}>{PHONE_DISPLAY}</a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100} className="card p-6 sm:p-8">
            <FluentFormEmbed
              fallback={(
                <div className="flex flex-col items-start gap-4">
                  <p className="text-lg font-semibold text-ink-900">Our online enquiry form will be available here shortly.</p>
                  <p className="text-ink-500">In the meantime, our team is happy to help by phone.</p>
                  <a className="btn btn-primary" href={PHONE_HREF}><Phone className="size-4" /> Call {PHONE_DISPLAY}</a>
                </div>
              )}
            />
          </Reveal>
        </div>
      </section>

      {/* Credentials, as supplied by the organization */}
      <section className="shell section-y">
        <SectionHeading
          eyebrow="About the organization"
          title={<>An Organization Built on <em>Experience and Commitment</em></>}
        />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {credentials.map(({ Icon, title, text }, index) => (
            <Reveal as="li" key={title} delay={(index % 4) * 60} className="h-full">
              <div className="flex h-full items-start gap-4 rounded-2xl border border-sand-200 bg-white p-5">
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span>
                <div className="min-w-0">
                  <p className="font-semibold break-words text-ink-900">{title}</p>
                  <p className="mt-1 text-sm text-ink-500">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-xs text-ink-500">
          Registration and certification details are as provided by the organization. They describe the organization&apos;s legal status and quality management, and are not a government endorsement of its educational guidance services.
        </p>
      </section>

      <CtaBand
        eyebrow="We're here to help"
        title={<>Need Help Choosing <em>Your Next Step?</em></>}
        description="Connect with our team to discuss your educational questions and explore the options available to you."
        actionLabel={`Call Us: ${PHONE_DISPLAY}`}
        actionHref={PHONE_HREF}
      />
    </main>
  );
}
