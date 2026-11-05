import { useMemo } from "react";
import PageHero from "./PageHero";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/^\s*\d+[.)]\s*/, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Gives every <h2> in the WordPress HTML an id (for in-page links) and returns the outline.
 * DOMParser never runs scripts; the HTML is otherwise left exactly as WordPress sent it.
 */
function withSectionAnchors(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const used = new Set();
  const sections = [...doc.body.querySelectorAll("h2")].map((heading, index) => {
    const text = heading.textContent.trim();
    let id = heading.id || slugify(text) || `section-${index + 1}`;
    if (used.has(id)) id = `${id}-${index + 1}`;
    used.add(id);
    heading.id = id;
    return { id, text };
  });
  return { html: doc.body.innerHTML, sections };
}

/**
 * Shared layout for WordPress-managed legal pages (Privacy Policy, Terms of Use).
 *
 * Same structure as the blog article page: the regular PageHero, then a `shell` with a
 * content column and, from `lg`, a 20–22rem sidebar — here a sticky "On this page" outline built
 * from the document's own h2 headings. Below `lg` it is a single column; on phones the document
 * is a full-width white sheet with the normal page gutter, from `sm` a card.
 */
export default function LegalPage({ crumb, page, fallbackTitle, description }) {
  const modified = page.modified
    ? new Date(page.modified).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const { html, sections } = useMemo(
    () => withSectionAnchors(page.content?.rendered || "<p>This page does not contain published content yet.</p>"),
    [page.content?.rendered],
  );
  const hasOutline = sections.length > 1;

  return (
    <main>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: crumb }]}
        eyebrow="Legal information"
        title={<span dangerouslySetInnerHTML={{ __html: page.title?.rendered || fallbackTitle }} />}
        description={description}
      >
        {modified && <p className="text-sm text-ink-500">Last updated {modified}</p>}
      </PageHero>
      <div className="bg-white sm:bg-transparent">
        <div className={`shell section-y ${hasOutline ? "grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_22rem]" : ""}`}>
          <article
            className={`wp-content legal-content min-w-0 sm:rounded-2xl sm:border sm:border-sand-200 sm:bg-white sm:p-10 sm:shadow-card lg:p-12 ${hasOutline ? "" : "max-w-3xl"}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {hasOutline && (
            <aside className="hidden lg:block">
              <nav aria-label="On this page" className="card p-6 lg:sticky lg:top-28">
                <p className="eyebrow mb-4">On this page</p>
                <ol className="flex flex-col gap-0.5 text-sm">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="-mx-3 block rounded-lg px-3 py-2 leading-snug text-ink-600 transition-colors hover:bg-brand-50 hover:text-brand-800"
                      >
                        {section.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
