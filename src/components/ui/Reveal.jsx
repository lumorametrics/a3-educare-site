import { useEffect, useRef, useState } from "react";
import { observeInView } from "./inView";

/**
 * Scroll-reveal wrapper. The motion itself lives in index.css (`[data-reveal]`), so the
 * only work done in JS is flipping one data attribute when the element enters/leaves.
 *
 * variant: "up" (default) | "down" | "left" | "right" | "zoom" | "fade"
 * delay:   stagger in ms
 * once:    keep visible after the first reveal instead of replaying on every entry
 */
export default function Reveal({ children, className = "", delay = 0, variant = "up", once = false, as: Tag = "div", style, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => observeInView(ref.current, setVisible, { once }), [once]);

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      data-visible={visible}
      style={delay ? { ...style, "--reveal-delay": `${delay}ms` } : style}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
