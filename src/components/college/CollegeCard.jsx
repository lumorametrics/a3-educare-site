import CollegeImage from "./CollegeImage";
import { ArrowUpRight, MapPin } from "../ui/Icons";
import { resolveCollegeImage } from "../../lib/collegeImage";
import { toPlainText } from "../../lib/text";
import { collegeUrl } from "../../lib/urls";

/** College card used by the home slider and the state / district category pages. */
export default function CollegeCard({ college, showDetails = false }) {
  const fields = college.acf || {};
  const entrance = toPlainText(fields.entrance_exams);
  // Some records hold a sentence here; the card only ever shows the year.
  const established = toPlainText(fields.established).match(/\b(1[5-9]|20)\d{2}\b/)?.[0];
  const place = toPlainText(fields.college_location || fields.location || [fields.city, fields.state].filter(Boolean).join(", "));
  const description = toPlainText(fields.college_short_introduction) || "Explore programmes, admissions and facilities for this institution.";

  return (
    <a href={collegeUrl(college)} className="group card-interactive flex h-full flex-col overflow-hidden">
      <div className="relative">
        <CollegeImage
          image={resolveCollegeImage(fields)}
          ratio={16 / 10}
          zoom
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 84vw"
          className="aspect-[16/10] w-full"
        />
        <span className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-white/90 text-ink-700 shadow-card backdrop-blur transition duration-300 group-hover:bg-brand-600 group-hover:text-white">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {place && (
          <span className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.14em] text-brand-700 uppercase">
            <MapPin className="size-3.5 shrink-0" /><span className="truncate">{place}</span>
          </span>
        )}
        <h3 className="mt-2 font-display text-xl leading-snug font-semibold transition-colors group-hover:text-brand-800 sm:text-[1.375rem]" dangerouslySetInnerHTML={{ __html: college.title?.rendered || "Untitled college" }} />
        {/* The wrapper takes the spare height; clamping a stretched paragraph itself would show extra lines. */}
        <div className="mt-3 flex-1"><p className="line-clamp-3 text-sm text-ink-500">{description}</p></div>
        {showDetails && (fields.college_type || established || entrance || toPlainText(fields.fees_information)) && (
          <dl className="mt-4 space-y-1 text-xs text-ink-500">
            {fields.college_type && <div className="flex gap-1.5"><dt className="font-semibold text-ink-700">Type:</dt><dd>{toPlainText(fields.college_type)}</dd></div>}
            {established && <div className="flex gap-1.5"><dt className="font-semibold text-ink-700">Established:</dt><dd className="truncate">{established}</dd></div>}
            {entrance && <div className="flex gap-1.5"><dt className="shrink-0 font-semibold text-ink-700">Admission:</dt><dd className="line-clamp-2">{entrance}</dd></div>}
            {toPlainText(fields.fees_information) && <div className="flex gap-1.5"><dt className="font-semibold text-ink-700">Fees:</dt><dd>See the college profile</dd></div>}
          </dl>
        )}
        <span className="link-arrow mt-6 border-t border-sand-100 pt-5">View details <ArrowUpRight /></span>
      </div>
    </a>
  );
}
