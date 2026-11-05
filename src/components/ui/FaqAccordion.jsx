import { useId, useState } from "react";
import { Plus } from "./Icons";
import { toPlainText } from "../../lib/text";

function stripMarkup(value = "") {
  return toPlainText(value);
}

/**
 * Animated accordion shared by every FAQ on the site.
 * items: [{ question, answer }] — `answer` is treated as HTML (WordPress content), `question` as text.
 */
export default function FaqAccordion({ items, defaultOpen = -1, numbered = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const baseId = useId();

  return (
    <div className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card">
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div key={`${item.question}-${index}`} className={`transition-colors duration-300 ${isOpen ? "bg-brand-50/40" : ""}`}>
            <h3 className="m-0">
              <button
                type="button"
                className="group flex w-full items-center gap-4 px-5 py-5 text-left sm:px-7"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : index)}
              >
                {numbered && <span className="w-7 shrink-0 font-display text-sm text-brand-600">{String(index + 1).padStart(2, "0")}</span>}
                <span className="flex-1 text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-700 sm:text-[17px]">
                  {stripMarkup(item.question)}
                </span>
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full border transition duration-300 ${
                    isOpen ? "rotate-45 border-brand-600 bg-brand-600 text-white" : "border-sand-200 text-ink-500 group-hover:border-ink-300"
                  }`}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              className={`grid transition-[grid-template-rows] duration-400 ease-(--ease-out-soft) ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <div
                  className={`wp-content prose-sm px-5 pb-6 sm:px-7 sm:prose-base ${numbered ? "sm:pl-[4.75rem]" : ""}`}
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
