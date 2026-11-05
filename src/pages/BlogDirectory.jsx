import { useEffect, useState } from "react";
import { getPostFeaturedImage, getPostTerms, getPosts } from "../services/wordpress";
import SplashScreen from "../components/ui/SplashScreen";
import FadeImage from "../components/ui/FadeImage";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import StatusMessage from "../components/ui/StatusMessage";
import CtaBand from "../components/ui/CtaBand";
import { ArrowUpRight, Book } from "../components/ui/Icons";
import { toPlainText } from "../lib/text";

function stripMarkup(value = "") {
  return toPlainText(value);
}

const artTones = ["from-brand-600 to-ink-900", "from-gold-400 to-coral-500", "from-ink-700 to-brand-800"];

export default function BlogDirectory() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    getPosts()
      .then((result) => {
        if (!active) return;
        setPosts(Array.isArray(result) ? result : []);
        setStatus("ready");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load blog posts:", requestError);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        eyebrow="Insights for your next step"
        title={<>The A3 <em>Blog</em></>}
        description="Admission guides, comparisons, and current-cycle explainers."
      />
      <section className="shell py-12 sm:py-16" aria-live="polite">
        {status === "loading" && <SplashScreen label="Loading articles" />}
        {status === "error" && (
          <StatusMessage tone="error">We could not load the articles right now. Please try again later.</StatusMessage>
        )}
        {status === "ready" && !posts.length && (
          <StatusMessage>No published articles found yet.</StatusMessage>
        )}
        {status === "ready" && posts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => {
              const title = stripMarkup(post.title?.rendered) || "Untitled article";
              const excerpt = stripMarkup(post.excerpt?.rendered || post.content?.rendered);
              const date = post.date ? new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
              const image = getPostFeaturedImage(post);
              const category = getPostTerms(post).categories.find((term) => term.slug !== "uncategorized")?.name || "Education guide";
              return (
                <Reveal key={post.id} delay={(index % 3) * 80} className="h-full">
                  <a className="group card-interactive flex h-full flex-col overflow-hidden" href={`/blog/${post.slug}`}>
                    <div className={`relative aspect-16/10 overflow-hidden bg-linear-to-br ${artTones[index % artTones.length]}`}>
                      {image ? (
                        <FadeImage className="size-full" imgClassName="group-hover:scale-105" zoom={false} src={image.url} alt={image.alt} loading={index > 2 ? "lazy" : "eager"} />
                      ) : (
                        <Book className="absolute right-6 bottom-6 size-16 text-white/20 transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12" />
                      )}
                      <span className="absolute top-5 left-5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-900 shadow-card backdrop-blur">{category}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      {date && <time className="text-xs font-medium text-ink-400" dateTime={post.date}>{date}</time>}
                      <h2 className="mt-2 font-display text-xl leading-snug font-semibold transition-colors group-hover:text-brand-800 sm:text-2xl">{title}</h2>
                      <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink-500">{excerpt || "Explore helpful guidance for your education journey."}</p>
                      <span className="link-arrow mt-6">Read article <ArrowUpRight /></span>
                    </div>
                  </a>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
      <CtaBand eyebrow="Have a question?" title={<>Get answers from <em>an advisor.</em></>} description="Our team can help you make sense of admissions, eligibility and next steps." />
    </main>
  );
}
