import { toPlainText } from "../../lib/text";
import { ChevronRight } from "./Icons";

/** items: [{ label, href? }] — the last item is rendered as the current page. Labels may contain WordPress HTML entities. */
export default function Breadcrumb({ items, tone = "light" }) {
  const dark = tone === "dark";
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className={`flex flex-wrap items-center gap-1.5 text-sm ${dark ? "text-ink-300" : "text-ink-500"}`}>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          // Rendered as text (not innerHTML) so a WordPress title can never inject markup.
          const label = toPlainText(item.label);
          return (
            <li className="flex min-w-0 items-center gap-1.5" key={`${label}-${index}`}>
              {item.href && !last ? (
                <a className={`-my-1.5 py-1.5 transition-colors ${dark ? "hover:text-white" : "hover:text-brand-700"}`} href={item.href}>{label}</a>
              ) : (
                <span aria-current={last ? "page" : undefined} className={`max-w-[60vw] truncate font-medium sm:max-w-md ${dark ? "text-white" : "text-ink-800"}`}>
                  {label}
                </span>
              )}
              {!last && <ChevronRight className="size-3.5 shrink-0 opacity-60" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
