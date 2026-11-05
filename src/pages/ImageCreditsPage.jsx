import { useEffect, useMemo, useState } from "react";
import PageHero from "../components/ui/PageHero";
import SplashScreen from "../components/ui/SplashScreen";
import StatusMessage from "../components/ui/StatusMessage";
import { CreditLine } from "../components/college/ImageCredits";
import { parseCredit } from "../lib/collegeImage";
import { useSeo } from "../lib/seo";
import { toPlainText } from "../lib/text";
import { getCreditedMedia } from "../services/wordpress";
import { HERO_SLIDES } from "../components/home/heroSlides";

/** One entry per source photo: the media library can hold the same Commons file more than once. */
function creditEntries(media) {
  const bySource = new Map();
  media.forEach((item) => {
    const credit = parseCredit(item);
    if (!credit || bySource.has(credit.sourceUrl)) return;
    const name = toPlainText(item.alt_text) || toPlainText(item.title?.rendered) || credit.sourceUrl.split("File:").pop();
    bySource.set(credit.sourceUrl, {
      id: item.id,
      name,
      credit,
      thumbnail: item.media_details?.sizes?.thumbnail?.source_url || item.source_url,
    });
  });
  HERO_SLIDES.forEach((slide) => {
    bySource.set(slide.credit.sourceUrl, { id: `hero-${slide.image}`, name: `Home page banner: ${slide.eyebrow}`, credit: slide.credit, thumbnail: `/hero/${slide.image}-mobile.webp` });
  });
  return [...bySource.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const breadcrumb = [{ label: "Home", href: "/" }, { label: "Image Credits" }];

/**
 * Attribution for the photographs on the site. Pages show images without a credit line, so this page carries the
 * author, licence and source that the Creative Commons licences require. Linked from the footer on every page.
 */
export default function ImageCreditsPage() {
  const [media, setMedia] = useState(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    getCreditedMedia()
      .then((result) => { if (active) setMedia(result); })
      .catch((requestError) => {
        console.error("Unable to load the image credits:", requestError);
        if (active) setFailed(true);
      });
    return () => { active = false; };
  }, []);

  useSeo({ title: "Image Credits", description: "Authors, licences and sources of the photographs used on A3 EduCare Hub.", noindex: true });

  const entries = useMemo(() => creditEntries(media || []), [media]);
  const needle = query.trim().toLowerCase();
  const shown = needle ? entries.filter((entry) => `${entry.name} ${entry.credit.author}`.toLowerCase().includes(needle)) : entries;

  if (failed) return <StatusMessage page tone="error" title="Something went wrong">The image credits could not be loaded from WordPress.</StatusMessage>;
  if (!media) return <SplashScreen label="Loading image credits" />;

  return (
    <main>
      <PageHero
        breadcrumb={breadcrumb}
        eyebrow="Legal"
        title={<>Image <em>Credits</em></>}
        description="Each photograph below is listed with its author, licence and source. Most come from Wikimedia Commons; the rest come from Pexels."
      />
      <section className="shell section-y">
        <p className="max-w-3xl text-sm text-ink-500">
          Images may be resized or cropped to fit page layouts. The authors and licensors do not endorse A3 EduCare Hub or its services.
        </p>
        <label className="mt-8 block max-w-md text-sm font-medium text-ink-900">
          Find a photo by place, college or author
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 block w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-base font-normal"
          />
        </label>
        <p className="mt-4 text-sm text-ink-500" aria-live="polite">Showing {shown.length} of {entries.length} photos</p>
        <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
          {shown.map((entry) => (
            <li key={entry.id} className="flex min-w-0 items-start gap-4">
              <img src={entry.thumbnail} alt="" width="64" height="64" loading="lazy" decoding="async" className="size-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 break-words text-sm">
                <p className="font-medium text-ink-900">{entry.name}</p>
                <p className="mt-1 text-ink-500"><CreditLine credit={entry.credit} /></p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
