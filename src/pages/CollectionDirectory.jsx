import { useEffect, useMemo, useState } from "react";
import {
  getColleges,
  getDistricts,
  getStates,
  getStudyAbroad,
} from "../services/wordpress";
import SplashScreen from "../components/ui/SplashScreen";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import StatusMessage from "../components/ui/StatusMessage";
import CtaBand from "../components/ui/CtaBand";
import CollegeImage from "../components/college/CollegeImage";
import { ArrowUpRight, ChevronRight, Globe, MapPin, Search } from "../components/ui/Icons";
import { resolveCollegeImage } from "../lib/collegeImage";
import { toPlainText } from "../lib/text";
import { districtUrl } from "../lib/urls";

const collections = {
  states: {
    title: "Explore by State",
    eyebrow: "Local education guides",
    description: "Discover education opportunities, institutions and regional guidance.",
    getItems: getStates,
    empty: "No published states are available yet.",
    loading: "Loading states",
  },
  districts: {
    title: "Explore by District",
    eyebrow: "Local education guides",
    description: "Find district-level courses, colleges and admission information.",
    getItems: getDistricts,
    empty: "No published districts are available yet.",
    loading: "Loading districts",
  },
  colleges: {
    title: "Find Your College",
    eyebrow: "Institution directory",
    description: "Explore published college profiles and plan your next education step.",
    getItems: getColleges,
    empty: "No published colleges are available yet.",
    loading: "Loading colleges",
  },
  "study-abroad": {
    title: "Study Abroad",
    eyebrow: "Global education guides",
    description: "Explore destination guides, university options and visa information.",
    getItems: getStudyAbroad,
    empty: "Study-abroad content is not available yet. Please register a public Study Abroad REST endpoint in WordPress.",
    loading: "Loading destinations",
  },
};

function stripHtml(value = "") {
  return toPlainText(value);
}

function SearchField({ value, onChange, placeholder, label }) {
  return (
    <label className="relative block flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-ink-400" />
      <input className="input-search" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={label} />
    </label>
  );
}

function StateDirectory({ items, status }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const stateItems = useMemo(() => items.map((item) => {
    const fields = item.acf || {};
    const title = stripHtml(item.title?.rendered || fields.state_name || "Untitled");
    const typeValue = fields.type || fields.state_type || fields.region_type || "";
    const isUnionTerritory = /union|ut/i.test(typeValue) || /andaman|chandigarh|dadra|delhi|jammu|ladakh|lakshadweep|puducherry/i.test(title);
    return {
      ...item,
      title,
      capital: fields.capital || fields.state_capital || fields.capital_city || "",
      isUnionTerritory,
    };
  }), [items]);
  const filteredItems = stateItems.filter((item) => {
    const matchesFilter = filter === "all" || (filter === "ut" ? item.isUnionTerritory : !item.isUnionTerritory);
    return matchesFilter && item.title.toLowerCase().includes(query.trim().toLowerCase());
  });
  const statesCount = stateItems.filter((item) => !item.isUnionTerritory).length;
  const unionCount = stateItems.length - statesCount;

  return (
    <main>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "States" }]}
        eyebrow="A3 Educare Hub & Research Academy"
        title={<>Explore States &amp; <em>Union Territories</em></>}
        description="Explore education information, colleges, courses and admission resources across India."
      >
        {status === "ready" && (
          <dl className="flex flex-wrap gap-3">
            {[[stateItems.length, "Locations"], [statesCount, "States"], [unionCount, "Union Territories"]].map(([count, label]) => (
              <div key={label} className="flex flex-col-reverse rounded-2xl border border-white bg-white/70 px-5 py-3 shadow-card backdrop-blur">
                <dt className="text-xs text-ink-500">{label}</dt>
                <dd className="font-display text-2xl font-semibold text-ink-900">{count}</dd>
              </div>
            ))}
          </dl>
        )}
      </PageHero>
      <section className="shell py-10 sm:py-14">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center">
          <SearchField value={query} onChange={setQuery} placeholder="Search a state or union territory..." label="Search states and union territories" />
          <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter locations">
            {[["all", "All"], ["state", "States"], ["ut", "Union Territories"]].map(([value, label]) => (
              <button className={`chip shrink-0 ${filter === value ? "chip-active" : ""}`} aria-pressed={filter === value} type="button" onClick={() => setFilter(value)} key={value}>{label}</button>
            ))}
          </div>
        </div>
        {status === "loading" && <SplashScreen label="Loading states" />}
        {status === "error" && <StatusMessage tone="error">States could not be loaded from WordPress.</StatusMessage>}
        {status === "ready" && !filteredItems.length && <StatusMessage title="No matches">No locations match your search or filter.</StatusMessage>}
        {status === "ready" && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => (
              <Reveal key={item.id} delay={(index % 3) * 50}>
                <a className="group card-interactive flex items-center gap-4 p-5" href={`/states/${item.slug || item.id}`}>
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sand-100 font-display text-sm text-ink-500 transition-colors group-hover:bg-brand-600 group-hover:text-white">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate font-semibold text-ink-900">{item.title}</strong>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-400">
                      <span className={`rounded-full px-2 py-0.5 font-medium ${item.isUnionTerritory ? "bg-gold-100 text-ink-800" : "bg-brand-50 text-brand-700"}`}>{item.isUnionTerritory ? "Union Territory" : "State"}</span>
                      {item.capital && <span className="truncate">Capital: {stripHtml(item.capital)}</span>}
                    </span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 text-ink-300 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />
                </a>
              </Reveal>
            ))}
          </div>
        )}
      </section>
      <CtaBand eyebrow="Continue exploring" title={<>Find Courses <em>Across India</em></>} description="Explore courses, colleges and education options with A3 Educare Hub." actionLabel="Explore Courses" actionHref="/courses" />
    </main>
  );
}

function CollegeDirectory({ items, status }) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((college) => {
    const fields = college.acf || {};
    const haystack = `${stripHtml(college.title?.rendered || "")} ${fields.college_location || fields.location || ""} ${fields.city || ""} ${fields.state || ""}`;
    return haystack.toLowerCase().includes(query.trim().toLowerCase());
  });
  const verified = query ? [] : filtered.slice(0, 4);
  const moreColleges = query ? filtered : filtered.slice(4);

  return (
    <main>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Colleges" }]}
        eyebrow="Institution directory"
        title={<>Browse <em>Colleges</em></>}
        description="Institution names below are drawn from our verified inventory; detail pages go live as each college's information is confirmed against its official website."
      >
        <div className="max-w-2xl">
          <SearchField value={query} onChange={setQuery} placeholder="Search by college name, city or state..." label="Search colleges" />
        </div>
      </PageHero>
      <section className="shell py-10 sm:py-14">
        {status === "loading" && <SplashScreen label="Loading colleges" />}
        {status === "error" && <StatusMessage tone="error">Colleges could not be loaded from WordPress.</StatusMessage>}
        {status === "ready" && !items.length && <StatusMessage>No published colleges are available yet.</StatusMessage>}
        {status === "ready" && items.length > 0 && !filtered.length && <StatusMessage title="No matches">No colleges match your search.</StatusMessage>}
        {status === "ready" && verified.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {verified.map((college, index) => {
              const fields = college.acf || {};
              const meta = fields.college_location || fields.location || [fields.city, fields.state].filter(Boolean).join(", ");
              return (
                <Reveal key={college.id} delay={index * 70} className="h-full">
                  <a className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-ink-900 text-white transition duration-300 hover:-translate-y-1 hover:shadow-lift" href={`/colleges/${college.slug}`}>
                    <div className="relative">
                      <CollegeImage image={resolveCollegeImage(fields)} ratio={16 / 10} zoom sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw" className="aspect-[16/10] w-full" />
                      <ArrowUpRight className="absolute top-3 right-3 size-9 rounded-full bg-ink-900/75 p-2 text-white backdrop-blur transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-400" />
                    </div>
                    <div className="relative flex flex-1 flex-col justify-between gap-6 p-5 sm:p-6">
                      <div aria-hidden="true" className="absolute -right-12 -bottom-16 size-40 rounded-full bg-brand-500/25 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                      <strong className="relative block font-display text-xl leading-snug font-semibold" dangerouslySetInnerHTML={{ __html: college.title?.rendered || "Untitled college" }} />
                      {meta && <span className="relative flex items-center gap-1.5 text-xs text-ink-300"><MapPin className="size-3.5" />{stripHtml(String(meta))}</span>}
                    </div>
                  </a>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
      {status === "ready" && moreColleges.length > 0 && (
        <section className="shell pb-20 sm:pb-24">
          {!query && (
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow mb-3">Keep exploring</p>
                <h2 className="heading-display text-3xl sm:text-4xl">More institutions to <em>explore.</em></h2>
              </div>
              <p className="max-w-md text-ink-500">Browse the complete college inventory from A3 Educare Hub. Select an institution to view its published profile and admissions information.</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {moreColleges.map((college) => {
              const fields = college.acf || {};
              const meta = fields.college_location || fields.location || fields.college_type || "";
              return (
                <a className="group card-interactive flex items-center gap-4 p-4 sm:p-5" href={`/colleges/${college.slug}`} key={college.id}>
                  <CollegeImage image={resolveCollegeImage(fields)} ratio={1} sizes="64px" className="size-14 shrink-0 rounded-xl sm:size-16" />
                  <span className="min-w-0 flex-1">
                    <strong className="block font-semibold text-ink-900" dangerouslySetInnerHTML={{ __html: college.title?.rendered || "Untitled college" }} />
                    {meta && <small className="mt-0.5 block truncate text-xs text-ink-400">{stripHtml(String(meta))}</small>}
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-ink-300 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />
                </a>
              );
            })}
          </div>
        </section>
      )}
      <CtaBand eyebrow="Need a shortlist?" title={<>Find the college that <em>fits you.</em></>} description="We compare eligibility, fees, location and outcomes so you can decide with confidence." />
    </main>
  );
}

export default function CollectionDirectory({ type }) {
  const config = collections[type] || collections.states;
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  useEffect(() => {
    let active = true;
    config.getItems()
      .then((data) => {
        if (!active) return;
        setItems(data);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => { active = false; };
  }, [config, type]);

  if (type === "colleges") {
    return <CollegeDirectory items={items} status={status} />;
  }
  if (type === "states") {
    return <StateDirectory items={items} status={status} />;
  }

  const Icon = type === "study-abroad" ? Globe : MapPin;
  const isDistricts = type === "districts";
  const stateNames = isDistricts ? [...new Set(items.map((item) => item.acf?.state_name).filter(Boolean))].sort() : [];
  const visibleItems = items.filter((item) => {
    if (!isDistricts) return true;
    const matchesState = stateFilter === "all" || item.acf?.state_name === stateFilter;
    const haystack = `${stripHtml(item.title?.rendered || "")} ${item.acf?.state_name || ""} ${item.acf?.headquarters || ""}`.toLowerCase();
    return matchesState && haystack.includes(query.trim().toLowerCase());
  });

  return (
    <main>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: config.title }]}
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
      >
        {isDistricts && status === "ready" && items.length > 0 && (
          <div className="flex max-w-3xl flex-col gap-3 sm:flex-row">
            <SearchField value={query} onChange={setQuery} placeholder="Search a district..." label="Search districts" />
            <label className="relative sm:w-56">
              <span className="sr-only">Filter by state</span>
              <select
                className="w-full appearance-none rounded-full border border-sand-200 bg-white py-3.5 pr-10 pl-5 text-ink-900 shadow-card transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
                value={stateFilter}
                onChange={(event) => setStateFilter(event.target.value)}
              >
                <option value="all">All states ({items.length})</option>
                {stateNames.map((name) => <option value={name} key={name}>{name}</option>)}
              </select>
              <ChevronRight aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rotate-90 text-ink-500" />
            </label>
          </div>
        )}
      </PageHero>
      <section className="shell py-12 sm:py-16">
        {status === "loading" && <SplashScreen label={config.loading} />}
        {status === "error" && <StatusMessage tone="error">This section could not be loaded from WordPress.</StatusMessage>}
        {status === "ready" && !items.length && <StatusMessage>{config.empty}</StatusMessage>}
        {status === "ready" && items.length > 0 && !visibleItems.length && <StatusMessage title="No matches">No districts match your search or filter.</StatusMessage>}
        {status === "ready" && visibleItems.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item, index) => {
              const fields = item.acf || {};
              const title = item.title?.rendered || fields.country || "Untitled";
              const summary = stripHtml(
                fields.college_short_introduction ||
                fields.district_short_introduction ||
                fields.district_overview ||
                fields.intro_description ||
                fields.country_overview ||
                fields.description ||
                "View the latest education information and details.",
              );
              const href = isDistricts
                ? districtUrl(item)
                : `/study-abroad/${item.slug || item.id}`;
              return (
                <Reveal key={item.id} delay={(index % 3) * 70} className="h-full">
                  <a className="group card-interactive flex h-full flex-col p-6 sm:p-7" href={href}>
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"><Icon className="size-5" /></span>
                      {isDistricts && fields.state_name
                        ? <span className="rounded-full bg-sand-100 px-2.5 py-1 text-xs font-medium text-ink-600">{fields.state_name}</span>
                        : <span aria-hidden="true" className="font-display text-sm text-ink-300">{String(index + 1).padStart(2, "0")}</span>}
                    </div>
                    <h2 className="mt-6 font-display text-2xl font-semibold transition-colors group-hover:text-brand-800" dangerouslySetInnerHTML={{ __html: title }} />
                    <p className="mt-3 flex-1 text-sm text-ink-500">{summary.slice(0, 130)}{summary.length > 130 ? "…" : ""}</p>
                    <span className="link-arrow mt-6">Explore details <ArrowUpRight /></span>
                  </a>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
      <CtaBand eyebrow="Plan with confidence" title={<>Talk to an <em>education advisor.</em></>} description="Get a clear, personalised plan for your next step." />
    </main>
  );
}
