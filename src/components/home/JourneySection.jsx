import { useRef, useState, useSyncExternalStore } from "react";
import Reveal from "../ui/Reveal";
import { ArrowUpRight, Check } from "../ui/Icons";
import { withBase } from "../../lib/basePath";
import { JOURNEY_STAGES } from "./homeContent";

// Each stage's own accent: [number/icon badge, eyebrow text colour].
const ACCENTS = {
  brand: ["bg-brand-500 text-white", "text-brand-300"],
  gold: ["bg-gold-400 text-ink-900", "text-gold-400"],
  coral: ["bg-coral-500 text-white", "text-coral-100"],
  sky: ["bg-white text-ink-900", "text-ink-100"],
  mint: ["bg-brand-200 text-ink-900", "text-brand-200"],
};

const stepLabel = (index) => `Stage ${String(index + 1).padStart(2, "0")}`;

// Only one layout is rendered at a time, so each stage photo exists once on the page.
const DESKTOP_QUERY = "(min-width: 1024px)";
const subscribe = (onChange) => {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const useIsDesktop = () => useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP_QUERY).matches, () => true);

function StageImage({ stage, className = "", sizes }) {
  return (
    <img
      src={withBase(stage.image.large)}
      srcSet={`${withBase(stage.image.small)} 640w, ${withBase(stage.image.large)} 1200w`}
      sizes={sizes}
      width="1200"
      height="800"
      alt=""
      loading="lazy"
      decoding="async"
      style={{ objectPosition: stage.position }}
      className={`object-cover ${className}`}
    />
  );
}

function Outcome({ text }) {
  return (
    <p className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-white/90 backdrop-blur-sm">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold-400 text-ink-900"><Check className="size-3.5" strokeWidth={2.6} /></span>
      <span><span className="block text-xs font-semibold tracking-[0.14em] text-gold-400 uppercase">What you leave with</span>{text}</span>
    </p>
  );
}

/**
 * What we do: A3's working approach, stage by stage, on a dark stage (distinct from the white About section).
 * - Desktop: a numbered vertical stepper (ARIA tabs) beside a large photo panel that cross-fades per stage.
 * - Phones/tablets: every stage stacked on a vertical timeline with its own photo, so nothing is hidden.
 */
export default function JourneySection() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);
  const isDesktop = useIsDesktop();
  const count = JOURNEY_STAGES.length;
  const current = JOURNEY_STAGES[active];

  const onKeyDown = (event) => {
    const keys = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: count - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = (keys[event.key] + count) % count;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-20 text-white sm:py-24 lg:py-28" id="what-we-do" aria-labelledby="what-we-do-title">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-32 -z-10 size-[32rem] rounded-full bg-brand-600/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)] bg-size-[56px_56px]" />

      <div className="shell">
        <Reveal className="max-w-3xl">
          <p className="eyebrow mb-4 text-gold-400"><span aria-hidden="true" className="h-px w-8 bg-gold-400" />What we do</p>
          <h2 id="what-we-do-title" className="font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.03em] text-white sm:text-[2.6rem] lg:text-[3.1rem]">
            From first question <span className="text-gold-400">to first job.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-ink-200 sm:text-lg">
            How we work with every student: one advisor, five stages, and a clear outcome at the end of each.
          </p>
        </Reveal>

        {/* Desktop: stepper + photo panel. Phones & tablets: the full journey as a photo timeline. */}
        {isDesktop ? (
        <div className="mt-14 grid grid-cols-[0.9fr_1.1fr] gap-12 xl:gap-16">
          <Reveal variant="left">
            <div role="tablist" aria-orientation="vertical" aria-label="Stages of the student journey" className="flex flex-col gap-2" onKeyDown={onKeyDown}>
              {JOURNEY_STAGES.map((stage, index) => {
                const selected = index === active;
                const done = index < active;
                const [badge] = ACCENTS[stage.accent];
                return (
                  <button
                    key={stage.key}
                    ref={(node) => { tabRefs.current[index] = node; }}
                    type="button"
                    role="tab"
                    id={`journey-tab-${stage.key}`}
                    aria-selected={selected}
                    aria-controls="journey-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(index)}
                    className={`group relative flex w-full items-start gap-5 rounded-2xl p-4 pr-5 text-left transition-[background-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 ${selected ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}
                  >
                    {/* Connector from this stage's number to the next one (gap-2 = 0.5rem between buttons); lit once passed. */}
                    {index < count - 1 && (
                      <span aria-hidden="true" className={`absolute top-8 left-8 h-[calc(100%+0.5rem)] w-px transition-colors duration-700 ${index < active ? "bg-brand-400" : "bg-white/12"}`} />
                    )}
                    <span className={`relative grid size-8 shrink-0 place-items-center rounded-full font-display text-sm font-semibold ring-4 ring-ink-950 transition-[background-color,color,scale] duration-500 ${selected ? `${badge} scale-125` : done ? "bg-brand-700 text-white" : "bg-ink-800 text-ink-300 group-hover:text-white"}`}>
                      {done ? <Check className="size-4" strokeWidth={2.5} /> : index + 1}
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className={`block font-display text-lg font-semibold transition-colors duration-300 ${selected ? "text-white" : "text-ink-200 group-hover:text-white"}`}>{stage.title}</span>
                      <span className={`mt-1 block text-sm transition-colors duration-300 ${selected ? "text-ink-200" : "text-ink-300"}`}>{stage.summary}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal variant="right" delay={120}>
            <div id="journey-panel" role="tabpanel" aria-labelledby={`journey-tab-${current.key}`} className="relative isolate flex min-h-[34rem] flex-col justify-end overflow-hidden rounded-[2rem] ring-1 ring-white/10 xl:min-h-[36rem]">
              {JOURNEY_STAGES.map((stage, index) => (
                <StageImage
                  key={stage.key}
                  stage={stage}
                  sizes="(min-width: 1280px) 42rem, 52vw"
                  className={`absolute inset-0 -z-20 size-full transition-[opacity,scale] duration-700 ease-(--ease-out-soft) ${index === active ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
                />
              ))}
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950 via-ink-950/75 to-ink-950/5" />

              {/* Keyed so the copy re-animates in on every stage change. */}
              <div key={current.key} className="p-8 motion-safe:animate-fade-up xl:p-10">
                <div className="flex items-center gap-3">
                  <span className={`grid size-11 place-items-center rounded-xl ${ACCENTS[current.accent][0]}`}><current.Icon className="size-5" /></span>
                  <span className={`text-xs font-semibold tracking-[0.18em] uppercase ${ACCENTS[current.accent][1]}`}>{stepLabel(active)} of {String(count).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-3xl font-semibold text-white">{current.title}</h3>
                <p className="mt-3 max-w-xl text-white/80">{current.text}</p>
                <div className="mt-6 max-w-xl"><Outcome text={current.outcome} /></div>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
                  {active > 0 && (
                    <button type="button" onClick={() => setActive(active - 1)} className="inline-flex items-center gap-2 text-white/70 transition-colors hover:text-white">
                      <ArrowUpRight className="size-4 -rotate-135" /> Previous
                    </button>
                  )}
                  {active < count - 1 && (
                    <button type="button" onClick={() => setActive(active + 1)} className="inline-flex items-center gap-2 text-white transition-colors hover:text-gold-400">
                      Next: {JOURNEY_STAGES[active + 1].title} <ArrowUpRight className="size-4 rotate-45" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
        ) : (

        <ol className="relative mt-12 flex flex-col gap-10">
          <span aria-hidden="true" className="absolute top-4 bottom-4 left-4 w-px bg-linear-to-b from-brand-400 via-white/15 to-gold-400" />
          {JOURNEY_STAGES.map((stage, index) => {
            const [badge, eyebrow] = ACCENTS[stage.accent];
            return (
              <Reveal as="li" key={stage.key} className="relative pl-12 sm:pl-14">
                <span className={`absolute top-0 left-0 grid size-8 place-items-center rounded-full font-display text-sm font-semibold ring-4 ring-ink-950 ${badge}`}>{index + 1}</span>
                <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                  <div className="relative">
                    <StageImage stage={stage} sizes="(min-width: 640px) 40rem, 90vw" className="aspect-[16/9] w-full" />
                    <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink-950/70 to-transparent" />
                    <span className={`absolute bottom-3 left-4 grid size-10 place-items-center rounded-xl ${badge}`}><stage.Icon className="size-5" /></span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className={`text-xs font-semibold tracking-[0.18em] uppercase ${eyebrow}`}>{stepLabel(index)}</p>
                    <h3 className="mt-1.5 font-display text-xl font-semibold text-white">{stage.title}</h3>
                    <p className="mt-2 text-sm text-ink-200">{stage.text}</p>
                    <div className="mt-4"><Outcome text={stage.outcome} /></div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ol>
        )}
      </div>
    </section>
  );
}
