import { useEffect, useState } from "react";
import { getScholarships } from "../services/wordpress";
import Breadcrumb from "../components/ui/Breadcrumb";
import CtaBand from "../components/ui/CtaBand";
import FadeImage from "../components/ui/FadeImage";
import Reveal from "../components/ui/Reveal";
import SectionHeading from "../components/ui/SectionHeading";
import StatusMessage from "../components/ui/StatusMessage";
import { ArrowDown, ArrowUpRight } from "../components/ui/Icons";
import { getResponsiveImage } from "../lib/media";
import { toPlainText } from "../lib/text";

const CARD_SIZES = "(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw";

function ScholarshipCard({ item }) {
  const fields = item.acf || {};
  const title = toPlainText(item.title?.rendered);
  const heading = toPlainText(fields.category_heading) || title;
  const image = getResponsiveImage(fields.category_image, heading);
  return (
    <a className="group card-interactive flex h-full flex-col overflow-hidden" href={`/scholarships/${item.slug}`}>
      {image
        ? <FadeImage src={image.src} srcSet={image.srcSet} sizes={CARD_SIZES} alt={image.alt} loading="lazy" zoom={false} imgClassName="group-hover:scale-[1.04]" className="aspect-[3/2] w-full" />
        : <span aria-hidden="true" className="block aspect-[3/2] w-full bg-linear-to-br from-brand-50 to-sand-100" />}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold text-ink-900 transition-colors group-hover:text-brand-700">{heading}</h3>
        {fields.category_intro && <p className="mt-3 text-sm leading-relaxed text-ink-500">{toPlainText(fields.category_intro)}</p>}
        <span className="link-arrow mt-auto self-start pt-5">View details <ArrowUpRight /></span>
      </div>
    </a>
  );
}

export default function Scholarships() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getScholarships()
      .then((data) => {
        if (!active) return;
        setItems(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        console.error("Unable to load scholarships:", error);
        setStatus("error");
      });
    return () => { active = false; };
  }, [attempt]);

  // The hero photo comes from WordPress too: the first category's banner image.
  const heroImage = getResponsiveImage(items[0]?.acf?.featured_image);

  return (
    <main>
      <section className="relative isolate overflow-hidden bg-ink-950 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-brand-600/30 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-gold-400/15 blur-3xl" />
        <div className="shell relative grid grid-cols-1 items-center gap-12 pt-8 pb-16 sm:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-14 lg:pb-24">
          <div className="min-w-0">
            <div className="motion-safe:animate-page-in"><Breadcrumb tone="dark" items={[{ label: "Home", href: "/" }, { label: "Scholarships" }]} /></div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur-sm motion-safe:animate-fade-up">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-400" />
              Funding your education
            </p>
            <h1 className="mt-5 text-[2.4rem] leading-[1.05] font-bold tracking-[-0.03em] text-white motion-safe:animate-fade-up motion-safe:[animation-delay:90ms] min-[375px]:text-[2.75rem] sm:text-6xl lg:text-[4.25rem]">
              <span className="text-brand-300">Scholarships</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 motion-safe:animate-fade-up motion-safe:[animation-delay:180ms] sm:text-lg">
              Scholarships can reduce the cost of your education, in India or abroad. Explore the main types of support available to students, who can apply and what you will need.
            </p>
            <div className="mt-9 flex flex-col gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:270ms] min-[420px]:flex-row min-[420px]:flex-wrap">
              <a className="btn btn-primary px-7 py-3.5" href="#scholarship-categories">Browse categories <ArrowDown /></a>
              <a className="btn btn-ghost-light px-7 py-3.5" href="/contact">Talk to an advisor <ArrowUpRight /></a>
            </div>
          </div>

          {status !== "error" && (status === "loading" || heroImage) && (
            <figure className="relative mx-auto w-full max-w-md motion-safe:animate-fade-up motion-safe:[animation-delay:150ms] sm:max-w-lg lg:max-w-none">
              <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border border-gold-400/40 sm:translate-x-5 sm:translate-y-5" />
              {heroImage
                ? <FadeImage src={heroImage.src} srcSet={heroImage.srcSet} sizes="(min-width: 1024px) 40vw, (min-width: 640px) 32rem, 100vw" alt={heroImage.alt || "Students studying together"} fetchPriority="high" zoom={false} className="relative aspect-[4/3] w-full rounded-[2rem] shadow-lift ring-1 ring-white/10" />
                : <div aria-hidden="true" className="relative aspect-[4/3] w-full animate-pulse rounded-[2rem] bg-white/10" />}
            </figure>
          )}
        </div>
      </section>

      <section id="scholarship-categories" className="shell section-y scroll-mt-20">
        <SectionHeading
          eyebrow="Scholarship categories"
          title={<>Find the Right <em>Support</em></>}
          description="Each category explains who can apply, the main benefits, how to apply and the documents you will need."
        />
        {status === "loading" && (
          <ul aria-busy="true" aria-label="Loading scholarship categories" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <li key={key} className="card overflow-hidden">
                <div className="aspect-[3/2] animate-pulse bg-sand-100" />
                <div className="space-y-3 p-6">
                  <div className="h-6 w-4/5 animate-pulse rounded bg-sand-100" />
                  <div className="h-16 animate-pulse rounded bg-sand-100" />
                </div>
              </li>
            ))}
          </ul>
        )}
        {status === "error" && (
          <StatusMessage tone="error" title="Scholarships could not be loaded" action={<button type="button" className="btn btn-dark mt-2" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}>Try again</button>}>
            Please check your connection and try again.
          </StatusMessage>
        )}
        {status === "ready" && items.length === 0 && (
          <StatusMessage title="No scholarships published yet">Please check back soon, or talk to an advisor about your options.</StatusMessage>
        )}
        {status === "ready" && items.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <Reveal as="li" key={item.id} delay={(index % 3) * 70} className="h-full">
                <ScholarshipCard item={item} />
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      <CtaBand
        eyebrow="Need guidance?"
        title={<>Not sure which scholarship <em>fits you?</em></>}
        description="Talk to an A3 EduCare Hub advisor about your course plans and the options worth exploring."
        actionHref="/contact"
      />
    </main>
  );
}
