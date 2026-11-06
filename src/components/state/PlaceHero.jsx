import { useEffect, useState } from "react";
import Breadcrumb from "../ui/Breadcrumb";

const LONG_DESCRIPTION = 240;

const enter = "motion-safe:animate-fade-up";

/**
 * Hero for district and course-category pages. The photo from WordPress covers the whole section as a background
 * under a dark gradient, with the copy at the lower left. Without a photo it shows the brand's dark gradient.
 * `image` is { url, alt, note } (see getHeroImage); `actions` are the buttons. `cardsBelow` keeps room for cards
 * that overlap the lower edge of the hero. `title` may include <em>; `longTitle` uses a smaller size so a long heading
 * does not push the hero far past the screen.
 */
export default function PlaceHero({ breadcrumb, eyebrow, title, description, actions, facts = [], image, cardsBelow = false, longTitle = false }) {
  const url = image?.url;
  const [loadedUrl, setLoadedUrl] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const canExpand = typeof description === "string" && description.length > LONG_DESCRIPTION;

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
    <section className="hero-photo relative isolate flex overflow-hidden bg-ink-950">
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-linear-to-br from-ink-900 via-ink-800 to-brand-800" />
      {url && (
        <div
          role="img"
          aria-label={image.alt || undefined}
          aria-hidden={image.alt ? undefined : "true"}
          style={{ backgroundImage: `url("${url}")` }}
          className={`absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-[opacity,transform] duration-[1600ms] ease-(--ease-out-soft) motion-reduce:transition-none ${loaded ? "scale-100 opacity-100" : "scale-[1.06] opacity-0"}`}
        />
      )}

      {/* Strongest behind the copy: the left side on wide screens, the lower part on a phone. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-ink-950/90 via-ink-950/55 to-ink-950/10 max-md:from-ink-950/20 max-md:via-ink-950/10 max-md:to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950/95 via-ink-950/40 to-ink-950/45 max-md:from-ink-950 max-md:from-35% max-md:via-ink-950/70 max-md:via-60% max-md:to-ink-950/45" />

      <div className={`shell relative flex w-full flex-col pt-8 ${cardsBelow ? "pb-24 sm:pb-28" : "pb-12 sm:pb-16"}`}>
        {breadcrumb && <div className="motion-safe:animate-page-in"><Breadcrumb items={breadcrumb} tone="dark" /></div>}

        <div className="mt-auto max-w-3xl pt-16 sm:pt-12">
          {eyebrow && (
            <p className={`mb-4 flex items-center gap-3 text-sm font-semibold tracking-wide text-accent ${enter}`}>
              <span aria-hidden="true" className="h-0.5 w-8 shrink-0 rounded-full bg-accent" />
              {eyebrow}
            </p>
          )}
          <h1 className={`heading-display text-white! ${longTitle ? "text-[1.9rem] leading-[1.1] min-[400px]:text-4xl sm:text-5xl lg:text-6xl" : "text-5xl leading-[1.02] sm:text-6xl lg:text-7xl"} [&_em]:text-accent! [text-shadow:0_2px_24px_rgb(9_24_41/0.55)] ${enter} motion-safe:[animation-delay:80ms]`}>{title}</h1>
          {description && (
            <div className={`mt-5 max-w-3xl sm:mt-6 ${enter} motion-safe:[animation-delay:160ms]`}>
              <p className={`text-base leading-relaxed text-ink-100 sm:text-lg ${canExpand && !expanded ? "line-clamp-5 sm:line-clamp-3" : ""}`}>{description}</p>
              {canExpand && (
                <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="mt-2 min-h-6 text-sm font-semibold text-accent underline underline-offset-4 hover:brightness-110">
                  {expanded ? "Read less" : "Read more"}
                </button>
              )}
            </div>
          )}
          {facts.length > 0 && (
            <dl className={`mt-6 flex flex-wrap gap-2 ${enter} motion-safe:[animation-delay:200ms]`}>
              {facts.map(([label, value, Icon]) => (
                <div key={label} className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 py-1.5 pr-4 pl-2 backdrop-blur-md">
                  <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/15 text-accent"><Icon className="size-3.5" /></span>
                  <div>
                    <dt className="text-[0.7rem] leading-tight font-medium text-ink-200">{label}</dt>
                    <dd className="text-sm leading-tight font-semibold text-white">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
          {actions && <div className={`mt-7 flex flex-wrap gap-3 sm:mt-8 ${enter} motion-safe:[animation-delay:240ms]`}>{actions}</div>}
          {image?.note && <p className={`mt-5 text-xs text-ink-200/80 ${enter} motion-safe:[animation-delay:320ms]`}>{image.note}</p>}
        </div>
      </div>
    </section>
  );
}
