import { useEffect, useMemo, useRef, useState } from "react";
import { withoutPhotoCredit } from "../lib/collegeImage";
import { getGalleryPage, getMediaByIds } from "../services/wordpress";
import SplashScreen from "../components/ui/SplashScreen";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import FadeImage from "../components/ui/FadeImage";
import StatusMessage from "../components/ui/StatusMessage";
import { ArrowUpRight, ChevronLeft, ChevronRight, Close, ImageIcon } from "../components/ui/Icons";
import { toPlainText } from "../lib/text";

function stripMarkup(value = "") {
  return toPlainText(value);
}

/**
 * Media-library ID of an <img> from WordPress content: the block editor's `wp-image-N` class or
 * `data-id`, or the attachment id inside Elementor's lightbox settings on the surrounding link.
 */
function getAttachmentId(image) {
  const direct = image.className.match(/wp-image-(\d+)/)?.[1] || image.getAttribute("data-id");
  if (direct) return Number(direct);
  const hash = image.closest("a")?.getAttribute("data-e-action-hash");
  const encoded = hash && decodeURIComponent(hash).match(/settings=([A-Za-z0-9+/=]+)/)?.[1];
  try {
    return encoded ? Number(JSON.parse(atob(encoded)).id) || null : null;
  } catch {
    return null;
  }
}

/** Adds real dimensions, a responsive srcset, and library alt text/captions to the gallery images. */
function withMediaDetails(images, media) {
  const byId = new Map(media.map((item) => [item.id, item]));
  return images.map((image) => {
    const item = byId.get(image.id);
    const details = item?.media_details;
    if (!details?.width) return image;
    const sizes = Object.values(details.sizes || {})
      .filter((size) => size.source_url && size.width >= 300)
      .sort((a, b) => a.width - b.width);
    const unique = sizes.filter((size, index) => sizes.findIndex((other) => other.width === size.width) === index);
    return {
      ...image,
      url: item.source_url || image.url,
      thumb: (unique.find((size) => size.width >= 600) || unique.at(-1))?.source_url || item.source_url,
      srcSet: unique.map((size) => `${size.source_url} ${size.width}w`).join(", "),
      width: details.width,
      height: details.height,
      alt: item.alt_text || image.alt,
      caption: withoutPhotoCredit(stripMarkup(item.caption?.rendered || "") || image.caption),
    };
  });
}

// Pinterest-style column counts by viewport width.
const COLUMN_QUERIES = [["(min-width: 1536px)", 5], ["(min-width: 1024px)", 4], ["(min-width: 768px)", 3]];
const columnCountNow = () => COLUMN_QUERIES.find(([query]) => window.matchMedia(query).matches)?.[1] || 2;

function useColumnCount() {
  const [count, setCount] = useState(columnCountNow);
  useEffect(() => {
    const lists = COLUMN_QUERIES.map(([query]) => window.matchMedia(query));
    const update = () => setCount(columnCountNow());
    lists.forEach((list) => list.addEventListener("change", update));
    return () => lists.forEach((list) => list.removeEventListener("change", update));
  }, []);
  return count;
}

/**
 * Masonry placement: each image goes into the currently shortest column (by aspect ratio), so the
 * order reads left to right like Pinterest and the column bottoms stay roughly level.
 */
function toColumns(images, count) {
  const columns = Array.from({ length: count }, () => ({ height: 0, items: [] }));
  images.forEach((image, index) => {
    const shortest = columns.reduce((best, column) => (column.height < best.height ? column : best));
    shortest.items.push({ image, index });
    shortest.height += image.width ? image.height / image.width : 1;
  });
  return columns;
}

function getGalleryImages(page) {
  const images = [];
  const getBestImageUrl = (image) => {
    if (typeof image === "string") return image;
    const srcSet = image?.srcset || image?.srcSet;
    if (srcSet) {
      const candidates = srcSet.split(",")
        .map((candidate) => {
          const [url, width] = candidate.trim().split(/\s+/);
          return { url, width: Number.parseInt(width, 10) || 0 };
        })
        .filter((candidate) => candidate.url);
      if (candidates.length) return candidates.sort((a, b) => b.width - a.width)[0].url;
    }
    const url = image?.source_url || image?.url || image?.media_details?.sizes?.full?.source_url || image?.media_details?.sizes?.large?.source_url;
    if (!url) return "";
    return url.replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, "");
  };
  const addImage = (image, fallbackAlt = "A3 Educare Hub gallery image") => {
    const url = getBestImageUrl(image);
    if (!url || images.some((item) => item.url === url)) return;
    images.push({
      id: typeof image === "object" ? image.id || null : null,
      url,
      alt: typeof image === "object" && image.alt_text ? image.alt_text : fallbackAlt,
      caption: typeof image === "object" ? withoutPhotoCredit(stripMarkup(image.caption?.rendered || image.caption || "")) : "",
    });
  };

  page._embedded?.["wp:featuredmedia"]?.forEach((image) => addImage(image, "A3 Educare Hub featured image"));
  const content = page.content?.rendered || "";
  if (typeof DOMParser !== "undefined") {
    const document = new DOMParser().parseFromString(content, "text/html");
    document.querySelectorAll("img").forEach((image) => {
      addImage({
        id: getAttachmentId(image),
        url: image.getAttribute("src"),
        srcset: image.getAttribute("srcset"),
        alt_text: image.getAttribute("alt"),
      }, image.getAttribute("alt") || undefined);
      const current = images[images.length - 1];
      if (current && !current.caption) current.caption = withoutPhotoCredit(image.closest("figure")?.querySelector("figcaption")?.textContent?.trim() || "");
    });
  }
  const fields = page.acf || {};
  Object.entries(fields).forEach(([key, value]) => {
    if (/image|photo|gallery|thumbnail/i.test(key)) {
      (Array.isArray(value) ? value : [value]).forEach((image) => addImage(image));
    }
  });
  return images;
}

export default function Gallery() {
  const [page, setPage] = useState(null);
  const [status, setStatus] = useState("loading");
  const [activeIndex, setActiveIndex] = useState(-1);
  const closeButtonRef = useRef(null);
  const swipeStartX = useRef(null);

  useEffect(() => {
    let active = true;
    getGalleryPage()
      .then((result) => {
        if (!active) return;
        setPage(result);
        setStatus(result ? "ready" : "not-found");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load the Gallery page:", requestError);
        setStatus("error");
      });
    return () => { active = false; };
  }, []);

  const baseImages = useMemo(() => page ? getGalleryImages(page) : [], [page]);
  // `null` until the media-library details arrive: tiles wait so each image is downloaded once, at the right size.
  const [media, setMedia] = useState(null);
  const columnCount = useColumnCount();

  const mediaIds = useMemo(() => baseImages.map((image) => image.id).filter(Boolean), [baseImages]);

  useEffect(() => {
    const ids = mediaIds;
    if (!ids.length) return undefined;
    let active = true;
    // Dimensions keep each card's height reserved; without them the grid still works, just unreserved.
    getMediaByIds(ids)
      .then((items) => active && setMedia(Array.isArray(items) ? items : []))
      .catch((requestError) => {
        console.error("Unable to load gallery image details:", requestError);
        if (active) setMedia([]);
      });
    return () => { active = false; };
  }, [mediaIds]);

  const images = useMemo(() => withMediaDetails(baseImages, media || []), [baseImages, media]);
  // Images without attachment IDs (plain URLs) have no details to wait for.
  const mediaReady = media !== null || mediaIds.length === 0;
  const columns = useMemo(() => toColumns(images, Math.max(1, Math.min(columnCount, images.length))), [images, columnCount]);
  const activeImage = images[activeIndex];

  useEffect(() => {
    if (activeIndex < 0) return undefined;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setActiveIndex(-1);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % images.length);
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, images.length]);

  // Move keyboard focus into the preview when it opens (not on every next/previous).
  const lightboxOpen = activeIndex >= 0;
  useEffect(() => {
    if (lightboxOpen) closeButtonRef.current?.focus();
  }, [lightboxOpen]);

  const title = stripMarkup(page?.title?.rendered) || "Gallery";
  const content = page?.content?.rendered || "";
  const intro = stripMarkup(page?.excerpt?.rendered) || "A glimpse into the people, moments and learning journeys that make A3 Educare Hub meaningful.";

  if (status === "loading") return <SplashScreen label="Loading gallery" />;
  if (status === "error") return <StatusMessage page tone="error">The Gallery could not be loaded from WordPress.</StatusMessage>;
  if (!page) return <StatusMessage page>A published Gallery page was not found in WordPress.</StatusMessage>;

  return (
    <main>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: title }]}
        eyebrow="Moments that matter"
        title={title}
        description={intro}
      />
      {images.length > 0 ? (
        <section className="shell section-y">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-3">Inside A3 Educare Hub</p>
              <h2 className="heading-display text-3xl sm:text-4xl">Stories in <em>every frame.</em></h2>
            </div>
            <p className="max-w-md text-ink-500">Explore our gallery and discover the people, places and experiences behind our education community.</p>
          </div>
          {/* Pinterest-style masonry: 2–5 columns, images keep their own proportions, order reads left to right. */}
          {!mediaReady && (
            <div aria-busy="true" aria-label="Loading gallery images" className="flex items-start gap-3 sm:gap-4">
              {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
                  {column.items.map(({ index }) => (
                    <div key={index} className={`animate-pulse rounded-2xl bg-sand-100 sm:rounded-3xl ${index % 2 ? "aspect-square" : "aspect-[9/16]"}`} />
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className={`flex items-start gap-3 sm:gap-4 ${mediaReady ? "" : "hidden"}`}>
            {mediaReady && columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
                {column.items.map(({ image, index }) => (
                  <Reveal key={image.url} delay={(index % columns.length) * 60}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`View image ${index + 1} of ${images.length}${image.caption ? `: ${image.caption}` : ""}`}
                      className="group relative block w-full overflow-hidden rounded-2xl bg-sand-100 text-left shadow-card transition-shadow duration-300 hover:shadow-lift focus-visible:outline-offset-4 sm:rounded-3xl"
                    >
                      <span className="block" style={image.width ? { aspectRatio: `${image.width} / ${image.height}` } : undefined}>
                        <FadeImage
                          className={image.width ? "size-full" : "w-full"}
                          imgClassName={`${image.width ? "" : "h-auto"} transition-[scale,opacity] duration-700 group-hover:scale-[1.04]`}
                          zoom={false}
                          src={image.thumb || image.url}
                          srcSet={image.srcSet || undefined}
                          sizes={image.srcSet ? "(min-width: 1536px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" : undefined}
                          width={image.width}
                          height={image.height}
                          alt={image.alt === "A3 Educare Hub gallery image" ? `${image.alt} ${index + 1}` : image.alt}
                          loading={index < columns.length ? "eager" : "lazy"}
                        />
                      </span>
                      {/* Hover / keyboard-focus overlay */}
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink-950/70 via-ink-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                      <span aria-hidden="true" className="absolute top-3 right-3 grid size-9 scale-90 place-items-center rounded-full bg-white/95 text-ink-900 opacity-0 shadow-card transition duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
                        <ArrowUpRight />
                      </span>
                      {image.caption && (
                        <span className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-sm font-medium text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                          {image.caption}
                        </span>
                      )}
                    </button>
                  </Reveal>
                ))}
              </div>
            ))}
          </div>
          {content && <div className="wp-content mx-auto mt-14 max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/<figure[\s\S]*?<\/figure>|<img[^>]*>/gi, "") }} />}
        </section>
      ) : (
        <section className="shell section-y">
          <StatusMessage title="New moments are on the way.">
            <ImageIcon className="mx-auto mb-2 size-8 text-ink-300" />
            {content ? stripMarkup(content) : "Gallery images will appear here once they are published in WordPress."}
          </StatusMessage>
        </section>
      )}
      {activeImage && (
        <div
          className="fixed inset-0 z-[60] flex touch-pan-y flex-col items-center justify-center bg-ink-950/95 p-4 backdrop-blur-sm motion-safe:animate-[fade-up_0.3s_ease-out]"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
          // Swipe left/right on touch screens to move between images.
          onPointerDown={(event) => { if (event.pointerType !== "mouse") swipeStartX.current = event.clientX; }}
          onPointerUp={(event) => {
            const start = swipeStartX.current;
            swipeStartX.current = null;
            if (start === null || images.length < 2 || Math.abs(event.clientX - start) < 50) return;
            const step = event.clientX < start ? 1 : -1;
            setActiveIndex((index) => (index + step + images.length) % images.length);
          }}
        >
          {/* Clicking anywhere outside the image closes the preview; Escape and the × button do too. */}
          <button type="button" tabIndex={-1} aria-hidden="true" className="absolute inset-0 cursor-zoom-out" onClick={() => setActiveIndex(-1)} />
          <button ref={closeButtonRef} type="button" className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20" aria-label="Close image preview" onClick={() => setActiveIndex(-1)}><Close className="size-5" /></button>
          {images.length > 1 && (
            <>
              <button type="button" className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6" aria-label="Previous image" onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)}><ChevronLeft className="size-5" /></button>
              <button type="button" className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6" aria-label="Next image" onClick={() => setActiveIndex((activeIndex + 1) % images.length)}><ChevronRight className="size-5" /></button>
            </>
          )}
          <img key={activeImage.url} className="relative max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl motion-safe:animate-[fade-up_0.4s_var(--ease-out-soft)]" src={activeImage.url} alt={activeImage.alt} />
          <p className="relative mt-4 text-center text-sm text-ink-200">{activeImage.caption}{images.length > 1 && <span className="ml-3 text-ink-300">{activeIndex + 1} / {images.length}</span>}</p>
        </div>
      )}
    </main>
  );
}
