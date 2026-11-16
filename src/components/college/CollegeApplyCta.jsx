import Reveal from "../ui/Reveal";
import CollegeImage from "./CollegeImage";
import { ArrowUpRight, Check, Graduation, MapPin, Phone } from "../ui/Icons";
import { openApplyForm } from "../../lib/applyForm";
import { PHONE_DISPLAY, PHONE_HREF } from "../../lib/contact";
import { getApplyFormPage } from "../../services/wordpress";

// What A3's admission support covers. Describes the service, not the college, so it is the same on every page.
const SUPPORT = ["Free one-to-one counselling", "Document and eligibility check", "Help through every counselling round"];

const prefetchForm = () => { getApplyFormPage().catch(() => {}); };

/**
 * Closing call to action on every college page. All college details come from the page's WordPress data:
 * `heading` / `description` are the ACF cta_heading / cta_description (with the existing fallbacks), and the
 * summary panel shows the college's own photo, name, location and admission test when published.
 * "Apply Now" opens the site's single Apply Now popup (Fluent Form id 3) rendered by the Header.
 */
export default function CollegeApplyCta({ title, heading, description, image, location, admissionTest }) {
  return (
    <section className="shell pb-20 sm:pb-24" aria-labelledby="college-cta-title">
      <Reveal variant="zoom" className="group/cta relative isolate overflow-hidden rounded-[2rem] bg-ink-950 text-white shadow-[0_30px_70px_-35px_rgb(9_24_41/0.7)]">
        {/* Background: brand glow, warm glow and a faint grid, so the panel has depth without a photo. */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 -z-10 size-[26rem] rounded-full bg-brand-600/35 blur-3xl transition-transform duration-1000 ease-(--ease-out-soft) group-hover/cta:-translate-x-8" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 -z-10 size-80 rounded-full bg-gold-400/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_left,black,transparent_70%)] bg-size-[44px_44px]" />

        <div className="grid grid-cols-1 gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-14 lg:p-14">
          {/* Message */}
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.16em] text-gold-400 uppercase">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-400" />Admissions guidance
            </p>
            <h2 id="college-cta-title" className="mt-5 font-display text-[1.75rem] leading-[1.1] font-bold tracking-[-0.03em] [overflow-wrap:anywhere] text-balance text-white min-[400px]:text-[1.9rem] sm:text-4xl lg:text-[2.75rem]">
              {heading}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed [overflow-wrap:anywhere] text-ink-200 sm:text-lg">{description}</p>
            <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-1 xl:grid-cols-3">
              {SUPPORT.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm [overflow-wrap:anywhere] text-white/85">
                  <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500/25 text-brand-300"><Check className="size-3" strokeWidth={2.6} /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Summary panel with the action */}
          <div className="relative min-w-0 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition-[border-color,background-color] duration-500 group-hover/cta:border-white/20 sm:p-5">
            <div className="flex items-center gap-3 min-[400px]:gap-4">
              <div className="size-16 shrink-0 overflow-hidden min-[400px]:size-20 rounded-2xl ring-1 ring-white/15 sm:size-24">
                <CollegeImage image={image} alt={`${title} campus`} ratio={1} sizes="96px" zoom className="size-full" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.14em] text-ink-300 uppercase">Your application to</p>
                <p className="mt-1 line-clamp-3 font-display text-base leading-snug font-semibold [overflow-wrap:anywhere] text-white min-[400px]:line-clamp-2 min-[400px]:text-lg">{title}</p>
                {location && <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-200"><MapPin className="mt-0.5 size-3.5 shrink-0 text-gold-400" /><span className="line-clamp-2 min-w-0 [overflow-wrap:anywhere]">{location}</span></p>}
              </div>
            </div>

            {admissionTest && (
              <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-white/10 bg-ink-950/40 px-3.5 py-3 text-sm text-white/85">
                <Graduation className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <span className="min-w-0 [overflow-wrap:anywhere]"><span className="text-ink-300">Admission through </span><span className="font-semibold text-white">{admissionTest}</span></span>
              </p>
            )}

            <button
              type="button"
              aria-haspopup="dialog"
              onClick={openApplyForm}
              onPointerEnter={prefetchForm}
              onFocus={prefetchForm}
              className="btn btn-gold mt-5 w-full py-3.5 text-base shadow-[0_14px_30px_-14px_var(--color-gold-500)]"
            >
              Apply Now <ArrowUpRight />
            </button>
            <a href={PHONE_HREF} className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full py-2 text-center text-sm text-ink-200 transition-colors hover:text-white">
              <Phone className="size-4" /> Prefer to talk? <span className="font-semibold text-white tabular-nums">{PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
