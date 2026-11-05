import { useMemo, useState } from "react";
import Reveal from "../ui/Reveal";
import CollegeCard from "./CollegeCard";
import { ChevronRight } from "../ui/Icons";
import { toPlainText } from "../../lib/text";

const PAGE_SIZE = 9;
const nameOf = (college) => toPlainText(college.title?.rendered);
const yearOf = (college) => Number(String(college.acf?.established || "").match(/\d{4}/)?.[0]) || null;
const distinct = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

const SORTS = {
  "name-asc": { label: "Name (A to Z)", compare: (a, b) => nameOf(a).localeCompare(nameOf(b)) },
  "name-desc": { label: "Name (Z to A)", compare: (a, b) => nameOf(b).localeCompare(nameOf(a)) },
  // Colleges without a published year go last in both directions.
  oldest: { label: "Oldest first", compare: (a, b) => (yearOf(a) ?? Infinity) - (yearOf(b) ?? Infinity) },
  newest: { label: "Newest first", compare: (a, b) => (yearOf(b) ?? -Infinity) - (yearOf(a) ?? -Infinity) },
};

function Filter({ label, value, onChange, children }) {
  return (
    <label className="flex w-full flex-col gap-1.5 text-xs font-semibold tracking-wide text-ink-500 uppercase sm:w-52">
      {label}
      <span className="relative">
        <select className="w-full appearance-none rounded-full border border-sand-200 bg-white py-3 pr-10 pl-5 text-sm font-normal tracking-normal text-ink-900 normal-case shadow-card transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none" value={value} onChange={(event) => onChange(event.target.value)}>
          {children}
        </select>
        <ChevronRight aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rotate-90 text-ink-500" />
      </span>
    </label>
  );
}

/** College grid with filters built from the listed colleges' own WordPress values, sorting and "show more". */
export default function CollegeResults({ colleges }) {
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const types = useMemo(() => distinct(colleges.map((college) => college.acf?.college_type)), [colleges]);
  const cities = useMemo(() => distinct(colleges.map((college) => toPlainText(college.acf?.city))), [colleges]);
  const results = useMemo(() => [...colleges]
    .filter((college) => (!type || college.acf?.college_type === type) && (!city || toPlainText(college.acf?.city) === city))
    .sort(SORTS[sort].compare), [colleges, type, city, sort]);
  const update = (setter) => (value) => { setter(value); setVisible(PAGE_SIZE); };
  const hasYears = colleges.some(yearOf);

  return (
    <>
      {colleges.length > 1 && (
        <div className="mb-8 flex flex-wrap items-end gap-4">
          {types.length > 1 && (
            <Filter label="College type" value={type} onChange={update(setType)}>
              <option value="">All types</option>
              {types.map((item) => <option key={item} value={item}>{item}</option>)}
            </Filter>
          )}
          {cities.length > 1 && (
            <Filter label="City" value={city} onChange={update(setCity)}>
              <option value="">All cities</option>
              {cities.map((item) => <option key={item} value={item}>{item}</option>)}
            </Filter>
          )}
          <Filter label="Sort by" value={sort} onChange={update(setSort)}>
            {Object.entries(SORTS).filter(([key]) => hasYears || key.startsWith("name")).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </Filter>
          <p className="ml-auto text-sm text-ink-500" aria-live="polite">Showing {Math.min(visible, results.length)} of {results.length}</p>
        </div>
      )}
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.slice(0, visible).map((college, index) => (
          <Reveal as="li" key={college.id} delay={(index % 3) * 70} className="h-full"><CollegeCard college={college} showDetails /></Reveal>
        ))}
      </ul>
      {results.length > visible && (
        <div className="mt-10 text-center">
          <button type="button" className="btn btn-outline" onClick={() => setVisible((count) => count + PAGE_SIZE)}>Show more colleges</button>
        </div>
      )}
    </>
  );
}
