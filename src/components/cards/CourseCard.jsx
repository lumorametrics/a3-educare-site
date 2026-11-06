import { ArrowUpRight, Clock, Graduation, Wallet } from "../ui/Icons";
import { toPlainText } from "../../lib/text";
import { courseUrl } from "../../lib/urls";
import { getResponsiveImage } from "../../lib/media";

function stripHtml(value = "") {
  return toPlainText(value);
}

const tones = [
  "bg-brand-50 text-brand-700",
  "bg-gold-100 text-ink-800",
  "bg-coral-50 text-coral-600",
  "bg-ink-50 text-ink-700",
];

export default function CourseCard({ course, index = 0, categoryName, categoryImage, hideImage = false }) {
  const fields = course.acf || {};
  const title = course.title?.rendered || "Untitled course";
  const image = ["course_image", "course_banner", "course_cover", "hero_image", "featured_image", "image", "thumbnail"]
    .map((key) => getResponsiveImage(fields[key], stripHtml(title)))
    .find(Boolean) ||
    getResponsiveImage(course._embedded?.["wp:featuredmedia"]?.[0], stripHtml(title)) ||
    (categoryImage ? { src: categoryImage, alt: `${categoryName || "Course"} category` } : null);
  const description = stripHtml(
    fields.course_short_introduction ||
      fields.course_overview ||
      course.excerpt?.rendered ||
      "Explore eligibility, outcomes and admissions for this pathway.",
  );
  const kicker = categoryName || course.course_category_name || "Popular pathway";
  const duration = fields.duration || fields.course_duration;
  const fees = stripHtml(String(fields.fees_information || fields.course_fee || fields.course_price || ""));

  const href = courseUrl(course);

  return (
    <a href={href} className="group card-interactive flex h-full flex-col p-6 sm:p-7">
      {image && !hideImage && (
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          alt={image.alt}
          loading="lazy"
          decoding="async"
          className="-mx-6 -mt-6 mb-6 aspect-[16/9] w-[calc(100%+3rem)] rounded-t-2xl object-cover transition duration-500 group-hover:scale-[1.02] sm:-mx-7 sm:-mt-7 sm:mb-7 sm:w-[calc(100%+3.5rem)]"
        />
      )}
      <div className="flex items-start justify-between gap-4">
        <span className={`grid size-12 place-items-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 ${tones[index % tones.length]}`}>
          <Graduation className="size-6" />
        </span>
        <span className="grid size-9 place-items-center rounded-full border border-sand-200 text-ink-400 transition duration-300 group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <span className="mt-6 text-xs font-semibold tracking-[0.14em] text-brand-700 uppercase">{kicker}</span>
      <h3 className="mt-2 font-display text-xl leading-snug font-semibold transition-colors group-hover:text-brand-800 sm:text-[1.375rem]" dangerouslySetInnerHTML={{ __html: title }} />
      <p className="mt-3 line-clamp-3 flex-1 text-sm text-ink-500">{description}</p>
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-sand-100 pt-5 text-xs font-medium text-ink-600">
        <span className="inline-flex items-center gap-1.5"><Clock className="size-4 text-ink-400" />{duration || "Duration not published"}</span>
        <span className="inline-flex min-w-0 items-center gap-1.5"><Wallet className="size-4 shrink-0 text-ink-400" /><span className="truncate">{fees || "Fees not published"}</span></span>
      </div>
    </a>
  );
}
