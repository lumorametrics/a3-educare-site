import { useEffect, useRef, useState } from "react";

/**
 * Image that fades/settles in once loaded (with a soft placeholder behind it) and zooms
 * gently on hover. Put sizing, aspect ratio and radius on `className` (the frame).
 */
export default function FadeImage({ src, alt = "", className = "", imgClassName = "", zoom = true, ...props }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Cached images can finish loading before React attaches onLoad.
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true);
  }, [src]);

  return (
    <span className={`group/img relative isolate block overflow-hidden bg-sand-100 ${loaded ? "" : "animate-pulse"} ${className}`}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`block size-full object-cover transition-[opacity,scale] duration-700 ease-(--ease-out-soft) motion-reduce:transition-none ${
          loaded ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
        } ${zoom ? "group-hover/img:scale-[1.04]" : ""} ${imgClassName}`}
        {...props}
      />
    </span>
  );
}
