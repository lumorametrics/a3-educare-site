import { useEffect, useState } from "react";
import Breadcrumb from "../ui/Breadcrumb";


const enter = "motion-safe:animate-fade-up";

/**
 * Hero for a state page. The state's photo (from the API) fills the whole section as a cover background under
 * a dark gradient wash, so the white copy stays readable at every width. Without a photo it falls back to the
 * brand's dark gradient. `title` may include <em>; `facts` is [[label, value, Icon]]; `image` is { url, alt, credit }.
 */
export default function StateHero({ breadcrumb, eyebrow, title, description, facts = [], image }) {
  const url = image?.url;
  const [loadedUrl, setLoadedUrl] = useState(null);

  useEffect(() => {
    if (!url) return undefined;
    // Fade the photo in once it has downloaded instead of letting it paint in strips.
    const probe = new Image();
    probe.onload = () => setLoadedUrl(url);
    probe.src = url;
    return () => { probe.onload = null; };
  }, [url]);

  const loaded = loadedUrl === url;

  return (
    <section
      aria-label={image?.alt || undefined}
      className="relative isolate flex min-h-[30rem] overflow-hidden bg-ink-950 sm:min-h-[34rem] lg:min-h-[38rem]"
    >
      {/* Photo: background-size cover, centred slightly high so skylines and facades keep their top. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-linear-to-br from-ink-900 via-ink-800 to-brand-800" />
      {url && (
        <div
          aria-hidden="true"
          style={{ backgroundImage: `url("${url}")` }}
          className={`absolute inset-0 -z-10 bg-cover bg-[position:50%_35%] bg-no-repeat transition-[opacity,transform] duration-[1600ms] ease-(--ease-out-soft) motion-reduce:transition-none md:bg-center ${loaded ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"}`}
        />
      )}

      {/* Readability wash: strongest on the text side (left, and the lower half on a phone), lighter where the photo should show. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-ink-950/90 via-ink-950/55 to-ink-950/10 max-md:from-ink-950/60 max-md:via-ink-950/40 max-md:to-ink-950/30" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950/95 via-ink-950/35 to-ink-950/45 max-md:from-ink-950 max-md:via-ink-950/75 max-md:to-ink-950/25" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-24 -z-10 size-[30rem] rounded-full bg-brand-500/20 blur-3xl" />

      <div className="shell relative flex w-full flex-col pt-8 pb-10 sm:pb-14">
        {breadcrumb && <div className="motion-safe:animate-page-in"><Breadcrumb items={breadcrumb} tone="dark" /></div>}

        <div className="mt-auto max-w-3xl pt-10">
          {eyebrow && <p className={`eyebrow mb-4 text-gold-400! ${enter}`}>{eyebrow}</p>}
          <h1 className={`heading-display text-4xl leading-[1.04] text-white! sm:text-5xl lg:text-6xl [&_em]:text-gold-400! ${enter} [animation-delay:80ms]`}>{title}</h1>
          {description && (
            <p className={`mt-5 max-w-2xl text-base leading-relaxed text-ink-100 sm:text-lg ${enter} [animation-delay:160ms]`}>{description}</p>
          )}

          {facts.length > 0 && (
            <dl className={`mt-8 flex flex-wrap gap-3 ${enter} [animation-delay:240ms]`}>
              {facts.map(([label, value, Icon]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 py-2.5 pr-5 pl-2.5 backdrop-blur-md">
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 text-gold-300"><Icon className="size-4" /></span>
                  <div>
                    <dt className="text-xs font-medium text-ink-200">{label}</dt>
                    <dd className="text-sm font-semibold text-white">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}

          {image?.credit?.note && (
            <p className={`mt-8 text-xs text-ink-200/80 ${enter} [animation-delay:320ms]`}>
              {image.credit.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
