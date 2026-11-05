import Breadcrumb from "./Breadcrumb";

const enter = "motion-safe:animate-fade-up";

/** Hero used by directory / listing / legal pages. `title` may include <em>. Copy enters in a short stagger on load. */
export default function PageHero({ breadcrumb, eyebrow, title, description, children, align = "left" }) {
  const centered = align === "center";
  return (
    <section className="relative overflow-hidden border-b border-sand-200 bg-linear-to-br from-brand-50 via-sand-50 to-ink-50">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-1/3 size-80 rounded-full bg-gold-300/30 blur-3xl" />
      <div className="shell relative pt-8 pb-14 sm:pb-20">
        {breadcrumb && <div className="motion-safe:animate-page-in"><Breadcrumb items={breadcrumb} /></div>}
        <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          {eyebrow && <p className={`eyebrow mb-4 ${enter}`}>{eyebrow}</p>}
          <h1 className={`heading-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl ${enter} [animation-delay:80ms]`}>{title}</h1>
          {description && <p className={`mt-5 max-w-2xl text-lg text-ink-500 ${enter} [animation-delay:160ms]`}>{description}</p>}
        </div>
        {children && <div className={`mt-8 ${enter} [animation-delay:240ms]`}>{children}</div>}
      </div>
    </section>
  );
}
