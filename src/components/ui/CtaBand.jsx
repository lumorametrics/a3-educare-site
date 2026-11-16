import Reveal from "./Reveal";
import { ArrowUpRight } from "./Icons";

/** Dark conversion band used at the end of pages. `title` may include <em>. */
export default function CtaBand({ eyebrow, title, description, actionLabel = "Talk to an advisor", actionHref = "/#contact", secondary, id }) {
  return (
    <section className="shell pb-20 sm:pb-24" id={id}>
      <Reveal variant="zoom" className="group/cta relative overflow-hidden rounded-[2rem] bg-ink-900 px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-brand-600/30 blur-3xl transition-transform duration-1000 ease-(--ease-out-soft) group-hover/cta:-translate-x-10 group-hover/cta:translate-y-6" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-10 size-72 rounded-full bg-gold-400/15 blur-3xl transition-transform duration-1000 ease-(--ease-out-soft) group-hover/cta:translate-x-10" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <Reveal delay={150} className="min-w-0 max-w-2xl lg:flex-1">
            {eyebrow && <p className="eyebrow mb-4 text-gold-400">{eyebrow}</p>}
            <h2 className="heading-display text-3xl leading-[1.1] [overflow-wrap:anywhere] text-white sm:text-4xl lg:text-5xl [&_em]:text-gold-400">{title}</h2>
            {description && <p className="mt-4 max-w-xl [overflow-wrap:anywhere] text-ink-200">{description}</p>}
          </Reveal>
          <Reveal delay={260} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap lg:shrink-0 lg:justify-end [&>*]:w-full [&>*]:justify-center sm:[&>*]:w-auto">
            <a className="btn btn-gold" href={actionHref}>{actionLabel} <ArrowUpRight /></a>
            {secondary}
          </Reveal>
        </div>
      </Reveal>
    </section>
  );
}
