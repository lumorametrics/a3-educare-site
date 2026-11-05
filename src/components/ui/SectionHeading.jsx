import Reveal from "./Reveal";

/**
 * Shared section header. `title` may contain an <em> for the brand-coloured accent.
 * `align="center"` stacks everything centred; the default puts `description`/`action` on the right at lg.
 * The heading and its supporting copy reveal in a short stagger as the section scrolls in.
 */
export default function SectionHeading({ eyebrow, title, description, action, align = "split", tone = "light", as: Tag = "h2" }) {
  const dark = tone === "dark";
  const centered = align === "center";
  return (
    <div
      className={`mb-10 flex flex-col gap-5 sm:mb-12 ${
        centered ? "mx-auto max-w-2xl items-center text-center" : "lg:flex-row lg:items-end lg:justify-between lg:gap-12"
      }`}
    >
      <Reveal className={centered ? "" : "max-w-2xl"}>
        {eyebrow && (
          <p className={`eyebrow mb-3 ${dark ? "text-gold-400" : ""}`}>
            <span aria-hidden="true" className={`h-px w-6 ${dark ? "bg-gold-400" : "bg-brand-600"}`} />
            {eyebrow}
          </p>
        )}
        <Tag className={`heading-display text-3xl leading-[1.1] sm:text-4xl lg:text-[2.75rem] ${dark ? "text-white [&_em]:text-gold-400" : ""}`}>
          {title}
        </Tag>
      </Reveal>
      {(description || action) && (
        <Reveal delay={120} className={`flex flex-col gap-4 ${centered ? "items-center" : "lg:max-w-sm lg:items-end lg:text-right"}`}>
          {description && <p className={dark ? "text-ink-200" : "text-ink-500"}>{description}</p>}
          {action}
        </Reveal>
      )}
    </div>
  );
}
