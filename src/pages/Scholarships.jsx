import { useEffect, useState } from "react";
import { getScholarships } from "../services/wordpress";
import PlaceHero from "../components/state/PlaceHero";
import CtaBand from "../components/ui/CtaBand";
import FadeImage from "../components/ui/FadeImage";
import Reveal from "../components/ui/Reveal";
import SectionHeading from "../components/ui/SectionHeading";
import StatusMessage from "../components/ui/StatusMessage";
import { ArrowDown, ArrowUpRight } from "../components/ui/Icons";
import { getResponsiveImage } from "../lib/media";
import { getHeroImage } from "../lib/collegeImage";
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
  const heroImage = getHeroImage(items[0]?.acf?.featured_image, "Students studying together");

  return (
    <main>
      <PlaceHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Scholarships" }]}
        eyebrow="Funding your education"
        title="Scholarships"
        description="Scholarships can reduce the cost of your education, in India or abroad. Explore the main types of support available to students, who can apply and what you will need."
        image={heroImage}
        actions={(
          <>
            <a className="btn bg-accent text-ink-950 hover:-translate-y-0.5 hover:brightness-110" href="#scholarship-categories">Browse categories <ArrowDown /></a>
            <a className="btn btn-ghost-light" href="/contact">Talk to an advisor <ArrowUpRight /></a>
          </>
        )}
      />

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
