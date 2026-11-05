import { ArrowUpRight, Building, Globe, Graduation, MapPin } from "../components/ui/Icons";

const suggestions = [
  ["Explore courses", "/courses", Graduation],
  ["Find colleges", "/colleges", Building],
  ["Browse by state", "/states", MapPin],
  ["Study abroad", "/study-abroad", Globe],
];

/** Shown for any URL the router does not recognise (marked noindex by App). */
export default function NotFound() {
  return (
    <main className="shell flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-8xl font-bold text-brand-200 sm:text-9xl motion-safe:animate-fade-up">404</p>
      <h1 className="heading-display mt-4 text-3xl sm:text-4xl motion-safe:animate-fade-up [animation-delay:80ms]">This page <em>could not be found.</em></h1>
      <p className="mt-4 max-w-md text-ink-500 motion-safe:animate-fade-up [animation-delay:160ms]">The link may be outdated, or the page may have moved. Try one of these instead:</p>
      <ul className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 motion-safe:animate-fade-up [animation-delay:240ms]">
        {suggestions.map(([label, href, Icon]) => (
          <li key={href}>
            <a className="group card-interactive flex items-center gap-3 p-4 text-left font-semibold text-ink-900" href={href}>
              <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon className="size-5" /></span>
              <span className="flex-1">{label}</span>
              <ArrowUpRight className="size-4 text-ink-300 transition group-hover:text-brand-600" />
            </a>
          </li>
        ))}
      </ul>
      <a className="btn btn-dark mt-10" href="/">Back to home</a>
    </main>
  );
}
