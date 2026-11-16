import { useEffect, useRef, useState } from "react";

/** Plain branded backdrop for a college without a verified photo; no stand-in photograph is shown. */
function PlaceholderBackdrop() {
  return <div aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-ink-900 via-ink-900 to-brand-700/60" />;
}

// Keeps the interesting part of the photo in frame once object-cover trims it to a wide hero.
function focalPoint(image) {
  const ratio = image.width && image.height ? image.width / image.height : null;
  if (ratio && ratio < 0.9) return "50% 30%"; // portrait: favour the upper part of the building
  if (ratio && ratio > 2.1) return "50% 50%"; // very wide
  return "50% 45%";
}

/**
 * Full-bleed college photo for the hero (object-cover), with the readability overlays on top.
 * Without a photo (or if it fails to load) a plain branded backdrop is shown instead. The photo is
 * decorative here: the page title names the college, and the photo is credited on /image-credits.
 */
export default function CollegeHeroBackdrop({ image: requested, onPhotoFailed }) {
  const ref = useRef(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [failed, setFailed] = useState([]);
  const image = requested;
  const src = image?.src;

  useEffect(() => {
    // A cached image can finish loading before React attaches onLoad.
    if (src && ref.current?.complete && ref.current.naturalWidth) setLoadedSrc(src);
  }, [src]);

  const hasPhoto = src && !failed.includes(src);
  const loaded = loadedSrc === src;

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-ink-900">
      {hasPhoto ? (
        <img
          ref={ref}
          src={src}
          srcSet={image.srcSet}
          sizes={image.srcSet ? "100vw" : undefined}
          width={image.width}
          height={image.height}
          alt=""
          decoding="async"
          fetchPriority="high"
          onLoad={() => setLoadedSrc(src)}
          onError={() => { setFailed((list) => [...list, src]); onPhotoFailed?.(src); }}
          style={{ objectPosition: focalPoint(image) }}
          className={`absolute inset-0 size-full object-cover transition-[opacity,scale] duration-[1400ms] ease-(--ease-out-soft) motion-reduce:transition-none ${loaded ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`}
        />
      ) : (
        <PlaceholderBackdrop />
      )}
      {hasPhoto && (
        <>
          {/* Dark wash for readability: strongest behind the text (left on desktop, the lower part on a phone), light elsewhere so the photo stays visible. */}
          <div className="absolute inset-0 bg-linear-to-r from-ink-950/85 via-ink-950/45 to-ink-950/5 max-md:bg-ink-950/25" />
          <div className="absolute inset-0 bg-linear-to-t from-ink-950/80 via-ink-950/10 to-ink-950/25 max-md:from-ink-950/95 max-md:via-ink-950/70 max-md:to-ink-950/10" />
        </>
      )}
      <div className="absolute -top-40 -right-20 size-[32rem] rounded-full bg-brand-600/20 blur-3xl" />
    </div>
  );
}
