import { useEffect, useRef, useState } from "react";

// How much of the photo may be cropped away by object-cover before it is shown whole instead.
const MAX_CROP = 0.35;

/** Neutral frame shown only while a college has no image record or its file fails to load: no text, no stand-in photo. */
function EmptyFrame({ className }) {
  return <span aria-hidden="true" className={`block bg-sand-100 ${className}`} />;
}

/**
 * A college photo that fits its frame. `className` sizes the frame (aspect ratio, radius); `ratio` is that
 * frame's width / height. Photos that cover the frame with little cropping use object-cover; portrait and
 * very wide ones are shown whole over a blurred copy of themselves instead of being cut off.
 * No `image` (or one that fails to load) leaves a plain neutral frame. Lazy by default; `priority` for the
 * first image on a page. `alt` is empty for card photos, whose link already names the college.
 */
export default function CollegeImage({ image, alt = "", ratio = 4 / 3, className = "", sizes, zoom = false, priority = false }) {
  const ref = useRef(null);
  const src = image?.src;
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [failedSrc, setFailedSrc] = useState(null);

  useEffect(() => {
    // A cached image can finish loading before React attaches onLoad.
    if (src && ref.current?.complete && ref.current.naturalWidth) setLoadedSrc(src);
  }, [src]);

  if (!src || failedSrc === src) return <EmptyFrame className={className} />;

  const loaded = loadedSrc === src;
  const imageRatio = image.width && image.height ? image.width / image.height : null;
  const crop = imageRatio ? 1 - Math.min(imageRatio, ratio) / Math.max(imageRatio, ratio) : 0;
  const contain = crop > MAX_CROP;
  const loading = priority ? "eager" : "lazy";

  return (
    <span className={`relative isolate block overflow-hidden bg-sand-100 ${loaded ? "" : "animate-pulse"} ${className}`}>
      {contain && (
        <img aria-hidden="true" alt="" src={src} loading={loading} decoding="async" className="absolute inset-0 size-full scale-110 object-cover opacity-80 blur-2xl" />
      )}
      <img
        ref={ref}
        src={src}
        srcSet={image.srcSet}
        sizes={image.srcSet ? sizes : undefined}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={loading}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        onLoad={() => setLoadedSrc(src)}
        onError={() => setFailedSrc(src)}
        style={contain ? undefined : { objectPosition: "50% 40%" }}
        className={`relative block size-full transition-[opacity,scale] duration-700 ease-(--ease-out-soft) motion-reduce:transition-none ${
          contain ? "object-contain" : "object-cover"
        } ${loaded ? "opacity-100" : "opacity-0"} ${zoom && !contain ? "scale-100 group-hover:scale-[1.04]" : ""}`}
      />
    </span>
  );
}
