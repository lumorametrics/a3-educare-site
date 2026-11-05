import { withBase } from "../lib/basePath";
import { useEffect, useMemo, useState } from "react";
import { getPostBySlug, getPostFeaturedImage, getPostTerms } from "../services/wordpress";
import SplashScreen from "../components/ui/SplashScreen";
import FadeImage from "../components/ui/FadeImage";
import Breadcrumb from "../components/ui/Breadcrumb";
import FaqAccordion from "../components/ui/FaqAccordion";
import StatusMessage from "../components/ui/StatusMessage";
import CtaBand from "../components/ui/CtaBand";
import BlogSidebar from "../components/blog/BlogSidebar";
import ShareButtons from "../components/blog/ShareButtons";
import { ArrowRight, Clock } from "../components/ui/Icons";
import { toPlainText, truncateText } from "../lib/text";
import { organizationRef, siteUrl, useSeo } from "../lib/seo";
import { enhanceArticleHtml } from "../lib/wpContent";

function stripMarkup(value = "") {
  return toPlainText(value);
}

function getFaqs(post) {
  const fields = post?.acf || {};
  const source = fields.faqs || fields.faq || fields.blog_faqs;
  if (!Array.isArray(source)) return [];
  return source
    .map((item) => ({
      question: item.question || item.faq_question || item.title,
      answer: item.answer || item.faq_answer || item.content,
    }))
    .filter((item) => item.question && item.answer);
}

function readingTime(html = "") {
  const words = stripMarkup(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export default function BlogDetail({ slug }) {
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const articleHtml = useMemo(() => enhanceArticleHtml(post?.content?.rendered), [post]);

  useEffect(() => {
    let active = true;
    getPostBySlug(slug)
      .then((items) => {
        if (!active) return;
        setPost(items[0] || null);
        setStatus(items[0] ? "ready" : "not-found");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Unable to load blog article:", requestError);
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const seoImage = post ? getPostFeaturedImage(post, "large")?.url : undefined;
  useSeo(post ? {
    title: toPlainText(post.title?.rendered),
    description: post.excerpt?.rendered || post.content?.rendered,
    image: seoImage,
    type: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: toPlainText(post.title?.rendered),
      description: truncateText(post.excerpt?.rendered || post.content?.rendered, 300),
      datePublished: post.date_gmt ? `${post.date_gmt}Z` : post.date,
      dateModified: post.modified_gmt ? `${post.modified_gmt}Z` : post.modified,
      ...(seoImage ? { image: seoImage } : {}),
      author: organizationRef(),
      publisher: organizationRef(),
    },
  } : null);

  if (status === "loading") {
    return <SplashScreen label="Loading article" />;
  }
  if (status === "error") {
    return <StatusMessage page tone="error" title="Something went wrong">This article could not be loaded from WordPress.</StatusMessage>;
  }
  if (!post) {
    return <StatusMessage page title="Article not found" action={<a className="btn btn-dark mt-2" href="/blog">Back to the blog</a>}>This article could not be found.</StatusMessage>;
  }

  const title = post.title?.rendered || "Untitled article";
  const image = getPostFeaturedImage(post, "large");
  const { categories, tags } = getPostTerms(post);
  const primaryCategory = categories.find((term) => term.slug !== "uncategorized")?.name || "Education guide";
  const faqs = getFaqs(post);
  const publishedDate = post.date
    ? new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "Latest";

  return (
    <main>
      <header className="relative overflow-hidden bg-linear-to-b from-brand-50 to-sand-50">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="shell relative pt-8 pb-10 sm:pb-14">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: title }]} />
          <div className="max-w-4xl motion-safe:animate-fade-up">
            <p className="eyebrow mb-5">{primaryCategory}</p>
            <h1 className="heading-display text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem]" dangerouslySetInnerHTML={{ __html: title }} />
            <p className="mt-6 inline-flex flex-wrap items-center gap-3 text-sm text-ink-500">
              <time dateTime={post.date}>{publishedDate}</time>
              <span className="size-1 rounded-full bg-ink-300" />
              <span className="inline-flex items-center gap-1.5"><Clock className="size-4" />{readingTime(post.content?.rendered)} min read</span>
            </p>
          </div>
        </div>
      </header>

      <div className="shell grid grid-cols-1 gap-12 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="min-w-0">
          {image && (
            <figure className="mb-10 motion-safe:animate-fade-up [animation-delay:120ms]">
              <FadeImage className="aspect-video w-full rounded-[2rem] shadow-lift" src={image.url} alt={image.alt} fetchPriority="high" zoom={false} />
              {image.caption && <figcaption className="mt-3 text-center text-sm text-ink-400 [&_p]:m-0" dangerouslySetInnerHTML={{ __html: image.caption }} />}
            </figure>
          )}
          <div className="wp-content max-w-3xl sm:prose-lg" dangerouslySetInnerHTML={{ __html: articleHtml || "<p>This article has no published content yet.</p>" }} />

          {faqs.length > 0 && (
            <section className="mt-14 max-w-3xl">
              <h2 className="heading-display mb-8 text-3xl">Frequently Asked <em>Questions</em></h2>
              <FaqAccordion items={faqs} />
            </section>
          )}

          <ShareButtons url={`${siteUrl()}${withBase(`/blog/${post.slug}`)}`} title={toPlainText(post.title?.rendered)} />

          <div className="mt-12 max-w-3xl border-t border-sand-200 pt-8">
            <a className="link-arrow" href="/blog"><ArrowRight className="rotate-180" /> Back to all articles</a>
          </div>
        </article>

        <BlogSidebar post={post} categories={categories} tags={tags} />
      </div>

      <CtaBand eyebrow="Your next chapter starts here" title={<>Want personalised <em>guidance?</em></>} description="Talk to an advisor about courses, colleges and admissions." />
    </main>
  );
}
