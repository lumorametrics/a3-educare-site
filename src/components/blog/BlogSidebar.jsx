import { useEffect, useState } from "react";
import { getPostFeaturedImage, getPosts } from "../../services/wordpress";
import { ArrowUpRight, Book, Building, Check, Globe, Graduation, MapPin } from "../ui/Icons";
import { toPlainText } from "../../lib/text";

const RECENT_LIMIT = 4;

const exploreLinks = [
  ["Explore courses", "/courses", Graduation],
  ["Find colleges", "/colleges", Building],
  ["Browse by state", "/states", MapPin],
  ["Study abroad", "/study-abroad", Globe],
];

function stripMarkup(value = "") {
  return toPlainText(value);
}

function SidebarBlock({ title, children }) {
  return (
    <section className="card p-6">
      <h2 className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-brand-700 uppercase">
        <span aria-hidden="true" className="h-px w-6 bg-brand-600" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function RecentArticles({ currentId }) {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    getPosts()
      .then((result) => {
        if (!active) return;
        setPosts((Array.isArray(result) ? result : []).filter((post) => post.id !== currentId).slice(0, RECENT_LIMIT));
        setStatus("ready");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load recent articles:", requestError);
        setStatus("error");
      });
    return () => { active = false; };
  }, [currentId]);

  // A failed sidebar request should never take the article down with it.
  if (status === "error") return null;

  return (
    <SidebarBlock title="Recent articles">
      {status === "loading" && (
        <ul className="flex flex-col gap-4" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <li className="flex animate-pulse gap-3" key={index}>
              <span className="size-16 shrink-0 rounded-xl bg-sand-100" />
              <span className="flex flex-1 flex-col gap-2 pt-1"><span className="h-3 w-full rounded bg-sand-100" /><span className="h-3 w-2/3 rounded bg-sand-100" /></span>
            </li>
          ))}
        </ul>
      )}
      {status === "ready" && !posts.length && <p className="text-sm text-ink-500">More articles are on the way.</p>}
      {status === "ready" && posts.length > 0 && (
        <ul className="-mx-2 flex flex-col">
          {posts.map((post) => {
            const image = getPostFeaturedImage(post, "thumbnail");
            const date = post.date ? new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
            return (
              <li key={post.id}>
                <a className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-sand-50" href={`/blog/${post.slug}`}>
                  <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-linear-to-br from-brand-600 to-ink-900">
                    {image ? (
                      <img className="size-full object-cover transition-transform duration-500 group-hover:scale-110" src={image.url} alt="" loading="lazy" decoding="async" />
                    ) : (
                      <Book className="size-6 text-white/40" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="line-clamp-2 text-sm leading-snug font-semibold text-ink-900 transition-colors group-hover:text-brand-700">{stripMarkup(post.title?.rendered) || "Untitled article"}</strong>
                    {date && <time className="mt-1 block text-xs text-ink-400" dateTime={post.date}>{date}</time>}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
      <a className="link-arrow mt-5" href="/blog">All articles <ArrowUpRight /></a>
    </SidebarBlock>
  );
}

/**
 * Sidebar for single blog posts. On large screens it sits beside the article and the
 * advisor card stays pinned while reading; below `lg` it stacks under the article.
 */
export default function BlogSidebar({ post, categories = [], tags = [] }) {
  const topics = [...categories.filter((term) => term.slug !== "uncategorized"), ...tags];

  return (
    <aside className="flex flex-col gap-6" aria-label="Blog sidebar">
      <RecentArticles currentId={post.id} />

      {topics.length > 0 && (
        <SidebarBlock title="Topics">
          <ul className="flex flex-wrap gap-2">
            {topics.map((term) => (
              <li key={`${term.taxonomy}-${term.id}`} className="chip px-3 py-1.5 text-xs">
                {term.taxonomy === "post_tag" ? "#" : ""}{stripMarkup(term.name)}
              </li>
            ))}
          </ul>
        </SidebarBlock>
      )}

      <SidebarBlock title="Explore">
        <ul className="-mx-2 flex flex-col">
          {exploreLinks.map(([label, href, Icon]) => (
            <li key={href}>
              <a className="group flex items-center gap-3 rounded-xl p-2 text-sm font-medium text-ink-800 transition-colors hover:bg-sand-50 hover:text-brand-700" href={href}>
                <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white"><Icon className="size-4" /></span>
                <span className="flex-1">{label}</span>
                <ArrowUpRight className="size-4 text-ink-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />
              </a>
            </li>
          ))}
        </ul>
      </SidebarBlock>

      <section className="relative overflow-hidden rounded-2xl bg-ink-900 p-7 text-ink-200 lg:sticky lg:top-28">
        <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-brand-500/30 blur-3xl" />
        <p className="eyebrow relative mb-3 text-gold-400">Free guidance</p>
        <h2 className="relative font-display text-2xl font-semibold text-white">Need help with your next step?</h2>
        <ul className="relative mt-5 flex flex-col gap-2.5 text-sm">
          {["Course & college shortlisting", "Admission & eligibility checks", "Study-abroad planning"].map((point) => (
            <li className="flex gap-2.5" key={point}><Check className="mt-0.5 size-4 shrink-0 text-gold-400" />{point}</li>
          ))}
        </ul>
        <a className="btn btn-gold relative mt-6 w-full" href="/#contact">Talk to an advisor <ArrowUpRight /></a>
      </section>
    </aside>
  );
}
